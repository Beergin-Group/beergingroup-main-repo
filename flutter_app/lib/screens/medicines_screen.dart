import 'package:flutter/material.dart';
import '../models/medicine.dart';
import '../services/api_service.dart';

class MedicinesScreen extends StatefulWidget {
  const MedicinesScreen({super.key});

  @override
  State<MedicinesScreen> createState() => _MedicinesScreenState();
}

class _MedicinesScreenState extends State<MedicinesScreen> {
  bool _isLoading = true;
  List<Medicine> _medicines = [];

  @override
  void initState() {
    super.initState();
    _fetchMedicines();
  }

  Future<void> _fetchMedicines() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.getMedicines();
      if (res['success'] == true) {
        final list = (res['data'] as List?)?.map((e) => Medicine.fromJson(e)).toList() ?? [];
        setState(() {
          _medicines = list;
        });
      }
    } catch (e) {
      debugPrint('Medicines load error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Prescriptions & Medicines', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _medicines.length,
              itemBuilder: (context, index) {
                final med = _medicines[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(med.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            Chip(
                              label: Text('${med.stockCount} units'),
                              backgroundColor: med.isLowStock ? Colors.red.shade100 : Colors.teal.shade50,
                            ),
                          ],
                        ),
                        Text('${med.dosage} • ${med.form.toUpperCase()}', style: const TextStyle(color: Color(0xFF0D9488), fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Text(med.instructions ?? 'Take as prescribed', style: const TextStyle(color: Colors.grey)),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
