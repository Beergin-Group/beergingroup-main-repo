/**
 * MediRemind — Live Application Controller (Week 3 & 4 Integrated)
 * Manages State, Auth Tokens, Dynamic Validation, and Medicine CRUD
 */

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'http://localhost:5000/api';

  // State
  let authToken = localStorage.getItem('mediremind_token') || null;
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem('mediremind_user')) || null;
  } catch (e) {
    currentUser = null;
  }

  let medicines = [];
  let currentSearch = '';
  let currentFormFilter = 'all';
  let activeEditId = null;
  let activeDeleteId = null;

  // UI Containers
  const authView = document.getElementById('authView');
  const medicineView = document.getElementById('medicineView');
  const appNav = document.getElementById('appNav');
  const userTag = document.getElementById('userTag');
  const frame = document.getElementById('deviceFrame');
  const toast = document.getElementById('liveToast');

  // Device switcher
  document.querySelectorAll('.dev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dev-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      frame.className = `device-frame mode-${btn.dataset.mode}`;
    });
  });

  // Check initial session
  if (authToken && currentUser) {
    showMedicineView();
  } else {
    showAuthView();
  }

  function showAuthView() {
    authView.style.display = 'flex';
    medicineView.style.display = 'none';
    appNav.style.display = 'none';
  }

  function showMedicineView() {
    authView.style.display = 'none';
    medicineView.style.display = 'flex';
    appNav.style.display = 'flex';
    userTag.innerHTML = `👤 ${currentUser?.name || 'User'} <span style="color:#0d9488">(${currentUser?.role || 'patient'})</span>`;
    fetchMedicines();
  }

  // Logout
  document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('mediremind_token');
    localStorage.removeItem('mediremind_user');
    authToken = null;
    currentUser = null;
    showToast('Logged out of session.');
    showAuthView();
  });

  // Auth Tabs
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');

  tabSignIn.addEventListener('click', () => {
    tabSignIn.classList.add('active');
    tabSignUp.classList.remove('active');
    signInForm.style.display = 'block';
    signUpForm.style.display = 'none';
    document.getElementById('authCardHeading').textContent = 'Sign In to MediRemind';
    document.getElementById('authCardSub').textContent = 'Manage prescriptions, schedules and reminder alerts';
  });

  tabSignUp.addEventListener('click', () => {
    tabSignUp.classList.add('active');
    tabSignIn.classList.remove('active');
    signInForm.style.display = 'none';
    signUpForm.style.display = 'block';
    document.getElementById('authCardHeading').textContent = 'Create an Account';
    document.getElementById('authCardSub').textContent = 'Protect daily adherence across all your devices';
  });

  // Password visibility
  document.querySelectorAll('.btn-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁️' : '🙈';
    });
  });

  // Password strength meter
  const regPwd = document.getElementById('regPwd');
  const segs = [document.getElementById('s1'), document.getElementById('s2'), document.getElementById('s3'), document.getElementById('s4')];
  const strLabel = document.getElementById('strLabel');

  regPwd.addEventListener('input', () => {
    const val = regPwd.value;
    let score = 0;
    if (val.length >= 8) score++;
    if (/\d/.test(val)) score++;
    if (/[a-zA-Z]/.test(val)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(val)) score++;

    const colors = ['#e2e8f0', '#ef4444', '#f59e0b', '#3b82f6', '#0d9488'];
    const texts = ['None', 'Weak (min 8 chars)', 'Fair', 'Good', 'Strong'];

    segs.forEach((s, idx) => {
      s.style.background = idx < score ? colors[score] : '#e2e8f0';
    });
    strLabel.textContent = texts[score];
    strLabel.style.color = score > 0 ? colors[score] : '#64748b';
  });

  // Role card selection
  document.querySelectorAll('.role-card').forEach(rc => {
    rc.addEventListener('click', () => {
      document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
      rc.classList.add('active');
      rc.querySelector('input').checked = true;
    });
  });

  // Demo account quick fills
  document.getElementById('fillPatient').addEventListener('click', () => {
    tabSignIn.click();
    document.getElementById('loginEmail').value = 'patient@mediremind.com';
    document.getElementById('loginPwd').value = 'password123';
    showToast('Loaded Patient credentials');
  });

  document.getElementById('fillCaregiver').addEventListener('click', () => {
    tabSignIn.click();
    document.getElementById('loginEmail').value = 'caregiver@mediremind.com';
    document.getElementById('loginPwd').value = 'password123';
    showToast('Loaded Caregiver credentials');
  });

  // Sign In submit
  signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPwd').value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('mediremind_token', authToken);
        localStorage.setItem('mediremind_user', JSON.stringify(currentUser));
        showToast(`Welcome back, ${currentUser.name}!`, 'success');
        showMedicineView();
      } else {
        showToast(data.message || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      showToast('Could not reach server. Ensure backend is running.', 'error');
    }
  });

  // Sign Up submit
  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPwd').value;
    const confirm = document.getElementById('regConfirm').value;
    const role = document.querySelector('input[name="role"]:checked')?.value || 'patient';
    const phone = document.getElementById('regPhone').value.trim();

    if (password !== confirm) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, phone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('mediremind_token', authToken);
        localStorage.setItem('mediremind_user', JSON.stringify(currentUser));
        showToast(`Account created for ${currentUser.name}!`, 'success');
        showMedicineView();
      } else {
        showToast(data.message || 'Registration failed.', 'error');
      }
    } catch (err) {
      showToast('Could not reach server. Ensure backend is running.', 'error');
    }
  });

  // ================= MEDICINE MANAGEMENT LOGIC =================
  const medListContent = document.getElementById('medListContent');
  const searchMeds = document.getElementById('searchMeds');
  const addMedModal = document.getElementById('addMedModal');
  const editMedModal = document.getElementById('editMedModal');
  const deleteMedModal = document.getElementById('deleteMedModal');

  async function fetchMedicines() {
    try {
      const res = await fetch(`${API_BASE}/medicines`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        medicines = data.data || [];
        renderMedicines();
      } else {
        if (res.status === 401) {
          showToast('Session expired. Please sign in again.', 'error');
          showAuthView();
        }
      }
    } catch (err) {
      showToast('Error loading medicines from server.', 'error');
    }
  }

  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(fc => {
    fc.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      fc.classList.add('active');
      currentFormFilter = fc.dataset.form;
      renderMedicines();
    });
  });

  // Search input
  searchMeds.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    renderMedicines();
  });

  // Render list
  function renderMedicines() {
    medListContent.innerHTML = '';

    const filtered = medicines.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(currentSearch) || m.dosage.toLowerCase().includes(currentSearch);
      const matchForm = currentFormFilter === 'all' || m.form.toLowerCase() === currentFormFilter.toLowerCase();
      return matchSearch && matchForm;
    });

    if (filtered.length === 0) {
      medListContent.innerHTML = `
        <div style="text-align: center; padding: 48px; color: #94a3b8;">
          <div style="font-size: 42px;">💊</div>
          <div style="font-size: 16px; font-weight: 600; margin-top: 8px;">No Prescriptions Found</div>
          <div style="font-size: 12px; margin-top: 4px;">Click "+ Add Medicine" to register your medications</div>
        </div>
      `;
      return;
    }

    filtered.forEach(med => {
      const isLow = med.is_low_stock || med.stock_count <= med.low_stock_threshold;
      const card = document.createElement('div');
      card.className = 'med-card';
      card.innerHTML = `
        <div class="med-card-top">
          <div class="med-meta">
            <div class="med-color-icon" style="background: ${med.color}22; color: ${med.color}; border: 1.5px solid ${med.color}66;">
              💊
            </div>
            <div>
              <div class="med-title">${med.name}</div>
              <div class="med-badges">
                <span class="badge-dose">${med.dosage}</span>
                <span class="badge-form">${med.form}</span>
              </div>
            </div>
          </div>
          <div class="stock-tag ${isLow ? 'low' : 'normal'}">
            ${isLow ? '⚠️ ' : ''}${med.stock_count} units
          </div>
        </div>

        ${med.instructions ? `<div class="instructions-quote">“${med.instructions}”</div>` : ''}

        <div class="card-foot">
          <button class="btn-refill-stock refill-btn" data-id="${med.id}">+ Refill (+30)</button>
          <div class="card-btns">
            <button class="card-btn edit-btn" data-id="${med.id}" title="Edit Prescription">✏️</button>
            <button class="card-btn del delete-btn" data-id="${med.id}" title="Delete Prescription">🗑️</button>
          </div>
        </div>
      `;

      // Refill Click
      card.querySelector('.refill-btn').addEventListener('click', async () => {
        try {
          const res = await fetch(`${API_BASE}/medicines/${med.id}/refill`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ count: 30 })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(`Refilled +30 units for ${med.name}. Stock: ${data.data.stock_count}`);
            fetchMedicines();
          }
        } catch (e) {
          showToast('Failed to refill stock.', 'error');
        }
      });

      // Edit Click
      card.querySelector('.edit-btn').addEventListener('click', () => {
        activeEditId = med.id;
        document.getElementById('editMedName').value = med.name;
        document.getElementById('editMedDosage').value = med.dosage;
        document.getElementById('editMedForm').value = med.form;
        document.getElementById('editMedNotes').value = med.instructions || '';
        document.getElementById('editMedStock').value = med.stock_count;
        document.getElementById('editMedThreshold').value = med.low_stock_threshold;
        document.getElementById('editMedColor').value = med.color;
        editMedModal.classList.add('active');
      });

      // Delete Click
      card.querySelector('.delete-btn').addEventListener('click', () => {
        activeDeleteId = med.id;
        document.getElementById('deleteMedTarget').textContent = med.name;
        deleteMedModal.classList.add('active');
      });

      medListContent.appendChild(card);
    });
  }

  // Modals open/close
  document.getElementById('btnOpenAddMed').addEventListener('click', () => {
    addMedModal.classList.add('active');
  });

  document.querySelectorAll('.close-dlg').forEach(btn => {
    btn.addEventListener('click', () => {
      addMedModal.classList.remove('active');
      editMedModal.classList.remove('active');
      deleteMedModal.classList.remove('active');
    });
  });

  // Swatches
  function initSwatches(containerId, inputId) {
    const cont = document.getElementById(containerId);
    const hidden = document.getElementById(inputId);
    cont.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        cont.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        hidden.value = dot.dataset.color;
      });
    });
  }
  initSwatches('addColors', 'addMedColor');
  initSwatches('editColors', 'editMedColor');

  // Submit Add
  document.getElementById('addMedForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('addMedName').value.trim(),
      dosage: document.getElementById('addMedDosage').value.trim(),
      form: document.getElementById('addMedFormSelect').value,
      instructions: document.getElementById('addMedNotes').value.trim(),
      stock_count: parseInt(document.getElementById('addMedStock').value, 10) || 30,
      low_stock_threshold: parseInt(document.getElementById('addMedThreshold').value, 10) || 5,
      color: document.getElementById('addMedColor').value
    };

    try {
      const res = await fetch(`${API_BASE}/medicines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Prescription "${payload.name}" added successfully!`);
        addMedModal.classList.remove('active');
        document.getElementById('addMedForm').reset();
        fetchMedicines();
      } else {
        showToast(data.message || 'Error adding medicine.', 'error');
      }
    } catch (e) {
      showToast('Network error adding medicine.', 'error');
    }
  });

  // Submit Edit
  document.getElementById('editMedForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeEditId) return;

    const payload = {
      name: document.getElementById('editMedName').value.trim(),
      dosage: document.getElementById('editMedDosage').value.trim(),
      form: document.getElementById('editMedForm').value,
      instructions: document.getElementById('editMedNotes').value.trim(),
      stock_count: parseInt(document.getElementById('editMedStock').value, 10) || 0,
      low_stock_threshold: parseInt(document.getElementById('editMedThreshold').value, 10) || 0,
      color: document.getElementById('editMedColor').value
    };

    try {
      const res = await fetch(`${API_BASE}/medicines/${activeEditId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Prescription "${payload.name}" updated!`);
        editMedModal.classList.remove('active');
        fetchMedicines();
      } else {
        showToast(data.message || 'Error updating medicine.', 'error');
      }
    } catch (e) {
      showToast('Network error updating medicine.', 'error');
    }
  });

  // Confirm Delete
  document.getElementById('btnConfirmDeleteMed').addEventListener('click', async () => {
    if (!activeDeleteId) return;

    try {
      const res = await fetch(`${API_BASE}/medicines/${activeDeleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Prescription removed.');
        deleteMedModal.classList.remove('active');
        fetchMedicines();
      } else {
        showToast(data.message || 'Failed to delete medicine.', 'error');
      }
    } catch (e) {
      showToast('Network error deleting medicine.', 'error');
    }
  });

  function showToast(msg, type = 'success') {
    toast.textContent = msg;
    toast.className = `live-toast active ${type}`;
    setTimeout(() => {
      toast.className = 'live-toast';
    }, 3500);
  }
});
