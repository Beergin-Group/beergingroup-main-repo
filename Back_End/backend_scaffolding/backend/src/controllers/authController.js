const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await db.users.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const newUser = await db.users.create({
      name,
      email,
      password_hash,
      role: role || 'patient',
      phone: phone || ''
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const userWithPassword = await db.users.findByEmail(email);
    if (!userWithPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, userWithPassword.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = {
      id: userWithPassword.id,
      name: userWithPassword.name,
      email: userWithPassword.email,
      role: userWithPassword.role,
      phone: userWithPassword.phone,
      created_at: userWithPassword.created_at
    };

    const token = generateToken(user);
    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

exports.getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

exports.getDemoAccounts = async (req, res) => {
  return res.json({
    success: true,
    accounts: [
      {
        role: 'patient',
        email: 'patient@mediremind.com',
        password: 'password123',
        description: 'Patient account with active prescriptions, schedules & adherence history'
      },
      {
        role: 'caregiver',
        email: 'caregiver@mediremind.com',
        password: 'password123',
        description: 'Caregiver account managing multiple dependents (Grandmother Rosa, Timmy Santos)'
      }
    ]
  });
};
