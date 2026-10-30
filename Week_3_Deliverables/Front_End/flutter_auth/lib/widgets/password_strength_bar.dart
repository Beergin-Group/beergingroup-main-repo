import 'package:flutter/material.dart';

class PasswordStrengthBar extends StatelessWidget {
  final String password;

  const PasswordStrengthBar({super.key, required this.password});

  int get score {
    if (password.isEmpty) return 0;
    int s = 0;
    if (password.length >= 8) s++;
    if (RegExp(r'\d').hasMatch(password)) s++;
    if (RegExp(r'[a-zA-Z]').hasMatch(password)) s++;
    if (RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(password)) s++;
    return s;
  }

  String get label {
    switch (score) {
      case 0:
        return 'Enter password';
      case 1:
        return 'Too Weak (min 8 chars)';
      case 2:
        return 'Fair (add numbers & symbols)';
      case 3:
        return 'Good';
      case 4:
      default:
        return 'Strong Password';
    }
  }

  Color get color {
    switch (score) {
      case 1:
        return Colors.red;
      case 2:
        return Colors.orange;
      case 3:
        return Colors.blue;
      case 4:
      default:
        return const Color(0xFF0D9488);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (password.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 6),
        Row(
          children: List.generate(4, (index) {
            return Expanded(
              child: Container(
                margin: EdgeInsets.only(right: index < 3 ? 4 : 0),
                height: 4,
                decoration: BoxDecoration(
                  color: index < score ? color : const Color(0xFFE2E8F0),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600),
            ),
            const Text(
              '8+ chars, 1 number, 1 letter',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
            ),
          ],
        ),
      ],
    );
  }
}
