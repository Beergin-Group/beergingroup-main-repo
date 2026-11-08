/**
 * MediRemind Web System — app.js
 * Production-quality front-end logic for the MediRemind dashboard.
 * Requires: js/icons.js (defines window.Icons + getMedFormIcon) loaded first.
 */

'use strict';

/* ─────────────────────────── CONSTANTS & STATE ─────────────────────────── */

const API = '/api';

let token            = localStorage.getItem('mr_token') || null;
let user             = JSON.parse(localStorage.getItem('mr_user') || 'null');
let activeDependentId = null;

let _countdownInterval = null;   // next-dose live countdown timer
let _clockInterval     = null;   // top-bar clock
let _alarmDose         = null;   // dose currently being alarmed

/* ───────────────────────────── BOOTSTRAP ───────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Clean up legacy service worker caches to prevent development caching bugs
  if ('caches' in window) {
    caches.keys().then(keys => {
      keys.forEach(k => {
        if (k !== 'mediremind-ws-v3') caches.delete(k);
      });
    }).catch(() => {});
  }

  // Register modern Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        reg.update();
      })
      .catch(() => {});
  }

  _setupAuthTabs();

  if (token) {
    _showApp();
    initApp();
  } else {
    _showAuth();
  }

  // Global modal close buttons
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.modalClose;
      _closeModal(id);
    });
  });

  // Sidebar Toggle (Supports both Desktop Collapsible Sidebar and Mobile Drawer)
  function toggleSidebar() {
    const isMobile = window.innerWidth <= 1024;
    const sidebar  = document.querySelector('.sidebar');
    const overlay  = document.getElementById('sidebar-overlay') || document.querySelector('.sidebar-overlay');
    const layout   = document.querySelector('.app-layout');

    if (isMobile) {
      const isOpen = sidebar?.classList.toggle('sidebar-open');
      sidebar?.classList.toggle('open', !!isOpen);
      overlay?.classList.toggle('sidebar-open', !!isOpen);
      overlay?.classList.toggle('active', !!isOpen);
    } else {
      // Desktop collapse toggle
      layout?.classList.toggle('sidebar-collapsed');
      document.body.classList.toggle('sidebar-collapsed');
    }
  }

  function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay') || document.querySelector('.sidebar-overlay');
    sidebar?.classList.remove('sidebar-open', 'open');
    overlay?.classList.remove('sidebar-open', 'active');
  }

  const hamburger = document.getElementById('hamburger-btn');
  if (hamburger) {
    hamburger.addEventListener('click', toggleSidebar);
  }

  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeMobileSidebar);
  }

  // Nav items
  document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
    item.addEventListener('click', () => {
      switchTab(item.dataset.tab);
      closeMobileSidebar();
    });
  });

  // Notifications button
  const notifBtn = document.getElementById('enable-notif-btn');
  if (notifBtn) notifBtn.addEventListener('click', enableNotifications);

  // Alarm modal actions
  document.getElementById('alarm-take-btn')?.addEventListener('click',    () => handleAlarm('take'));
  document.getElementById('alarm-snooze-btn')?.addEventListener('click',  () => handleAlarm('snooze'));
  document.getElementById('alarm-dismiss-btn')?.addEventListener('click', () => handleAlarm('dismiss'));

  // Medicine modal save
  document.getElementById('medicine-form')?.addEventListener('submit', saveMedicine);

  // Add medicine button
  document.getElementById('add-medicine-btn')?.addEventListener('click', showAddMedicineModal);

  // Caregiver form
  document.getElementById('dependent-form')?.addEventListener('submit', saveDependent);
  document.getElementById('add-dependent-btn')?.addEventListener('click', showAddDependentModal);

  // Confirm modal buttons
  document.getElementById('confirm-yes-btn')?.addEventListener('click', _confirmYes);
  document.getElementById('confirm-no-btn')?.addEventListener('click',  () => _closeModal('confirm-modal'));

  // Adherence export
  document.getElementById('export-btn')?.addEventListener('click', () => {
    window.open(API + '/adherence/export', '_blank');
  });
});

/* ─────────────────────────── AUTH HELPERS ──────────────────────────────── */

function _showApp() {
  const authScreen = document.getElementById('auth-screen') || document.querySelector('.auth-screen');
  const appLayout  = document.querySelector('.app-layout');
  if (authScreen) authScreen.classList.add('hidden');
  if (appLayout)  appLayout.classList.remove('hidden');
}

function _showAuth() {
  const authScreen = document.getElementById('auth-screen') || document.querySelector('.auth-screen');
  const appLayout  = document.querySelector('.app-layout');
  if (authScreen) authScreen.classList.remove('hidden');
  if (appLayout)  appLayout.classList.add('hidden');
  switchAuthTab('panel-login');
}

function switchAuthTab(target) {
  const targetId = target === 'register' || target === 'panel-register' ? 'panel-register' : 'panel-login';
  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(t => {
    const isTarget = t.dataset.target === targetId || (targetId === 'panel-login' && t.dataset.target === 'panel-login');
    t.classList.toggle('active', isTarget);
  });
  document.querySelectorAll('.auth-panel').forEach(p => {
    p.classList.remove('active');
    p.classList.add('hidden');
  });
  const targetEl = document.getElementById(targetId);
  if (targetEl) {
    targetEl.classList.add('active');
    targetEl.classList.remove('hidden');
  }
}

