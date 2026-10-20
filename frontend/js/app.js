/**
 * MediRemind - Unified Cross-Platform Application Client
 * Project: MediRemind — Cross-Platform Medicine & Prescription Reminder
 * Team: Beergin (Jerold Sodusta, Francis John Empil, Jibson Cabilin, Nove Calasang)
 */

const API_BASE = '/api';
let authToken = localStorage.getItem('mediremind_token') || null;
let currentUser = JSON.parse(localStorage.getItem('mediremind_user') || 'null');
let activeDependentId = null;

let todayDoses = [];
let nextDoseItem = null;
let countdownInterval = null;
let currentRemainingSeconds = null;

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  initServiceWorker();
  updateDateHeader();
  
  if (!authToken || !currentUser) {
    await quickLogin('patient@mediremind.com', 'password123');
  } else {
    updateUserUI();
    loadDashboard();
    checkCaregiverMode();
  }

  // Periodic clock sync
  setInterval(() => {
    updateDateHeader();
  }, 60000);
});

// PWA Service Worker
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration note:', err.message);
    });
  }
}

function updateDateHeader() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dStr = new Date().toLocaleDateString(undefined, options);
  const el = document.getElementById('todayDateStr');
  if (el) el.innerText = dStr;
}

// Device Viewport Simulator Switcher
function setDeviceMode(mode) {
  document.body.className = `device-${mode}`;
  document.querySelectorAll('.platform-btn').forEach(btn => btn.classList.remove('active'));
  
  if (mode === 'desktop') document.getElementById('btnModeDesktop')?.classList.add('active');
  if (mode === 'tablet') document.getElementById('btnModeTablet')?.classList.add('active');
  if (mode === 'mobile') document.getElementById('btnModeMobile')?.classList.add('active');
  
  showToast(`Switched view to ${mode.toUpperCase()} layout`);
}

// Navigation Tabs
function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tabId);
  });
  document.querySelectorAll('.mobile-nav-btn').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-pane').forEach(el => {
    el.style.display = 'none';
  });

  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) {
    targetPane.style.display = 'block';
  }

  if (tabId === 'dashboard') loadDashboard();
  if (tabId === 'medicines') loadMedicines();
  if (tabId === 'adherence') loadAdherenceReport();
  if (tabId === 'caregiver') loadCaregiverView();
}

// API Helper
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (res.status === 401) {
      showToast('Session expired. Please re-login.');
      showAuthModal();
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    showToast(`Network error: ${err.message}`, 'danger');
    return null;
  }
}

// Auth UI & Handlers
function updateUserUI() {
  if (!currentUser) return;
  const nameEl = document.getElementById('userNameText');
  const greetingEl = document.getElementById('dashboardGreeting');
  const avatarEl = document.getElementById('userAvatarText');
  const roleEl = document.getElementById('userRoleBadge');

  if (nameEl) nameEl.innerText = currentUser.name;
  if (greetingEl) greetingEl.innerText = `Good Day, ${currentUser.name.split(' ')[0]}`;
  if (avatarEl) {
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    avatarEl.innerText = initials;
  }
  if (roleEl) roleEl.innerText = currentUser.role.toUpperCase();
}

async function quickLogin(email, password) {
  const res = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  if (res && res.success) {
    authToken = res.token;
    currentUser = res.user;
    localStorage.setItem('mediremind_token', authToken);
    localStorage.setItem('mediremind_user', JSON.stringify(currentUser));
    closeModal('authModal');
    updateUserUI();
    activeDependentId = null;
    checkCaregiverMode();
    loadDashboard();
    showToast(`Logged in as ${currentUser.name}`);
  } else {
    showToast(res ? res.message : 'Login failed', 'danger');
  }
}

async function handleManualLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  await quickLogin(email, password);
}

