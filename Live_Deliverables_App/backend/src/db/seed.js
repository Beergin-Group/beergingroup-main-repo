const bcrypt = require('bcryptjs');
const db = require('./index');

async function seed() {
  await db.init();
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  const isPostgres = db.getDriver() === 'postgres';
  console.log(`[Seed] Seeding database using driver: ${db.getDriver()}`);

  if (isPostgres) {
    const pool = db.getPgPool();
    // Clear existing tables
    await pool.query('TRUNCATE TABLE dose_logs, schedules, medicines, dependents, users RESTART IDENTITY CASCADE');
  }

  // 1. Users
  const patient = await db.users.create({
    name: 'Maria Elena Santos',
    email: 'patient@mediremind.com',
    password_hash: passwordHash,
    role: 'patient',
    phone: '+63 917 123 4567'
  });

  const caregiver = await db.users.create({
    name: 'Francis Empil (Caregiver)',
    email: 'caregiver@mediremind.com',
    password_hash: passwordHash,
    role: 'caregiver',
    phone: '+63 920 987 6543'
  });

  // 2. Dependents for caregiver
  const depRosa = await db.dependents.create({
    caregiver_id: caregiver.id,
    name: 'Grandmother Rosa (78y/o)',
    relationship: 'Grandmother',
    date_of_birth: '1948-04-12',
    emergency_contact: '+63 917 555 1234',
    notes: 'Chronic hypertension and type 2 diabetes management.'
  });

  const depTimmy = await db.dependents.create({
    caregiver_id: caregiver.id,
    name: 'Timmy Santos (9y/o)',
    relationship: 'Son',
    date_of_birth: '2017-08-20',
    emergency_contact: '+63 917 555 5678',
    notes: 'Childhood asthma and seasonal allergies.'
  });

  // 3. Medicines for Patient (Maria Elena)
  const medMetformin = await db.medicines.create({
    user_id: patient.id,
    name: 'Metformin',
    dosage: '500 mg',
    form: 'tablet',
    instructions: 'Take with food to reduce stomach upset',
    stock_count: 36,
    low_stock_threshold: 10,
    color: '#0284c7', // Sky Blue
    shape: 'oval',
    icon: 'pill'
  });

  const medLisinopril = await db.medicines.create({
    user_id: patient.id,
    name: 'Lisinopril',
    dosage: '10 mg',
    form: 'tablet',
    instructions: 'Take every morning with a full glass of water',
    stock_count: 22,
    low_stock_threshold: 7,
    color: '#10b981', // Emerald Green
    shape: 'round',
    icon: 'pill'
  });

  const medAtorvastatin = await db.medicines.create({
    user_id: patient.id,
    name: 'Atorvastatin',
    dosage: '20 mg',
    form: 'tablet',
    instructions: 'Take once daily in the evening / bedtime',
    stock_count: 14,
    low_stock_threshold: 5,
    color: '#8b5cf6', // Purple
    shape: 'oval',
    icon: 'pill'
  });

  const medVitaminD = await db.medicines.create({
    user_id: patient.id,
    name: 'Vitamin D3',
    dosage: '1000 IU',
    form: 'capsule',
    instructions: 'Take once daily with breakfast for bone health',
    stock_count: 48,
    low_stock_threshold: 10,
    color: '#f59e0b', // Amber
    shape: 'capsule',
    icon: 'capsule'
  });

  // Medicine for Rosa (Caregiver dependent)
  const medRosaAmlodipine = await db.medicines.create({
    user_id: caregiver.id,
    dependent_id: depRosa.id,
    name: 'Amlodipine',
    dosage: '5 mg',
    form: 'tablet',
    instructions: 'Take in the morning for blood pressure control',
    stock_count: 20,
    low_stock_threshold: 7,
    color: '#06b6d4',
    shape: 'round',
    icon: 'pill'
  });

  // 4. Schedules
  const schedMetformin = await db.schedules.create({
    medicine_id: medMetformin.id,
    user_id: patient.id,
    frequency_type: 'daily',
    frequency_value: '1',
    dose_times: ['08:00', '19:00'],
    meal_timing: 'with_meal',
    start_date: '2026-09-01',
    end_date: null,
    is_active: true
  });

  const schedLisinopril = await db.schedules.create({
    medicine_id: medLisinopril.id,
    user_id: patient.id,
    frequency_type: 'daily',
    frequency_value: '1',
    dose_times: ['08:00'],
    meal_timing: 'before_meal',
    start_date: '2026-09-01',
    end_date: null,
    is_active: true
  });

  const schedAtorvastatin = await db.schedules.create({
    medicine_id: medAtorvastatin.id,
    user_id: patient.id,
    frequency_type: 'daily',
    frequency_value: '1',
    dose_times: ['21:00'],
    meal_timing: 'after_meal',
    start_date: '2026-09-01',
    end_date: null,
    is_active: true
  });

  const schedVitD = await db.schedules.create({
    medicine_id: medVitaminD.id,
    user_id: patient.id,
    frequency_type: 'daily',
    frequency_value: '1',
    dose_times: ['08:00'],
    meal_timing: 'with_meal',
    start_date: '2026-09-01',
    end_date: null,
    is_active: true
  });

  const schedRosa = await db.schedules.create({
    medicine_id: medRosaAmlodipine.id,
    user_id: caregiver.id,
    dependent_id: depRosa.id,
    frequency_type: 'daily',
    frequency_value: '1',
    dose_times: ['09:00'],
    meal_timing: 'with_meal',
    start_date: '2026-09-01',
    end_date: null,
    is_active: true
  });

  // 5. Generate Past 14 Days of Dose Logs for realistic Adherence graphs
  const now = new Date();
  const schedulesList = [
    { sched: schedMetformin, med: medMetformin, times: ['08:00', '19:00'] },
    { sched: schedLisinopril, med: medLisinopril, times: ['08:00'] },
    { sched: schedAtorvastatin, med: medAtorvastatin, times: ['21:00'] },
    { sched: schedVitD, med: medVitaminD, times: ['08:00'] }
  ];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    for (const item of schedulesList) {
      for (const timeStr of item.times) {
        const scheduledDateTime = new Date(`${dateStr}T${timeStr}:00.000Z`).toISOString();
        
        let status = 'taken';
        // Add realistic occasional skipped doses on day -7 and -3
        if (i === 7 && item.med.name === 'Atorvastatin') {
          status = 'skipped';
        } else if (i === 3 && item.med.name === 'Metformin' && timeStr === '19:00') {
          status = 'skipped';
        } else if (i === 0) {
          // Today: 08:00 is taken, later times may be pending
          const currentHour = now.getHours();
          const [doseHour] = timeStr.split(':').map(Number);
          if (doseHour <= currentHour) {
            status = 'taken';
          } else {
            status = 'pending';
          }
        }

        const recordedAt = status === 'taken' 
          ? new Date(new Date(scheduledDateTime).getTime() + (Math.floor(Math.random() * 20) * 60000)).toISOString()
          : null;

        await db.doseLogs.recordDose({
          schedule_id: item.sched.id,
          medicine_id: item.med.id,
          user_id: patient.id,
          scheduled_time: scheduledDateTime,
          status,
          recorded_at: recordedAt,
          notes: status === 'skipped' ? 'Fell asleep early / forgot' : ''
        });
      }
    }
  }

  console.log('[Seed] Database successfully seeded with demo accounts & 14 days of realistic adherence data!');
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seed;
