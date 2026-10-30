import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../widgets/custom_text_field.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController(text: 'patient@mediremind.com');
  final _passCtrl = TextEditingController(text: 'password123');
  bool _obscurePassword = true;
  bool _rememberMe = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final res = await AuthService.login(
      _emailCtrl.text.trim(),
      _passCtrl.text.trim(),
    );

    setState(() => _isLoading = false);

    if (!mounted) return;

    if (res['success'] == true) {
      final user = res['user'];
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF0D9488),
          content: Text('Welcome back, ${user['name']}! Role: ${user['role']}'),
        ),
      );
      Navigator.pushReplacementNamed(context, '/dashboard');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: Colors.red.shade700,
          content: Text(res['message'] ?? 'Authentication failed.'),
        ),
      );
    }
  }

  void _quickFill(String email, String role) {
    setState(() {
      _emailCtrl.text = email;
      _passCtrl.text = 'password123';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        duration: const Duration(seconds: 1),
        content: Text('Loaded $role test credentials'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Card(
              elevation: 4,
              shadowColor: Colors.black12,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 36),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // App Brand Header
                      Center(
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: const Color(0xFFCCFBF1),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Center(
                            child: Text('💊', style: TextStyle(fontSize: 32)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Center(
                        child: Text(
                          'MediRemind',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0D9488),
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                      const Center(
                        child: Text(
                          'Sign in to manage medications & reminders',
                          style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Email Field
                      CustomTextField(
                        controller: _emailCtrl,
                        label: 'Email Address',
                        hint: 'name@example.com',
                        prefixIcon: Icons.email_outlined,
                        keyboardType: TextInputType.emailAddress,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Email address is required.';
                          }
                          final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
                          if (!emailRegex.hasMatch(value.trim())) {
                            return 'Enter a valid email address.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 18),

                      // Password Field
                      CustomTextField(
                        controller: _passCtrl,
                        label: 'Password',
                        hint: 'Enter your password',
                        prefixIcon: Icons.lock_outline,
                        obscureText: _obscurePassword,
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
                          if (value.length < 6) {
                            return 'Password must be at least 6 characters.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),

                      // Remember me row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              SizedBox(
                                width: 24,
                                height: 24,
                                child: Checkbox(
                                  value: _rememberMe,
                                  activeColor: const Color(0xFF0D9488),
                                  onChanged: (v) => setState(() => _rememberMe = v ?? true),
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text('Remember me', style: TextStyle(fontSize: 13, color: Color(0xFF475569))),
                            ],
                          ),
                          TextButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Password reset instructions will be sent to your email.')),
                              );
                            },
                            child: const Text('Forgot password?', style: TextStyle(fontSize: 13, color: Color(0xFF0D9488))),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Sign In Button
                      SizedBox(
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleLogin,
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
                              : const Text('Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Quick Demo Switcher
                      const Row(
                        children: [
                          Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                          Padding(
                            padding: EdgeInsets.symmetric(horizontal: 10),
                            child: Text('TEST ACCOUNTS', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
                          ),
                          Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              icon: const Icon(Icons.person, size: 16, color: Color(0xFF0D9488)),
                              label: const Text('Patient Demo', style: TextStyle(fontSize: 12, color: Color(0xFF0D9488))),
                              onPressed: () => _quickFill('patient@mediremind.com', 'Patient'),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Color(0xFF99F6E4)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: OutlinedButton.icon(
                              icon: const Icon(Icons.medical_services, size: 16, color: Color(0xFF0369A1)),
                              label: const Text('Caregiver Demo', style: TextStyle(fontSize: 12, color: Color(0xFF0369A1))),
                              onPressed: () => _quickFill('caregiver@mediremind.com', 'Caregiver'),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Color(0xFFBAE6FD)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Go to Register
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text("Don't have an account?", style: TextStyle(fontSize: 13, color: Color(0xFF64748B))),
                          TextButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const RegisterScreen()),
                              );
                            },
                            child: const Text('Sign Up', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0D9488))),
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