// Web Notifications API
function enableWebNotifications() {
  if (!('Notification' in window)) {
    showToast('Web notifications are not supported in this browser.');
    return;
  }
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      document.getElementById('notifStatusIcon').innerText = '🔔✓';
      document.getElementById('notifStatusText').innerText = 'Notifications Active';
      showToast('Notifications enabled successfully!');
      new Notification('MediRemind Active', {
        body: 'Medication alerts will fire directly on this device.',
        icon: 'icons/icon-192.png'
      });
    } else {
      showToast('Notifications permission was dismissed.');
    }
  });
}

// Web Audio API Pleasant Medical Chime
function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // 1st Tone (C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    // 2nd Tone (E5 - Harmony)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.85);
  } catch (err) {
    console.warn('Audio synthesis note:', err.message);
  }
}

function testAlarmNotification() {
  playChimeSound();
  if (Notification.permission === 'granted') {
    new Notification('Test MediRemind Alert', {
      body: 'Time to take Metformin 500mg with meal!',
      requireInteraction: true
    });
  }
  showDoseAlarmModal({
    medicine_name: 'Metformin',
    dosage: '500 mg',
    meal_timing: 'with_meal',
    instructions: 'Take with meal and a glass of water'
  });
}

// DASHBOARD MODULE
async function loadDashboard() {
  const query = activeDependentId ? `?dependent_id=${activeDependentId}` : '';
  const res = await apiRequest(`/dose-logs/today${query}`);
  const summaryRes = await apiRequest(`/adherence/summary${query}`);

  if (res && res.success) {
    todayDoses = res.doses || [];
    renderTodayDosesTimeline(todayDoses);

    // Summary counters
    document.getElementById('statTodayCount').innerText = `${res.summary.taken} / ${res.summary.total}`;
    document.getElementById('statAdherenceRate').innerText = `${res.summary.adherence_rate}%`;

    // Next dose & countdown
    nextDoseItem = res.next_dose;
    setupCountdown(res.seconds_to_next_dose, nextDoseItem);
  }

  if (summaryRes && summaryRes.success) {
    document.getElementById('statStreakDays').innerText = `${summaryRes.data.current_streak} Days 🔥`;
    
    // Check low stock count
    const lowStockCount = summaryRes.data.medicine_breakdown.filter(m => m.is_low_stock).length;
    const stockEl = document.getElementById('statLowStockCount');
    if (stockEl) {
      stockEl.innerText = `${lowStockCount} Low`;
      stockEl.style.color = lowStockCount > 0 ? 'var(--danger)' : 'var(--text-primary)';
    }
  }
}

