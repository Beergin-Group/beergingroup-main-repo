import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/medicine_service.dart';
import '../../services/auth_service.dart';

class MobileTodayScreen extends StatelessWidget {
  const MobileTodayScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final medService = context.watch<MedicineService>();
    final authService = context.watch<AuthService>();
    final user = authService.currentUser;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hi, ${user?.name ?? 'User'} 👋',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
            ),
            const Text(
              "Today's Dose Schedule",
              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFCCFBF1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                const Icon(Icons.pie_chart_rounded, size: 14, color: Color(0xFF0D9488)),
                const SizedBox(width: 4),
                Text(
                  '${medService.adherenceRate}%',
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: Color(0xFF0D9488)),
                ),
              ],
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: const Color(0xFF0D9488),
        onRefresh: () async {
          await medService.fetchMedicines();
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Quick Status KPI Bar
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildMetric('Pending', medService.pendingDoses.toString(), const Color(0xFFF59E0B)),
                  Container(width: 1, height: 28, color: const Color(0xFFE2E8F0)),
                  _buildMetric('Taken', medService.takenDoses.toString(), const Color(0xFF10B981)),
                  Container(width: 1, height: 28, color: const Color(0xFFE2E8F0)),
                  _buildMetric('Skipped', medService.skippedDoses.toString(), const Color(0xFFEF4444)),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Low Stock Banner (if any)
            if (medService.lowStockCount > 0)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFFECACA)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: Color(0xFFDC2626), size: 22),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        '${medService.lowStockCount} medication(s) running low on stock!',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF991B1B)),
                      ),
                    ),
                  ],
                ),
              ),

            // Today's Doses Header
            const Text(
              "Today's Timeline",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 12),

            if (medService.schedules.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Text('No doses scheduled for today.', style: TextStyle(color: Color(0xFF94A3B8))),
                ),
              )
            else
              ...medService.schedules.map((schedule) {
                final isTaken = schedule.status == 'taken';
                final isSkipped = schedule.status == 'skipped';

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isTaken
                          ? const Color(0xFF86EFAC)
                          : isSkipped
                              ? const Color(0xFFFECACA)
                              : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.access_time_filled, size: 12, color: Color(0xFF0D9488)),
                                const SizedBox(width: 6),
                                Text(
                                  schedule.doseTime,
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                                ),
                              ],
                            ),
                          ),
                          if (isTaken)
                            const Text('TAKEN', style: TextStyle(color: Color(0xFF16A34A), fontWeight: FontWeight.w800, fontSize: 11))
                          else if (isSkipped)
                            const Text('SKIPPED', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w800, fontSize: 11))
                          else
                            const Text('PENDING', style: TextStyle(color: Color(0xFFD97706), fontWeight: FontWeight.w800, fontSize: 11)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        schedule.medicineName,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          decoration: isTaken ? TextDecoration.lineThrough : null,
                          color: isTaken ? const Color(0xFF94A3B8) : const Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Dosage: ${schedule.dosage}',
                        style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 14),

                      // Large thumb-friendly Action Buttons
                      if (!isTaken && !isSkipped)
                        Row(
                          children: [
                            Expanded(
                              flex: 1,
                              child: SizedBox(
                                height: 48,
                                child: OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: const Color(0xFFEF4444),
                                    side: const BorderSide(color: Color(0xFFFCA5A5)),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  onPressed: () => medService.markDoseStatus(schedule.id, 'skipped'),
                                  child: const Text('Skip'),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              flex: 2,
                              child: SizedBox(
                                height: 48,
                                child: ElevatedButton.icon(
                                  icon: const Icon(Icons.check_rounded, size: 18),
                                  label: const Text('Take Now', style: TextStyle(fontWeight: FontWeight.w800)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF0D9488),
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  onPressed: () => medService.markDoseStatus(schedule.id, 'taken'),
                                ),
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }

  Widget _buildMetric(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: color)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF64748B))),
      ],
    );
  }
}
