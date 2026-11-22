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
        onSave: (newMed) async {
          final medService = context.read<MedicineService>();
          final success = await medService.addMedicine(newMed);
          if (!context.mounted) return;

          if (success) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text('Prescription "${newMed.name}" saved to PostgreSQL database!'),
                    ),
                  ],
                ),
                backgroundColor: const Color(0xFF0D9488),
                behavior: SnackBarBehavior.floating,
                duration: const Duration(seconds: 4),
              ),
            );
          } else {
            final error = medService.lastError ?? 'Failed to save prescription.';
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20),
                    const SizedBox(width: 10),
                    Expanded(child: Text(error)),
                  ],
                ),
                backgroundColor: const Color(0xFFDC2626),
                behavior: SnackBarBehavior.floating,
                duration: const Duration(seconds: 5),
              ),
            );
          }
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
        onSave: (updated) async {
          final medService = context.read<MedicineService>();
          final success = await medService.updateMedicine(updated);
          if (!context.mounted) return;

          if (success) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text('Prescription "${updated.name}" updated in PostgreSQL!'),
                    ),
                  ],
                ),
                backgroundColor: const Color(0xFF0D9488),
                behavior: SnackBarBehavior.floating,
                duration: const Duration(seconds: 4),
              ),
            );
          } else {
            final error = medService.lastError ?? 'Failed to update prescription.';
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20),
                    const SizedBox(width: 10),
                    Expanded(child: Text(error)),
                  ],
                ),
                backgroundColor: const Color(0xFFDC2626),
                behavior: SnackBarBehavior.floating,
                duration: const Duration(seconds: 5),
              ),
            );
          }
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
        onConfirm: () async {
          final medService = context.read<MedicineService>();
          final success = await medService.deleteMedicine(medicine.id);
          if (!context.mounted) return;

          if (success) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.delete_sweep_rounded, color: Colors.white, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text('Deleted "${medicine.name}" from PostgreSQL database.'),
                    ),
                  ],
                ),
                backgroundColor: const Color(0xFFDC2626),
                behavior: SnackBarBehavior.floating,
                duration: const Duration(seconds: 4),
              ),
            );
          } else {
            final error = medService.lastError ?? 'Failed to delete prescription.';
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20),
                    const SizedBox(width: 10),
                    Expanded(child: Text(error)),
                  ],
                ),
                backgroundColor: const Color(0xFFDC2626),
                behavior: SnackBarBehavior.floating,
                duration: const Duration(seconds: 5),
              ),
            );
          }
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
                    'Showing ${items.length} of ${medService.totalMedicines} prescriptions (Synced with localhost:5000)',
                    style: const TextStyle(fontSize: 14, color: Color(0xFF64748B)),
                  ),
                ],
              ),
              Row(
                children: [
                  OutlinedButton.icon(
                    icon: medService.isLoading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0D9488)),
                          )
                        : const Icon(Icons.sync_rounded, size: 18, color: Color(0xFF0D9488)),
                    label: const Text('Sync Backend', style: TextStyle(color: Color(0xFF0D9488))),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      side: const BorderSide(color: Color(0xFF0D9488)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: medService.isLoading
                        ? null
                        : () async {
                            final ok = await medService.fetchMedicines();
                            if (!context.mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  ok
                                      ? 'Synchronized with PostgreSQL database (localhost:5000)'
                                      : 'Sync failed: Cannot connect to localhost:5000',
                                ),
                                backgroundColor: ok ? const Color(0xFF0D9488) : const Color(0xFFDC2626),
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                  ),
                  const SizedBox(width: 12),
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
            ],
          ),
          const SizedBox(height: 16),

          // Disconnection or Error Notification Banner
          if (!medService.isConnectedToBackend)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFFECACA)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.cloud_off_rounded, color: Color(0xFFDC2626), size: 20),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Backend Server Disconnected — Could not reach http://localhost:5000. Operating in offline cached mode.',
                      style: TextStyle(color: Color(0xFF991B1B), fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ),
                  TextButton.icon(
                    icon: const Icon(Icons.refresh_rounded, size: 16, color: Color(0xFFDC2626)),
                    label: const Text('Retry Connection', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.bold)),
                    onPressed: () => medService.fetchMedicines(),
                  ),
                ],
              ),
            ),

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
                            onRefill: () async {
                              final ok = await medService.refillMedicine(medicine.id);
                              if (!context.mounted) return;
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    ok
                                        ? 'Refilled ${medicine.name} (+30 units in database)!'
                                        : 'Failed to refill stock: check backend connection.',
                                  ),
                                  backgroundColor: ok ? const Color(0xFF0D9488) : const Color(0xFFDC2626),
                                  behavior: SnackBarBehavior.floating,
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
