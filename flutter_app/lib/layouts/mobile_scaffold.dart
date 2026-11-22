import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/medicine_service.dart';
import '../widgets/mobile_bottom_sheets.dart';
import '../screens/mobile/mobile_today_screen.dart';
import '../screens/mobile/mobile_medicines_screen.dart';
import '../screens/mobile/mobile_schedules_screen.dart';
import '../screens/mobile/mobile_profile_screen.dart';

/// Mobile Touch Navigation Shell (Task 3.6 / Issue #45)
/// Features BottomNavigationBar, Floating Action Button, and thumb-friendly touch targets.
class MobileScaffold extends StatefulWidget {
  const MobileScaffold({super.key});

  @override
  State<MobileScaffold> createState() => _MobileScaffoldState();
}

class _MobileScaffoldState extends State<MobileScaffold> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    MobileTodayScreen(),
    MobileMedicinesScreen(),
    MobileSchedulesScreen(),
    MobileProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      // Ergonomic Floating Action Button (+ Add Medicine)
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF0D9488),
        foregroundColor: Colors.white,
        elevation: 4,
        shape: const CircleBorder(),
        tooltip: 'Add Prescription',
        onPressed: () {
          showMobileAddEditMedicineSheet(
            context: context,
            onSave: (newMed) {
              context.read<MedicineService>().addMedicine(newMed);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Added "${newMed.name}" to prescriptions!'),
                  backgroundColor: const Color(0xFF0D9488),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
          );
        },
        child: const Icon(Icons.add_rounded, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,

      // Mobile Bottom Navigation Bar (Today, Medicines, Schedules, Profile)
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        notchMargin: 8,
        color: Colors.white,
        elevation: 12,
        child: SizedBox(
          height: 64,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                index: 0,
                icon: Icons.today_outlined,
                activeIcon: Icons.today_rounded,
                label: 'Today',
              ),
              _buildNavItem(
                index: 1,
                icon: Icons.medication_outlined,
                activeIcon: Icons.medication_rounded,
                label: 'Medicines',
              ),
              const SizedBox(width: 48), // Spacer for notched center FAB
              _buildNavItem(
                index: 2,
                icon: Icons.calendar_today_outlined,
                activeIcon: Icons.calendar_today_rounded,
                label: 'Schedules',
              ),
              _buildNavItem(
                index: 3,
                icon: Icons.person_outline_rounded,
                activeIcon: Icons.person_rounded,
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
  }) {
    final isSelected = _currentIndex == index;
    const activeColor = Color(0xFF0D9488);
    const inactiveColor = Color(0xFF64748B);

    return InkWell(
      onTap: () => setState(() => _currentIndex = index),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              color: isSelected ? activeColor : inactiveColor,
              size: 22,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                color: isSelected ? activeColor : inactiveColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
