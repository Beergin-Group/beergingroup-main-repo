import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/medicine_service.dart';
import '../../widgets/desktop_medication_card.dart';
import '../../widgets/add_edit_medicine_modal.dart';
import '../../widgets/delete_confirmation_dialog.dart';
import '../../models/medicine.dart';

class DesktopMedicinesScreen extends StatelessWidget {
  const DesktopMedicinesScreen({super.key});

  final List<String> _forms = const [
    'All',
    'Tablet',
    'Capsule',
    'Liquid',
    'Inhaler',
    'Drops',
    'Powder',
  ];

  void _openAddModal(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AddEditMedicineModal(
        onSave: (newMed) {
          context.read<MedicineService>().addMedicine(newMed);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Prescription "${newMed.name}" added successfully!'),
              backgroundColor: const Color(0xFF0D9488),
            ),
          );
        },
      ),
    );
  }

  void _openEditModal(BuildContext context, Medicine medicine) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AddEditMedicineModal(
        initialMedicine: medicine,
        onSave: (updated) {
          context.read<MedicineService>().updateMedicine(updated);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Prescription "${updated.name}" updated!'),
              backgroundColor: const Color(0xFF0D9488),
            ),
          );
        },
      ),
    );
  }

  void _confirmDelete(BuildContext context, Medicine medicine) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => DeleteConfirmationDialog(
        medicineName: medicine.name,
        onConfirm: () {
          context.read<MedicineService>().deleteMedicine(medicine.id);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Deleted "${medicine.name}".'),
              backgroundColor: const Color(0xFFDC2626),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final medService = context.watch<MedicineService>();
    final items = medService.filteredMedicines;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Medication Catalog',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A),
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Showing ${items.length} of ${medService.totalMedicines} prescriptions',
                    style: const TextStyle(fontSize: 14, color: Color(0xFF64748B)),
                  ),
                ],
              ),
              ElevatedButton.icon(
                icon: const Icon(Icons.add_rounded, size: 20),
                label: const Text('Add Prescription'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0D9488),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () => _openAddModal(context),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Search bar & Form category chips
          Row(
            children: [
              // Search Input
              Expanded(
                flex: 2,
                child: TextField(
                  onChanged: (val) => medService.setSearchQuery(val),
                  decoration: InputDecoration(
                    hintText: 'Search medication name or dosage...',
                    prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF94A3B8)),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              // Category Chips
              Expanded(
                flex: 3,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: _forms.map((form) {
                      final isSelected = medService.selectedForm == form;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          selected: isSelected,
                          label: Text(form),
                          labelStyle: TextStyle(
                            fontSize: 13,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? Colors.white : const Color(0xFF475569),
                          ),
                          backgroundColor: Colors.white,
                          selectedColor: const Color(0xFF0D9488),
                          side: BorderSide(
                            color: isSelected ? const Color(0xFF0D9488) : const Color(0xFFCBD5E1),
                          ),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          onSelected: (_) => medService.setSelectedForm(form),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Multi-Column Responsive Desktop Grid
          Expanded(
            child: items.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.search_off_rounded, size: 54, color: Color(0xFFCBD5E1)),
                        const SizedBox(height: 12),
                        const Text(
                          'No medications match your filter.',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                        ),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: () {
                            medService.setSearchQuery('');
                            medService.setSelectedForm('All');
                          },
                          child: const Text('Reset Search & Filters'),
                        ),
                      ],
                    ),
                  )
                : LayoutBuilder(
                    builder: (context, constraints) {
                      // Desktop multi-column grid: 3 columns on standard wide monitor (>= 1100px), 2 columns on smaller desktop
                      final crossAxisCount = constraints.maxWidth >= 1100 ? 3 : 2;

                      return GridView.builder(
                        itemCount: items.length,
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: crossAxisCount,
                          crossAxisSpacing: 20,
                          mainAxisSpacing: 20,
                          mainAxisExtent: 290,
                        ),
                        itemBuilder: (context, idx) {
                          final medicine = items[idx];
                          return DesktopMedicationCard(
                            medicine: medicine,
                            onEdit: () => _openEditModal(context, medicine),
                            onDelete: () => _confirmDelete(context, medicine),
                            onRefill: () {
                              medService.refillMedicine(medicine.id);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Refilled ${medicine.name} (+30 units)!'),
                                  backgroundColor: const Color(0xFF0D9488),
                                ),
                              );
                            },
                          );
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
