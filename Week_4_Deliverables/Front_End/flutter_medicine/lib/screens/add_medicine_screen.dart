import 'package:flutter/material.dart';
import '../services/medicine_service.dart';

class AddMedicineScreen extends StatefulWidget {
  const AddMedicineScreen({super.key});

  @override
  State<AddMedicineScreen> createState() => _AddMedicineScreenState();
}

class _AddMedicineScreenState extends State<AddMedicineScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _dosageCtrl = TextEditingController(text: '500 mg');
  final _instructionsCtrl = TextEditingController();
  final _stockCtrl = TextEditingController(text: '30');
  final _thresholdCtrl = TextEditingController(text: '5');

  String _selectedForm = 'tablet';
  String _selectedColor = '#0D9488';
  bool _isLoading = false;

  final List<String> _forms = [
    'tablet',
    'capsule',
    'syrup',
    'injection',
    'drops',
    'inhaler',
    'other',
  ];

  final List<Map<String, dynamic>> _colorSwatches = [
    {'name': 'Teal', 'hex': '#0D9488'},
    {'name': 'Sky', 'hex': '#0284C7'},
    {'name': 'Purple', 'hex': '#8B5CF6'},
    {'name': 'Rose', 'hex': '#F43F5E'},
    {'name': 'Amber', 'hex': '#F59E0B'},
    {'name': 'Emerald', 'hex': '#10B981'},
  ];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _dosageCtrl.dispose();
    _instructionsCtrl.dispose();
    _stockCtrl.dispose();
    _thresholdCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final payload = {
      'name': _nameCtrl.text.trim(),
      'dosage': _dosageCtrl.text.trim(),
      'form': _selectedForm,
      'instructions': _instructionsCtrl.text.trim(),
      'stock_count': int.tryParse(_stockCtrl.text.trim()) ?? 30,
      'low_stock_threshold': int.tryParse(_thresholdCtrl.text.trim()) ?? 5,
      'color': _selectedColor,
    };

    final res = await MedicineService.createMedicine(payload);

    setState(() => _isLoading = false);

    if (!mounted) return;

    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF0D9488),
          content: Text('Medicine "${_nameCtrl.text.trim()}" added to inventory!'),
        ),
      );
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: Colors.red.shade700,
          content: Text(res['message'] ?? 'Failed to add medicine.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Add Prescription', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Medicine Name
              const Text('Medicine Name *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _nameCtrl,
                decoration: InputDecoration(
                  hintText: 'e.g. Amoxicillin, Metformin',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Medicine name is required.';
                  if (val.trim().length < 2) return 'Name must be at least 2 characters.';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Dosage & Form Row
              Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Dosage *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _dosageCtrl,
                          decoration: InputDecoration(
                            hintText: 'e.g. 500 mg, 10 ml',
                            filled: true,
                            fillColor: Colors.white,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) return 'Dosage is required.';
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 3,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Form', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _selectedForm,
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: Colors.white,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          items: _forms.map((f) {
                            return DropdownMenuItem(
                              value: f,
                              child: Text(f[0].toUpperCase() + f.substring(1)),
                            );
                          }).toList(),
                          onChanged: (val) => setState(() => _selectedForm = val ?? 'tablet'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Instructions
              const Text('Doctor Instructions / Notes', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _instructionsCtrl,
                maxLines: 2,
                decoration: InputDecoration(
                  hintText: 'e.g. Take with breakfast to prevent stomach upset',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 16),

              // Stock Count & Threshold Row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Stock Quantity', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _stockCtrl,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            suffixText: 'units',
                            filled: true,
                            fillColor: Colors.white,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
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
                        const Text('Low Alert Below', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _thresholdCtrl,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            suffixText: 'units',
                            filled: true,
                            fillColor: Colors.white,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Pill Tag Color Picker
              const Text('Visual Color Tag', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 10,
                children: _colorSwatches.map((item) {
                  final hex = item['hex'] as String;
                  final isSelected = _selectedColor == hex;
                  final colorVal = Color(int.parse('FF${hex.replaceAll('#', '')}', radix: 16));
                  return GestureDetector(
                    onTap: () => setState(() => _selectedColor = hex),
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: colorVal,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isSelected ? Colors.black : Colors.transparent,
                          width: 2.5,
                        ),
                      ),
                      child: isSelected
                          ? const Icon(Icons.check, size: 20, color: Colors.white)
                          : null,
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 28),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0D9488),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Save Prescription', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
