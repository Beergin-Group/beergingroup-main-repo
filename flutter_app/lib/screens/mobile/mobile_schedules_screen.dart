import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/medicine_service.dart';

class MobileSchedulesScreen extends StatelessWidget {
  const MobileSchedulesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final medService = context.watch<MedicineService>();
    final schedules = medService.schedules;

    final Map<int, List<dynamic>> grouped = {};
    for (final s in schedules) {
      grouped.putIfAbsent(s.medicineId, () => []).add(s);
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Reminder Schedules',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
        ),
      ),
      body: RefreshIndicator(
        color: const Color(0xFF0D9488),
        onRefresh: () async {
          await medService.fetchMedicines();
        },
        child: grouped.isEmpty
            ? const Center(
                child: Text('No active schedules configured.', style: TextStyle(color: Color(0xFF94A3B8))),
              )
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: grouped.keys.length,
                itemBuilder: (context, idx) {
                  final medId = grouped.keys.elementAt(idx);
                  final medSchedules = grouped[medId]!;
                  final first = medSchedules.first;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              first.medicineName,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                first.dosage,
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11, color: Color(0xFF475569)),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: medSchedules.map((s) {
                            final isTaken = s.status == 'taken';
                            final isSkipped = s.status == 'skipped';
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: isTaken
                                    ? const Color(0xFFDCFCE7)
                                    : isSkipped
                                        ? const Color(0xFFFEE2E2)
                                        : const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(8),
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
                                    size: 14,
                                    color: isTaken
                                        ? const Color(0xFF16A34A)
                                        : isSkipped
                                            ? const Color(0xFFDC2626)
                                            : const Color(0xFF0D9488),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    s.doseTime,
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: isTaken
                                          ? const Color(0xFF16A34A)
                                          : isSkipped
                                              ? const Color(0xFFDC2626)
                                              : const Color(0xFF1E293B),
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
      ),
    );
  }
}