function _setupAuthTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(tab => {
    tab.onclick = () => {
      switchAuthTab(tab.dataset.target);
    };
  });

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.onsubmit = async e => {
      e.preventDefault();
      const email    = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      await login(email, password);
    };
  }

  // Register form
  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.onsubmit = async e => {
      e.preventDefault();
      const name     = document.getElementById('reg-name').value.trim();
      const email    = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const role     = document.getElementById('reg-role')?.value || 'patient';
      await register(name, email, password, role);
    };
  }

  // Password strength meter
  const regPassword = document.getElementById('reg-password');
  if (regPassword) {
    regPassword.oninput = () => {
      _updatePasswordStrength(regPassword.value);
    };
  }
}

function _updatePasswordStrength(value) {
  const meter = document.getElementById('password-strength');
  if (!meter) return;
  let score = 0;
  if (value.length >= 8)  score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const tiers = [
    { label: 'Weak',   cls: 'strength-weak',   min: 0 },
    { label: 'Fair',   cls: 'strength-fair',   min: 2 },
    { label: 'Good',   cls: 'strength-good',   min: 3 },
    { label: 'Strong', cls: 'strength-strong', min: 4 },
  ];
  let tier = tiers[0];
  for (const t of tiers) { if (score >= t.min) tier = t; }

  meter.className = `password-strength ${tier.cls}`;
  meter.textContent = tier.label;
}

/* ─────────────────────────── AUTH FUNCTIONS ────────────────────────────── */

async function login(email, password) {
  const btn = document.getElementById('login-btn');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Signing in...';
  }
  const res = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
  if (!res) return;
  if (res.success === false || res.error) {
    toast(res.message || res.error || 'Invalid email or password.', 'danger');
    return;
  }
  token = res.token;
  user  = res.user;
  localStorage.setItem('mr_token', token);
  localStorage.setItem('mr_user',  JSON.stringify(user));
  _showApp();
  initApp();
  toast('Welcome back, ' + (user.name || 'User') + '!', 'success');
}

async function register(name, email, password, role) {
  const btn = document.getElementById('register-btn');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Creating account...';
  }
  const res = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
  if (!res) return;
  if (res.success === false || res.error) {
    toast(res.message || res.error || 'Registration failed.', 'danger');
    return;
  }
  toast('Account created! Signing you in…', 'success');
  await login(email, password);
}

function logout() {
  localStorage.removeItem('mr_token');
  localStorage.removeItem('mr_user');
  token = null;
  user  = null;
  activeDependentId = null;

  if (_countdownInterval) {
    clearInterval(_countdownInterval);
    _countdownInterval = null;
  }
  if (_clockInterval) {
    clearInterval(_clockInterval);
    _clockInterval = null;
  }

  // Reset auth forms
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.reset();
  const regForm = document.getElementById('register-form');
  if (regForm) regForm.reset();

  // Reset header & sidebar display
  const sidebarName = document.getElementById('sidebar-username');
  if (sidebarName) sidebarName.textContent = 'User';

  _showAuth();
  toast('You have been signed out.', 'info');
}

function updateUserUI() {
  if (!user) return;
  const name     = user.name  || 'User';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const role     = user.role  || 'patient';

  // Sidebar
  const sidebarName     = document.getElementById('sidebar-username');
  const sidebarInitials = document.getElementById('sidebar-initials');
  const sidebarRole     = document.getElementById('sidebar-role-badge');
  if (sidebarName)     sidebarName.textContent     = name;
  if (sidebarInitials) sidebarInitials.textContent = initials;
  if (sidebarRole) {
    sidebarRole.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    sidebarRole.className   = `role-badge role-${role}`;
  }

  // Topbar
  const topbarUser = document.getElementById('topbar-username');
  if (topbarUser) topbarUser.textContent = name;

  // Logout button
  document.getElementById('logout-btn')?.addEventListener('click', logout);
}

/* ─────────────────────────── initApp ───────────────────────────────────── */

function initApp() {
  updateUserUI();
  checkCaregiverMode();
  loadDashboard();
  startClockSync();
  switchTab('dashboard');
}

/* ─────────────────────────── API HELPER ────────────────────────────────── */

async function api(endpoint, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const r = await fetch(API + endpoint, { ...opts, headers });
    if (r.status === 401 && !endpoint.startsWith('/auth/')) {
      logout();
      return null;
    }
    const data = await r.json();
    return data;
  } catch (e) {
    toast('Network error: ' + e.message, 'danger');
    return null;
  }
}

/* ─────────────────────────── NAVIGATION ────────────────────────────────── */

function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('hidden', pane.dataset.tab !== tabId);
  });

  switch (tabId) {
    case 'dashboard':  loadDashboard();       break;
    case 'medicines':  loadMedicines();        break;
    case 'adherence':  loadAdherenceReport();  break;
    case 'caregiver':  loadCaregiverView();    break;
  }
}

/* ─────────────────────────── CLOCK & DATE ──────────────────────────────── */

function _updateClock() {
  const now    = new Date();
  const dateEl = document.getElementById('current-date-display');
  const timeEl = document.getElementById('topbar-time');

  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }
  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
  }
}

function startClockSync() {
  _updateClock();
  if (_clockInterval) clearInterval(_clockInterval);
  _clockInterval = setInterval(_updateClock, 60_000);
}

/* ───────────────────────────── TOAST ───────────────────────────────────── */

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;

  let icon = '';
  if (typeof Icons !== 'undefined') {
    if      (type === 'success') icon = Icons.checkCircle('toast-icon', 16);
    else if (type === 'danger')  icon = Icons.xCircle('toast-icon', 16);
    else if (type === 'warning') icon = Icons.alertTriangle('toast-icon', 16);
    else                         icon = Icons.info('toast-icon', 16);
  }

  el.innerHTML = icon + `<span>${_escapeHTML(msg)}</span>`;
  const stack  = document.getElementById('toast-stack');
  if (stack) stack.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

