class Medicine {
  final int id;
  final int userId;
  final int? dependentId;
  final String name;
  final String dosage;
  final String form;
  final String? instructions;
  final int stockCount;
  final int lowStockThreshold;
  final String color;
  final String shape;

  Medicine({
    required this.id,
    required this.userId,
    this.dependentId,
    required this.name,
    required this.dosage,
    required this.form,
    this.instructions,
    required this.stockCount,
    required this.lowStockThreshold,
    required this.color,
    required this.shape,
  });

  bool get isLowStock => stockCount <= lowStockThreshold;

  factory Medicine.fromJson(Map<String, dynamic> json) {
    return Medicine(
      id: json['id'],
      userId: json['user_id'],
      dependentId: json['dependent_id'],
      name: json['name'],
      dosage: json['dosage'],
      form: json['form'] ?? 'tablet',
      instructions: json['instructions'],
      stockCount: json['stock_count'] ?? 0,
      lowStockThreshold: json['low_stock_threshold'] ?? 5,
      color: json['color'] ?? '#0d9488',
      shape: json['shape'] ?? 'round',
    );
  }
}
