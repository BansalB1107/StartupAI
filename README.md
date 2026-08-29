# 🚀 StartupAI

### AI-Powered Startup Incubation & Investor Platform

StartupAI is a full-stack web application designed to help startups analyze their ideas, prepare for funding, generate business reports, and connect with investors through a centralized platform.

The application combines a React frontend with a Django REST API backend, MongoDB, AI-powered features, and machine-learning-based funding analysis.

---

## ✨ Overview

StartupAI provides a digital ecosystem for both **startups and investors**.

Startups can create and manage their profiles, analyze their business ideas, evaluate funding readiness, generate reports, and interact with AI-powered tools.

Investors can explore startup profiles, manage their portfolios, review startup information, and interact with the platform through dedicated investor features.

The project also includes machine-learning functionality for startup funding prediction and AI-powered analysis.

---

## 🎯 Key Features

### 👨‍💻 Startup Features

- Startup registration and authentication
- Email OTP verification
- Startup profile management
- Startup dashboard
- AI-powered startup analysis
- AI-powered startup strategy
- Funding readiness analysis
- Funding prediction using Machine Learning
- Startup analytics
- Startup marketplace
- Startup-investor interactions
- AI chat functionality
- Business/report generation
- PDF report generation
- Notifications
- Premium subscription functionality

### 💼 Investor Features

- Investor registration and authentication
- Investor profile management
- Investor dashboard
- Startup discovery
- Startup profiles
- Investment portfolio management
- Investor analytics
- Investor feed
- Startup-investor communication

### 🔐 Authentication & Security

- JWT-based authentication
- Email OTP verification
- Protected frontend routes
- Environment-variable-based secret management
- Django REST Framework authentication
- CORS configuration

### 🤖 AI & Machine Learning

- Google Gemini API integration
- AI-powered startup analysis
- AI-powered conversational features
- Machine-learning-based funding prediction
- Startup success/funding dataset
- Trained ML model integrated with the application

### 📊 Reports & Business Analysis

- Startup analysis reports
- Funding-related reports
- PDF report generation
- Report management
- Email-based report functionality

### 💳 Other Integrations

- Razorpay payment integration
- Email/SMTP integration
- MongoDB database
- REST API architecture

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3

### Backend

- Python
- Django
- Django REST Framework

### Database

- MongoDB

### Authentication

- JWT
- Email OTP

### AI / ML

- Google Gemini API
- Python Machine Learning
- Jupyter Notebook
- Trained ML model

### Payments & Services

- Razorpay
- SMTP / Gmail

### Development Tools

- Git
- GitHub
- npm
- VS Code

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │      + Vite         │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   Django Backend    │
                    │ Django REST API     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │   MongoDB   │  │  Gemini AI  │  │  ML Model   │
       │   Database  │  │     API     │  │   Funding   │
       └─────────────┘  └─────────────┘  └─────────────┘
              │
              │
              ▼
       ┌─────────────┐
       │  Reports /  │
       │ PDF / Email │
       └─────────────┘
```

## 📁 Project Structure

```text
StartupAI/
│
├── backend/                 # Django project configuration
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── users/                  # Authentication, profiles & user features
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
│
├── reports/                # Startup report generation & management
│   ├── models.py
│   ├── views.py
│   ├── services.py
│   └── urls.py
│
├── ml/                     # Machine learning components
│   ├── dataset/
│   ├── models/
│   └── notebooks/
│
├── manage.py               # Django management utility
├── package.json            # Project dependencies/scripts
├── .env.example            # Environment variable template
└── .gitignore              # Git ignored files
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/BansalB1107/StartupAI.git
cd StartupAI
```

### 2. Backend Setup

Create and activate a Python virtual environment:

```bash
python -m venv venv
```

**Windows:**

```bash
venv\Scripts\activate
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file in the project root:

```bash
copy .env.example .env
```

Configure the required environment variables in `.env`, including:

```env
DJANGO_SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
EMAIL_HOST_USER=your_email
EMAIL_HOST_PASSWORD=your_email_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

> ⚠️ Never commit the `.env` file or expose API keys, passwords, or other secrets publicly.

### 4. Database

StartupAI uses MongoDB.

Make sure MongoDB is running locally and the database configuration matches your environment.

### 5. Run the Django Backend

```bash
python manage.py runserver
```

The backend will be available at:

```text
http://127.0.0.1:8000/
```

### 6. Frontend Setup

Open a new terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The React application will be available at the URL shown by Vite in the terminal.
