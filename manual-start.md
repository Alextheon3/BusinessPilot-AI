# Manual Startup Guide

If you prefer to start the servers manually or the start.bat doesn't work, follow these steps:

## 1. Start Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Run database migrations (first time only)
alembic upgrade head

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8002
```

## 2. Start Frontend Server

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start the frontend server
npm start
```

## 3. Access the Application

- **Frontend App**: http://localhost:3002
- **Backend API**: http://localhost:8002
- **API Documentation**: http://localhost:8002/docs

## Troubleshooting

### Port Already in Use
If you get port errors, you can change the ports:

**Backend:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8003
```

**Frontend:**
Create a `.env` file in the frontend directory:
```
PORT=3003
REACT_APP_API_URL=http://localhost:8003
```

### Dependencies Issues
If you get dependency errors:

**Backend:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Frontend:**
```bash
npm install --force
```

### Database Issues
If you get database errors:
```bash
cd backend
alembic upgrade head
```

## First Time Setup

1. **Register a new account** at http://localhost:3002
2. **Fill in your business information**
3. **Start exploring the features:**
   - Add some sample sales data
   - Create inventory items
   - Add employees
   - Try the AI assistant

## Features to Try

- **Dashboard**: Overview of your business metrics
- **Sales**: Add transactions and view analytics
- **Inventory**: Manage stock and get alerts
- **Employees**: Schedule staff and track hours
- **Marketing**: Create AI-powered campaigns
- **Finance**: Track expenses and generate reports
- **AI Assistant**: Ask questions about your business

Enjoy using BusinessPilot AI! 🚀