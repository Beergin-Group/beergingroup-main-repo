import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';

class MobileProfileScreen extends StatelessWidget {
  const MobileProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();
    final user = authService.currentUser;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Profile & Settings',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Profile Banner Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: const Color(0xFF0D9488),
                  child: Text(
                    user != null && user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.name ?? 'User',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        user?.email ?? '',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: user?.isCaregiver ?? false ? const Color(0xFFEDE9FE) : const Color(0xFFCCFBF1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          (user?.role ?? 'patient').toUpperCase(),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: user?.isCaregiver ?? false ? const Color(0xFF7C3AED) : const Color(0xFF0D9488),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Role Switcher for Evaluation
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Active Role:', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFF334155))),
                const SizedBox(height: 10),
                Row(
                  children: [
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
          const SizedBox(height: 16),

          // Dev Tunnel / API Connectivity Info
          Container(
            padding: const EdgeInsets.all(16),
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
                    Icon(Icons.wifi_tethering_rounded, size: 18, color: Color(0xFF0D9488)),
                    SizedBox(width: 8),
                    Text('API Endpoint Configuration', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  'Base URL: ${ApiService.baseUrl}',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Android Tunnel: devtunnels.ms HTTPS route',
                  style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Logout Button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              icon: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 18),
              label: const Text('Log Out', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w700)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFFCA5A5)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Log Out?'),
                    content: const Text('Are you sure you want to log out of MediRemind?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(ctx).pop(),
                        child: const Text('Cancel'),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFDC2626),
                          foregroundColor: Colors.white,
                        ),
                        onPressed: () {
                          Navigator.of(ctx).pop();
                          authService.logout();
                        },
                        child: const Text('Log Out'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
