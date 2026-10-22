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
  final String icon;
  final bool isLowStock;

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
    this.shape = 'round',
    this.icon = 'pill',
    required this.isLowStock,
  });

  factory Medicine.fromJson(Map<String, dynamic> json) {
    final stock = json['stock_count'] is int ? json['stock_count'] : int.tryParse(json['stock_count']?.toString() ?? '0') ?? 0;
    final threshold = json['low_stock_threshold'] is int ? json['low_stock_threshold'] : int.tryParse(json['low_stock_threshold']?.toString() ?? '5') ?? 5;
    
    return Medicine(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      userId: json['user_id'] is int ? json['user_id'] : int.tryParse(json['user_id']?.toString() ?? '0') ?? 0,
      dependentId: json['dependent_id'] != null ? int.tryParse(json['dependent_id'].toString()) : null,
      name: json['name'] ?? '',
      dosage: json['dosage'] ?? '',
      form: json['form'] ?? 'tablet',
      instructions: json['instructions'],
      stockCount: stock,
      lowStockThreshold: threshold,
      color: json['color'] ?? '#0D9488',
      shape: json['shape'] ?? 'round',
      icon: json['icon'] ?? 'pill',
      isLowStock: json['is_low_stock'] == true || stock <= threshold,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'dependent_id': dependentId,
      'name': name,
      'dosage': dosage,
      'form': form,
      'instructions': instructions,
      'stock_count': stockCount,
      'low_stock_threshold': lowStockThreshold,
      'color': color,
      'shape': shape,
      'icon': icon,
    };
  }
}
