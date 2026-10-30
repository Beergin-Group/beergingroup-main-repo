import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/password_strength_bar.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  String _selectedRole = 'patient';
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  bool _agreeTerms = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _confirmPassCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_agreeTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please accept terms and medical disclaimer.')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final res = await AuthService.register(
      name: _nameCtrl.text.trim(),
      email: _emailCtrl.text.trim(),
      password: _passCtrl.text.trim(),
      role: _selectedRole,
      phone: _phoneCtrl.text.trim(),
    );

    setState(() => _isLoading = false);

    if (!mounted) return;

    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF0D9488),
          content: Text('Account created! Welcome to MediRemind, ${_nameCtrl.text.trim()}!'),
        ),
      );
      Navigator.pushReplacementNamed(context, '/dashboard');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: Colors.red.shade700,
          content: Text(res['message'] ?? 'Registration failed.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        title: const Text('Create MediRemind Account', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0.5,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Card(
              elevation: 4,
              shadowColor: Colors.black12,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 32),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Join MediRemind',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0D9488),
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Never miss or double-dose again with synchronized tracking.',
                        style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 24),

                      // Full Name
                      CustomTextField(
                        controller: _nameCtrl,
                        label: 'Full Name',
                        hint: 'e.g. Maria Elena Santos',
                        prefixIcon: Icons.person_outline,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Full name is required.';
                          }
                          if (value.trim().length < 2) {
                            return 'Name must be at least 2 characters.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Email Address
                      CustomTextField(
                        controller: _emailCtrl,
                        label: 'Email Address',
                        hint: 'maria.santos@example.com',
                        prefixIcon: Icons.email_outlined,
                        keyboardType: TextInputType.emailAddress,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Email is required.';
                          }
                          final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
                          if (!emailRegex.hasMatch(value.trim())) {
                            return 'Enter a valid email address.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Role Selection (Radio Cards)
                      const Text(
                        'Account Type / Role',
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Color(0xFF334155)),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Expanded(
                            child: InkWell(
                              onTap: () => setState(() => _selectedRole = 'patient'),
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: _selectedRole == 'patient' ? const Color(0xFFCCFBF1) : const Color(0xFFF8FAFC),
                                  border: Border.parseBorderSide(
                                    BorderSide(
                                      color: _selectedRole == 'patient' ? const Color(0xFF0D9488) : const Color(0xFFCBD5E1),
                                      width: _selectedRole == 'patient' ? 2 : 1,
                                    ),
                                  ),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Column(
                                  children: [
                                    const Text('👤', style: TextStyle(fontSize: 22)),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Patient',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                        color: _selectedRole == 'patient' ? const Color(0xFF0F766E) : const Color(0xFF475569),
                                      ),
                                    ),
                                    const Text('Manage own meds', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: InkWell(
                              onTap: () => setState(() => _selectedRole = 'caregiver'),
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: _selectedRole == 'caregiver' ? const Color(0xFFE0F2FE) : const Color(0xFFF8FAFC),
                                  border: Border.parseBorderSide(
                                    BorderSide(
                                      color: _selectedRole == 'caregiver' ? const Color(0xFF0284C7) : const Color(0xFFCBD5E1),
                                      width: _selectedRole == 'caregiver' ? 2 : 1,
                                    ),
                                  ),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Column(
                                  children: [
                                    const Text('🩺', style: TextStyle(fontSize: 22)),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Caregiver',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                        color: _selectedRole == 'caregiver' ? const Color(0xFF0369A1) : const Color(0xFF475569),
                                      ),
                                    ),
                                    const Text('Manage family/dependents', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Password Field with Dynamic Strength Indicator
                      CustomTextField(
                        controller: _passCtrl,
                        label: 'Password',
                        hint: 'Minimum 8 chars, 1 number',
                        prefixIcon: Icons.lock_outline,
                        obscureText: _obscurePassword,
                        onChanged: (val) => setState(() {}),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_off : Icons.visibility,
                            color: const Color(0xFF94A3B8),
                            size: 20,
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Password is required.';
                          }
                          if (value.length < 8) {
                            return 'Password must be at least 8 characters.';
                          }
                          if (!RegExp(r'\d').hasMatch(value)) {
                            return 'Include at least one digit.';
                          }
                          return null;
                        },
                      ),
                      PasswordStrengthBar(password: _passCtrl.text),
                      const SizedBox(height: 16),

                      // Confirm Password
                      CustomTextField(
                        controller: _confirmPassCtrl,
                        label: 'Confirm Password',
                        hint: 'Re-enter password',
                        prefixIcon: Icons.lock_reset,
                        obscureText: _obscureConfirm,
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureConfirm ? Icons.visibility_off : Icons.visibility,
                            color: const Color(0xFF94A3B8),
                            size: 20,
                          ),
                          onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please confirm your password.';
                          }
                          if (value != _passCtrl.text) {
                            return 'Passwords do not match.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Optional Phone
                      CustomTextField(
                        controller: _phoneCtrl,
                        label: 'Phone Number (Optional)',
                        hint: '+63 917 123 4567',
                        prefixIcon: Icons.phone_outlined,
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 18),

                      // Terms Agreement Checkbox
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            width: 24,
                            height: 24,
                            child: Checkbox(
                              value: _agreeTerms,
                              activeColor: const Color(0xFF0D9488),
                              onChanged: (v) => setState(() => _agreeTerms = v ?? true),
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Expanded(
                            child: Text(
                              'I agree to the Terms of Service, Privacy Policy, and understand MediRemind is a reminder tool, not a doctor prescription replacement.',
                              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Submit Button
                      SizedBox(
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleRegister,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0D9488),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            elevation: 0,
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : const Text('Create Account', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Return to Login
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text('Already have an account?', style: TextStyle(fontSize: 13, color: Color(0xFF64748B))),
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Sign In', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0D9488))),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
