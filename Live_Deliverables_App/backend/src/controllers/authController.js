/**
 * MediRemind — Authentication Controller
 * Week 3 Deliverable
 * Author: Francis John Empil (Back-End Developer)
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fallback configuration if external config is not loaded
const JWT_SECRET = process.env.JWT_SECRET || 'mediremind_super_secure_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate HMAC-SHA256 Signed JWT
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Validates Email RFC 5322 format
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validates Password Complexity
 * - Minimum 8 characters
 * - At least one digit
 * - At least one letter
 */
function validatePassword(password) {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one numerical digit.';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must contain at least one letter.';
  }
  return null;
}

/**
 * Register New User
 * POST /api/auth/register
 */
exports.register = async (req, res, db) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // 1. Mandatory Fields Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!isValidEmail(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    // 2. Password Strength Validation
    const pwdErr = validatePassword(password);
    if (pwdErr) {
      return res.status(400).json({ success: false, message: pwdErr });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 3. Duplicate Email Check
    const existing = await db.users.findByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in or use another email.'
      });
    }

    // 4. Secure Password Hashing (10 Salt Rounds)
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    // 5. User Record Creation
    const assignedRole = role === 'caregiver' ? 'caregiver' : 'patient';
    const newUser = await db.users.create({
      name: name.trim(),
      email: cleanEmail,
      password_hash,
      role: assignedRole,
      phone: phone ? phone.trim() : ''
    });

    // 6. Issue JWT Token
    const token = generateToken(newUser);

    // Return sanitized user object
    return res.status(201).json({
      success: true,
      message: 'Account successfully registered and signed in.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        created_at: newUser.created_at
      }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during account registration.' });
  }
};

/**
 * Authenticate User & Issue JWT
 * POST /api/auth/login
 */
exports.login = async (req, res, db) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Both email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userWithPassword = await db.users.findByEmail(cleanEmail);

    if (!userWithPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Constant-time hash comparison
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
      message: 'Authentication successful.',
      token,
      user
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
};

/**
 * Fetch Current Authenticated User Profile
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  return res.json({
    success: true,
    user: req.user
  });
};

/**
 * Refresh JWT Token
 * POST /api/auth/refresh
 */
exports.refreshToken = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  const newToken = generateToken(req.user);
  return res.json({
    success: true,
    message: 'Token refreshed successfully.',
    token: newToken,
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Return Available Demo Accounts for Testing
 * GET /api/auth/demo-accounts
 */
exports.getDemoAccounts = async (req, res) => {
  return res.json({
    success: true,
    accounts: [
      {
        role: 'patient',
        email: 'patient@mediremind.com',
        password: 'password123',
        name: 'Maria Elena Santos',
        description: 'Primary patient with 4 active prescription medications and adherence logs'
      },
      {
        role: 'caregiver',
        email: 'caregiver@mediremind.com',
        password: 'password123',
        name: 'Carlos Mendoza',
        description: 'Caregiver managing prescriptions for Grandmother Rosa & Timmy'
      }
    ]
  });
};
