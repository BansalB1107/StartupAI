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
