import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../lib/models/medicine.dart';
import '../lib/models/user.dart';
import '../lib/services/api_service.dart';

void main() {
  group('Phase 3.3 Verification Tests', () {
    test('1. Verify HTTP client target is http://localhost:5000/api', () {
      expect(ApiService.baseUrl, 'http://localhost:5000/api');
    });

    test('2. Verify JWT token persistence via SharedPreferences', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();

      const testToken = 'mock_jwt_token_for_phase_3_3_verification';
      const user = User(
        id: 1,
        name: 'Maria Elena Santos',
        email: 'patient@mediremind.com',
        role: 'patient',
      );

      await prefs.setString('auth_token', testToken);
      await prefs.setString('user_session', jsonEncode(user.toJson()));

      expect(prefs.getString('auth_token'), testToken);
      final restoredJson = jsonDecode(prefs.getString('user_session')!);
      final restoredUser = User.fromJson(restoredJson);
      expect(restoredUser.email, 'patient@mediremind.com');
      expect(restoredUser.role, 'patient');
    });

    test('3. Verify Medicine serialization matches PostgreSQL schema constraints', () {
      const med = Medicine(
        id: 42,
        name: 'Amoxicillin Trihydrate',
        dosage: '500mg',
        form: 'Capsule',
        colorTag: '#0D9488',
        instructions: 'Take 1 capsule after meals',
        stockCount: 20,
        lowStockThreshold: 5,
        isPrn: false,
      );

      final jsonMap = med.toJson();
      expect(jsonMap['name'], 'Amoxicillin Trihydrate');
      expect(jsonMap['dosage'], '500mg');
      expect(jsonMap['form'], 'capsule'); // Normalized lowercase for PostgreSQL CHECK constraint
      expect(jsonMap['color'], '#0D9488'); // Column name in PostgreSQL
      expect(jsonMap['stock_count'], 20);
      expect(jsonMap['low_stock_threshold'], 5);
      expect(jsonMap['shape'], 'round');
      expect(jsonMap['icon'], 'pill');

      // Test deserialization from backend JSON
      final backendJson = {
        'id': 105,
        'name': 'Metformin',
        'dosage': '500 mg',
        'form': 'tablet',
        'color': '#0284c7',
        'instructions': 'Take after meal',
        'stock_count': 30,
        'low_stock_threshold': 5,
        'is_prn': false
      };

      final parsed = Medicine.fromJson(backendJson);
      expect(parsed.id, 105);
      expect(parsed.name, 'Metformin');
      expect(parsed.form, 'Tablet');
      expect(parsed.colorTag, '#0284c7');
    });
  });
}
