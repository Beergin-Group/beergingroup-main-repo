/**
 * MediRemind — Web Authentication Logic & Live Validation
 * Week 3 Deliverable
 * Author: Jibson Cabilin (Front-End Developer)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const frame = document.getElementById('viewportFrame');
  const toast = document.getElementById('toastNotice');

  // Device switcher
  document.querySelectorAll('.device-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      frame.className = `viewport-frame mode-${mode}`;
    });
  });

  // Tab switching
  tabLogin.addEventListener('click', () => switchTab('login'));
  tabRegister.addEventListener('click', () => switchTab('register'));

  function switchTab(mode) {
    if (mode === 'login') {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      document.getElementById('authCardTitle').textContent = 'Sign In to MediRemind';
      document.getElementById('authCardSub').textContent = 'Access your personal medicine schedule and reminders';
    } else {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      document.getElementById('authCardTitle').textContent = 'Create an Account';
      document.getElementById('authCardSub').textContent = 'Join MediRemind to safeguard your daily prescription routine';
    }
  }

  // Toggle Password Visibility
  document.querySelectorAll('.toggle-pwd').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    });
  });

  // Password Strength Meter for Registration
  const regPassword = document.getElementById('regPassword');
  const segments = [
    document.getElementById('seg1'),
    document.getElementById('seg2'),
    document.getElementById('seg3'),
    document.getElementById('seg4'),
  ];
  const strengthText = document.getElementById('strengthText');

  regPassword.addEventListener('input', () => {
    const pwd = regPassword.value;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/\d/.test(pwd)) score++;
    if (/[a-zA-Z]/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;

    const colors = ['#e2e8f0', '#ef4444', '#f59e0b', '#3b82f6', '#0d9488'];
    const labels = ['None', 'Weak (min 8 chars)', 'Fair', 'Good', 'Strong Password'];

    segments.forEach((seg, idx) => {
      if (idx < score) {
        seg.style.background = colors[score];
      } else {
        seg.style.background = '#e2e8f0';
      }
    });

    strengthText.textContent = labels[score];
    strengthText.style.color = score > 0 ? colors[score] : '#64748b';
  });

  // Role Option Selector
  document.querySelectorAll('.role-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.role-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      opt.querySelector('input').checked = true;
    });
  });

  // Demo account quick fillers
  document.getElementById('btnDemoPatient').addEventListener('click', () => {
    switchTab('login');
    document.getElementById('loginEmail').value = 'patient@mediremind.com';
    document.getElementById('loginPassword').value = 'password123';
    showToast('Loaded Patient credentials (patient@mediremind.com)', 'success');
  });

  document.getElementById('btnDemoCaregiver').addEventListener('click', () => {
    switchTab('login');
    document.getElementById('loginEmail').value = 'caregiver@mediremind.com';
    document.getElementById('loginPassword').value = 'password123';
    showToast('Loaded Caregiver credentials (caregiver@mediremind.com)', 'success');
  });

  // Form Submissions
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    let valid = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInvalid('loginEmail', 'Please enter a valid email address.');
      valid = false;
    } else {
      clearInvalid('loginEmail');
    }

    if (!password || password.length < 6) {
      setInvalid('loginPassword', 'Password must be at least 6 characters.');
      valid = false;
    } else {
      clearInvalid('loginPassword');
    }

    if (!valid) return;

    // Simulate / Live Backend Call
    const submitBtn = loginForm.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Authenticating...';

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('mediremind_token', data.token);
        localStorage.setItem('mediremind_user', JSON.stringify(data.user));
        showToast(`Welcome back, ${data.user.name}! (${data.user.role})`, 'success');
      } else {
        showToast(data.message || 'Invalid email or password.', 'error');
      }
    } catch (err) {
      // Local fallback simulation if server is offline
      if ((email === 'patient@mediremind.com' || email === 'caregiver@mediremind.com') && password === 'password123') {
        showToast(`Offline Demo Success: Authenticated as ${email}!`, 'success');
      } else {
        showToast('Server offline or invalid credentials.', 'error');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Sign In <span>→</span>';
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    const role = document.querySelector('input[name="role"]:checked')?.value || 'patient';
    const phone = document.getElementById('regPhone').value.trim();

    let valid = true;
    if (!name || name.length < 2) {
      setInvalid('regName', 'Full name must be at least 2 characters.');
      valid = false;
    } else {
      clearInvalid('regName');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInvalid('regEmail', 'Please enter a valid email address.');
      valid = false;
    } else {
      clearInvalid('regEmail');
    }

    if (!password || password.length < 8 || !/\d/.test(password)) {
      setInvalid('regPassword', 'Password must be at least 8 characters with at least one digit.');
      valid = false;
    } else {
      clearInvalid('regPassword');
    }

    if (password !== confirm) {
      setInvalid('regConfirm', 'Passwords do not match.');
      valid = false;
    } else {
      clearInvalid('regConfirm');
    }

    if (!valid) return;

    const submitBtn = registerForm.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, phone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('mediremind_token', data.token);
        localStorage.setItem('mediremind_user', JSON.stringify(data.user));
        showToast(`Account successfully created for ${name}!`, 'success');
        setTimeout(() => switchTab('login'), 1500);
      } else {
        showToast(data.message || 'Registration failed.', 'error');
      }
    } catch (err) {
      showToast(`Offline Demo: Account created locally for ${name} (${role})!`, 'success');
      setTimeout(() => switchTab('login'), 1500);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Create Account <span>✓</span>';
    }
  });

  function setInvalid(id, msg) {
    const input = document.getElementById(id);
    input.classList.add('is-invalid');
    const feedback = input.parentElement.parentElement.querySelector('.invalid-feedback');
    if (feedback) feedback.textContent = msg;
  }

  function clearInvalid(id) {
    const input = document.getElementById(id);
    input.classList.remove('is-invalid');
  }

  function showToast(msg, type = 'success') {
    toast.textContent = msg;
    toast.className = `toast-notice show ${type}`;
    setTimeout(() => {
      toast.className = 'toast-notice';
    }, 4000);
  }
});
