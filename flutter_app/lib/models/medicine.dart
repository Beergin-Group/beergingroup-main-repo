class Medicine {
  final int id;
  final String name;
  final String dosage;
  final String form; // 'Tablet', 'Capsule', 'Liquid', 'Inhaler', 'Drops', 'Powder'
  final String colorTag;
  final String instructions;
  final int stockCount;
  final int lowStockThreshold;
  final bool isPrn; // As-needed

  const Medicine({
    required this.id,
    required this.name,
    required this.dosage,
    required this.form,
    this.colorTag = '#0D9488',
    this.instructions = '',
    this.stockCount = 30,
    this.lowStockThreshold = 5,
    this.isPrn = false,
  });

  bool get isLowStock => stockCount <= lowStockThreshold;
  double get stockRatio => (stockCount / 30.0).clamp(0.0, 1.0);

  factory Medicine.fromJson(Map<String, dynamic> json) {
    return Medicine(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      dosage: json['dosage'] as String? ?? '',
      form: json['form'] as String? ?? 'Tablet',
      colorTag: json['color_tag'] as String? ?? '#0D9488',
      instructions: json['instructions'] as String? ?? '',
      stockCount: json['stock_count'] as int? ?? 0,
      lowStockThreshold: json['low_stock_threshold'] as int? ?? 5,
      isPrn: json['is_prn'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'dosage': dosage,
        'form': form,
        'color_tag': colorTag,
        'instructions': instructions,
        'stock_count': stockCount,
        'low_stock_threshold': lowStockThreshold,
        'is_prn': isPrn,
      };

  Medicine copyWith({
    int? id,
    String? name,
    String? dosage,
    String? form,
    String? colorTag,
    String? instructions,
    int? stockCount,
    int? lowStockThreshold,
    bool? isPrn,
  }) {
    return Medicine(
      id: id ?? this.id,
      name: name ?? this.name,
      dosage: dosage ?? this.dosage,
      form: form ?? this.form,
      colorTag: colorTag ?? this.colorTag,
      instructions: instructions ?? this.instructions,
      stockCount: stockCount ?? this.stockCount,
      lowStockThreshold: lowStockThreshold ?? this.lowStockThreshold,
      isPrn: isPrn ?? this.isPrn,
    );
  }
}
