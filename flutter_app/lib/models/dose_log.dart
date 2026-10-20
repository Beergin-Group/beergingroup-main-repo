class DoseLog {
  final int? id;
  final int? scheduleId;
  final int medicineId;
  final String medicineName;
  final String dosage;
  final String form;
  final String color;
  final String timeDisplay;
  final String scheduledTime;
  final String status; // 'taken', 'skipped', 'snoozed', 'pending'
  final String mealTiming;
  final String? instructions;
  final int? stockCount;

  DoseLog({
    this.id,
    this.scheduleId,
    required this.medicineId,
    required this.medicineName,
    required this.dosage,
    required this.form,
    required this.color,
    required this.timeDisplay,
    required this.scheduledTime,
    required this.status,
    required this.mealTiming,
    this.instructions,
    this.stockCount,
  });

  bool get isTaken => status == 'taken';
  bool get isSkipped => status == 'skipped';
  bool get isPending => status == 'pending' || status == 'snoozed';

  factory DoseLog.fromJson(Map<String, dynamic> json) {
    return DoseLog(
      id: json['id'],
      scheduleId: json['schedule_id'],
      medicineId: json['medicine_id'],
      medicineName: json['medicine_name'] ?? 'Medicine',
      dosage: json['dosage'] ?? '',
      form: json['form'] ?? 'tablet',
      color: json['color'] ?? '#0d9488',
      timeDisplay: json['time_display'] ?? '',
      scheduledTime: json['scheduled_time'],
      status: json['status'] ?? 'pending',
      mealTiming: json['meal_timing'] ?? 'no_food_relation',
      instructions: json['instructions'],
      stockCount: json['stock_count'],
    );
  }
}
