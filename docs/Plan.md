# Carvaan - Implementation Roadmap & Plan

## Phase 1: Project Setup & Firebase Core Initialization
- [x] Initialize Next.js (App Router, TypeScript, Tailwind CSS, Lucide icons).
- [x] Configure environment variables & Firebase SDK initialization (`lib/firebase/client.ts` using [firebase-config.ts](file:///Users/khurramrizvi/Development/Hackathon/Carvaan/firebase-config.ts)).
- [x] Integrate Meta design tokens into Tailwind config (Optimistic/Inter typography, Cobalt primary, pill buttons, flat card styling from [docs/Design.md](file:///Users/khurramrizvi/Development/Hackathon/Carvaan/docs/Design.md)).

## Phase 2: Authentication Module Implementation (Auth-Design)
- [x] Implement `AuthContext` and `useAuth` hook:
  - Auth state observer (`onAuthStateChanged`).
  - Dual collection sync (`users` & `committees`).
  - Provider validation & role guards.
- [x] Build UI Components:
  - Meta-styled Radio Option Selector (Committee vs Normal User).
  - Outlined Google Auth CTA button.
  - Cobalt pill submit buttons and input fields with validation states.
- [x] Build Auth Pages:
  - `/login`: Role toggle, email/password for Committee, Google OAuth for Normal User.
  - `/register`: Google onboarding for Normal User, 7-field form + Logo upload for Committee.
  - `/auth/status`: Friendly notifications for Pending Approval and Rejection states.
- [x] Build Dedicated Admin Portal:
  - `/admin/login`: Secure admin sign-in.
  - `/admin/dashboard`: Metrics cards (Total, Approved, Rejected, Pending) and live Committee review table with Approve/Reject actions.
- [x] Security Rules: Deploy Firestore & Storage rules for user profiles and committee logo uploads.

## Phase 3: Event (Juloos) Core Module
- [x] Event data model and Firestore schema.
- [x] Homepage: Live/Upcoming Juloos list.
- [x] Event Details Page:
  - [x] Organizing Committee card.
  - [x] Announcements.
  - [x] Route map (Start & End point plotted).
  - [x] SOS button & incident reporting.
  - [x] Niyaz registration (Individual vs Sabeel/Booth).
  - [x] Volunteer registration.
  - [x] Lost & Found reporting.

## Phase 4: Committee Dedicated Management Section
- [x] Committee dashboard: `/committee/events`.
- [x] Committee event details hub (`/committee/events/[id]`):
  - [x] Volunteer registration review & attendance tracking.
  - [x] Lost & Found resolver and announcement broadcaster.
  - [x] Niyaz approvals and QR code generation.
  - [x] SOS incident triage and resolution.

## Phase 5: Volunteer Experience & PWA Verification
- [x] Volunteer scanner tool (QR code scanner for Niyaz validation).
- [x] Attendance toggle.
- [x] Incident viewer & Lost/Found reporting.
- [x] End-to-end testing, responsive audits, and deployment.
