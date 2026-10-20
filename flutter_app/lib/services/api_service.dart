import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Defaults to local development server localhost:5000 (10.0.2.2 for Android emulator)
  static const String baseUrl = 'http://localhost:5000/api';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  static Future<Map<String, String>> _headers() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode == 200 && data['token'] != null) {
      await saveToken(data['token']);
    }
    return data;
  }

  static Future<Map<String, dynamic>> getTodayDoses({int? dependentId}) async {
    final q = dependentId != null ? '?dependent_id=$dependentId' : '';
    final res = await http.get(Uri.parse('$baseUrl/dose-logs/today$q'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> recordDose({
    int? scheduleId,
    required int medicineId,
    required String scheduledTime,
    required String status,
    int? dependentId,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/dose-logs'),
      headers: await _headers(),
      body: jsonEncode({
        'schedule_id': scheduleId,
        'medicine_id': medicineId,
        'scheduled_time': scheduledTime,
        'status': status,
        'dependent_id': dependentId,
      }),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> snoozeDose({
    int? scheduleId,
    required int medicineId,
    required String scheduledTime,
    int minutes = 15,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/dose-logs/snooze'),
      headers: await _headers(),
      body: jsonEncode({
        'schedule_id': scheduleId,
        'medicine_id': medicineId,
        'scheduled_time': scheduledTime,
        'minutes': minutes,
      }),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> getMedicines({int? dependentId}) async {
    final q = dependentId != null ? '?dependent_id=$dependentId' : '';
    final res = await http.get(Uri.parse('$baseUrl/medicines$q'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> getAdherenceSummary({int? dependentId}) async {
    final q = dependentId != null ? '?dependent_id=$dependentId' : '';
    final res = await http.get(Uri.parse('$baseUrl/adherence/summary$q'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> getDependents() async {
    final res = await http.get(Uri.parse('$baseUrl/caregiver/dependents'), headers: await _headers());
    return jsonDecode(res.body);
  }
}
