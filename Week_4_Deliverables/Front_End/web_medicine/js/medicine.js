/**
 * MediRemind — Web Medicine Management CRUD Logic
 * Week 4 Deliverable
 * Author: Jibson Cabilin (Front-End Developer)
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let medicines = [
    {
      id: 1,
      name: 'Metformin HCl',
      dosage: '500 mg',
      form: 'tablet',
      instructions: 'Take with breakfast and dinner to lower blood sugar',
      stock_count: 42,
      low_stock_threshold: 10,
      color: '#0d9488'
    },
    {
      id: 2,
      name: 'Lisinopril',
      dosage: '10 mg',
      form: 'tablet',
      instructions: 'Take 1 tablet every morning with full glass of water',
      stock_count: 4,
      low_stock_threshold: 7,
      color: '#0284c7'
    },
    {
      id: 3,
      name: 'Atorvastatin',
      dosage: '20 mg',
      form: 'tablet',
      instructions: 'Take at bedtime for cholesterol control',
      stock_count: 28,
      low_stock_threshold: 5,
      color: '#8b5cf6'
    },
    {
      id: 4,
      name: 'Vitamin D3',
      dosage: '1000 IU',
      form: 'capsule',
      instructions: 'Take once daily with food',
      stock_count: 60,
      low_stock_threshold: 10,
      color: '#f59e0b'
    }
  ];

  let currentSearch = '';
  let currentFormFilter = 'all';
  let activeEditId = null;
  let activeDeleteId = null;

  // DOM Elements
  const medicineList = document.getElementById('medicineList');
  const searchInput = document.getElementById('searchInput');
  const frame = document.getElementById('viewportFrame');
  const addModal = document.getElementById('addModal');
  const editModal = document.getElementById('editModal');
  const deleteModal = document.getElementById('deleteModal');
  const toast = document.getElementById('toastMsg');

  // Device switcher
  document.querySelectorAll('.device-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      frame.className = `viewport-frame mode-${btn.dataset.mode}`;
    });
  });

  // Filter Chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFormFilter = chip.dataset.form;
      render();
    });
  });

  // Search
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    render();
  });

  // Color Swatch Selection
  function setupSwatches(containerId, hiddenInputId) {
    const container = document.getElementById(containerId);
    const hidden = document.getElementById(hiddenInputId);
    container.querySelectorAll('.swatch-btn').forEach(sw => {
      sw.addEventListener('click', () => {
        container.querySelectorAll('.swatch-btn').forEach(s => s.classList.remove('selected'));
        sw.classList.add('selected');
        hidden.value = sw.dataset.color;
      });
    });
  }
  setupSwatches('addSwatches', 'addColor');
  setupSwatches('editSwatches', 'editColor');

  // Open / Close Modals
  document.getElementById('btnOpenAdd').addEventListener('click', () => {
    addModal.classList.add('open');
  });

  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      addModal.classList.remove('open');
      editModal.classList.remove('open');
      deleteModal.classList.remove('open');
    });
  });

  // Submit Add
  document.getElementById('addForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('addName').value.trim();
    const dosage = document.getElementById('addDosage').value.trim();
    const form = document.getElementById('addFormSelect').value;
    const instructions = document.getElementById('addInstructions').value.trim();
    const stock = parseInt(document.getElementById('addStock').value, 10) || 30;
    const threshold = parseInt(document.getElementById('addThreshold').value, 10) || 5;
    const color = document.getElementById('addColor').value;

    if (!name || !dosage) {
      alert('Name and dosage are required.');
      return;
    }

    const newMed = {
      id: Date.now(),
      name,
      dosage,
      form,
      instructions,
      stock_count: stock,
      low_stock_threshold: threshold,
      color
    };

    medicines.unshift(newMed);
    addModal.classList.remove('open');
    document.getElementById('addForm').reset();
    showToast(`Added "${name}" to your medicine catalog!`);
    render();
  });

  // Submit Edit
  document.getElementById('editForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!activeEditId) return;

    const med = medicines.find(m => m.id === activeEditId);
    if (!med) return;

    med.name = document.getElementById('editName').value.trim();
    med.dosage = document.getElementById('editDosage').value.trim();
    med.form = document.getElementById('editFormSelect').value;
    med.instructions = document.getElementById('editInstructions').value.trim();
    med.stock_count = parseInt(document.getElementById('editStock').value, 10) || 0;
    med.low_stock_threshold = parseInt(document.getElementById('editThreshold').value, 10) || 0;
    med.color = document.getElementById('editColor').value;

    editModal.classList.remove('open');
    showToast(`Updated "${med.name}" prescription!`);
    render();
  });

  // Confirm Delete
  document.getElementById('btnConfirmDelete').addEventListener('click', () => {
    if (!activeDeleteId) return;
    const idx = medicines.findIndex(m => m.id === activeDeleteId);
    if (idx !== -1) {
      const deletedName = medicines[idx].name;
      medicines.splice(idx, 1);
      showToast(`"${deletedName}" removed from catalog.`);
    }
    deleteModal.classList.remove('open');
    render();
  });

  // Render Function
  function render() {
    medicineList.innerHTML = '';

    const filtered = medicines.filter(m => {
      const matchQuery = m.name.toLowerCase().includes(currentSearch) || m.dosage.toLowerCase().includes(currentSearch);
      const matchForm = currentFormFilter === 'all' || m.form.toLowerCase() === currentFormFilter.toLowerCase();
      return matchQuery && matchForm;
    });

    if (filtered.length === 0) {
      medicineList.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #94a3b8;">
          <div style="font-size: 40px;">💊</div>
          <div style="font-size: 16px; font-weight: 600; margin-top: 8px;">No medications found</div>
          <div style="font-size: 12px; margin-top: 4px;">Try searching for another name or click "+ New Medicine"</div>
        </div>
      `;
      return;
    }

    filtered.forEach(med => {
      const isLow = med.stock_count <= med.low_stock_threshold;
      const card = document.createElement('div');
      card.className = 'medicine-card';
      card.innerHTML = `
        <div class="card-top">
          <div class="med-info">
            <div class="med-icon-tag" style="background: ${med.color}22; color: ${med.color}; border: 1.5px solid ${med.color}66;">
              💊
            </div>
            <div>
              <div class="med-name">${med.name}</div>
              <div class="med-sub">
                <span class="dosage-badge">${med.dosage}</span>
                <span class="form-badge">${med.form}</span>
              </div>
            </div>
          </div>
          <div class="stock-chip ${isLow ? 'low' : 'normal'}">
            ${isLow ? '⚠️ ' : ''}${med.stock_count} units
          </div>
        </div>

        ${med.instructions ? `<div class="med-instructions">“${med.instructions}”</div>` : ''}

        <div class="card-actions">
          <button class="btn-refill" data-id="${med.id}">+ Refill (30)</button>
          <div class="icon-actions">
            <button class="btn-icon edit-btn" data-id="${med.id}" title="Edit Prescription">✏️</button>
            <button class="btn-icon delete delete-btn" data-id="${med.id}" title="Delete Prescription">🗑️</button>
          </div>
        </div>
      `;

      // Refill
      card.querySelector('.btn-refill').addEventListener('click', () => {
        med.stock_count += 30;
        showToast(`Refilled +30 units for ${med.name}. New total: ${med.stock_count}`);
        render();
      });

      // Edit
      card.querySelector('.edit-btn').addEventListener('click', () => {
        activeEditId = med.id;
        document.getElementById('editName').value = med.name;
        document.getElementById('editDosage').value = med.dosage;
        document.getElementById('editFormSelect').value = med.form;
        document.getElementById('editInstructions').value = med.instructions || '';
        document.getElementById('editStock').value = med.stock_count;
        document.getElementById('editThreshold').value = med.low_stock_threshold;
        document.getElementById('editColor').value = med.color;
        editModal.classList.add('open');
      });

      // Delete
      card.querySelector('.delete-btn').addEventListener('click', () => {
        activeDeleteId = med.id;
        document.getElementById('deleteTargetName').textContent = med.name;
        deleteModal.classList.add('open');
      });

      medicineList.appendChild(card);
    });
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.className = 'toast-msg show success';
    setTimeout(() => {
      toast.className = 'toast-msg';
    }, 3500);
  }

  // Initial load
  render();
});