/* ─────────────────────────── CONFIRM MODAL ─────────────────────────────── */

let _pendingConfirm = null;

function confirmAction(message, onConfirm) {
  const modal   = document.getElementById('confirm-modal');
  const msgEl   = document.getElementById('confirm-message');
  if (!modal) { onConfirm(); return; }

  if (msgEl) msgEl.textContent = message;
  _pendingConfirm = onConfirm;
  _openModal('confirm-modal');
}

function _confirmYes() {
  _closeModal('confirm-modal');
  if (typeof _pendingConfirm === 'function') {
    const fn = _pendingConfirm;
    _pendingConfirm = null;
    fn();
  }
}

/* ─────────────────────────── MODAL HELPERS ─────────────────────────────── */

function _openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('hidden'); el.setAttribute('aria-hidden', 'false'); }
}

function _closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('hidden'); el.setAttribute('aria-hidden', 'true'); }
}

/* ─────────────────────────── UTILITIES ─────────────────────────────────── */

function _escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _fmtTime(timeStr) {
  // timeStr like "08:30" or ISO
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(); d.setHours(h, m, 0);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function _secondsUntil(timeStr) {
  if (!timeStr) return Infinity;
  const now    = new Date();
  const target = timeStr.includes('T') ? new Date(timeStr) : (() => {
    const d2 = new Date(); const [h, m] = timeStr.split(':').map(Number);
    d2.setHours(h, m, 0, 0); return d2;
  })();
  return Math.floor((target - now) / 1000);
}

function _fmtCountdown(seconds) {
  if (seconds <= 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function _stockPercent(current, total) {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

/* ─────────────────────────── CHIME ─────────────────────────────────────── */

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[523.25, 0], [659.25, 0.15], [783.99, 0.3]].forEach(([freq, delay]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.28, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.7);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + 0.7);
    });
  } catch (_) {}
}

/* ─────────────────────────── ALARM MODAL ───────────────────────────────── */

function triggerAlarm(dose) {
  _alarmDose = dose;
  playChime();

  const modal    = document.getElementById('alarm-modal');
  const nameEl   = document.getElementById('alarm-dose-name');
  const timeEl2  = document.getElementById('alarm-dose-time');
  const iconEl   = document.getElementById('alarm-dose-icon');

  if (nameEl)  nameEl.textContent  = dose.medicine_name  || 'Medicine';
  if (timeEl2) timeEl2.textContent = _fmtTime(dose.scheduled_time);
  if (iconEl && typeof getMedFormIcon === 'function') {
    iconEl.innerHTML = getMedFormIcon(dose.form || '');
  }
  _openModal('alarm-modal');

  // Browser notification
  if (Notification.permission === 'granted') {
    new Notification('MediRemind — Time to take your dose', {
      body: `${dose.medicine_name || 'Medicine'} at ${_fmtTime(dose.scheduled_time)}`,
      icon: '/icons/icon-192.png',
    });
  }
}

async function handleAlarm(action) {
  _closeModal('alarm-modal');
  if (!_alarmDose) return;

  const dose = _alarmDose;
  _alarmDose = null;

  if (action === 'take') {
    await markDose(dose.schedule_id, dose.medicine_id, dose.scheduled_time, 'taken');
    toast('Dose marked as taken!', 'success');
  } else if (action === 'snooze') {
    await snoozeDose(dose.schedule_id, dose.medicine_id, dose.scheduled_time);
    toast('Snoozed for 10 minutes.', 'warning');
  } else {
    toast('Alarm dismissed.', 'info');
  }
  loadDashboard();
}

/* ═══════════════════════════ DASHBOARD MODULE ══════════════════════════════ */

async function loadDashboard() {
  const qp = activeDependentId ? `?dependent_id=${activeDependentId}` : '';

  const [dosesRes, summaryRes] = await Promise.all([
    api('/dose-logs/today' + qp),
    api('/adherence/summary' + (qp ? qp.replace('?', '&') : '')),
  ]);

  const doses   = dosesRes?.doses || dosesRes?.data || (Array.isArray(dosesRes) ? dosesRes : []);
  const summary = summaryRes?.data || summaryRes?.summary || summaryRes || {};

  _renderStatCards(summary, doses);
  renderDoseTimeline(doses);
  _startCountdown(doses);
}

function _renderStatCards(summary, doses) {
  const taken = doses.filter(d => d.status === 'taken').length;
  const total = doses.length;

  const todayEl = document.getElementById('stat-today-doses');
  if (todayEl) todayEl.textContent = `${taken} / ${total}`;

  const rateEl = document.getElementById('stat-adherence-rate');
  if (rateEl) rateEl.textContent = `${summary.adherence_rate ?? 0}%`;

  const streakEl = document.getElementById('stat-streak');
  if (streakEl) streakEl.textContent = `${summary.current_streak ?? summary.streak_days ?? 0} days`;

  const breakdown = summary.medicine_breakdown || summary.medicines || [];
  const lowCount = summary.low_stock_count ?? breakdown.filter(m => m.is_low_stock).length;
  const stockEl = document.getElementById('stat-low-stock');
  if (stockEl) stockEl.textContent = `${lowCount} Low`;
}

