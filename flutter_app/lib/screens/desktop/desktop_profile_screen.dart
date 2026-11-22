import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';

class DesktopProfileScreen extends StatefulWidget {
  const DesktopProfileScreen({super.key});

  @override
  State<DesktopProfileScreen> createState() => _DesktopProfileScreenState();
}

class _DesktopProfileScreenState extends State<DesktopProfileScreen> {
  Map<String, dynamic>? _healthInfo;
  bool _isCheckingHealth = false;

  void _checkBackend() async {
    setState(() => _isCheckingHealth = true);
    final health = await ApiService.checkHealth();
    if (!mounted) return;
    setState(() {
      _healthInfo = health;
      _isCheckingHealth = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              health != null ? Icons.cloud_done_rounded : Icons.cloud_off_rounded,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 10),
            Text(
              health != null
                  ? 'Connected to Node.js backend! DB Driver: ${health['db_driver'] ?? 'POSTGRES'}'
                  : 'Cannot reach http://localhost:5000/api/health. Check backend server.',
            ),
          ],
        ),
        backgroundColor: health != null ? const Color(0xFF0D9488) : const Color(0xFFDC2626),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _refreshProfile() async {
    final auth = context.read<AuthService>();
    final ok = await auth.fetchProfile();
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              ok ? Icons.verified_user_rounded : Icons.error_outline_rounded,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 10),
            Text(
              ok
                  ? 'Profile refreshed from GET /api/auth/me (PostgreSQL)!'
                  : 'Failed to refresh profile from backend.',
            ),
          ],
        ),
        backgroundColor: ok ? const Color(0xFF0D9488) : const Color(0xFFDC2626),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();
    final user = authService.currentUser;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'User Profile & System Settings',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A),
                      letterSpacing: -0.5,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Manage session credentials, role switching, and API backend connectivity.',
                    style: TextStyle(fontSize: 14, color: Color(0xFF64748B)),
                  ),
                ],
              ),
              Row(
                children: [
                  OutlinedButton.icon(
                    icon: _isCheckingHealth
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0D9488)),
                          )
                        : const Icon(Icons.network_check_rounded, size: 18, color: Color(0xFF0D9488)),
                    label: const Text('Test Connection', style: TextStyle(color: Color(0xFF0D9488))),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      side: const BorderSide(color: Color(0xFF0D9488)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: _isCheckingHealth ? null : _checkBackend,
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.refresh_rounded, size: 18),
                    label: const Text('GET /api/auth/me'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0D9488),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: _refreshProfile,
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 28),

          // Profile Info Card
          Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 36,
                  backgroundColor: const Color(0xFF0D9488),
                  child: Text(
                    user != null && user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                    style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
                const SizedBox(width: 24),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            user?.name ?? 'User',
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: user?.isCaregiver ?? false
                                  ? const Color(0xFFEDE9FE)
                                  : const Color(0xFFCCFBF1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              (user?.role ?? 'patient').toUpperCase(),
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: user?.isCaregiver ?? false
                                    ? const Color(0xFF7C3AED)
                                    : const Color(0xFF0D9488),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(user?.email ?? '', style: const TextStyle(fontSize: 14, color: Color(0xFF64748B))),
                      const SizedBox(height: 18),

                      // Role Switcher for Testing
                      Row(
                        children: [
                          const Text('Active Role View: ', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                          const SizedBox(width: 10),
                          ChoiceChip(
                            label: const Text('Patient'),
                            selected: user?.role == 'patient',
                            onSelected: (_) => authService.switchRole('patient'),
                          ),
                          const SizedBox(width: 8),
                          ChoiceChip(
                            label: const Text('Caregiver'),
                            selected: user?.role == 'caregiver',
                            onSelected: (_) => authService.switchRole('caregiver'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // System / API Connectivity Information Card
          Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.dns_rounded, color: Color(0xFF0D9488), size: 20),
                    SizedBox(width: 10),
                    Text(
                      'API Backend Configuration (Phase 3 localhost:5000)',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildConfigRow('Target Environment', 'Windows Desktop Native Client'),
                _buildConfigRow('Base URL Endpoint', ApiService.baseUrl),
                _buildConfigRow(
                  'Backend Server Status',
                  _healthInfo != null
                      ? 'ONLINE (${_healthInfo!['system']} • Driver: ${_healthInfo!['db_driver']})'
                      : (authService.isBackendConnected ? 'ONLINE (localhost:5000)' : 'Awaiting Test / Disconnected'),
                ),
                _buildConfigRow('Active Session JWT', ApiService.authToken ?? 'None'),
                _buildConfigRow('Persistent Storage', 'Windows Registry / Native SharedPreferences'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConfigRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 200,
            child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF64748B))),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF1E293B)),
            ),
          ),
        ],
      ),
    );
  }
}
