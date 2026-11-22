import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;
  bool _isBackendConnected = false;

  User? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isBackendConnected => _isBackendConnected;

  AuthService() {
    _loadSession();
  }

  /// Restores persisted JWT token from native Windows desktop storage (shared_preferences)
  /// and validates profile against GET /api/auth/me.
  Future<void> _loadSession() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      final userStr = prefs.getString('user_session');

      if (token != null && token.isNotEmpty) {
        ApiService.authToken = token;

        // Verify session and fetch fresh profile from GET /api/auth/me
        final success = await fetchProfile();
        if (!success && userStr != null) {
          // If backend was unreachable temporarily, restore cached session
          try {
            _currentUser = User.fromJson(jsonDecode(userStr));
          } catch (_) {}
        }
      }
    } catch (e) {
      debugPrint('[AuthService] Error reading shared preferences: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Authenticates against POST /api/auth/login and stores JWT in SharedPreferences.
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await http
          .post(
            Uri.parse('${ApiService.baseUrl}/auth/login'),
            headers: ApiService.defaultHeaders,
            body: jsonEncode({'email': email, 'password': password}),
          )
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final token = data['token'] as String?;
        final user = User.fromJson(data['user'] as Map<String, dynamic>);

        _currentUser = user;
        ApiService.authToken = token;
        _isBackendConnected = true;

        // Persist session to Windows native storage
        final prefs = await SharedPreferences.getInstance();
        if (token != null) {
          await prefs.setString('auth_token', token);
        }
        await prefs.setString('user_session', jsonEncode(user.toJson()));

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        final error = jsonDecode(response.body);
        _errorMessage = error['message'] ?? 'Invalid email or password.';
      }
    } catch (e) {
      _errorMessage = 'Network Error: Cannot connect to http://localhost:5000. Ensure the Node.js backend is running.';
      _isBackendConnected = false;
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  /// Verifies active token and retrieves user profile via GET /api/auth/me.
  Future<bool> fetchProfile() async {
    if (ApiService.authToken == null) return false;

    try {
      final response = await http
          .get(
            Uri.parse('${ApiService.baseUrl}/auth/me'),
            headers: ApiService.defaultHeaders,
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final user = User.fromJson(data['user'] as Map<String, dynamic>);
        _currentUser = user;
        _isBackendConnected = true;

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_session', jsonEncode(user.toJson()));

        notifyListeners();
        return true;
      } else if (response.statusCode == 401) {
        // Token expired or invalid
        await logout();
        return false;
      }
    } catch (e) {
      debugPrint('[AuthService] fetchProfile error: $e');
      _isBackendConnected = false;
    }
    return false;
  }

  /// Clears session credentials and resets desktop SharedPreferences storage.
  Future<void> logout() async {
    _currentUser = null;
    ApiService.authToken = null;
    _errorMessage = null;

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('user_session');
    } catch (e) {
      debugPrint('[AuthService] Error clearing preferences: $e');
    }

    notifyListeners();
  }

  void switchRole(String newRole) {
    if (_currentUser != null) {
      _currentUser = User(
        id: _currentUser!.id,
        name: _currentUser!.name,
        email: _currentUser!.email,
        role: newRole,
      );
      notifyListeners();
    }
  }
}