function renderDoseTimeline(doses) {
  const container = document.getElementById('dose-timeline');
  if (!container) return;

  if (!doses || doses.length === 0) {
    container.innerHTML = `<div class="empty-state">
      ${typeof Icons !== 'undefined' ? Icons.pill('empty-icon', 48) : ''}
      <p>No doses scheduled for today.</p>
    </div>`;
    return;
  }

  container.innerHTML = doses.map(dose => _buildDoseCard(dose)).join('');

  // Wire up action buttons
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { action, scheduleId, medicineId, scheduledTime } = btn.dataset;
      if (action === 'take')   markDose(scheduleId, medicineId, scheduledTime, 'taken');
      if (action === 'skip')   markDose(scheduleId, medicineId, scheduledTime, 'skipped');
      if (action === 'snooze') snoozeDose(scheduleId, medicineId, scheduledTime);
    });
  });
}

function _buildDoseCard(dose) {
  const formIcon  = typeof getMedFormIcon === 'function' ? getMedFormIcon(dose.form || '') : '';
  const timeLabel = _fmtTime(dose.scheduled_time);
  const mealLabel = dose.meal_timing ? `<span class="meal-timing">${_escapeHTML(dose.meal_timing)}</span>` : '';
  const statusCls = dose.status || 'pending';

  let actions = '';
  if (statusCls === 'pending' || !statusCls) {
    actions = `
      <button class="btn btn-sm btn-primary" data-action="take"
              data-schedule-id="${dose.schedule_id}"
              data-medicine-id="${dose.medicine_id}"
              data-scheduled-time="${_escapeHTML(dose.scheduled_time || '')}">
        ${typeof Icons !== 'undefined' ? Icons.check('', 14) : ''}Take
      </button>
      <button class="btn btn-sm btn-warning" data-action="snooze"
              data-schedule-id="${dose.schedule_id}"
              data-medicine-id="${dose.medicine_id}"
              data-scheduled-time="${_escapeHTML(dose.scheduled_time || '')}">
        ${typeof Icons !== 'undefined' ? Icons.clock('', 14) : ''}Snooze
      </button>
      <button class="btn btn-sm btn-ghost" data-action="skip"
              data-schedule-id="${dose.schedule_id}"
              data-medicine-id="${dose.medicine_id}"
              data-scheduled-time="${_escapeHTML(dose.scheduled_time || '')}">
        ${typeof Icons !== 'undefined' ? Icons.xCircle('', 14) : ''}Skip
      </button>`;
  } else {
    const badgeCls = statusCls === 'taken' ? 'badge-success'
                   : statusCls === 'skipped' ? 'badge-danger'
                   : 'badge-warning';
    const badgeTxt = statusCls.charAt(0).toUpperCase() + statusCls.slice(1);
    actions = `<span class="badge ${badgeCls}">${badgeTxt}</span>`;
  }

  return `
    <div class="dose-item dose-status-${_escapeHTML(statusCls)}">
      <div class="dose-icon-wrap">${formIcon}</div>
      <div class="dose-info">
        <div class="dose-name">${_escapeHTML(dose.medicine_name || 'Unknown')}</div>
        <div class="dose-meta">
          <span class="dose-time">${timeLabel}</span>
          ${mealLabel}
          ${dose.dosage ? `<span class="dose-dosage">${_escapeHTML(dose.dosage)}</span>` : ''}
        </div>
      </div>
      <div class="dose-actions">${actions}</div>
    </div>`;
}

function _startCountdown(doses) {
  if (_countdownInterval) clearInterval(_countdownInterval);

  const pending = doses
    .filter(d => !d.status || d.status === 'pending')
    .sort((a, b) => _secondsUntil(a.scheduled_time) - _secondsUntil(b.scheduled_time));

  const banner     = document.getElementById('countdown-banner');
  const bannerName = document.getElementById('countdown-dose-name');
  const bannerTime = document.getElementById('countdown-time');
  const timerEl    = document.getElementById('countdown-timer');

  if (!pending.length) {
    if (banner) banner.classList.add('hidden');
    return;
  }

  const next = pending[0];
  if (banner) banner.classList.remove('hidden');
  if (bannerName) bannerName.textContent = next.medicine_name || 'Next Dose';
  if (bannerTime) bannerTime.textContent = _fmtTime(next.scheduled_time);

  let alarmFired = false;

  _countdownInterval = setInterval(() => {
    const secs = _secondsUntil(next.scheduled_time);
    if (timerEl) timerEl.textContent = secs > 0 ? _fmtCountdown(secs) : '00:00';

    if (secs <= 0 && !alarmFired) {
      alarmFired = true;
      clearInterval(_countdownInterval);
      triggerAlarm(next);
    }
  }, 1000);
}

async function markDose(scheduleId, medicineId, scheduledTime, status) {
  const res = await api('/dose-logs', {
    method: 'POST',
    body: JSON.stringify({
      schedule_id:    scheduleId,
      medicine_id:    medicineId,
      scheduled_time: scheduledTime,
      status,
      dependent_id:   activeDependentId || undefined,
    }),
  });
  if (res && !res.error) {
    const labels = { taken: 'taken', skipped: 'skipped' };
    toast(`Dose marked as ${labels[status] || status}.`, status === 'taken' ? 'success' : 'warning');
    loadDashboard();
  } else if (res?.error) {
    toast(res.error, 'danger');
  }
}

async function snoozeDose(scheduleId, medicineId, scheduledTime) {
  const res = await api('/dose-logs/snooze', {
    method: 'POST',
    body: JSON.stringify({
      schedule_id:    scheduleId,
      medicine_id:    medicineId,
      scheduled_time: scheduledTime,
      dependent_id:   activeDependentId || undefined,
    }),
  });
  if (res && !res.error) {
    toast('Dose snoozed for 10 minutes.', 'warning');
    loadDashboard();
  } else if (res?.error) {
    toast(res.error, 'danger');
  }
}

