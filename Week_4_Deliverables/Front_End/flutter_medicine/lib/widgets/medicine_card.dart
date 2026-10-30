import 'package:flutter/material.dart';
import '../models/medicine.dart';

class MedicineCard extends StatelessWidget {
  final Medicine medicine;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onRefill;

  const MedicineCard({
    super.key,
    required this.medicine,
    required this.onEdit,
    required this.onDelete,
    required this.onRefill,
  });

  Color _parseColor(String hex) {
    try {
      final clean = hex.replaceAll('#', '');
      return Color(int.parse('FF$clean', radix: 16));
    } catch (e) {
      return const Color(0xFF0D9488);
    }
  }

  @override
  Widget build(BuildContext context) {
    final medColor = _parseColor(medicine.color);

    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 14),
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Header Row
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Color Tag Icon
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: medColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: medColor.withOpacity(0.4), width: 1.5),
                  ),
                  child: Center(
                    child: Text('💊', style: TextStyle(fontSize: 20, color: medColor)),
                  ),
                ),
                const SizedBox(width: 12),

                // Name & Dosage
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        medicine.name,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              medicine.dosage,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF0D9488),
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            medicine.form.toUpperCase(),
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Stock Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: medicine.isLowStock ? const Color(0xFFFEE2E2) : const Color(0xFFCCFBF1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: medicine.isLowStock ? const Color(0xFFFCA5A5) : const Color(0xFF99F6E4),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (medicine.isLowStock) ...[
                        const Icon(Icons.warning_amber_rounded, size: 14, color: Color(0xFFDC2626)),
                        const SizedBox(width: 4),
                      ],
                      Text(
                        '${medicine.stockCount} units',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: medicine.isLowStock ? const Color(0xFFDC2626) : const Color(0xFF0F766E),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // Instructions Note
            if (medicine.instructions != null && medicine.instructions!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '“${medicine.instructions}”',
                  style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Color(0xFF475569)),
                ),
              ),
            ],

            const SizedBox(height: 14),
            const Divider(height: 1, color: Color(0xFFF1F5F9)),
            const SizedBox(height: 10),

            // Action Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Quick Refill button
                TextButton.icon(
                  onPressed: onRefill,
                  icon: const Icon(Icons.add_circle_outline, size: 16, color: Color(0xFF0D9488)),
                  label: const Text('Refill (+30)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0D9488))),
                ),

                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.edit_outlined, size: 18, color: Color(0xFF475569)),
                      tooltip: 'Edit Prescription',
                      onPressed: onEdit,
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 18, color: Colors.red),
                      tooltip: 'Delete Prescription',
                      onPressed: onDelete,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
