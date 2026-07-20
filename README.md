# MediQueue AI — Smart Hospital Triage & Appointment Management System

AI-Powered Hospital Triage and Appointment Management System

**Supporting UN Sustainable Development Goal 3 (SDG 3) — Good Health and Well-Being**

---

## 🌟 Project Overview

MediQueue AI is an AI-powered hospital triage and appointment management system. It uses AI to analyze patient symptoms, automatically recommends the appropriate department, assigns priority levels, and optimizes the appointment booking process — reducing wait times and improving hospital efficiency.

### Core Features

- **AI Symptom Analysis**: Uses Google Gemini AI (free) to analyze patient symptoms, recommend departments, and assign priority
- **Smart Triage**: Automatically assigns priority (Emergency, High, Medium, Low) based on symptom severity
- **Appointment Management**: Automatically matches available doctors and books the earliest available slot
- **Automated Workflow**: Automates the entire triage-to-booking process using n8n
- **Notification System**: Sends automatic email and SMS confirmations and reminders
- **Doctor Portal**: Doctors can view appointments and AI-generated patient summaries

---

## 🏗️ Tech Stack

### Backend
- **Framework**: Express.js
- **Database**: SQLite
- **AI Service**: Google Gemini API (free) with rule-based fallback
- **Notifications**: Nodemailer (email), Twilio (SMS)
- **Process Manager**: PM2

### Frontend
- **Framework**: React + Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Automation
- **Workflow Engine**: n8n
- **Features**: Automated appointment flow, notification delivery, data storage

---

## 📋 Requirements

- Node.js >= 16.0.0
- npm >= 8.0.0
- Google Gemini API Key (free — no credit card required)
- (Optional) Gmail App Password (for email notifications)
- (Optional) Twilio Account (for SMS notifications)
- (Optional) n8n (for automated workflows)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/sahilblaze84/MediQue.git
cd MediQue
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit the `.env` file:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_PATH=./database/medique.db
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Keep-Alive (prevents server from sleeping on free hosting)
KEEP_ALIVE=true
PING_INTERVAL_MINUTES=10
SERVER_URL=http://localhost:5000
```

#### Initialize the Database

```bash
npm run init-db
```

#### Start the Backend Server

```bash
npm run dev
```

Backend will run at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at: `http://localhost:3000`

---

### 4. n8n Workflow Setup (Optional)

#### Install n8n

```bash
npm install -g n8n
n8n start
```

#### Import the Workflow

1. Open n8n at `http://localhost:5678`
2. Click **"Import from File"**
3. Select `n8n-workflow.json` from the project root
4. Configure credentials (SMTP, Twilio, SQLite)
5. Activate the workflow

See [n8n-workflow-guide.md](./n8n-workflow-guide.md) for detailed setup instructions.

---

## 📁 Project Structure

```
MediQue/
├── api/
│   └── index.js               # Vercel serverless entrypoint
├── backend/
│   ├── database/
│   │   ├── db.js              # Database connection
│   │   └── init.js            # Database initialization
│   ├── middleware/
│   │   ├── errorHandler.js    # Error handling middleware
│   │   ├── logger.js          # Request logging
│   │   └── validation.js      # Input validation
│   ├── routes/
│   │   ├── appointments.js    # Appointment routes
│   │   ├── departments.js     # Department routes
│   │   ├── doctors.js         # Doctor routes
│   │   ├── patients.js        # Patient routes
│   │   └── symptoms.js        # Symptom analysis routes
│   ├── services/
│   │   ├── aiService.js       # AI analysis service (Gemini + fallback)
│   │   ├── keepAlive.js       # 24/7 server keep-alive service
│   │   ├── notificationService.js  # Email/SMS notifications
│   │   └── tunnelManager.js   # Persistent tunnel manager
│   ├── utils/
│   │   └── database.js        # Database utility helpers
│   ├── ecosystem.config.js    # PM2 configuration
│   ├── .env.example           # Environment variable template
│   ├── package.json           # Backend dependencies
│   └── server.js              # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppointmentBooking.jsx  # Appointment booking page
│   │   │   ├── BookingConfirmation.jsx # Booking confirmation page
│   │   │   ├── DoctorDashboard.jsx     # Doctor portal
│   │   │   ├── Home.jsx               # Home page
│   │   │   ├── Navbar.jsx             # Navigation bar
│   │   │   └── SymptomForm.jsx        # Symptom submission form
│   │   ├── App.jsx            # Root application component
│   │   ├── main.jsx           # Application entry point
│   │   └── index.css          # Global styles
│   ├── index.html             # HTML template
│   ├── package.json           # Frontend dependencies
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── vite.config.js         # Vite configuration
├── vercel.json                # Vercel deployment configuration
├── n8n-workflow.json          # n8n workflow configuration
├── n8n-workflow-guide.md      # n8n setup guide
└── README.md                  # Project documentation
```

---

## 🔌 API Endpoints

### Symptom Analysis
- `POST /api/symptoms/analyze` — Analyze symptoms and get department recommendation
- `GET /api/symptoms/history/:patientId` — Get patient symptom history

### Appointment Management
- `POST /api/appointments` — Create appointment
- `GET /api/appointments` — Get all appointments
- `GET /api/appointments/:id` — Get specific appointment
- `PATCH /api/appointments/:id/status` — Update appointment status
- `GET /api/appointments/available/slots` — Get available time slots

### Department Management
- `GET /api/departments` — Get all departments
- `GET /api/departments/:id` — Get specific department
- `GET /api/departments/:id/doctors` — Get doctors in a department

### Doctor Management
- `GET /api/doctors` — Get all doctors
- `GET /api/doctors/:id` — Get specific doctor
- `POST /api/doctors` — Create a doctor profile
- `GET /api/doctors/:id/appointments` — Get doctor's appointments