/* ═══════════════════════════ MEDICINES MODULE ══════════════════════════════ */

let _editingMedicineId = null;
let _editingScheduleId = null;

async function loadMedicines() {
  const qp = activeDependentId ? `?dependent_id=${activeDependentId}` : '';
  const [medsRes, schedsRes] = await Promise.all([
    api('/medicines' + qp),
    api('/schedules' + qp),
  ]);

  const meds  = medsRes?.data || medsRes?.medicines || (Array.isArray(medsRes) ? medsRes : []);
  const scheds = schedsRes?.data || schedsRes?.schedules || (Array.isArray(schedsRes) ? schedsRes : []);

  _renderMedsGrid(meds, scheds);
}

function _renderMedsGrid(meds, scheds) {
  const grid = document.getElementById('meds-grid');
  if (!grid) return;

  if (!meds.length) {
    grid.innerHTML = `<div class="empty-state">
      ${typeof Icons !== 'undefined' ? Icons.pill('empty-icon', 48) : ''}
      <p>No medicines added yet.</p>
    </div>`;
    return;
  }

  grid.innerHTML = meds.map(med => {
    const sched     = scheds.find(s => Number(s.medicine_id) === Number(med.id)) || null;
    const currentStock = med.stock_count ?? med.stock_current ?? med.quantity ?? 0;
    const totalStock = med.stock_total ?? med.quantity_total ?? 40;
    const stockPct  = _stockPercent(currentStock, totalStock);
    const lowStock  = med.is_low_stock || (currentStock <= (med.low_stock_threshold ?? 5));
    const formIcon  = typeof getMedFormIcon === 'function' ? getMedFormIcon(med.form || '') : '';
    let doseTimes = [];
    if (sched) {
      if (Array.isArray(sched.dose_times)) doseTimes = sched.dose_times;
      else if (typeof sched.dose_times === 'string') {
        try { doseTimes = JSON.parse(sched.dose_times); } catch(_) { doseTimes = [sched.dose_times]; }
      } else if (sched.times) {
        doseTimes = Array.isArray(sched.times) ? sched.times : [sched.times];
      }
    }

    return `
      <div class="med-card" data-id="${med.id}">
        <div class="med-card-header">
          <div class="med-icon-box med-form-${_escapeHTML((med.form || 'pill').toLowerCase())}">${formIcon}</div>
          <div class="med-info">
            <div class="med-name">${_escapeHTML(med.name || 'Unknown')}</div>
            <div class="med-dosage">${_escapeHTML(med.dosage || '')}</div>
          </div>
          ${lowStock ? `<span class="badge badge-danger">Low Stock</span>` : ''}
        </div>
        ${med.instructions ? `<p class="med-instructions">${_escapeHTML(med.instructions)}</p>` : ''}
        <div class="med-stock">
          <div class="stock-label">
            <span>Stock</span>
            <span>${currentStock} remaining</span>
          </div>
          <div class="stock-bar">
            <div class="stock-fill ${lowStock ? 'stock-low' : ''}" style="width:${stockPct}%"></div>
          </div>
        </div>
        ${doseTimes.length ? `<div class="med-times">${doseTimes.map(t => `<span class="time-badge">${typeof Icons !== 'undefined' ? Icons.clock('',12) : ''}${_escapeHTML(_fmtTime(t))}</span>`).join('')}</div>` : ''}
        <div class="med-card-actions">
          <button class="btn btn-sm btn-ghost" data-refill-id="${med.id}">
            ${typeof Icons !== 'undefined' ? Icons.plus('',14) : ''}Refill
          </button>
          <button class="btn btn-sm btn-secondary" data-edit-id="${med.id}">
            ${typeof Icons !== 'undefined' ? Icons.edit('',14) : ''}Edit
          </button>
          <button class="btn btn-sm btn-danger" data-delete-id="${med.id}">
            ${typeof Icons !== 'undefined' ? Icons.trash('',14) : ''}Delete
          </button>
        </div>
      </div>`;
  }).join('');

  // Wire up buttons
  grid.querySelectorAll('[data-refill-id]').forEach(btn => {
    btn.addEventListener('click', () => _refillMedicine(btn.dataset.refillId));
  });
  grid.querySelectorAll('[data-edit-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const med   = meds.find(m => String(m.id) === btn.dataset.editId);
      const sched = scheds.find(s => String(s.medicine_id) === btn.dataset.editId) || null;
      if (med) showEditMedicineModal(med, sched);
    });
  });
  grid.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmAction('Delete this medicine and all its schedules?', async () => {
        await _deleteMedicine(btn.dataset.deleteId);
      });
    });
  });
}

async function _refillMedicine(id) {
  const qty = prompt('Enter refill quantity:');
  if (!qty || isNaN(Number(qty))) return;
  const res = await api(`/medicines/${id}/refill`, {
    method: 'POST',
    body: JSON.stringify({ quantity: Number(qty) }),
  });
  if (res && !res.error) {
    toast('Medicine refilled!', 'success');
    loadMedicines();
  } else if (res?.error) {
    toast(res.error, 'danger');
  }
}

async function _deleteMedicine(id) {
  const res = await api(`/medicines/${id}`, { method: 'DELETE' });
  if (res && !res.error) {
    toast('Medicine deleted.', 'success');
    loadMedicines();
  } else if (res?.error) {
    toast(res.error, 'danger');
  }
}

