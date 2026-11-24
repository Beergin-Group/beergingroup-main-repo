import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform, SocketException;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

/// Custom Exception for Dev Tunnel & API network failures
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final bool isTunnelUnreachable;

  ApiException(this.message, {this.statusCode, this.isTunnelUnreachable = false});

  @override
  String toString() => 'ApiException: $message (statusCode: $statusCode, tunnelUnreachable: $isTunnelUnreachable)';
}

/// Centralized API & Dev Tunnel Configuration Service (Task 3.9 / Issue #48)
/// Automatically resolves baseUrl for desktop (localhost) and mobile (Dev Tunnel HTTPS),
/// centralizes authentication headers, and provides robust global error handling.
class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // Standard development endpoints
  static const String defaultLocalhostUrl = 'http://localhost:5000/api';
  static const String defaultAndroidEmulatorUrl = 'http://10.0.2.2:5000/api';
  
  // Default fallback Dev Tunnel pattern (VS Code Port 5000 Public Forward)
  static const String defaultDevTunnelUrl = 'https://mediremind-tunnel.devtunnels.ms/api';

  static String? _customBaseUrl;
  static String? authToken;
  static const Duration requestTimeout = Duration(seconds: 8);

  /// Initializes persistent API configuration from SharedPreferences
  static Future<void> initialize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _customBaseUrl = prefs.getString('custom_api_base_url');
      authToken ??= prefs.getString('auth_token');
    } catch (e) {
      debugPrint('[ApiService] Init warning: $e');
    }
  }

  /// Environment-aware Base URL resolution
  /// 1. If user set a custom Dev Tunnel or IP URL, use it.
  /// 2. Windows / macOS / Linux / Web ➔ http://localhost:5000/api
  /// 3. Android physical phone or emulator ➔ VS Code Dev Tunnel HTTPS URL
  static String get baseUrl {
    if (_customBaseUrl != null && _customBaseUrl!.trim().isNotEmpty) {
      return _customBaseUrl!.trim();
    }

    if (kIsWeb) {
      return defaultLocalhostUrl;
    }

    try {
      if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
        return defaultLocalhostUrl;
      }
      if (Platform.isAndroid) {
        // Android routes through the secure HTTPS Dev Tunnel configured in Task 3.8
        return defaultDevTunnelUrl;
      }
    } catch (_) {}

    return defaultLocalhostUrl;
  }

  /// Sets and persists custom Dev Tunnel URL (e.g. https://<tunnel-id>-5000.asse.devtunnels.ms/api)
  static Future<void> setCustomBaseUrl(String? url) async {
    _customBaseUrl = url?.trim();
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
        await prefs.setString('custom_api_base_url', _customBaseUrl!);
      } else {
        await prefs.remove('custom_api_base_url');
      }
    } catch (_) {}
  }

  /// Resets to default environment resolution
  static Future<void> resetBaseUrl() async {
    await setCustomBaseUrl(null);
  }

  /// Centralized HTTP Headers with Bearer token guard
  static Map<String, String> get defaultHeaders {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Platform': kIsWeb ? 'web' : (Platform.isAndroid ? 'android' : 'desktop'),
    };
    if (authToken != null && authToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $authToken';
    }
    return headers;
  }

  // ---------------------------------------------------------------------------
  // Centralized HTTP Methods with Global Error & Timeout Handling
  // ---------------------------------------------------------------------------

  /// Centralized GET request
  static Future<dynamic> get(String endpoint) async {
    final uri = _resolveUri(endpoint);
    try {
      final response = await http
          .get(uri, headers: defaultHeaders)
          .timeout(requestTimeout);
      return _processResponse(response);
    } on TimeoutException {
      throw ApiException(
        'Connection timed out while reaching $uri. Verify that port 5000 has Public Visibility in VS Code.',
        isTunnelUnreachable: true,
      );
    } on SocketException catch (e) {
      throw ApiException(
        'Network unreachable ($uri): ${e.message}. Ensure internet connection and active Dev Tunnel.',
        isTunnelUnreachable: true,
      );
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected network error: $e');
    }
  }

  /// Centralized POST request
  static Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final uri = _resolveUri(endpoint);
    try {
      final response = await http
          .post(uri, headers: defaultHeaders, body: jsonEncode(body))
          .timeout(requestTimeout);
      return _processResponse(response);
    } on TimeoutException {
      throw ApiException(
        'Request timed out connecting to Dev Tunnel at $uri.',
        isTunnelUnreachable: true,
      );
    } on SocketException catch (e) {
      throw ApiException(
        'Unable to connect to $uri: ${e.message}',
        isTunnelUnreachable: true,
      );
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected network error: $e');
    }
  }

  /// Centralized PUT request
  static Future<dynamic> put(String endpoint, Map<String, dynamic> body) async {
    final uri = _resolveUri(endpoint);
    try {
      final response = await http
          .put(uri, headers: defaultHeaders, body: jsonEncode(body))
          .timeout(requestTimeout);
      return _processResponse(response);
    } on TimeoutException {
      throw ApiException('Request timed out reaching Dev Tunnel ($uri).', isTunnelUnreachable: true);
    } on SocketException catch (e) {
      throw ApiException('Socket error connecting to $uri: ${e.message}', isTunnelUnreachable: true);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected network error: $e');
    }
  }

  /// Centralized DELETE request
  static Future<dynamic> delete(String endpoint) async {
    final uri = _resolveUri(endpoint);
    try {
      final response = await http
          .delete(uri, headers: defaultHeaders)
          .timeout(requestTimeout);
      return _processResponse(response);
    } on TimeoutException {
      throw ApiException('Request timed out reaching Dev Tunnel ($uri).', isTunnelUnreachable: true);
    } on SocketException catch (e) {
      throw ApiException('Socket error connecting to $uri: ${e.message}', isTunnelUnreachable: true);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected network error: $e');
    }
  }

  // ---------------------------------------------------------------------------
  // Connectivity & Health Diagnostics
  // ---------------------------------------------------------------------------

  /// Checks API health & measures ping latency in milliseconds
  static Future<Map<String, dynamic>> checkHealth() async {
    final stopwatch = Stopwatch()..start();
    try {
      final uri = _resolveUri('/health');
      final res = await http.get(uri, headers: defaultHeaders).timeout(const Duration(seconds: 4));
      stopwatch.stop();

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        return {
          'status': 'connected',
          'latency_ms': stopwatch.elapsedMilliseconds,
          'server_data': data,
          'endpoint': baseUrl,
        };
      } else {
        return {
          'status': 'http_error',
          'statusCode': res.statusCode,
          'latency_ms': stopwatch.elapsedMilliseconds,
          'endpoint': baseUrl,
        };
      }
    } catch (e) {
      stopwatch.stop();
      return {
        'status': 'unreachable',
        'error': e.toString(),
        'latency_ms': stopwatch.elapsedMilliseconds,
        'endpoint': baseUrl,
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Internal Helpers
  // ---------------------------------------------------------------------------

  static Uri _resolveUri(String endpoint) {
    var base = baseUrl;
    if (base.endsWith('/')) {
      base = base.substring(0, base.length - 1);
    }
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    return Uri.parse('$base$cleanEndpoint');
  }

  static dynamic _processResponse(http.Response response) {
    final status = response.statusCode;
    dynamic body;
    try {
      body = jsonDecode(response.body);
    } catch (_) {
      body = response.body;
    }

    if (status >= 200 && status < 300) {
      return body;
    } else if (status == 401) {
      throw ApiException('Authentication session expired or invalid credentials.', statusCode: 401);
    } else if (status == 403) {
      throw ApiException('Access forbidden for active role.', statusCode: 403);
    } else if (status == 404) {
      throw ApiException('Resource not found ($status).', statusCode: 404);
    } else {
      final msg = (body is Map && body['message'] != null) ? body['message'] : 'Server returned error status $status';
      throw ApiException(msg, statusCode: status);
    }
  }
}
