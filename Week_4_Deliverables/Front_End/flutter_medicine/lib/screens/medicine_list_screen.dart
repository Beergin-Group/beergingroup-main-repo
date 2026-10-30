import 'package:flutter/material.dart';
import '../models/medicine.dart';
import '../services/medicine_service.dart';
import '../widgets/medicine_card.dart';
import '../widgets/delete_confirmation_dialog.dart';
import 'add_medicine_screen.dart';
import 'edit_medicine_screen.dart';

class MedicineListScreen extends StatefulWidget {
  const MedicineListScreen({super.key});

  @override
  State<MedicineListScreen> createState() => _MedicineListScreenState();
}

class _MedicineListScreenState extends State<MedicineListScreen> {
  bool _isLoading = true;
  List<Medicine> _allMedicines = [];
  String _searchQuery = '';
  String _formFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadMedicines();
  }

  Future<void> _loadMedicines() async {
    setState(() => _isLoading = true);
    final list = await MedicineService.getMedicines();
    setState(() {
      _allMedicines = list;
      _isLoading = false;
    });
  }

  List<Medicine> get _filteredMedicines {
    return _allMedicines.where((med) {
      final matchesSearch = med.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          med.dosage.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesForm = _formFilter == 'all' || med.form.toLowerCase() == _formFilter.toLowerCase();
      return matchesSearch && matchesForm;
    }).toList();
  }

  Future<void> _refillStock(Medicine med) async {
    final res = await MedicineService.refillStock(med.id, 30);
    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF0D9488),
          content: Text('Refilled +30 units for ${med.name}. Stock: ${(med.stockCount + 30)}'),
        ),
      );
      _loadMedicines();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to refill stock.')),
      );
    }
  }

  Future<void> _deleteMedicine(Medicine med) async {
    showDialog(
      context: context,
      builder: (ctx) => DeleteConfirmationDialog(
        medicineName: med.name,
        onConfirm: () async {
          final success = await MedicineService.deleteMedicine(med.id);
          if (success) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: const Color(0xFF0F172A),
                content: Text('"${med.name}" was removed.'),
              ),
            );
            _loadMedicines();
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Failed to delete medicine.')),
            );
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final list = _filteredMedicines;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Prescriptions & Medicines', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
            onPressed: _loadMedicines,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF0D9488),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Medicine', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: () async {
          final added = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AddMedicineScreen()),
          );
          if (added == true) _loadMedicines();
        },
      ),
      body: Column(
        children: [
          // Search & Filter Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: Colors.white,
            child: Column(
              children: [
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search medicines (e.g. Metformin)...',
                    prefixIcon: const Icon(Icons.search, size: 20, color: Color(0xFF94A3B8)),
                    filled: true,
                    fillColor: const Color(0xFFF1F5F9),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      'all',
                      'tablet',
                      'capsule',
                      'syrup',
                      'injection',
                      'inhaler',
                    ].map((f) {
                      final isSelected = _formFilter == f;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text(f == 'all' ? 'All Forms' : f[0].toUpperCase() + f.substring(1)),
                          selected: isSelected,
                          selectedColor: const Color(0xFFCCFBF1),
                          checkmarkColor: const Color(0xFF0D9488),
                          labelStyle: TextStyle(
                            color: isSelected ? const Color(0xFF0F766E) : const Color(0xFF475569),
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            fontSize: 12,
                          ),
                          onSelected: (val) => setState(() => _formFilter = f),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          // Main Medicine List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)))
                : list.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('💊', style: TextStyle(fontSize: 48)),
                            const SizedBox(height: 12),
                            const Text('No medicines found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Text(
                              _searchQuery.isNotEmpty ? 'Try clearing your search query' : 'Tap "+ Add Medicine" to register your first prescription',
                              style: const TextStyle(color: Colors.grey, fontSize: 13),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadMedicines,
                        color: const Color(0xFF0D9488),
                        child: ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                          itemCount: list.length,
                          itemBuilder: (context, index) {
                            final med = list[index];
                            return MedicineCard(
                              medicine: med,
                              onEdit: () async {
                                final updated = await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => EditMedicineScreen(medicine: med),
                                  ),
                                );
                                if (updated == true) _loadMedicines();
                              },
                              onDelete: () => _deleteMedicine(med),
                              onRefill: () => _refillStock(med),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
