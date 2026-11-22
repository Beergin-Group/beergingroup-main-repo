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

  static String normalizeFormForDb(String form) {
    final lower = form.trim().toLowerCase();
    if (lower == 'tablet') return 'tablet';
    if (lower == 'capsule') return 'capsule';
    if (lower == 'liquid' || lower == 'syrup') return 'syrup';
    if (lower == 'inhaler') return 'inhaler';
    if (lower == 'drops') return 'drops';
    if (lower == 'injection') return 'injection';
    if (lower == 'topical') return 'topical';
    return 'other';
  }

  factory Medicine.fromJson(Map<String, dynamic> json) {
    final rawForm = (json['form'] as String? ?? 'tablet').toLowerCase();
    String displayForm = 'Tablet';
    if (rawForm == 'capsule') {
      displayForm = 'Capsule';
    } else if (rawForm == 'syrup' || rawForm == 'liquid') {
      displayForm = 'Liquid';
    } else if (rawForm == 'inhaler') {
      displayForm = 'Inhaler';
    } else if (rawForm == 'drops') {
      displayForm = 'Drops';
    } else if (rawForm == 'injection') {
      displayForm = 'Injection';
    } else if (rawForm == 'topical') {
      displayForm = 'Topical';
    } else if (rawForm == 'other' || rawForm == 'powder') {
      displayForm = 'Powder';
    } else {
      displayForm = rawForm.isNotEmpty
          ? '${rawForm[0].toUpperCase()}${rawForm.substring(1)}'
          : 'Tablet';
    }

    return Medicine(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      dosage: json['dosage'] as String? ?? '',
      form: displayForm,
      colorTag: json['color'] as String? ??
          json['color_tag'] as String? ??
          '#0D9488',
      instructions: json['instructions'] as String? ?? '',
      stockCount: json['stock_count'] as int? ??
          (json['stockCount'] as int? ?? 30),
      lowStockThreshold: json['low_stock_threshold'] as int? ??
          (json['lowStockThreshold'] as int? ?? 5),
      isPrn: json['is_prn'] as bool? ??
          (json['isPrn'] as bool? ?? false),
    );
  }

  Map<String, dynamic> toJson({bool includeId = true}) => {
        if (includeId && id > 0) 'id': id,
        'name': name,
        'dosage': dosage,
        'form': normalizeFormForDb(form),
        'color': colorTag,
        'instructions': instructions,
        'stock_count': stockCount,
        'low_stock_threshold': lowStockThreshold,
        'shape': 'round',
        'icon': 'pill',
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
