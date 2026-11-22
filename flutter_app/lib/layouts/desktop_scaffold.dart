import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../services/medicine_service.dart';
import '../screens/desktop/desktop_dashboard_screen.dart';
import '../screens/desktop/desktop_medicines_screen.dart';
import '../screens/desktop/desktop_schedules_screen.dart';
import '../screens/desktop/desktop_adherence_screen.dart';
import '../screens/desktop/desktop_profile_screen.dart';

class DesktopScaffold extends StatefulWidget {
  const DesktopScaffold({super.key});

  @override
  State<DesktopScaffold> createState() => _DesktopScaffoldState();
}

class _DesktopScaffoldState extends State<DesktopScaffold> {
  int _selectedIndex = 0;
  bool _isExtended = true;

  void _onDestinationSelected(int index) {
    setState(() => _selectedIndex = index);
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log Out of MediRemind?'),
        content: const Text('Are you sure you want to end your active session on this device?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDC2626), foregroundColor: Colors.white),
            onPressed: () {
              Navigator.of(ctx).pop();
              context.read<AuthService>().logout();
            },
            child: const Text('Log Out'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();
    final medService = context.watch<MedicineService>();
    final isOnline = authService.isBackendConnected || medService.isConnectedToBackend;
    final user = authService.currentUser;

    final List<Widget> pages = [
      DesktopDashboardScreen(onNavigateTab: _onDestinationSelected),
      const DesktopMedicinesScreen(),
      const DesktopSchedulesScreen(),
      const DesktopAdherenceScreen(),
      const DesktopProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Row(
        children: [
          // Permanent Desktop NavigationRail Sidebar (Task 3.2 Core Component)
          Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(right: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(minHeight: constraints.maxHeight),
                    child: IntrinsicHeight(
                      child: NavigationRail(
                        selectedIndex: _selectedIndex,
                        onDestinationSelected: _onDestinationSelected,
                        extended: _isExtended,
                        minWidth: 72,
                        minExtendedWidth: 240,
                        backgroundColor: Colors.white,
                        selectedIconTheme: const IconThemeData(color: Color(0xFF0D9488), size: 24),
                        unselectedIconTheme: const IconThemeData(color: Color(0xFF64748B), size: 22),
                        selectedLabelTextStyle: const TextStyle(
                          color: Color(0xFF0D9488),
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                        unselectedLabelTextStyle: const TextStyle(
                          color: Color(0xFF64748B),
                          fontWeight: FontWeight.w500,
                          fontSize: 14,
                        ),
                        // Sidebar Header
                        leading: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                          child: Column(
                            crossAxisAlignment: _isExtended ? CrossAxisAlignment.start : CrossAxisAlignment.center,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0D9488),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: const Icon(Icons.healing_rounded, color: Colors.white, size: 20),
                                  ),
                                  if (_isExtended) ...[
                                    const SizedBox(width: 12),
                                    const Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'MediRemind',
                                          style: TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.w800,
                                            color: Color(0xFF0F172A),
                                            letterSpacing: -0.5,
                                          ),
                                        ),
                                        Text(
                                          'Healthcare Suite',
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                            color: Color(0xFF0D9488),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 16),
                              // Sidebar Toggle Button
                              IconButton(
                                icon: Icon(_isExtended ? Icons.chevron_left_rounded : Icons.chevron_right_rounded),
                                tooltip: _isExtended ? 'Collapse Sidebar' : 'Expand Sidebar',
                                onPressed: () => setState(() => _isExtended = !_isExtended),
                              ),
                            ],
                          ),
                        ),
                        // Primary Navigation Destinations
                        destinations: const [
                          NavigationRailDestination(
                            icon: Icon(Icons.dashboard_outlined),
                            selectedIcon: Icon(Icons.dashboard_rounded),
                            label: Text('Dashboard'),
                          ),
                          NavigationRailDestination(
                            icon: Icon(Icons.medication_outlined),
                            selectedIcon: Icon(Icons.medication_rounded),
                            label: Text('Medicines'),
                          ),
                          NavigationRailDestination(
                            icon: Icon(Icons.calendar_today_outlined),
                            selectedIcon: Icon(Icons.calendar_today_rounded),
                            label: Text('Schedules'),
                          ),
                          NavigationRailDestination(
                            icon: Icon(Icons.analytics_outlined),
                            selectedIcon: Icon(Icons.analytics_rounded),
                            label: Text('Adherence'),
                          ),
                          NavigationRailDestination(
                            icon: Icon(Icons.person_outline_rounded),
                            selectedIcon: Icon(Icons.person_rounded),
                            label: Text('Profile'),
                          ),
                        ],
                        // Sidebar Footer: Status & Logout
                        trailing: Expanded(
                          child: Align(
                            alignment: Alignment.bottomCenter,
                            child: Padding(
                              padding: const EdgeInsets.only(bottom: 24, left: 12, right: 12),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (_isExtended) ...[
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: isOnline ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                          color: isOnline ? const Color(0xFFBBF7D0) : const Color(0xFFFECACA),
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Container(
                                            width: 8,
                                            height: 8,
                                            decoration: BoxDecoration(
                                              color: isOnline ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Flexible(
                                            child: Text(
                                              isOnline ? 'localhost:5000 • Online' : 'localhost:5000 • Offline',
                                              style: TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.w600,
                                                color: isOnline ? const Color(0xFF166534) : const Color(0xFF991B1B),
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                  ],
                                  IconButton(
                                    icon: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444)),
                                    tooltip: 'Log Out',
                                    onPressed: () => _confirmLogout(context),
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
              },
            ),
          ),

          // Main Desktop Content Viewport
          Expanded(
            child: IndexedStack(
              index: _selectedIndex,
              children: pages,
            ),
          ),
        ],
      ),
    );
  }
}
