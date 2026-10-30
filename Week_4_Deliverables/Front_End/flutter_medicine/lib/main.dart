import 'package:flutter/material.dart';
import 'screens/medicine_list_screen.dart';

void main() {
  runApp(const MediRemindMedicineApp());
}

class MediRemindMedicineApp extends StatelessWidget {
  const MediRemindMedicineApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MediRemind — Medicine Management',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0D9488),
          primary: const Color(0xFF0D9488),
        ),
        fontFamily: 'Roboto',
        useMaterial3: true,
      ),
      home: const MedicineListScreen(),
    );
  }
}
