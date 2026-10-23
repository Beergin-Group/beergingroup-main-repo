# MediRemind — Cross-Platform Medicine & Prescription Reminder

**MediRemind** is a cross-platform application designed to help users manage their medication schedules, receive timely reminders, and track their daily medication adherence. It aims to reduce missed or duplicate doses by providing a centralized platform for managing medicines, prescriptions, schedules, and dose history.

## Project Scope

MediRemind will focus on developing a functional medication management application for patients who take scheduled medications, caregivers, and family members who help manage prescriptions.

The project covers the development of a Flutter-based frontend for mobile, web, and desktop environments, supported by a RESTful API backend built with Node.js and Express and a PostgreSQL database.

The application will support user authentication, medicine management, medication scheduling, local reminders, dose logging, adherence reporting, and caregiver access to linked dependents.

### In-Scope Features

- **User Authentication:** User registration, login, logout, and JWT-based session authentication.
- **Medicine Management:** Add, view, edit, and delete medicine records, including medicine name, dosage, form, and notes.
- **Prescription Scheduling:** Create medication schedules based on daily frequency, intervals, or specific days, with start and end dates.
- **Medication Reminders:** Schedule local notifications for upcoming doses, primarily on mobile devices.
- **Dose Logging:** Record medication doses as Taken, Skipped, or Snoozed and view dose history.
- **Adherence Reports:** Display weekly and monthly medication adherence percentages and missed-dose lists.
- **Caregiver View:** Allow authorized users to view and manage schedules for linked dependents.
- **Dashboard:** Display today's scheduled doses, the next-dose countdown, and the current adherence streak.
- **Cross-Platform Support:** Develop the application using Flutter for Android, iOS, web browsers, and desktop environments, subject to platform compatibility and testing.

## Project Objectives

1. Develop a unified medication management application accessible across supported platforms.
2. Implement a RESTful API for authentication, medicine management, scheduling, and dose tracking.
3. Use PostgreSQL to store and manage application data.
4. Provide local medication reminders to help users follow their schedules.
5. Enable users to monitor their medication history and adherence.
6. Support caregivers in managing medication schedules for linked dependents.
7. Apply regular testing and incremental integration throughout development.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | Flutter and Dart |
| Backend | Node.js and Express.js |
| Database | PostgreSQL |
| Authentication | JSON Web Tokens (JWT) and bcrypt |
| API Testing | Postman |
| Development Environment | Visual Studio Code |
| Version Control | Git and GitHub |
| Notifications | Flutter local notifications package |

## Project Development Approach

The project will use an incremental development approach in which frontend and backend development proceed simultaneously. Features will be developed, integrated, and tested in stages.

The team will use GitHub to manage source code, track individual contributions, and coordinate development. Weekly milestones will be established to monitor progress and ensure that each team member delivers demonstrable work.

## Out of Scope

The following features are excluded from the current project:

- Real-time integration with doctors or pharmacies.
- Automatic electronic prescription import.
- Cloud deployment or production hosting.
- Smartwatch companion application.
- Drug interaction checking through external medical databases.
- Payment processing and insurance-related features.

## Target Users

- Patients who take medications on a regular schedule.
- Caregivers responsible for managing another person's medication.
- Family members who assist with prescription and medication management.

## Project Status

**Status:** In Development

This project is being developed as an academic software project. Features and supported platforms will be implemented and validated according to the project schedule and available development resources.

## Project Team — Beergin

- **Jerold Sodusta** — Project Manager
- **Francis John Empil** — Back-End Developer
- **Jibson Cabilin** — Front-End Developer
- **Nove Calasang** — Quality Assurance

## Disclaimer

MediRemind is intended to assist with medication scheduling and record-keeping. It does not replace professional medical advice, and users should follow the instructions provided by their healthcare professionals.

---

*Developed by Beergin as an academic project.*
