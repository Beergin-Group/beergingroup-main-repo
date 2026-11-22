import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiService {
  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // Environment-aware Base URL targeting http://localhost:5000/api
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000/api';
    }
    try {
      if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
        return 'http://localhost:5000/api';
      }
      if (Platform.isAndroid) {
        // Standard Android emulator loopback or dev tunnel
        return 'http://10.0.2.2:5000/api';
      }
    } catch (_) {}
    return 'http://localhost:5000/api';
  }

  static String? authToken;

  static Map<String, String> get defaultHeaders {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (authToken != null && authToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $authToken';
    }
    return headers;
  }

  /// Pings http://localhost:5000/api/health to verify connectivity & DB driver status
  static Future<Map<String, dynamic>?> checkHealth() async {
    try {
      final res = await http
          .get(Uri.parse('$baseUrl/health'))
          .timeout(const Duration(seconds: 3));
      if (res.statusCode == 200) {
        return jsonDecode(res.body) as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('[ApiService] Health check failed: $e');
    }
    return null;
  }
}
