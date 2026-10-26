import 'package:flutter/material.dart';
import '../models/dose_log.dart';
import '../services/api_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isLoading = true;
  List<DoseLog> _doses = [];
  Map<String, dynamic>? _summary;
  DoseLog? _nextDose;
  int? _secondsRemaining;

  @override
  void initState() {
    super.initState();
    _fetchDashboard();
  }

  Future<void> _fetchDashboard() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.getTodayDoses();
      if (res['success'] == true) {
        final list = (res['doses'] as List?)?.map((e) => DoseLog.fromJson(e)).toList() ?? [];
        setState(() {
          _doses = list;
          _summary = res['summary'];
          if (res['next_dose'] != null) {
            _nextDose = DoseLog.fromJson(res['next_dose']);
          }
          _secondsRemaining = res['seconds_to_next_dose'];
        });
      }
    } catch (e) {
      debugPrint('Dashboard error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleDoseAction(DoseLog dose, String status) async {
    await ApiService.recordDose(
      scheduleId: dose.scheduleId,
      medicineId: dose.medicineId,
      scheduledTime: dose.scheduledTime,
      status: status,
    );
    _fetchDashboard();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('MediRemind', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            Text("Today's Schedule", style: TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchDashboard,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchDashboard,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Next Dose Hero Card
                  if (_nextDose != null)
                    Card(
                      color: const Color(0xFF0D9488),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'UP NEXT',
                              style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              '${_nextDose!.medicineName} (${_nextDose!.dosage})',
                              style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'Scheduled at ${_nextDose!.timeDisplay} • ${_nextDose!.mealTiming.replaceAll('_', ' ')}',
                              style: const TextStyle(color: Colors.white, fontSize: 14),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: () => _handleDoseAction(_nextDose!, 'taken'),
                              icon: const Icon(Icons.check, color: Color(0xFF0D9488)),
                              label: const Text('Mark Taken', style: TextStyle(color: Color(0xFF0D9488), fontWeight: FontWeight.bold)),
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.white),
                            )
                          ],
                        ),
                      ),
                    ),

                  const SizedBox(height: 20),

                  // Today's Doses Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("Today's Dose Timeline", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      if (_summary != null)
                        Text('${_summary!['taken']} / ${_summary!['total']} Taken', style: const TextStyle(color: Colors.grey)),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Timeline Items
                  ..._doses.map((dose) => Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: const Color(0xFFCCFBF1),
                            child: const Text('💊'),
                          ),
                          title: Text(
                            '${dose.medicineName} (${dose.dosage})',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Text('${dose.timeDisplay} • ${dose.instructions ?? ""}'),
                          trailing: dose.isTaken
                              ? const Text('✓ Taken', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold))
                              : ElevatedButton(
                                  onPressed: () => _handleDoseAction(dose, 'taken'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF0D9488),
                                    foregroundColor: Colors.white,
                                  ),
                                  child: const Text('Take'),
                                ),
                        ),
                      )),
                ],
              ),
            ),
    );
  }
}
