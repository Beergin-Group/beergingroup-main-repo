import 'package:flutter/material.dart';
import '../services/api_service.dart';

class CaregiverScreen extends StatefulWidget {
  const CaregiverScreen({super.key});

  @override
  State<CaregiverScreen> createState() => _CaregiverScreenState();
}

class _CaregiverScreenState extends State<CaregiverScreen> {
  bool _isLoading = true;
  List<dynamic> _dependents = [];

  @override
  void initState() {
    super.initState();
    _fetchDependents();
  }

  Future<void> _fetchDependents() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.getDependents();
      if (res['success'] == true) {
        setState(() {
          _dependents = res['data'] ?? [];
        });
      }
    } catch (e) {
      debugPrint('Dependents error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Caregiver Dependents', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _dependents.length,
              itemBuilder: (context, index) {
                final d = _dependents[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: Color(0xFFE0F2FE),
                      child: Text('👤'),
                    ),
                    title: Text(d['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${d['relationship']} • ${d['notes'] ?? ""}'),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  ),
                );
              },
            ),
    );
  }
}
