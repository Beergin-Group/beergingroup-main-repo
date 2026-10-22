import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const MediRemindAuthApp());
}

class MediRemindAuthApp extends StatelessWidget {
  const MediRemindAuthApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MediRemind — Authentication',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0D9488),
          primary: const Color(0xFF0D9488),
        ),
        fontFamily: 'Roboto',
        useMaterial3: true,
      ),
      home: const LoginScreen(),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/dashboard': (context) => const PlaceholderDashboardScreen(),
      },
    );
  }
}

class PlaceholderDashboardScreen extends StatelessWidget {
  const PlaceholderDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MediRemind — Dashboard'),
        backgroundColor: const Color(0xFF0D9488),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle_outline, size: 72, color: Color(0xFF0D9488)),
            const SizedBox(height: 16),
            const Text(
              'Authentication Successful!',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Session token stored securely. Ready for Week 4 Medicine Management.',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
              child: const Text('Log Out'),
            ),
          ],
        ),
      ),
    );
  }
}
