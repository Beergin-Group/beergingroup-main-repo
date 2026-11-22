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
  String? _lastError;
  bool _isConnectedToBackend = false;
  String _searchQuery = '';
  String _selectedForm = 'All';

  List<Medicine> get medicines => _medicines;
  List<Schedule> get schedules => _schedules;
  bool get isLoading => _isLoading;
  String? get lastError => _lastError;
  bool get isConnectedToBackend => _isConnectedToBackend;
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
        name: 'Metformin',
        dosage: '500 mg',
        form: 'Tablet',
        colorTag: '#0284c7',
        instructions: 'Take 1 tablet after meals with water',
        stockCount: 36,
        lowStockThreshold: 10,
      ),
      const Medicine(
        id: 2,
        name: 'Lisinopril',
        dosage: '10 mg',
        form: 'Tablet',
        colorTag: '#10b981',
        instructions: 'Take every morning at 08:00 AM for blood pressure',
        stockCount: 22,
        lowStockThreshold: 7,
      ),
      const Medicine(
        id: 3,
        name: 'Atorvastatin',
        dosage: '20 mg',
        form: 'Tablet',
        colorTag: '#8b5cf6',
        instructions: 'Take with evening meal to manage cholesterol',
        stockCount: 14,
        lowStockThreshold: 5,
      ),
      const Medicine(
        id: 4,
        name: 'Vitamin D3',
        dosage: '1000 IU',
        form: 'Capsule',
        colorTag: '#f59e0b',
        instructions: 'Take once daily with breakfast for bone health',
        stockCount: 48,
        lowStockThreshold: 10,
      ),
    ];

    _schedules = [
      const Schedule(
        id: 101,
        medicineId: 1,
        medicineName: 'Metformin',
        dosage: '500 mg',
        doseTime: '08:00 AM',
        status: 'taken',
      ),
      const Schedule(
        id: 102,
        medicineId: 2,
        medicineName: 'Lisinopril',
        dosage: '10 mg',
        doseTime: '08:00 AM',
        status: 'taken',
      ),
      const Schedule(
        id: 103,
        medicineId: 1,
        medicineName: 'Metformin',
        dosage: '500 mg',
        doseTime: '02:00 PM',
        status: 'pending',
      ),
      const Schedule(
        id: 104,
        medicineId: 3,
        medicineName: 'Atorvastatin',
        dosage: '20 mg',
        doseTime: '07:00 PM',
        status: 'pending',
      ),
      const Schedule(
        id: 105,
        medicineId: 4,
        medicineName: 'Vitamin D3',
        dosage: '1000 IU',
        doseTime: '09:00 AM',
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

  /// [READ] Fetches all medicines directly from GET /api/medicines
  Future<bool> fetchMedicines() async {
    _isLoading = true;
    _lastError = null;
    notifyListeners();

    try {
      final response = await http
          .get(
            Uri.parse('${ApiService.baseUrl}/medicines'),
            headers: ApiService.defaultHeaders,
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final dynamic decoded = jsonDecode(response.body);
        final List<dynamic> list = (decoded is Map && decoded['data'] is List)
            ? decoded['data']
            : (decoded is List ? decoded : []);

        _medicines = list
            .map((json) => Medicine.fromJson(json as Map<String, dynamic>))
            .toList();
        _isConnectedToBackend = true;
        _lastError = null;
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _lastError = 'Backend returned HTTP ${response.statusCode} while loading medicines.';
      }
    } catch (e) {
      _isConnectedToBackend = false;
      _lastError = 'Network error: Cannot reach http://localhost:5000/api/medicines.';
      debugPrint('[MedicineService] fetchMedicines error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  /// [CREATE] Inserts a new prescription via POST /api/medicines and saves to PostgreSQL.
  Future<bool> addMedicine(Medicine medicine) async {
    _isLoading = true;
    _lastError = null;
    notifyListeners();

    try {
      final payload = medicine.toJson(includeId: false);
      final response = await http
          .post(
            Uri.parse('${ApiService.baseUrl}/medicines'),
            headers: ApiService.defaultHeaders,
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 201 || response.statusCode == 200) {
        final decoded = jsonDecode(response.body) as Map<String, dynamic>;
        final rawMed = decoded['data'] != null
            ? decoded['data'] as Map<String, dynamic>
            : payload;
        final persisted = Medicine.fromJson(rawMed);

        _medicines.insert(0, persisted);
        _isConnectedToBackend = true;
        _lastError = null;
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        final decoded = jsonDecode(response.body);
        _lastError = decoded['message'] ?? 'Failed to create prescription (HTTP ${response.statusCode}).';
      }
    } catch (e) {
      _isConnectedToBackend = false;
      _lastError = 'Network error: Cannot connect to localhost:5000 to save prescription.';
      debugPrint('[MedicineService] addMedicine error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  /// [UPDATE] Modifies prescription details via PUT /api/medicines/:id in PostgreSQL.
  Future<bool> updateMedicine(Medicine updated) async {
    _isLoading = true;
    _lastError = null;
    notifyListeners();

    try {
      final payload = updated.toJson(includeId: false);
      final response = await http
          .put(
            Uri.parse('${ApiService.baseUrl}/medicines/${updated.id}'),
            headers: ApiService.defaultHeaders,
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body) as Map<String, dynamic>;
        final rawMed = decoded['data'] != null
            ? decoded['data'] as Map<String, dynamic>
            : payload;
        final persisted = Medicine.fromJson(rawMed);

        final index = _medicines.indexWhere((m) => m.id == updated.id);
        if (index != -1) {
          _medicines[index] = persisted;
        }

        _isConnectedToBackend = true;
        _lastError = null;
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        final decoded = jsonDecode(response.body);
        _lastError = decoded['message'] ?? 'Failed to update prescription (HTTP ${response.statusCode}).';
      }
    } catch (e) {
      _isConnectedToBackend = false;
      _lastError = 'Network error: Cannot connect to localhost:5000 to update prescription.';
      debugPrint('[MedicineService] updateMedicine error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  /// [DELETE] Removes a prescription via DELETE /api/medicines/:id in PostgreSQL.
  Future<bool> deleteMedicine(int id) async {
    _isLoading = true;
    _lastError = null;
    notifyListeners();

    try {
      final response = await http
          .delete(
            Uri.parse('${ApiService.baseUrl}/medicines/$id'),
            headers: ApiService.defaultHeaders,
          )
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        _medicines.removeWhere((m) => m.id == id);
        _schedules.removeWhere((s) => s.medicineId == id);
        _isConnectedToBackend = true;
        _lastError = null;
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        final decoded = jsonDecode(response.body);
        _lastError = decoded['message'] ?? 'Failed to delete prescription (HTTP ${response.statusCode}).';
      }
    } catch (e) {
      _isConnectedToBackend = false;
      _lastError = 'Network error: Cannot connect to localhost:5000 to delete prescription.';
      debugPrint('[MedicineService] deleteMedicine error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  /// [REFILL] Increments prescription stock via POST /api/medicines/:id/refill.
  Future<bool> refillMedicine(int id, {int amount = 30}) async {
    try {
      final response = await http
          .post(
            Uri.parse('${ApiService.baseUrl}/medicines/$id/refill'),
            headers: ApiService.defaultHeaders,
            body: jsonEncode({'amount': amount}),
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final index = _medicines.indexWhere((m) => m.id == id);
        if (index != -1) {
          final current = _medicines[index];
          _medicines[index] = current.copyWith(stockCount: current.stockCount + amount);
        }
        _isConnectedToBackend = true;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('[MedicineService] refillMedicine error: $e');
    }
    return false;
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
