import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/medicine_service.dart';
import '../../widgets/mobile_medication_card.dart';
import '../../widgets/mobile_bottom_sheets.dart';
import '../../models/medicine.dart';

class MobileMedicinesScreen extends StatelessWidget {
  const MobileMedicinesScreen({super.key});

  final List<String> _forms = const [
    'All',
    'Tablet',
    'Capsule',
    'Liquid',
    'Inhaler',
    'Drops',
    'Powder',
  ];

  @override
  Widget build(BuildContext context) {
    final medService = context.watch<MedicineService>();
    final items = medService.filteredMedicines;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Medication Catalog',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: Color(0xFF0D9488), size: 26),
            onPressed: () {
              showMobileAddEditMedicineSheet(
                context: context,
                onSave: (newMed) => medService.addMedicine(newMed),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        color: const Color(0xFF0D9488),
        onRefresh: () async {
          await medService.fetchMedicines();
        },
        child: Column(
          children: [
            // Search Input
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: TextField(
                onChanged: (val) => medService.setSearchQuery(val),
                decoration: InputDecoration(
                  hintText: 'Search medicine name...',
                  prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF94A3B8)),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                ),
              ),
            ),

            // Horizontal Scrollable Form Filter Chips
            SizedBox(
              height: 44,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _forms.length,
                itemBuilder: (context, idx) {
                  final form = _forms[idx];
                  final isSelected = medService.selectedForm == form;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      selected: isSelected,
                      label: Text(form),
                      labelStyle: TextStyle(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected ? Colors.white : const Color(0xFF475569),
                      ),
                      backgroundColor: Colors.white,
                      selectedColor: const Color(0xFF0D9488),
                      side: BorderSide(
                        color: isSelected ? const Color(0xFF0D9488) : const Color(0xFFCBD5E1),
                      ),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                      onSelected: (_) => medService.setSelectedForm(form),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 8),

            // Full-Width Stacked Medication Cards List
            Expanded(
              child: items.isEmpty
                  ? const Center(
                      child: Text('No medications found.', style: TextStyle(color: Color(0xFF94A3B8))),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: items.length,
                      itemBuilder: (context, idx) {
                        final med = items[idx];
                        return MobileMedicationCard(
                          medicine: med,
                          onEdit: () {
                            showMobileAddEditMedicineSheet(
                              context: context,
                              initialMedicine: med,
                              onSave: (updated) => medService.updateMedicine(updated),
                            );
                          },
                          onDelete: () {
                            showMobileDeleteConfirmationSheet(
                              context: context,
                              medicineName: med.name,
                              onConfirm: () => medService.deleteMedicine(med.id),
                            );
                          },
                          onRefill: () {
                            medService.refillMedicine(med.id);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Refilled ${med.name} (+30 units)!'),
                                backgroundColor: const Color(0xFF0D9488),
                              ),
                            );
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
