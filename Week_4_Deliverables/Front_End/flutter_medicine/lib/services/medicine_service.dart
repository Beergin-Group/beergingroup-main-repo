import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/medicine.dart';

class MedicineService {
  static const String baseUrl = 'http://localhost:5000/api/medicines';

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('mediremind_auth_token');
  }

  static Future<Map<String, String>> _headers() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// Fetch all medicines for user (with optional dependent filter)
  static Future<List<Medicine>> getMedicines({int? dependentId}) async {
    try {
      final headers = await _headers();
      final uri = Uri.parse(baseUrl).replace(queryParameters: {
        if (dependentId != null) 'dependent_id': dependentId.toString(),
      });

      final response = await http.get(uri, headers: headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final list = data['data'] as List? ?? [];
        return list.map((e) => Medicine.fromJson(e)).toList();
      }
      return [];
    } catch (e) {
      // Fallback demo items if backend is offline
      return [
        Medicine(
          id: 1,
          userId: 1,
          name: 'Metformin HCl',
          dosage: '500 mg',
          form: 'tablet',
          instructions: 'Take with breakfast and dinner to lower blood sugar',
          stockCount: 42,
          lowStockThreshold: 10,
          color: '#0d9488',
          isLowStock: false,
        ),
        Medicine(
          id: 2,
          userId: 1,
          name: 'Lisinopril',
          dosage: '10 mg',
          form: 'tablet',
          instructions: 'Take 1 tablet every morning with full glass of water',
          stockCount: 4,
          lowStockThreshold: 7,
          color: '#0284c7',
          isLowStock: true,
        ),
        Medicine(
          id: 3,
          userId: 1,
          name: 'Atorvastatin',
          dosage: '20 mg',
          form: 'tablet',
          instructions: 'Take at bedtime for cholesterol control',
          stockCount: 28,
          lowStockThreshold: 5,
          color: '#8b5cf6',
          isLowStock: false,
        ),
        Medicine(
          id: 4,
          userId: 1,
          name: 'Vitamin D3',
          dosage: '1000 IU',
          form: 'capsule',
          instructions: 'Take once daily with food',
          stockCount: 60,
          lowStockThreshold: 10,
          color: '#f59e0b',
          isLowStock: false,
        )
      ];
    }
  }

  /// Create new medicine
  static Future<Map<String, dynamic>> createMedicine(Map<String, dynamic> payload) async {
    try {
      final headers = await _headers();
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: headers,
        body: jsonEncode(payload),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Network error creating medicine.'};
    }
  }

  /// Update medicine
  static Future<Map<String, dynamic>> updateMedicine(int id, Map<String, dynamic> payload) async {
    try {
      final headers = await _headers();
      final response = await http.put(
        Uri.parse('$baseUrl/$id'),
        headers: headers,
        body: jsonEncode(payload),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Network error updating medicine.'};
    }
  }

  /// Delete medicine
  static Future<bool> deleteMedicine(int id) async {
    try {
      final headers = await _headers();
      final response = await http.delete(
        Uri.parse('$baseUrl/$id'),
        headers: headers,
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Refill stock
  static Future<Map<String, dynamic>> refillStock(int id, int count) async {
    try {
      final headers = await _headers();
      final response = await http.post(
        Uri.parse('$baseUrl/$id/refill'),
        headers: headers,
        body: jsonEncode({'count': count}),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Network error refilling stock.'};
    }
  }
}
