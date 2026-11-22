import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/medicine_service.dart';
import '../../services/auth_service.dart';
import '../../widgets/desktop_stat_card.dart';

class DesktopDashboardScreen extends StatelessWidget {
  final Function(int) onNavigateTab;

  const DesktopDashboardScreen({
    super.key,
    required this.onNavigateTab,
  });

  @override
  Widget build(BuildContext context) {
    final medService = context.watch<MedicineService>();
    final authService = context.watch<AuthService>();
    final user = authService.currentUser;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Desktop Welcome Banner
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome back, ${user?.name ?? 'User'} 👋',
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A),
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Here is your prescription management overview and daily dose timeline.',
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_rounded, size: 16, color: Color(0xFF64748B)),
                        const SizedBox(width: 8),
                        Text(
                          DateTime.now().toLocal().toString().split(' ')[0],
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF334155)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.add_rounded, size: 18),
                    label: const Text('+ Add Medicine'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0D9488),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () => onNavigateTab(1), // Go to Medicines tab
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 28),

          // Multi-Column Row of KPI Stat Cards
          LayoutBuilder(
            builder: (context, constraints) {
              return Row(
                children: [
                  Expanded(
                    child: DesktopStatCard(
                      title: 'Total Medicines',
                      value: medService.totalMedicines.toString(),
                      subtitle: 'Active prescriptions',
                      icon: Icons.medication_rounded,
                      color: const Color(0xFF0D9488),
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: DesktopStatCard(
                      title: 'Pending Today',
                      value: medService.pendingDoses.toString(),
                      subtitle: 'Scheduled upcoming doses',
                      icon: Icons.schedule_rounded,
                      color: const Color(0xFFF59E0B),
                      isHighlighted: medService.pendingDoses > 0,
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: DesktopStatCard(
                      title: 'Taken Today',
                      value: medService.takenDoses.toString(),
                      subtitle: 'Successfully logged doses',
                      icon: Icons.check_circle_rounded,
                      color: const Color(0xFF10B981),
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: DesktopStatCard(
                      title: 'Adherence Rate',
                      value: '${medService.adherenceRate}%',
                      subtitle: 'Current compliance rating',
                      icon: Icons.pie_chart_rounded,
                      color: const Color(0xFF6366F1),
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 32),

          // 2-Column Desktop Grid: Left (Timeline), Right (Quick Info & Alerts)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Left Column: Today's Dose Schedule Timeline
              Expanded(
                flex: 3,
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withOpacity(0.03),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0D9488).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.timer_outlined, color: Color(0xFF0D9488), size: 20),
                              ),
                              const SizedBox(width: 12),
                              const Text(
                                "Today's Medication Schedule",
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                            ],
                          ),
                          TextButton(
                            onPressed: () => onNavigateTab(2), // Schedules tab
                            child: const Text('View All Schedules →'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      if (medService.schedules.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 40),
                          child: Center(
                            child: Text(
                              'No scheduled doses for today.',
                              style: TextStyle(color: Color(0xFF94A3B8)),
                            ),
                          ),
                        )
                      else
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: medService.schedules.length,
                          separatorBuilder: (_, __) => const Divider(height: 20, color: Color(0xFFF1F5F9)),
                          itemBuilder: (context, idx) {
                            final schedule = medService.schedules[idx];
                            final isTaken = schedule.status == 'taken';
                            final isSkipped = schedule.status == 'skipped';

                            return Row(
                              children: [
                                // Time Badge
                                Container(
                                  width: 90,
                                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                  ),
                                  child: Center(
                                    child: Text(
                                      schedule.doseTime,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 12,
                                        color: Color(0xFF334155),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                // Medication Details
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        schedule.medicineName,
                                        style: TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 15,
                                          decoration: isTaken ? TextDecoration.lineThrough : null,
                                          color: isTaken ? const Color(0xFF94A3B8) : const Color(0xFF0F172A),
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Dosage: ${schedule.dosage}',
                                        style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                                      ),
                                    ],
                                  ),
                                ),
                                // Action / Status Buttons
                                if (isTaken)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFDCFCE7),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: const Row(
                                      children: [
                                        Icon(Icons.check_circle, size: 14, color: Color(0xFF16A34A)),
                                        SizedBox(width: 6),
                                        Text('Taken', style: TextStyle(color: Color(0xFF16A34A), fontWeight: FontWeight.w700, fontSize: 12)),
                                      ],
                                    ),
                                  )
                                else if (isSkipped)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFEE2E2),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: const Row(
                                      children: [
                                        Icon(Icons.cancel_rounded, size: 14, color: Color(0xFFDC2626)),
                                        SizedBox(width: 6),
                                        Text('Skipped', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w700, fontSize: 12)),
                                      ],
                                    ),
                                  )
                                else
                                  Row(
                                    children: [
                                      OutlinedButton(
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: const Color(0xFFEF4444),
                                          side: const BorderSide(color: Color(0xFFFCA5A5)),
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                        ),
                                        onPressed: () => medService.markDoseStatus(schedule.id, 'skipped'),
                                        child: const Text('Skip'),
                                      ),
                                      const SizedBox(width: 8),
                                      ElevatedButton.icon(
                                        icon: const Icon(Icons.check_rounded, size: 14),
                                        label: const Text('Take Now'),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFF0D9488),
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                        ),
                                        onPressed: () => medService.markDoseStatus(schedule.id, 'taken'),
                                      ),
                                    ],
                                  ),
                              ],
                            );
                          },
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 24),

              // Right Column: Low Stock Alerts & Quick Navigation
              Expanded(
                flex: 2,
                child: Column(
                  children: [
                    // Low Stock Alert Card
                    Container(
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: medService.lowStockCount > 0
                              ? const Color(0xFFFCA5A5)
                              : const Color(0xFFE2E8F0),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0F172A).withOpacity(0.03),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEE2E2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.warning_rounded, color: Color(0xFFDC2626), size: 20),
                              ),
                              const SizedBox(width: 12),
                              const Text(
                                'Inventory Alerts',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          if (medService.lowStockCount == 0)
                            const Text(
                              'All medication stocks are sufficient.',
                              style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.w600, fontSize: 13),
                            )
                          else
                            Column(
                              children: medService.medicines
                                  .where((m) => m.isLowStock)
                                  .map(
                                    (m) => Container(
                                      margin: const EdgeInsets.only(bottom: 10),
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFFF1F2),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                m.name,
                                                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFF9F1239)),
                                              ),
                                              Text(
                                                'Only ${m.stockCount} left in stock',
                                                style: const TextStyle(fontSize: 12, color: Color(0xFFBE123C)),
                                              ),
                                            ],
                                          ),
                                          ElevatedButton(
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: const Color(0xFF0D9488),
                                              foregroundColor: Colors.white,
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                              textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                                            ),
                                            onPressed: () => medService.refillMedicine(m.id),
                                            child: const Text('+30 Refill'),
                                          ),
                                        ],
                                      ),
                                    ),
                                  )
                                  .toList(),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Quick Actions / System Info Box
                    Container(
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Desktop Shortcuts & Info',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 12),
                          const Row(
                            children: [
                              Icon(Icons.keyboard_outlined, size: 16, color: Color(0xFF64748B)),
                              SizedBox(width: 8),
                              Text('Tab / Shift+Tab to cycle inputs', style: TextStyle(fontSize: 12, color: Color(0xFF475569))),
                            ],
                          ),
                          const SizedBox(height: 6),
                          const Row(
                            children: [
                              Icon(Icons.keyboard_return_rounded, size: 16, color: Color(0xFF64748B)),
                              SizedBox(width: 8),
                              Text('Ctrl + Enter to submit modals', style: TextStyle(fontSize: 12, color: Color(0xFF475569))),
                            ],
                          ),
                          const SizedBox(height: 6),
                          const Row(
                            children: [
                              Icon(Icons.aspect_ratio_rounded, size: 16, color: Color(0xFF64748B)),
                              SizedBox(width: 8),
                              Text('Minimum resolution: 1024x768', style: TextStyle(fontSize: 12, color: Color(0xFF475569))),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
