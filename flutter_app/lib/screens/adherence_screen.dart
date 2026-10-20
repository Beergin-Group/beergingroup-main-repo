import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AdherenceScreen extends StatefulWidget {
  const AdherenceScreen({super.key});

  @override
  State<AdherenceScreen> createState() => _AdherenceScreenState();
}

class _AdherenceScreenState extends State<AdherenceScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _summary;

  @override
  void initState() {
    super.initState();
    _fetchAdherence();
  }

  Future<void> _fetchAdherence() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.getAdherenceSummary();
      if (res['success'] == true) {
        setState(() {
          _summary = res['data'];
        });
      }
    } catch (e) {
      debugPrint('Adherence load error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Adherence Report', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Text(
                          '${_summary?['adherence_rate'] ?? 0}%',
                          style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Color(0xFF0D9488)),
                        ),
                        const Text('Overall Adherence Score', style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            Column(
                              children: [
                                Text('${_summary?['current_streak'] ?? 0} Days', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                const Text('Streak 🔥', style: TextStyle(color: Colors.grey)),
                              ],
                            ),
                            Column(
                              children: [
                                Text('${_summary?['taken_doses'] ?? 0}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.green)),
                                const Text('Taken', style: TextStyle(color: Colors.grey)),
                              ],
                            ),
                            Column(
                              children: [
                                Text('${_summary?['skipped_doses'] ?? 0}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.red)),
                                const Text('Skipped', style: TextStyle(color: Colors.grey)),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
