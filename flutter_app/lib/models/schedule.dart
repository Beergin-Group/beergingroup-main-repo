class Schedule {
  final int id;
  final int medicineId;
  final String medicineName;
  final String dosage;
  final String doseTime; // '08:00 AM'
  final List<String> days;
  final String status; // 'pending', 'taken', 'skipped'

  const Schedule({
    required this.id,
    required this.medicineId,
    required this.medicineName,
    required this.dosage,
    required this.doseTime,
    this.days = const ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    this.status = 'pending',
  });

  factory Schedule.fromJson(Map<String, dynamic> json) {
    return Schedule(
      id: json['id'] as int? ?? 0,
      medicineId: json['medicine_id'] as int? ?? 0,
      medicineName: json['medicine_name'] as String? ?? 'Medication',
      dosage: json['dosage'] as String? ?? '',
      doseTime: json['dose_time'] as String? ?? '08:00 AM',
      days: (json['days'] as List<dynamic>?)?.map((e) => e.toString()).toList() ??
          ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      status: json['status'] as String? ?? 'pending',
    );
  }

  Schedule copyWith({
    int? id,
    int? medicineId,
    String? medicineName,
    String? dosage,
    String? doseTime,
    List<String> days,
    String? status,
  }) {
    return Schedule(
      id: id ?? this.id,
      medicineId: medicineId ?? this.medicineId,
      medicineName: medicineName ?? this.medicineName,
      dosage: dosage ?? this.dosage,
      doseTime: doseTime ?? this.doseTime,
      days: days ?? this.days,
      status: status ?? this.status,
    );
  }
}
