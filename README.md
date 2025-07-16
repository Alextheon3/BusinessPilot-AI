# BusinessPilot AI

Your all-in-one AI business operations team for small businesses.

## 🚀 Quick Start

**Windows Users:**
```bash
# Double-click start.bat or run in Command Prompt
start.bat
```

**Manual Setup:**

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- PostgreSQL (optional - SQLite used by default)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm install @tanstack/react-query @types/react-router-dom
npm start
```

## 🌐 Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000  
- **API Documentation**: http://localhost:8000/docs
- **Interactive API**: http://localhost:8000/redoc

## 🔧 Features

### ✅ **Implemented (Production Ready)**
- 🔐 **Authentication**: JWT-based login/registration
- 📊 **Sales Analytics**: Revenue tracking, growth analysis, forecasting with Prophet ML
- 📦 **Inventory Management**: Stock tracking, low stock alerts, demand forecasting
- 👥 **Employee Management**: Staff scheduling, payroll calculations
- 📢 **Marketing Campaigns**: AI-powered content generation for email, SMS, social media
- 💰 **Financial Management**: Expense tracking, profit/loss analysis, PDF/Excel reports
- 🤖 **AI Assistant**: Intelligent business insights and recommendations
- 💻 **Dashboard**: Comprehensive business metrics and insights
- 📱 **Mobile-First Design**: Responsive UI with Tailwind CSS

### 🔄 **Future Enhancements**
- 🌤️ **Weather Integration**: Business impact analysis
- 🎯 **Advanced Analytics**: Predictive modeling and trend analysis
- 📈 **Performance Optimization**: Caching and database optimization
- 🔌 **Third-party Integrations**: POS systems, accounting software

## 📁 Project Structure

```
businesspilot-ai/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/v1/      # API endpoints
│   │   ├── core/        # Configuration & security
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── services/    # Business logic
│   ├── main.py          # FastAPI app
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Main pages
│   │   ├── services/    # API services
│   │   ├── store/       # State management
│   │   └── types/       # TypeScript types
│   └── package.json
└── start.bat           # Windows startup script
```

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: Database ORM
- **PostgreSQL**: Database (SQLite for development)
- **JWT**: Authentication
- **Prophet**: Sales forecasting
- **Pydantic**: Data validation

### Frontend  
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Query**: Data fetching
- **Zustand**: State management
- **React Hook Form**: Form handling

## 📊 Business Intelligence Features

### Sales Analytics
- Revenue tracking and growth analysis
- Sales forecasting using Prophet ML
- Top products and performance metrics
- Customer transaction history

### Inventory Management
- Real-time stock levels
- Low stock alerts and reorder suggestions
- Demand forecasting based on sales history
- Category-based organization

### Employee Management
- Smart scheduling based on predicted sales
- Payroll calculations and time tracking
- Performance metrics and reporting
- Shift management and optimization

## 🔐 Security

- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- SQL injection prevention

## 🚦 Development Status

| Module | Backend | Frontend | Status |
|--------|---------|----------|---------|
| Authentication | ✅ | ✅ | Complete |
| Dashboard | ✅ | ✅ | Complete |
| Sales | ✅ | ✅ | Complete |
| Inventory | ✅ | ✅ | Complete |
| Employees | ✅ | ✅ | Complete |
| Marketing | ✅ | ✅ | Complete |
| Finance | ✅ | ✅ | Complete |
| AI Assistant | ✅ | ✅ | Complete |

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests  
cd frontend
npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Backend: Change port in `uvicorn main:app --reload --port 8001`
   - Frontend: Set `PORT=3001` in frontend/.env

2. **Database connection issues**
   - Ensure PostgreSQL is running
   - Check database credentials in backend/app/core/config.py

3. **Module not found errors**
   - Ensure virtual environment is activated
   - Reinstall dependencies: `pip install -r requirements.txt`

4. **CORS issues**
   - Check frontend URL in backend CORS settings
   - Verify API endpoints are accessible

## 📈 Performance

- **Backend**: FastAPI with async/await for high performance
- **Frontend**: React 18 with optimized rendering
- **Database**: Indexed queries for fast data retrieval
- **Caching**: Redis for session management (optional)

## 🔜 Roadmap

### Phase 1 (Current)
- ✅ Core business operations
- ✅ User authentication
- ✅ Basic analytics

### Phase 2 (Next)
- 🔄 AI-powered insights
- 🔄 Marketing automation
- 🔄 Advanced financial reports

### Phase 3 (Future)
- 📱 Mobile app
- 🌐 Multi-tenant support
- 🔌 Third-party integrations

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for small businesses**