### Health Check
- `GET /api/health` — Server health check (used for keep-alive monitoring)

---

## 🎯 User Flow

### Patient Flow

1. **Submit Symptoms**
   - Visit the home page and click "Start Symptom Check"
   - Fill in personal information
   - Select symptoms (from common list or enter custom)
   - Set severity and duration
   - Submit for AI analysis

2. **View Analysis Results**
   - AI-recommended department
   - Assigned priority level
   - AI-generated doctor summary
   - Recommended action

3. **Book Appointment**
   - System recommends the right department
   - Select a doctor
   - Choose date and time
   - Confirm appointment

4. **Receive Notifications**
   - Confirmation email and SMS
   - Reminder 24 hours before appointment

### Doctor Flow

1. **Access Doctor Portal**
   - View all appointments
   - Filter by status and priority
   - Search patients

2. **Manage Appointments**
   - Confirm appointments
   - Mark as completed
   - Cancel appointments

3. **View Patient Information**
   - AI-generated patient summary
   - Symptom details
   - Contact information

---

## ☁️ Deployment

### Vercel (Recommended)

The app is pre-configured for one-click Vercel deployment:

```bash
npx vercel
```

Or connect your GitHub repository on [vercel.com](https://vercel.com) and deploy automatically on every push.

**Environment variables to set in Vercel Dashboard:**
- `GEMINI_API_KEY` — Your free Google Gemini API key
- `NODE_ENV` — `production`

### Keep Server Active 24/7

Use [UptimeRobot](https://uptimerobot.com) (free) to ping your deployed app every 5 minutes and keep it always active:

- Monitor URL: `https://your-app.vercel.app/api/health`
- Monitor type: `HTTP(s)`
- Interval: `5 minutes`

---

## 🔒 Security Notice

> ⚠️ **Important Disclaimer**
>
> - This system is for **triage and appointment management only** — it does NOT provide medical diagnosis or treatment advice
> - AI analysis is for guidance only and cannot replace professional medical consultation
> - In emergencies, call emergency services or go directly to the Emergency Department
> - All medical decisions must be made by qualified healthcare professionals

### Data Security

- Patient data is stored locally in an SQLite database
- Use an encrypted database in production
- Implement proper access control and authentication
- Comply with applicable healthcare data privacy regulations (HIPAA, GDPR, etc.)

---

## 🧪 Testing

### Test AI Analysis (No API Key Required)

The system includes a built-in rule-based fallback that works without any AI key:

```bash
curl -X POST http://localhost:5000/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "headache"],
    "severity": "moderate",
    "duration": "2 days"
  }'
```

### Test Appointment Creation

```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "doctorId": 1,
    "departmentId": 1,
    "appointmentDate": "2024-01-15",
    "appointmentTime": "10:00",
    "priorityLevel": "Medium",
    "symptomsSummary": "fever, headache",
    "aiSummary": "Patient presents with fever and headache"
  }'
```

---

## 📊 Database Schema

### departments
| Column | Type |
|---|---|
| id | INTEGER PRIMARY KEY |
| name | TEXT UNIQUE |
| description | TEXT |
| created_at | TIMESTAMP |

### doctors
| Column | Type |
|---|---|
| id | INTEGER PRIMARY KEY |
| name | TEXT |
| email | TEXT UNIQUE |
| phone | TEXT |
| department_id | INTEGER (FK) |
| specialization | TEXT |
| available_from | TEXT |
| available_to | TEXT |
| created_at | TIMESTAMP |

### patients
| Column | Type |
|---|---|
| id | INTEGER PRIMARY KEY |
| name | TEXT |
| email | TEXT |
| phone | TEXT |
| date_of_birth | TEXT |
| created_at | TIMESTAMP |

### appointments
| Column | Type |
|---|---|
| id | INTEGER PRIMARY KEY |
| patient_id | INTEGER (FK) |
| doctor_id | INTEGER (FK) |
| department_id | INTEGER (FK) |
| appointment_date | TEXT |
| appointment_time | TEXT |
| priority_level | TEXT |
| status | TEXT |
| symptoms_summary | TEXT |
| ai_summary | TEXT |
| created_at | TIMESTAMP |

---

## 🌍 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `PORT` | Backend server port (default: 5000) | No |
| `GEMINI_API_KEY` | Google Gemini AI API key (free) | Yes (for AI features) |
| `DATABASE_PATH` | SQLite database file path | No |
| `EMAIL_HOST` | SMTP server hostname | No |
| `EMAIL_PORT` | SMTP server port | No |
| `EMAIL_USER` | Email account username | No |
| `EMAIL_PASSWORD` | Email app password | No |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | No |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | No |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | No |
| `KEEP_ALIVE` | Enable self-ping keep-alive (true/false) | No |
| `PING_INTERVAL_MINUTES` | Keep-alive ping interval in minutes | No |
| `SERVER_URL` | Public server URL for keep-alive pings | No |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License — see the LICENSE file for details.

---

## 🙏 Acknowledgements

- **Google Gemini** — Free AI analysis capability
- **n8n** — Workflow automation
- **React** — Frontend framework
- **Express.js** — Backend framework
- **TailwindCSS** — Styling framework

---

## 🎯 SDG 3 — Good Health and Well-Being

This project directly supports UN Sustainable Development Goal 3:

- **Reduce wait times**: Optimize patient flow through smart triage
- **Improve healthcare access**: Simplify the appointment booking process
- **Optimize resource use**: Help hospitals manage resources more effectively
- **Enhance patient experience**: Provide transparent and efficient service

---

> **Note**: This system is intended for demonstration and educational purposes. Before using in a production environment, ensure compliance with all applicable medical regulations and standards.
