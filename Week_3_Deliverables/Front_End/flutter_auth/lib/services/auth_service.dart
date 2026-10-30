import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String baseUrl = 'http://localhost:5000/api/auth';
  static const String _tokenKey = 'mediremind_auth_token';
  static const String _userKey = 'mediremind_user_data';

  /// Save JWT Token and User data to persistent storage
  static Future<void> saveSession(String token, Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user));
  }

  /// Get stored token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  /// Get stored user data
  static Future<Map<String, dynamic>?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      return jsonDecode(userJson) as Map<String, dynamic>;
    }
    return null;
  }

  /// Clear session on Logout
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  /// Login API Call
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final data = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['token'] != null) {
        await saveSession(data['token'], data['user']);
      }

      return data;
    } catch (e) {
      return {
        'success': false,
        'message': 'Cannot connect to MediRemind server at $baseUrl. Ensure backend is running.'
      };
    }
  }

  /// Register API Call
  static Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String role = 'patient',
    String phone = '',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'role': role,
          'phone': phone,
        }),
      );

      final data = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 201 && data['token'] != null) {
        await saveSession(data['token'], data['user']);
      }

      return data;
    } catch (e) {
      return {
        'success': false,
        'message': 'Cannot connect to MediRemind server at $baseUrl. Ensure backend is running.'
      };
    }
  }

  /// Fetch Me (Verify Session)
  static Future<Map<String, dynamic>> getMe() async {
    final token = await getToken();
    if (token == null) return {'success': false, 'message': 'No active session token.'};

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      return jsonDecode(response.body) as Map<String, dynamic>;
    } catch (e) {
      return {'success': false, 'message': 'Failed to verify session.'};
    }
  }
}