function showAddMedicineModal() {
  _editingMedicineId = null;
  _editingScheduleId = null;
  const form = document.getElementById('medicine-form');
  if (form) form.reset();
  const title = document.getElementById('medicine-modal-title');
  if (title) title.textContent = 'Add Medicine';
  _openModal('medicine-modal');
}

function showEditMedicineModal(med, sched) {
  _editingMedicineId = med.id;
  _editingScheduleId = sched?.id || null;

  const fields = {
    'med-name':         med.name        || '',
    'med-form':         med.form        || 'pill',
    'med-dosage':       med.dosage      || '',
    'med-instructions': med.instructions|| '',
    'med-stock':        med.stock_current ?? med.quantity ?? '',
    'med-stock-total':  med.stock_total  ?? med.quantity_total ?? '',
    'sched-times':      sched ? (Array.isArray(sched.times) ? sched.times.join(', ') : sched.times || '') : '',
    'sched-meal':       sched?.meal_timing || '',
    'sched-days':       sched?.days_of_week || 'daily',
  };

  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });

  const title = document.getElementById('medicine-modal-title');
  if (title) title.textContent = 'Edit Medicine';
  _openModal('medicine-modal');
}

async function saveMedicine(e) {
  e.preventDefault();

  const name         = document.getElementById('med-name')?.value.trim();
  const form         = document.getElementById('med-form')?.value  || 'pill';
  const dosage       = document.getElementById('med-dosage')?.value.trim();
  const instructions = document.getElementById('med-instructions')?.value.trim();
  const stockCurrent = Number(document.getElementById('med-stock')?.value        || 0);
  const stockTotal   = Number(document.getElementById('med-stock-total')?.value  || 0);
  const timesRaw     = document.getElementById('sched-times')?.value.trim();
  const mealTiming   = document.getElementById('sched-meal')?.value  || '';
  const daysOfWeek   = document.getElementById('sched-days')?.value  || 'daily';

  if (!name) { toast('Medicine name is required.', 'danger'); return; }

  const medPayload = {
    name, form, dosage, instructions,
    stock_current: stockCurrent,
    stock_total:   stockTotal,
  };

  let medRes;
  if (_editingMedicineId) {
    medRes = await api(`/medicines/${_editingMedicineId}`, {
      method: 'PUT',
      body: JSON.stringify(medPayload),
    });
  } else {
    medRes = await api('/medicines', {
      method: 'POST',
      body: JSON.stringify(medPayload),
    });
  }

  if (!medRes || medRes.error) {
    toast(medRes?.error || 'Failed to save medicine.', 'danger');
    return;
  }

  const medicineId = medRes.medicine?.id || medRes.id || _editingMedicineId;

  // Schedule
  if (timesRaw) {
    const times = timesRaw.split(',').map(t => t.trim()).filter(Boolean);
    const schedPayload = { medicine_id: medicineId, times, meal_timing: mealTiming, days_of_week: daysOfWeek };

    if (_editingScheduleId) {
      await api(`/schedules/${_editingScheduleId}`, {
        method: 'PUT',
        body: JSON.stringify(schedPayload),
      });
    } else {
      await api('/schedules', {
        method: 'POST',
        body: JSON.stringify(schedPayload),
      });
    }
  }

  _closeModal('medicine-modal');
  toast(_editingMedicineId ? 'Medicine updated!' : 'Medicine added!', 'success');
  loadMedicines();
}

/* ═══════════════════════════ ADHERENCE MODULE ══════════════════════════════ */

async function loadAdherenceReport() {
  const qp = activeDependentId ? `?dependent_id=${activeDependentId}` : '';
  const [summaryRes, weeklyRes] = await Promise.all([
    api('/adherence/summary' + qp),
    api('/adherence/weekly' + qp),
  ]);

  const summary = summaryRes?.data || summaryRes?.summary || summaryRes || {};
  const weekly  = weeklyRes?.data || weeklyRes?.weekly || (Array.isArray(weeklyRes) ? weeklyRes : []);

  // Update subtitle if caregiver
  const subEl = document.getElementById('adherence-subtitle');
  if (subEl && user?.role === 'caregiver') {
    const depSelect = document.getElementById('adherence-dep-select') || document.getElementById('dep-select');
    const selectedText = depSelect?.selectedOptions?.[0]?.text?.replace(/^Patient:\s*/i, '') || 'My Schedule (Personal)';
    subEl.textContent = `Showing clinical compliance records for: ${selectedText}`;
  } else if (subEl) {
    subEl.textContent = 'Review adherence percentages, weekly consistency, and clinical medication history.';
  }

  _renderAdherenceSummary(summary);
  _renderAdherenceChart(weekly);
  _renderAdherenceTable(summary.medicine_breakdown || summary.medicines || []);
}

function _renderAdherenceSummary(summary) {
  const bigPct = document.getElementById('adherence-big-pct');
  if (bigPct) bigPct.textContent = `${summary.adherence_rate ?? 0}%`;

  const takenEl   = document.getElementById('adherence-taken-count');
  const skippedEl = document.getElementById('adherence-skipped-count');
  if (takenEl)   takenEl.textContent   = summary.taken_doses ?? summary.taken_count ?? 0;
  if (skippedEl) skippedEl.textContent = summary.skipped_doses ?? summary.skipped_count ?? 0;
}

