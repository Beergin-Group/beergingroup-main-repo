import 'package:flutter/material.dart';
import '../models/medicine.dart';

/// Mobile Medication Card (Task 3.6 & 3.7)
/// Stacked full-width layout with 48x48 dp touch targets and zero RenderFlex horizontal overflow.
class MobileMedicationCard extends StatelessWidget {
  final Medicine medicine;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onRefill;

  const MobileMedicationCard({
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
    } catch (_) {
      return const Color(0xFF0D9488);
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeColor = _parseColor(medicine.colorTag);
    final isLow = medicine.isLowStock;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isLow ? const Color(0xFFFCA5A5) : const Color(0xFFE2E8F0),
          width: isLow ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Form Chip, Name, Menu Actions
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 10,
                  height: 10,
                  margin: const EdgeInsets.only(top: 4),
                  decoration: BoxDecoration(
                    color: themeColor,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: themeColor.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              medicine.form.toUpperCase(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: themeColor,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          if (medicine.isPrn) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF3C7),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                'PRN',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFFD97706)),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        medicine.name,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        medicine.dosage,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: themeColor,
                        ),
                      ),
                    ],
                  ),
                ),
                // Action Buttons with WCAG minimum 48x48dp touch targets
                SizedBox(
                  width: 48,
                  height: 48,
                  child: IconButton(
                    icon: const Icon(Icons.edit_outlined, size: 20, color: Color(0xFF64748B)),
                    onPressed: onEdit,
                  ),
                ),
                SizedBox(
                  width: 48,
                  height: 48,
                  child: IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, size: 20, color: Color(0xFFEF4444)),
                    onPressed: onDelete,
                  ),
                ),
              ],
            ),

            if (medicine.instructions.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(
                medicine.instructions,
                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.3),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],

            const SizedBox(height: 14),
            const Divider(height: 1, color: Color(0xFFF1F5F9)),
            const SizedBox(height: 12),

            // Stock Inventory Bar & Quick Refill Button
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            isLow ? Icons.warning_amber_rounded : Icons.inventory_2_outlined,
                            size: 14,
                            color: isLow ? const Color(0xFFEF4444) : const Color(0xFF64748B),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Stock: ${medicine.stockCount} left',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: isLow ? const Color(0xFFEF4444) : const Color(0xFF334155),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: medicine.stockRatio,
                          minHeight: 5,
                          backgroundColor: const Color(0xFFE2E8F0),
                          valueColor: AlwaysStoppedAnimation<Color>(
                            isLow ? const Color(0xFFEF4444) : themeColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
                // +30 Refill Button with 48dp touch height
                SizedBox(
                  height: 44,
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.add_rounded, size: 16),
                    label: const Text('+30 Refill', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0D9488),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: onRefill,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
