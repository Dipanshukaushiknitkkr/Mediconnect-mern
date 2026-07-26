# 🏥 MediConnect MERN - Enterprise Telehealth & AI Platform

A production-grade, placement-level **Full Stack MERN Healthcare & Telehealth Platform** built with **Node.js, Express, React (Vite), MongoDB, Google Gemini AI, WebSockets (Socket.io), WebRTC Video Calls**, and **Payment Gateway Integration**.

---

## 🌟 Key Features & Technical Highlights

- **🤖 Google Gemini AI Symptom Triage**: Instant clinical symptom analysis using Gemini LLM to suggest medical specialties, urgency levels, and recommended actions.
- **📹 Encrypted WebRTC Video Consultation**: Fullscreen HD P2P video calls between patients and doctors with mute/unmute, video toggle, and chat overlay.
- **💬 Real-Time WebSocket Chat**: Live messaging powered by Socket.io with persistent database chat logs.
- **🔐 Multi-Role RBAC Authentication**: Granular role-based access control (`PATIENT`, `DOCTOR`, `ADMIN`) using JWT and password hashing (`bcryptjs`).
- **📑 Digital Rx Prescriptions**: Doctors can generate and issue digital medical prescriptions with dosage, duration, and diagnosis.
- **👨‍⚕️ Doctor Credential Verification Queue**: Admin control panel to verify doctor licenses and monitor platform revenue metrics.
- **💳 Payment Gateway Integration**: Instant booking authorization flow for consultation fees with transaction receipts.
- **✨ Glassmorphism UI/UX**: Premium dark theme UI built with React 19, Tailwind CSS v4, Lucide icons, and fluid animations.

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
> Server will start at `http://localhost:5000` and automatically seed demo data!

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> App will run at `http://localhost:5173`.

---

## 🔑 Pre-Seeded Demo Login Credentials (Instant Testing)

| Role | Email | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@mediconnect.com` | `patient123` | AI Triage, Book Doctors, Join Video Call, View Rx |
| **Doctor** | `sarah.jenkins@mediconnect.com` | `doctor123` | Patient Queue, Start Video Consultation, Write Rx |
| **Admin** | `admin@mediconnect.com` | `admin123` | Verify Doctors, System Stats, Revenue Analytics |

---

## 📌 Resume Bullet Points for Placement Interviews

- Developed **MediConnect**, a full-stack telehealth platform integrating **Google Gemini AI** for clinical symptom triage and specialist matching.
- Engineered real-time video consultation rooms using **WebRTC** and **Socket.io** for low-latency peer-to-peer signaling and chat.
- Implemented robust **JWT-based RBAC** securing patient health data and doctor verification queues across Node.js/Express REST endpoints.
- Designed responsive glassmorphism UI in **React 19** and **Tailwind CSS v4**, processing bookings and digital prescriptions.
