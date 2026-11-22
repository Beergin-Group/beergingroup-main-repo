import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/medicine.dart';
import '../models/schedule.dart';
import 'api_service.dart';

class MedicineService extends ChangeNotifier {
  List<Medicine> _medicines = [];
  List<Schedule> _schedules = [];
  bool _isLoading = false;
  String _searchQuery = '';
  String _selectedForm = 'All';

  List<Medicine> get medicines => _medicines;
  List<Schedule> get schedules => _schedules;
  bool get isLoading => _isLoading;
  String get searchQuery => _searchQuery;
  String get selectedForm => _selectedForm;

  List<Medicine> get filteredMedicines {
    return _medicines.where((med) {
      final matchesSearch = med.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          med.dosage.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesForm = _selectedForm == 'All' || med.form.toLowerCase() == _selectedForm.toLowerCase();
      return matchesSearch && matchesForm;
    }).toList();
  }

  // Dashboard Metrics
  int get totalMedicines => _medicines.length;
  int get pendingDoses => _schedules.where((s) => s.status == 'pending').length;
  int get takenDoses => _schedules.where((s) => s.status == 'taken').length;
  int get skippedDoses => _schedules.where((s) => s.status == 'skipped').length;
  int get lowStockCount => _medicines.where((m) => m.isLowStock).length;

  double get adherenceRate {
    final total = takenDoses + skippedDoses;
    if (total == 0) return 100.0;
    return double.parse(((takenDoses / total) * 100).toStringAsFixed(1));
  }

  MedicineService() {
    _seedDefaultData();
    fetchMedicines();
  }

  void _seedDefaultData() {
    _medicines = [
      const Medicine(
        id: 1,
        name: 'Amoxicillin Trihydrate',
        dosage: '500mg',
        form: 'Capsule',
        colorTag: '#0D9488',
        instructions: 'Take 1 capsule after meals with a full glass of water',
        stockCount: 18,
        lowStockThreshold: 6,
      ),
      const Medicine(
        id: 2,
        name: 'Metformin HCl',
        dosage: '850mg',
        form: 'Tablet',
        colorTag: '#0284C7',
        instructions: 'Take with evening meal to control blood glucose',
        stockCount: 4, // Low stock trigger
        lowStockThreshold: 5,
      ),
      const Medicine(
        id: 3,
        name: 'Lisinopril',
        dosage: '10mg',
        form: 'Tablet',
        colorTag: '#10B981',
        instructions: 'Take every morning at 08:00 AM for hypertension',
        stockCount: 26,
        lowStockThreshold: 7,
      ),
      const Medicine(
        id: 4,
        name: 'Ventolin Inhaler',
        dosage: '100mcg',
        form: 'Inhaler',
        colorTag: '#8B5CF6',
        instructions: '2 puffs as needed for bronchospasm relief',
        stockCount: 2, // Low stock trigger
        lowStockThreshold: 3,
        isPrn: true,
      ),
      const Medicine(
        id: 5,
        name: 'Paracetamol',
        dosage: '500mg',
        form: 'Tablet',
        colorTag: '#F59E0B',
        instructions: 'Take every 4-6 hours for fever or mild pain',
        stockCount: 20,
        lowStockThreshold: 5,
        isPrn: true,
      ),
    ];

    _schedules = [
      const Schedule(
        id: 101,
        medicineId: 1,
        medicineName: 'Amoxicillin Trihydrate',
        dosage: '500mg',
        doseTime: '08:00 AM',
        status: 'taken',
      ),
      const Schedule(
        id: 102,
        medicineId: 3,
        medicineName: 'Lisinopril',
        dosage: '10mg',
        doseTime: '08:00 AM',
        status: 'taken',
      ),
      const Schedule(
        id: 103,
        medicineId: 1,
        medicineName: 'Amoxicillin Trihydrate',
        dosage: '500mg',
        doseTime: '02:00 PM',
        status: 'pending',
      ),
      const Schedule(
        id: 104,
        medicineId: 2,
        medicineName: 'Metformin HCl',
        dosage: '850mg',
        doseTime: '07:00 PM',
        status: 'pending',
      ),
      const Schedule(
        id: 105,
        medicineId: 1,
        medicineName: 'Amoxicillin Trihydrate',
        dosage: '500mg',
        doseTime: '09:00 PM',
        status: 'pending',
      ),
    ];
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setSelectedForm(String form) {
    _selectedForm = form;
    notifyListeners();
  }

  Future<void> fetchMedicines() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http
          .get(
            Uri.parse('${ApiService.baseUrl}/medicines'),
            headers: ApiService.defaultHeaders,
          )
          .timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        _medicines = data.map((json) => Medicine.fromJson(json)).toList();
      }
    } catch (_) {
      // Retain offline default seed
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> addMedicine(Medicine medicine) async {
    final newId = DateTime.now().millisecondsSinceEpoch % 10000;
    final createdMed = medicine.copyWith(id: newId);
    _medicines.insert(0, createdMed);
    notifyListeners();

    try {
      await http.post(
        Uri.parse('${ApiService.baseUrl}/medicines'),
        headers: ApiService.defaultHeaders,
        body: jsonEncode(createdMed.toJson()),
      );
    } catch (_) {}
  }

  Future<void> updateMedicine(Medicine updated) async {
    final index = _medicines.indexWhere((m) => m.id == updated.id);
    if (index != -1) {
      _medicines[index] = updated;
      notifyListeners();

      try {
        await http.put(
          Uri.parse('${ApiService.baseUrl}/medicines/${updated.id}'),
          headers: ApiService.defaultHeaders,
          body: jsonEncode(updated.toJson()),
        );
      } catch (_) {}
    }
  }

  Future<void> deleteMedicine(int id) async {
    _medicines.removeWhere((m) => m.id == id);
    _schedules.removeWhere((s) => s.medicineId == id);
    notifyListeners();

    try {
      await http.delete(
        Uri.parse('${ApiService.baseUrl}/medicines/$id'),
        headers: ApiService.defaultHeaders,
      );
    } catch (_) {}
  }

  Future<void> refillMedicine(int id, {int amount = 30}) async {
    final index = _medicines.indexWhere((m) => m.id == id);
    if (index != -1) {
      final current = _medicines[index];
      _medicines[index] = current.copyWith(stockCount: current.stockCount + amount);
      notifyListeners();

      try {
        await http.post(
          Uri.parse('${ApiService.baseUrl}/medicines/$id/refill'),
          headers: ApiService.defaultHeaders,
          body: jsonEncode({'amount': amount}),
        );
      } catch (_) {}
    }
  }

  void markDoseStatus(int scheduleId, String status) {
    final index = _schedules.indexWhere((s) => s.id == scheduleId);
    if (index != -1) {
      final current = _schedules[index];
      _schedules[index] = current.copyWith(status: status);
      // Deduct stock if taken
      if (status == 'taken') {
        final medIdx = _medicines.indexWhere((m) => m.id == current.medicineId);
        if (medIdx != -1 && _medicines[medIdx].stockCount > 0) {
          _medicines[medIdx] = _medicines[medIdx].copyWith(
            stockCount: _medicines[medIdx].stockCount - 1,
          );
        }
      }
      notifyListeners();
    }
  }
}
