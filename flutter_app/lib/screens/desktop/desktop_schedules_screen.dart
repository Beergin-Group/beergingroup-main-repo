import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/medicine_service.dart';

class DesktopSchedulesScreen extends StatelessWidget {
  const DesktopSchedulesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final medService = context.watch<MedicineService>();
    final schedules = medService.schedules;

    // Group schedules by medication
    final Map<int, List<dynamic>> grouped = {};
    for (final s in schedules) {
      grouped.putIfAbsent(s.medicineId, () => []).add(s);
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Medication Schedules & Reminders',
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0F172A),
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Configured reminder time slots grouped by prescription record.',
            style: TextStyle(fontSize: 14, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 28),

          if (grouped.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 60),
                child: Text('No active schedules configured.', style: TextStyle(color: Color(0xFF94A3B8))),
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: grouped.keys.length,
              itemBuilder: (context, idx) {
                final medId = grouped.keys.elementAt(idx);
                final medSchedules = grouped[medId]!;
                final first = medSchedules.first;

                return Container(
                  margin: const EdgeInsets.only(bottom: 20),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withOpacity(0.03),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
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
                                  color: const Color(0xFF0D9488).withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.alarm_on_rounded, color: Color(0xFF0D9488), size: 20),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                first.medicineName,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  first.dosage,
                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: Color(0xFF475569)),
                                ),
                              ),
                            ],
                          ),
                          Text(
                            '${medSchedules.length} reminder time(s) daily',
                            style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      const Divider(height: 1, color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 18),

                      // Time Slots Chips Row
                      Wrap(
                        spacing: 12,
                        runSpacing: 10,
                        children: medSchedules.map((s) {
                          final isTaken = s.status == 'taken';
                          final isSkipped = s.status == 'skipped';

                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: isTaken
                                  ? const Color(0xFFF0FDF4)
                                  : isSkipped
                                      ? const Color(0xFFFEF2F2)
                                      : const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isTaken
                                    ? const Color(0xFF86EFAC)
                                    : isSkipped
                                        ? const Color(0xFFFECACA)
                                        : const Color(0xFFCBD5E1),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  isTaken
                                      ? Icons.check_circle_rounded
                                      : isSkipped
                                          ? Icons.cancel_rounded
                                          : Icons.access_time_filled_rounded,
                                  size: 16,
                                  color: isTaken
                                      ? const Color(0xFF16A34A)
                                      : isSkipped
                                          ? const Color(0xFFDC2626)
                                          : const Color(0xFF0D9488),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  s.doseTime,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: isTaken
                                        ? const Color(0xFF16A34A)
                                        : isSkipped
                                            ? const Color(0xFFDC2626)
                                            : const Color(0xFF1E293B),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  isTaken ? 'Taken' : isSkipped ? 'Skipped' : 'Pending',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isTaken
                                        ? const Color(0xFF16A34A)
                                        : isSkipped
                                            ? const Color(0xFFDC2626)
                                            : const Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