function renderTodayDosesTimeline(doses) {
  const container = document.getElementById('todayDosesList');
  if (!container) return;

  if (!doses.length) {
    container.innerHTML = `
      <div style="background: white; padding: 32px; border-radius: 12px; text-align: center; border: 1px dashed var(--border);">
        <p style="color: var(--text-secondary); margin-bottom: 12px;">No doses scheduled for today.</p>
        <button class="btn btn-primary btn-sm" onclick="showAddMedicineModal()">+ Add Your First Prescription</button>
      </div>
    `;
    return;
  }

  container.innerHTML = doses.map(dose => {
    const isTaken = dose.status === 'taken';
    const isSkipped = dose.status === 'skipped';
    const isSnoozed = dose.status === 'snoozed';
    const isPending = dose.status === 'pending';

    let mealTag = '';
    if (dose.meal_timing === 'with_meal') mealTag = '<span class="badge-tag badge-meal">🍽️ With Meal</span>';
    if (dose.meal_timing === 'before_meal') mealTag = '<span class="badge-tag badge-meal">⏳ Before Meal</span>';
    if (dose.meal_timing === 'after_meal') mealTag = '<span class="badge-tag badge-meal">🥣 After Meal</span>';

    return `
      <div class="dose-card status-${dose.status}">
        <div class="dose-left">
          <div class="dose-time-badge">${dose.time_display}</div>
          <div class="dose-pill-visual" style="background-color: ${dose.color || '#0d9488'};">
            ${dose.form === 'capsule' ? '💊' : dose.form === 'syrup' ? '🧴' : dose.form === 'inhaler' ? '💨' : '⚪'}
          </div>
          <div class="dose-details">
            <h4>
              ${dose.medicine_name} (${dose.dosage})
              ${mealTag}
            </h4>
            <p>${dose.instructions || 'Take as prescribed'} • Stock: ${dose.stock_count !== undefined ? dose.stock_count : '--'} left</p>
          </div>
        </div>
        <div class="dose-actions">
          ${isTaken ? `
            <span style="color: var(--success); font-weight: 700; font-size: 0.9rem;">✓ Taken</span>
          ` : isSkipped ? `
            <span style="color: var(--danger); font-weight: 700; font-size: 0.9rem;">✕ Skipped</span>
          ` : `
            <button class="btn btn-success btn-sm" onclick="markDoseStatus(${dose.schedule_id}, ${dose.medicine_id}, '${dose.scheduled_time}', 'taken')">
              ✓ Take
            </button>
            <button class="btn btn-warning btn-sm" onclick="snoozeDose(${dose.schedule_id}, ${dose.medicine_id}, '${dose.scheduled_time}')">
              ⏰ Snooze
            </button>
            <button class="btn btn-outline btn-sm" onclick="markDoseStatus(${dose.schedule_id}, ${dose.medicine_id}, '${dose.scheduled_time}', 'skipped')">
              Skip
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// Live Countdown Widget
function setupCountdown(seconds, dose) {
  if (countdownInterval) clearInterval(countdownInterval);
  const card = document.getElementById('nextDoseCard');
  if (!card) return;

  if (!dose || seconds === null) {
    document.getElementById('nextDoseName').innerText = 'All Doses Completed!';
    document.getElementById('nextDoseTimeAndMeal').innerText = 'Great job staying on track today.';
    document.getElementById('countdownClock').innerText = '--:--:--';
    document.getElementById('btnTakeNextDose').style.display = 'none';
    return;
  }

  document.getElementById('btnTakeNextDose').style.display = 'inline-flex';
  document.getElementById('nextDoseName').innerText = `${dose.medicine_name} (${dose.dosage})`;
  document.getElementById('nextDoseTimeAndMeal').innerText = `Scheduled at ${dose.time_display} • ${dose.meal_timing.replace('_', ' ')}`;
  
  currentRemainingSeconds = seconds;
  updateClockDisplay(currentRemainingSeconds);

  countdownInterval = setInterval(() => {
    if (currentRemainingSeconds > 0) {
      currentRemainingSeconds--;
      updateClockDisplay(currentRemainingSeconds);
    } else {
      clearInterval(countdownInterval);
      triggerDoseAlarm(dose);
    }
  }, 1000);
}

function updateClockDisplay(sec) {
  const clockEl = document.getElementById('countdownClock');
  if (!clockEl) return;
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  clockEl.innerText = [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0')
  ].join(':');
}

// Dose Recording
async function markDoseStatus(scheduleId, medicineId, scheduledTime, status) {
  const res = await apiRequest('/dose-logs', {
    method: 'POST',
    body: JSON.stringify({
      schedule_id: scheduleId,
      medicine_id: medicineId,
      scheduled_time: scheduledTime,
      status,
      dependent_id: activeDependentId
    })
  });

  if (res && res.success) {
    if (status === 'taken') {
      playChimeSound();
      showToast('Dose recorded as taken! Great adherence!');
    } else {
      showToast(`Dose marked as ${status}.`);
    }

    if (res.stockAlert && res.stockAlert.lowStock) {
      showToast(res.stockAlert.message, 'warning');
    }

    loadDashboard();
  }
}

async function snoozeDose(scheduleId, medicineId, scheduledTime) {
  const res = await apiRequest('/dose-logs/snooze', {
    method: 'POST',
    body: JSON.stringify({
      schedule_id: scheduleId,
      medicine_id: medicineId,
      scheduled_time: scheduledTime,
      minutes: 15,
      dependent_id: activeDependentId
    })
  });

  if (res && res.success) {
    showToast('Dose snoozed for 15 minutes.');
    loadDashboard();
  }
}

function takeNextDoseNow() {
  if (!nextDoseItem) return;
  markDoseStatus(nextDoseItem.schedule_id, nextDoseItem.medicine_id, nextDoseItem.scheduled_time, 'taken');
}

// Alarm Modal Trigger
let activeAlarmDose = null;

function triggerDoseAlarm(dose) {
  activeAlarmDose = dose;
  playChimeSound();
  if (Notification.permission === 'granted') {
    new Notification(`MediRemind: ${dose.medicine_name}`, {
      body: `It's time to take ${dose.medicine_name} (${dose.dosage})!`,
      requireInteraction: true
    });
  }
  showDoseAlarmModal(dose);
}

function showDoseAlarmModal(dose) {
  activeAlarmDose = dose;
  document.getElementById('alarmDoseDetails').innerText = 
    `${dose.medicine_name} ${dose.dosage} • ${dose.instructions || 'Scheduled dose is due'}`;
  document.getElementById('doseAlarmModal').style.display = 'flex';
}

function handleAlarmAction(action) {
  closeModal('doseAlarmModal');
  if (!activeAlarmDose) return;

  if (action === 'take') {
    markDoseStatus(activeAlarmDose.schedule_id, activeAlarmDose.medicine_id, activeAlarmDose.scheduled_time, 'taken');
  } else if (action === 'snooze') {
    snoozeDose(activeAlarmDose.schedule_id, activeAlarmDose.medicine_id, activeAlarmDose.scheduled_time);
  }
}

// MEDICINE & PRESCRIPTION MODULE
async function loadMedicines() {
  const query = activeDependentId ? `?dependent_id=${activeDependentId}` : '';
  const medsRes = await apiRequest(`/medicines${query}`);
  const schedsRes = await apiRequest(`/schedules${query}`);

  const grid = document.getElementById('medicinesGrid');
  if (!grid) return;

  if (!medsRes || !medsRes.data.length) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; background: white; padding: 40px; border-radius: 12px; text-align: center; border: 1px dashed var(--border);">
        <p style="color: var(--text-secondary); margin-bottom: 12px;">No prescriptions found.</p>
        <button class="btn btn-primary" onclick="showAddMedicineModal()">+ Add New Prescription</button>
      </div>
    `;
    return;
  }

  const schedules = schedsRes?.data || [];

  grid.innerHTML = medsRes.data.map(med => {
    const linkedSched = schedules.find(s => Number(s.medicine_id) === Number(med.id));
    const stockPercent = Math.min(100, Math.round(((med.stock_count || 0) / 40) * 100));
    const isLow = med.stock_count <= med.low_stock_threshold;
    const progressColor = isLow ? 'var(--danger)' : 'var(--primary)';

    return `
      <div class="med-card">
        <div>
          <div class="med-card-header">
            <div>
              <div class="med-name">${med.name}</div>
              <div class="med-dosage">${med.dosage} (${med.form})</div>
            </div>
            <div class="med-icon-pill" style="background-color: ${med.color || '#0d9488'};">
              ${med.form === 'capsule' ? '💊' : med.form === 'syrup' ? '🧴' : med.form === 'inhaler' ? '💨' : '⚪'}
            </div>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
            ${med.instructions || 'No special notes.'}
          </p>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">
            <strong>Frequency:</strong> ${linkedSched ? linkedSched.dose_times.join(', ') : 'No active schedule'}
          </div>
          <div class="med-stock-bar">
            <div class="med-stock-header">
              <span>Inventory Stock</span>
              <strong style="color: ${isLow ? 'var(--danger)' : 'inherit'};">
                ${med.stock_count} units ${isLow ? '(Low!)' : ''}
              </strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${stockPercent}%; background: ${progressColor};"></div>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 14px; border-top: 1px solid var(--border); padding-top: 12px;">
          <button class="btn btn-outline btn-sm" style="flex: 1;" onclick="refillMedicineStock(${med.id})">
            + Refill (30)
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteMedicineItem(${med.id})">
            🗑️
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function handleSaveMedicine(e) {
  e.preventDefault();
  const name = document.getElementById('medFormName').value;
  const dosage = document.getElementById('medFormDosage').value;
  const form = document.getElementById('medFormType').value;
  const stock_count = parseInt(document.getElementById('medFormStock').value, 10);
  const low_stock_threshold = parseInt(document.getElementById('medFormLowThreshold').value, 10);
  const instructions = document.getElementById('medFormInstructions').value;
  const meal_timing = document.getElementById('medFormMealTiming').value;
  const doseTimesRaw = document.getElementById('medFormDoseTimes').value;
  const color = document.getElementById('medFormColor').value;

  const dose_times = doseTimesRaw.split(',').map(t => t.trim()).filter(Boolean);

  // 1. Create Medicine
  const medRes = await apiRequest('/medicines', {
    method: 'POST',
    body: JSON.stringify({
      name,
      dosage,
      form,
      stock_count,
      low_stock_threshold,
      instructions,
      color,
      dependent_id: activeDependentId
    })
  });

  if (medRes && medRes.success) {
    const medId = medRes.data.id;
    // 2. Create Schedule
    await apiRequest('/schedules', {
      method: 'POST',
      body: JSON.stringify({
        medicine_id: medId,
        frequency_type: 'daily',
        dose_times,
        meal_timing,
        dependent_id: activeDependentId
      })
    });

    closeModal('addMedicineModal');
    showToast(`Prescription for ${name} added!`);
    loadMedicines();
    loadDashboard();
  }
}

async function refillMedicineStock(id) {
  const res = await apiRequest(`/medicines/${id}/refill`, {
    method: 'POST',
    body: JSON.stringify({ count: 30 })
  });
  if (res && res.success) {
    showToast(res.message);
    loadMedicines();
    loadDashboard();
  }
}

async function deleteMedicineItem(id) {
  if (!confirm('Are you sure you want to remove this prescription?')) return;
  const res = await apiRequest(`/medicines/${id}`, { method: 'DELETE' });
  if (res && res.success) {
    showToast('Prescription removed.');
    loadMedicines();
    loadDashboard();
  }
}

// ADHERENCE & REPORTING MODULE
async function loadAdherenceReport() {
  const query = activeDependentId ? `?dependent_id=${activeDependentId}` : '';
  const summaryRes = await apiRequest(`/adherence/summary${query}`);
  const weeklyRes = await apiRequest(`/adherence/weekly${query}`);

  if (summaryRes && summaryRes.success) {
    const data = summaryRes.data;
    document.getElementById('reportAdherenceLarge').innerText = `${data.adherence_rate}%`;
    document.getElementById('reportTakenDosesCount').innerText = data.taken_doses;
    document.getElementById('reportSkippedDosesCount').innerText = data.skipped_doses;

    // Compliance Table
    const tbody = document.getElementById('adherenceMedTableBody');
    if (tbody) {
      tbody.innerHTML = data.medicine_breakdown.map(m => `
        <tr style="border-bottom: 1px solid var(--border);">
          <td style="padding: 10px; font-weight: 600;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${m.color || '#0d9488'}; margin-right: 6px;"></span>
            ${m.name}
          </td>
          <td style="padding: 10px;">${m.dosage}</td>
          <td style="padding: 10px;">${m.stock_count} units ${m.is_low_stock ? '⚠️' : ''}</td>
          <td style="padding: 10px;">${m.taken_doses} / ${m.total_doses}</td>
          <td style="padding: 10px; font-weight: 700; color: ${m.adherence_rate >= 80 ? 'var(--success)' : 'var(--warning)'};">
            ${m.adherence_rate}%
          </td>
        </tr>
      `).join('');
    }
  }

  if (weeklyRes && weeklyRes.success) {
    const container = document.getElementById('weeklyBarsContainer');
    if (container) {
      container.innerHTML = weeklyRes.data.map(day => `
        <div class="bar-col">
          <div class="bar-val">${day.rate}%</div>
          <div class="bar-tube">
            <div class="bar-fill-inner" style="height: ${day.rate}%;"></div>
          </div>
          <div class="bar-label">${day.day}</div>
        </div>
      `).join('');
    }
  }
}

function exportAdherenceCsv() {
  const query = activeDependentId ? `?dependent_id=${activeDependentId}` : '';
  window.open(`${API_BASE}/adherence/export${query}`, '_blank');
}

// CAREGIVER & DEPENDENT MODULE
async function checkCaregiverMode() {
  const box = document.getElementById('caregiverActiveBox');
  if (!box) return;

  if (currentUser && currentUser.role === 'caregiver') {
    box.style.display = 'block';
    const res = await apiRequest('/caregiver/dependents');
    const select = document.getElementById('dependentSelect');
    if (res && res.success && select) {
      select.innerHTML = '<option value="">All / Self</option>' + 
        res.data.map(d => `<option value="${d.id}">${d.name} (${d.relationship})</option>`).join('');
    }
  } else {
    box.style.display = 'none';
  }
}

function changeActiveDependent(depId) {
  activeDependentId = depId ? parseInt(depId, 10) : null;
  loadDashboard();
  loadMedicines();
  loadAdherenceReport();
  showToast(depId ? 'Switched to dependent view' : 'Switched to caregiver profile');
}

async function loadCaregiverView() {
  const grid = document.getElementById('dependentsGrid');
  if (!grid) return;

  const res = await apiRequest('/caregiver/dependents');
  if (!res || !res.data.length) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; background: white; padding: 40px; border-radius: 12px; text-align: center; border: 1px dashed var(--border);">
        <p style="color: var(--text-secondary); margin-bottom: 12px;">No dependent family members registered yet.</p>
        <button class="btn btn-primary" onclick="showAddDependentModal()">+ Add Dependent Family Member</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = res.data.map(d => `
    <div class="med-card">
      <div>
        <div class="med-name">${d.name}</div>
        <div style="font-size: 0.85rem; color: var(--primary); font-weight: 600; margin-bottom: 8px;">
          ${d.relationship}
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">
          ${d.notes || 'No specific medical notes.'}
        </p>
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          Emergency Contact: ${d.emergency_contact || 'None specified'}
        </div>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 14px; border-top: 1px solid var(--border); padding-top: 12px;">
        <button class="btn btn-outline btn-sm" style="flex: 1;" onclick="changeActiveDependent(${d.id})">
          Select Patient
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteDependentItem(${d.id})">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

async function handleSaveDependent(e) {
  e.preventDefault();
  const name = document.getElementById('depName').value;
  const relationship = document.getElementById('depRelationship').value;
  const notes = document.getElementById('depNotes').value;

  const res = await apiRequest('/caregiver/dependents', {
    method: 'POST',
    body: JSON.stringify({ name, relationship, notes })
  });

  if (res && res.success) {
    closeModal('addDependentModal');
    showToast(`Added dependent: ${name}`);
    checkCaregiverMode();
    loadCaregiverView();
  }
}

async function deleteDependentItem(id) {
  if (!confirm('Remove this dependent family member?')) return;
  const res = await apiRequest(`/caregiver/dependents/${id}`, { method: 'DELETE' });
  if (res && res.success) {
    showToast('Dependent removed.');
    checkCaregiverMode();
    loadCaregiverView();
  }
}

// Modal Helpers
function showAddMedicineModal() {
  document.getElementById('addMedicineModal').style.display = 'flex';
}
function showAuthModal() {
  document.getElementById('authModal').style.display = 'flex';
}
function showAddDependentModal() {
  document.getElementById('addDependentModal').style.display = 'flex';
}
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}
