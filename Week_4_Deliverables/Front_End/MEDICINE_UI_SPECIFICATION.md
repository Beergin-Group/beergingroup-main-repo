# MediRemind — Front-End UI Specification: Medicine Management Module
**Week 4 Deliverable**  
**Author:** Jibson Cabilin (Front-End Developer)  
**Reviewed By:** Jerold Sodusta (Project Manager), Nove Calasang (Quality Assurance)  
**Target Course:** Application Development and Emerging Technologies  
**Date:** October 2026  

---

## 1. Overview & UI Objectives

The Medicine Management module gives users complete visual control over their prescription catalog. Patients and caregivers can search, filter, inspect stock levels, add new medications with comprehensive forms, edit existing details, trigger fast inventory refills, and safely delete obsolete medications.

### Core UI Components
1. **Medicine List Screen:** Card-based catalog with live search filter, dosage badges, visual pill color markers, low-stock warning chips, and an action menu.
2. **Add Medicine Screen / Modal:** Clean multi-field form with dropdown form selector (Tablet, Capsule, Syrup, etc.), color swatch selector, stock threshold inputs, and instant validation.
3. **Edit Medicine Screen / Modal:** Pre-populated edit interface allowing quick dosage or instruction updates.
4. **Delete Confirmation Dialog:** Double-confirmation modal emphasizing safety to avoid accidental prescription removal.

---

## 2. Wireframe Specifications

### 2.1 Medicine List View
```text
+-------------------------------------------------------------+
|  💊 Prescriptions & Medicines              [+ Add Medicine] |
|                                                             |
|  [ 🔍 Search medicines by name... ]  [ Filter: All Forms v ]|
|                                                             |
|  +-------------------------------------------------------+  |
|  | [🟢] Metformin HCl                     [ 42 in stock ]|  |
|  |     500 mg • TABLET                                   |  |
|  |     "Take with breakfast and dinner to lower blood"    |  |
|  |                                                       |  |
|  |     Stock: [████████████░░░] 42/60 units              |  |
|  |     [ + Refill (+30) ]        [ ✏️ Edit ]   [ 🗑️ Delete ]|  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | [🔴] Lisinopril                        [ ⚠️ 4 LOW STOCK] |  |
|  |     10 mg • TABLET                                    |  |
|  |     "Take 1 tablet every morning with water"          |  |
|  |                                                       |  |
|  |     Stock: [██░░░░░░░░░░░░░] 4/30 units               |  |
|  |     [ + Refill (+30) ]        [ ✏️ Edit ]   [ 🗑️ Delete ]|  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

### 2.2 Add / Edit Medicine Modal Layout
```text
+-------------------------------------------------------------+
|  + Add New Medicine                                     [✕] |
|                                                             |
|  Medicine Name *                                            |
|  [ Amoxicillin                                            ] |
|                                                             |
|  Dosage (e.g. 500 mg, 10 ml) *                              |
|  [ 250 mg                                                 ] |
|                                                             |
|  Form / Administration Type                                 |
|  [ Capsule                                              v ] |
|                                                             |
|  Doctor Instructions / Notes                                |
|  [ Take 1 capsule every 8 hours after meals until finished] |
|                                                             |
|  Current Stock Count              Low Stock Alert Below     |
|  [ 21                           ] [ 5                     ] |
|                                                             |
|  Pill Color Accent Tag                                      |
|  (• Teal)  ( ) Coral  ( ) Amber  ( ) Purple  ( ) Emerald    |
|                                                             |
|  [ Cancel ]                                 [ Save Medicine]|
+-------------------------------------------------------------+
```

---

## 3. Form Validation & Interaction Rules

| UI Control | Constraints | Error Indicator |
| :--- | :--- | :--- |
| **Medicine Name** | Required, $\ge 2$ chars, max 100 | "Medicine name is required (e.g. Amoxicillin)." |
| **Dosage** | Required, non-empty | "Dosage is required (e.g. 500 mg)." |
| **Form Selector** | Enum: tablet, capsule, syrup, injection, drops, inhaler | Default: `tablet` |
| **Stock Count** | Number, $\ge 0$ | "Stock count cannot be negative." |
| **Low Stock Threshold**| Number, $\ge 0$ | "Threshold cannot be negative." |
| **Refill Action** | Increments stock by specified amount (default: 30) | Instant badge recalculation & celebration toast |
| **Delete Action** | Requires modal confirmation | Deletion removes item and updates list seamlessly |
