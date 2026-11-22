import 'package:flutter/material.dart';

/// Dynamic Responsive Layout Adapter (Task 3.7 / Issue #46)
/// Detects viewport width and seamlessly switches between compact single-column
/// mobile layouts (<600px) and wide multi-column desktop/tablet layouts (>=600px).
class ResponsiveLayout extends StatelessWidget {
  final Widget mobileScaffold;
  final Widget desktopScaffold;
  final Widget? tabletScaffold;

  // Adaptive breakpoints compliant with Android/Desktop standards
  static const double mobileBreakpoint = 600.0;
  static const double desktopBreakpoint = 1024.0;

  const ResponsiveLayout({
    super.key,
    required this.mobileScaffold,
    required this.desktopScaffold,
    this.tabletScaffold,
  });

  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < mobileBreakpoint;

  static bool isTablet(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= mobileBreakpoint && width < desktopBreakpoint;
  }

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= desktopBreakpoint;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth < mobileBreakpoint) {
          return mobileScaffold;
        } else if (constraints.maxWidth < desktopBreakpoint && tabletScaffold != null) {
          return tabletScaffold!;
        } else {
          return desktopScaffold;
        }
      },
    );
  }
}