function _renderAdherenceChart(weekly) {
  const chart = document.getElementById('weekly-chart');
  if (!chart) return;

  if (!weekly || !weekly.length) {
    chart.innerHTML = '<p class="empty-state" style="padding: 40px 0; text-align: center; color: var(--text-3);">No adherence records available yet.</p>';
    return;
  }

  chart.innerHTML = `
    <div class="chart-bar-container">
      ${weekly.map(day => {
        const total = Number(day.total || 0);
        const hasDoses = total > 0;
        const rate = hasDoses ? Math.max(0, Math.min(100, Math.round(day.rate ?? 0))) : 0;
        const colorCls = !hasDoses ? 'bar-none'
                       : rate >= 80 ? 'bar-good'
                       : rate >= 50 ? 'bar-fair'
                       : 'bar-poor';
        const barColor = !hasDoses ? 'transparent'
                       : rate >= 80 ? 'var(--success)'
                       : rate >= 50 ? 'var(--warning)'
                       : 'var(--danger)';
        const dayLabel = day.day || day.day_label || day.date || '';
        const pctLabel = hasDoses ? `${rate}%` : '—';
        const tooltip = hasDoses
          ? `${dayLabel}: ${rate}% adherence (${day.taken}/${total} doses taken)`
          : `${dayLabel}: No scheduled doses`;

        return `
          <div class="chart-bar-col">
            <div class="chart-bar-pct" style="color: ${hasDoses ? barColor : 'var(--text-3)'}; font-weight: ${hasDoses ? '700' : '500'};">${pctLabel}</div>
            <div class="chart-bar-track">
              <div class="chart-bar-fill ${colorCls}" style="height: ${hasDoses ? rate : 0}%; background: ${barColor};" title="${tooltip}"></div>
            </div>
            <div class="chart-bar-day">${_escapeHTML(dayLabel)}</div>
          </div>`;
      }).join('')}
    </div>`;
}

function _renderAdherenceTable(medicines) {
  const tbody = document.getElementById('adherence-table-body');
  if (!tbody) return;

  if (!medicines.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-cell" style="text-align: center; padding: 20px; color: var(--text-3);">No data available.</td></tr>';
    return;
  }

  tbody.innerHTML = medicines.map(med => {
    const rate    = med.adherence_rate ?? 0;
    const rateCls = rate >= 80 ? 'rate-good' : rate >= 50 ? 'rate-fair' : 'rate-poor';
    const rateColor = rate >= 80 ? 'var(--success)' : rate >= 50 ? 'var(--warning)' : 'var(--danger)';
    return `
      <tr>
        <td style="font-weight: 600;">${_escapeHTML(med.name || '')}</td>
        <td>${_escapeHTML(med.dosage || '-')}</td>
        <td>${med.stock_count ?? med.stock_current ?? med.quantity ?? '-'}</td>
        <td>${med.taken_doses ?? med.taken_count ?? 0} / ${med.total_doses ?? med.total_count ?? 0}</td>
        <td><span class="rate-badge ${rateCls}" style="font-weight: 700; color: ${rateColor};">${rate}%</span></td>
      </tr>`;
  }).join('');
}

/* ═══════════════════════════ CAREGIVER MODULE ══════════════════════════════ */

async function checkCaregiverMode() {
  const isCG        = user?.role === 'caregiver';
  const cgNavItem   = document.querySelector('.nav-item[data-tab="caregiver"]');
  const dependentSW = document.getElementById('dependent-switcher');
  const adhDepWrap  = document.getElementById('adherence-dep-filter-wrap');

  if (cgNavItem)   cgNavItem.classList.toggle('hidden', !isCG);
  if (dependentSW) dependentSW.classList.toggle('hidden', !isCG);
  if (adhDepWrap)  adhDepWrap.classList.toggle('hidden', !isCG);

  if (isCG) {
    try {
      const res = await api('/caregiver/dependents');
      const deps = res?.data || res?.dependents || (Array.isArray(res) ? res : []);
      _updateDependentSwitcher(deps);
    } catch (e) {
      console.error('Caregiver dependents init error:', e);
    }
  }
}

function _reloadActiveTab() {
  const activeNavItem = document.querySelector('.nav-item.active');
  const currentTab = activeNavItem ? activeNavItem.dataset.tab : 'dashboard';
  switch (currentTab) {
    case 'dashboard': loadDashboard(); break;
    case 'medicines': loadMedicines(); break;
    case 'adherence': loadAdherenceReport(); break;
    case 'caregiver': loadCaregiverView(); break;
  }
}

async function loadCaregiverView() {
  const res = await api('/caregiver/dependents');
  const deps = res?.data || res?.dependents || (Array.isArray(res) ? res : []);
  _renderDependentGrid(deps);
}

