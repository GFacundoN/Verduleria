# Verdulería Management System

A comprehensive order management system for produce stores, featuring desktop application for order management, delivery note generation with QR codes, and mobile app for delivery confirmation.

[🇪🇸 Versión en Español](./README.es.md)

## 📋 Overview

This project is a complete management solution for produce stores (verdulerías), enabling:
- Product and customer management
- Order registration and tracking
- Delivery note generation with QR codes
- Delivery confirmation via mobile app
- Daily sales reporting

## 🏗️ Project Structure

```
Verduleria/
├── verduleria/              # Backend (Java Spring Boot + MySQL)
├── frontend-electron/       # Desktop Application (React + Electron)
├── verduleria-mobile/       # Mobile Application (React)
└── README.md               # This file
```

## 🛠️ Technology Stack

### Backend
- **Framework**: Java Spring Boot
- **Database**: MySQL
- **Architecture**: RESTful API

### Desktop Application
- **Frontend**: React 18 + Vite
- **Desktop Framework**: Electron
- **UI Library**: TailwindCSS + shadcn/ui
- **Icons**: Lucide React
- **QR Generation**: qrcode.react

### Mobile Application
- **Framework**: React
- **Purpose**: QR scanning and delivery confirmation

## 🚀 Getting Started

### Prerequisites
- Java JDK 11 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd verduleria
```

2. Configure database connection in `application.properties`

3. Run the Spring Boot application:
```bash
./mvnw spring-boot:run
```

The backend will be available at `http://localhost:8080`

### Desktop Application Setup

1. Navigate to the desktop app directory:
```bash
cd frontend-electron
```

2. Install dependencies:
```bash
npm install
```

3. Configure backend URL in `src/config/api.js`

4. Run in development mode:
```bash
# Browser mode
npm run dev

# Desktop mode (Electron)
npm run electron:dev
```

5. Build for production:
```bash
npm run electron:build
```

The installer will be generated in the `dist-electron/` folder.

### Mobile Application Setup

1. Navigate to the mobile app directory:
```bash
cd verduleria-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm start
```

## ✨ Features

### Desktop Application
- ✅ Product Management (CRUD operations)
- ✅ Customer Management
- ✅ Order Registration
- ✅ Delivery Note Generation with QR Codes
- ✅ Delivery Confirmation
- ✅ Daily Sales Reports

### Mobile Application
- ✅ QR Code Scanning
- ✅ Delivery Confirmation
- ✅ Order Lookup

## 📱 Usage Workflow

1. **Order Creation**: Create orders in the desktop application
2. **Delivery Note**: Generate delivery notes with unique QR codes
3. **Delivery**: Driver uses mobile app to scan QR and confirm delivery
4. **Reporting**: View daily sales and delivery reports

## 🔧 Configuration

### Backend Configuration
Configure the following in `verduleria/src/main/resources/application.properties`:
- Database connection
- Server port
- JWT secret (if applicable)

### Desktop App Configuration
Configure in `frontend-electron/src/config/api.js`:
- Backend API URL
- Default settings

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Facundo Nicolas Gandolfo**

## 🐛 Known Issues

- Some features may require additional configuration

---

Made with ❤️ for produce store management
