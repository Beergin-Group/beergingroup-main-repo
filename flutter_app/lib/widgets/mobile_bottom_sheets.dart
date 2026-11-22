import 'package:flutter/material.dart';
import '../models/medicine.dart';

/// Touch-Friendly Mobile Bottom Sheets (Task 3.6 / Issue #45)
/// Converts dialogs to ergonomic smartphone bottom sheets with WCAG 48x48 touch targets.

Future<void> showMobileAddEditMedicineSheet({
  required BuildContext context,
  Medicine? initialMedicine,
  required Function(Medicine) onSave,
}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => _MobileAddEditSheetContent(
      initialMedicine: initialMedicine,
      onSave: onSave,
    ),
  );
}

class _MobileAddEditSheetContent extends StatefulWidget {
  final Medicine? initialMedicine;
  final Function(Medicine) onSave;

  const _MobileAddEditSheetContent({
    this.initialMedicine,
    required this.onSave,
  });

  @override
  State<_MobileAddEditSheetContent> createState() => _MobileAddEditSheetContentState();
}

class _MobileAddEditSheetContentState extends State<_MobileAddEditSheetContent> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _dosageController;
  late TextEditingController _instructionsController;
  late TextEditingController _stockController;
  late TextEditingController _thresholdController;

  late String _selectedForm;
  late String _selectedColor;
  late bool _isPrn;

  final List<String> _forms = ['Tablet', 'Capsule', 'Liquid', 'Inhaler', 'Drops', 'Powder'];
  final List<String> _colors = ['#0D9488', '#0284C7', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];

  @override
  void initState() {
    super.initState();
    final med = widget.initialMedicine;
    _nameController = TextEditingController(text: med?.name ?? '');
    _dosageController = TextEditingController(text: med?.dosage ?? '');
    _instructionsController = TextEditingController(text: med?.instructions ?? '');
    _stockController = TextEditingController(text: (med?.stockCount ?? 30).toString());
    _thresholdController = TextEditingController(text: (med?.lowStockThreshold ?? 5).toString());
    _selectedForm = med?.form ?? 'Tablet';
    _selectedColor = med?.colorTag ?? '#0D9488';
    _isPrn = med?.isPrn ?? false;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _dosageController.dispose();
    _instructionsController.dispose();
    _stockController.dispose();
    _thresholdController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState?.validate() ?? false) {
      final updated = Medicine(
        id: widget.initialMedicine?.id ?? 0,
        name: _nameController.text.trim(),
        dosage: _dosageController.text.trim(),
        form: _selectedForm,
        colorTag: _selectedColor,
        instructions: _instructionsController.text.trim(),
        stockCount: int.tryParse(_stockController.text.trim()) ?? 30,
        lowStockThreshold: int.tryParse(_thresholdController.text.trim()) ?? 5,
        isPrn: _isPrn,
      );
      widget.onSave(updated);
      Navigator.of(context).pop();
    }
  }

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
    final isEditing = widget.initialMedicine != null;
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 12,
        left: 20,
        right: 20,
        bottom: bottomInset + 20,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag Handle
              Center(
                child: Container(
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(
                    color: const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Title Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0D9488).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.medication_rounded, color: Color(0xFF0D9488), size: 22),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        isEditing ? 'Edit Prescription' : 'New Prescription',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Color(0xFF94A3B8)),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Name
              const Text('Medicine Name *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF334155))),
              const SizedBox(height: 6),
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  hintText: 'e.g. Amoxicillin',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                ),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter medication name' : null,
              ),
              const SizedBox(height: 14),

              // Dosage & Form (Row)
              Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Dosage *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF334155))),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _dosageController,
                          decoration: InputDecoration(
                            hintText: 'e.g. 500mg',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                          ),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter dosage' : null,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Form', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF334155))),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _selectedForm,
                          items: _forms
                              .map((f) => DropdownMenuItem(value: f, child: Text(f, style: const TextStyle(fontSize: 13))))
                              .toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedForm = val);
                          },
                          decoration: InputDecoration(
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Instructions
              const Text('Instructions', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF334155))),
              const SizedBox(height: 6),
              TextFormField(
                controller: _instructionsController,
                maxLines: 2,
                decoration: InputDecoration(
                  hintText: 'e.g. Take after meal',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
              const SizedBox(height: 14),

              // Stock Count & Low Stock Alert
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Stock Count', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF334155))),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _stockController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Low Stock Alert', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF334155))),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _thresholdController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // As-needed (PRN) Switch
              SwitchListTile(
                title: const Text('As-Needed (PRN)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                subtitle: const Text('No strict daily time required', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                value: _isPrn,
                activeColor: const Color(0xFF0D9488),
                contentPadding: EdgeInsets.zero,
                onChanged: (val) => setState(() => _isPrn = val),
              ),
              const SizedBox(height: 8),

              // Color Swatches
              const Text('Tag Color', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF334155))),
              const SizedBox(height: 8),
              Row(
                children: _colors.map((hex) {
                  final c = _parseColor(hex);
                  final isSelected = _selectedColor == hex;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedColor = hex),
                    child: Container(
                      margin: const EdgeInsets.only(right: 12),
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        color: c,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isSelected ? const Color(0xFF0F172A) : Colors.transparent,
                          width: 2.5,
                        ),
                      ),
                      child: isSelected
                          ? const Icon(Icons.check, size: 16, color: Colors.white)
                          : null,
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              // Touch-friendly Large Submit Button (min 48dp height for WCAG)
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.check_rounded, size: 20),
                  label: Text(
                    isEditing ? 'Save Changes' : 'Create Prescription',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0D9488),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: _submit,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

Future<void> showMobileDeleteConfirmationSheet({
  required BuildContext context,
  required String medicineName,
  required VoidCallback onConfirm,
}) {
  return showModalBottomSheet(
    context: context,
    backgroundColor: Colors.transparent,
    builder: (ctx) => Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 44,
            height: 5,
            decoration: BoxDecoration(
              color: const Color(0xFFCBD5E1),
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Color(0xFFFEE2E2),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.delete_outline_rounded, size: 32, color: Color(0xFFDC2626)),
          ),
          const SizedBox(height: 14),
          Text(
            'Delete $medicineName?',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          const Text(
            'This prescription and all dependent schedule reminders will be permanently removed.',
            style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      side: const BorderSide(color: Color(0xFFCBD5E1)),
                    ),
                    onPressed: () => Navigator.of(ctx).pop(),
                    child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B))),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFDC2626),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () {
                      Navigator.of(ctx).pop();
                      onConfirm();
                    },
                    child: const Text('Delete'),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  );
}
