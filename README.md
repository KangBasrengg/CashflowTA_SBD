# Cashflow Monitoring Application

A full-stack web application for monitoring cashflow, built with React (frontend) and Node.js/Express (backend).

## Features
- Transaction Management (CRUD)
- Dashboard with Financial Overview
- Monthly Reports & Data Visualization
- Administrative User Management
- Excel Export Functionality

## Tech Stack
- **Frontend**: React, Vite, Vanilla CSS
- **Backend**: Node.js, Express, MySQL
- **Authentication**: JWT-based auth

## Setup Instructions

### Prerequisites
- Node.js installed
- MySQL database running

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. Configure environment variables (create `.env` in backend folder):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=yourpassword
   DB_NAME=cashflow_db
   JWT_SECRET=your_secret_key
   ```

4. Run the application:
   ```bash
   # Backend
   cd backend
   npm start

   # Frontend
   cd ../frontend
   npm run dev
   ```