function _renderDependentGrid(deps) {
  const grid = document.getElementById('dependent-grid');
  if (!grid) return;

  if (!deps.length) {
    grid.innerHTML = `<div class="empty-state">
      ${typeof Icons !== 'undefined' ? Icons.users('empty-icon', 48) : ''}
      <p>No dependents added yet.</p>
    </div>`;
    return;
  }

  grid.innerHTML = deps.map(dep => `
    <div class="dependent-card" data-id="${dep.id}">
      <div class="dep-avatar">${(dep.name || 'U').charAt(0).toUpperCase()}</div>
      <div class="dep-info">
        <div class="dep-name">${_escapeHTML(dep.name || 'Unknown')}</div>
        ${dep.relationship ? `<div class="dep-rel">${_escapeHTML(dep.relationship)}</div>` : ''}
        ${dep.notes ? `<p class="dep-notes">${_escapeHTML(dep.notes)}</p>` : ''}
        ${dep.emergency_contact ? `<div class="dep-emergency">
          ${typeof Icons !== 'undefined' ? Icons.phone('', 12) : ''}${_escapeHTML(dep.emergency_contact)}
        </div>` : ''}
      </div>
      <div class="dep-actions">
        <button class="btn btn-sm btn-primary" data-view-dep="${dep.id}">
          ${typeof Icons !== 'undefined' ? Icons.eye('', 14) : ''}View Doses
        </button>
        <button class="btn btn-sm btn-danger" data-del-dep="${dep.id}">
          ${typeof Icons !== 'undefined' ? Icons.trash('', 14) : ''}Remove
        </button>
      </div>
    </div>`).join('');

  // Wire up
  grid.querySelectorAll('[data-view-dep]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeDependentId = btn.dataset.viewDep;
      _updateDependentSwitcher(deps);
      switchTab('dashboard');
    });
  });

  grid.querySelectorAll('[data-del-dep]').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmAction('Remove this dependent?', async () => {
        const res = await api(`/caregiver/dependents/${btn.dataset.delDep}`, { method: 'DELETE' });
        if (res && !res.error) {
          toast('Dependent removed.', 'success');
          if (activeDependentId === btn.dataset.delDep) activeDependentId = null;
          loadCaregiverView();
        }
      });
    });
  });

  _updateDependentSwitcher(deps);
}

function _updateDependentSwitcher(deps) {
  if (!deps) return;
  const switcher = document.getElementById('dependent-switcher');
  if (switcher) {
    switcher.classList.remove('hidden');
    switcher.innerHTML = `
      <label class="dependent-switcher-label">Active Patient:</label>
      <select id="dep-select" class="form-control form-control-sm" style="font-weight: 600; width: 100%;">
        <option value="">My Schedule (Personal)</option>
        ${deps.map(d => `<option value="${d.id}" ${String(activeDependentId) === String(d.id) ? 'selected' : ''}>${_escapeHTML(d.name)}</option>`).join('')}
      </select>`;

    switcher.querySelector('#dep-select')?.addEventListener('change', e => {
      activeDependentId = e.target.value || null;
      const adhSelect = document.getElementById('adherence-dep-select');
      if (adhSelect) adhSelect.value = activeDependentId || '';
      _reloadActiveTab();
    });
  }

  // Also sync the Adherence page header patient filter
  const adhSelect = document.getElementById('adherence-dep-select');
  const adhWrap   = document.getElementById('adherence-dep-filter-wrap');
  if (adhSelect && adhWrap) {
    adhWrap.classList.remove('hidden');
    adhSelect.innerHTML = `
      <option value="">Patient: Self (Caregiver)</option>
      ${deps.map(d => `<option value="${d.id}" ${String(activeDependentId) === String(d.id) ? 'selected' : ''}>Patient: ${_escapeHTML(d.name)}</option>`).join('')}
    `;
    adhSelect.onchange = e => {
      activeDependentId = e.target.value || null;
      const sidebarSelect = document.getElementById('dep-select');
      if (sidebarSelect) sidebarSelect.value = activeDependentId || '';
      _reloadActiveTab();
    };
  }
}

function showAddDependentModal() {
  const form = document.getElementById('dependent-form');
  if (form) form.reset();
  _openModal('dependent-modal');
}

async function saveDependent(e) {
  e.preventDefault();
  const name              = document.getElementById('dep-name')?.value.trim();
  const relationship      = document.getElementById('dep-relationship')?.value.trim();
  const notes             = document.getElementById('dep-notes')?.value.trim();
  const emergency_contact = document.getElementById('dep-emergency')?.value.trim();

  if (!name) { toast('Name is required.', 'danger'); return; }

  const res = await api('/caregiver/dependents', {
    method: 'POST',
    body: JSON.stringify({ name, relationship, notes, emergency_contact }),
  });

  if (res && !res.error) {
    _closeModal('dependent-modal');
    toast('Dependent added!', 'success');
    loadCaregiverView();
  } else {
    toast(res?.error || 'Failed to add dependent.', 'danger');
  }
}

/* ═══════════════════════════ NOTIFICATIONS / PWA ═══════════════════════════ */

async function enableNotifications() {
  if (!('Notification' in window)) {
    toast('Notifications not supported in this browser.', 'warning');
    return;
  }
  const perm = await Notification.requestPermission();
  const btn  = document.getElementById('enable-notif-btn');

  if (perm === 'granted') {
    toast('Notifications enabled!', 'success');
    if (btn) {
      btn.innerHTML = (typeof Icons !== 'undefined' ? Icons.bell('',16) : '') + 'Notifications On';
      btn.disabled  = true;
    }
  } else {
    toast('Notifications permission denied.', 'warning');
  }
}

// ─────────────────────────── WINDOW EXPORTS ───────────────────────────
if (typeof window !== 'undefined') {
  window.login = login;
  window.quickLogin = login;
  window.register = register;
  window.switchAuthTab = switchAuthTab;
  window.logout = logout;
  window.switchTab = switchTab;
  window.showAddMedicineModal = showAddMedicineModal;
  window.showEditMedicineModal = showEditMedicineModal;
  window.showAddDependentModal = showAddDependentModal;
  window.enableNotifications = enableNotifications;
  window.handleAlarm = handleAlarm;
  window.saveMedicine = saveMedicine;
  window.saveDependent = saveDependent;
  window.confirmAction = confirmAction;
  window.toast = toast;
  window.openModal = _openModal;
  window.closeModal = _closeModal;
}

