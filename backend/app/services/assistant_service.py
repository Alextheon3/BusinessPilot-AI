from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.models.assistant import ChatHistory
from app.schemas.assistant import ChatRequest, ChatResponse
import json
import re


class AssistantService:
    def __init__(self, db: Session):
        self.db = db
        self.business_context = {}
        self._initialize_business_context()

    def _initialize_business_context(self):
        """Initialize business context with current data"""
        try:
            # Get recent sales data
            sales_data = self._get_sales_context()
            inventory_data = self._get_inventory_context()
            employee_data = self._get_employee_context()
            
            self.business_context = {
                "sales": sales_data,
                "inventory": inventory_data,
                "employees": employee_data,
                "last_updated": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error initializing business context: {e}")
            self.business_context = {"last_updated": datetime.now().isoformat()}

    def create_chat_message(self, chat_request: ChatRequest) -> ChatHistory:
        """Create a new chat message and generate AI response"""
        
        # Generate AI response
        ai_response = self._generate_ai_response(chat_request.message)
        
        # Store chat message
        db_message = ChatHistory(
            message=chat_request.message,
            response=ai_response["response"]
        )
        self.db.add(db_message)
        self.db.commit()
        self.db.refresh(db_message)
        
        return db_message

    def get_chat_history(self, skip: int = 0, limit: int = 50) -> List[ChatHistory]:
        """Get chat history"""
        return self.db.query(ChatHistory).order_by(desc(ChatHistory.created_at)).offset(skip).limit(limit).all()

    def get_chat_message(self, message_id: int) -> Optional[ChatHistory]:
        """Get specific chat message"""
        return self.db.query(ChatHistory).filter(ChatHistory.id == message_id).first()

    def delete_chat_message(self, message_id: int) -> bool:
        """Delete a chat message"""
        db_message = self.get_chat_message(message_id)
        if not db_message:
            return False
        
        self.db.delete(db_message)
        self.db.commit()
        return True

    def _generate_ai_response(self, user_message: str) -> Dict[str, Any]:
        """Generate AI response based on user message"""
        
        # Analyze the message to determine intent
        intent = self._analyze_message_intent(user_message)
        
        # Generate response based on intent
        if intent == "sales_inquiry":
            return self._handle_sales_inquiry(user_message)
        elif intent == "inventory_inquiry":
            return self._handle_inventory_inquiry(user_message)
        elif intent == "employee_inquiry":
            return self._handle_employee_inquiry(user_message)
        elif intent == "financial_inquiry":
            return self._handle_financial_inquiry(user_message)
        elif intent == "marketing_inquiry":
            return self._handle_marketing_inquiry(user_message)
        elif intent == "general_business":
            return self._handle_general_business_inquiry(user_message)
        else:
            return self._handle_general_inquiry(user_message)

    def _analyze_message_intent(self, message: str) -> str:
        """Analyze message to determine user intent"""
        
        message_lower = message.lower()
        
        # Sales-related keywords
        sales_keywords = ["sales", "revenue", "customers", "transactions", "selling", "profit", "income"]
        if any(keyword in message_lower for keyword in sales_keywords):
            return "sales_inquiry"
        
        # Inventory-related keywords
        inventory_keywords = ["inventory", "stock", "products", "items", "supplies", "reorder"]
        if any(keyword in message_lower for keyword in inventory_keywords):
            return "inventory_inquiry"
        
        # Employee-related keywords
        employee_keywords = ["employees", "staff", "workers", "schedule", "payroll", "team"]
        if any(keyword in message_lower for keyword in employee_keywords):
            return "employee_inquiry"
        
        # Financial keywords
        financial_keywords = ["expenses", "costs", "budget", "financial", "money", "cash flow"]
        if any(keyword in message_lower for keyword in financial_keywords):
            return "financial_inquiry"
        
        # Marketing keywords
        marketing_keywords = ["marketing", "campaign", "promotion", "advertising", "customers"]
        if any(keyword in message_lower for keyword in marketing_keywords):
            return "marketing_inquiry"
        
        # Business strategy keywords
        business_keywords = ["business", "strategy", "growth", "performance", "analytics"]
        if any(keyword in message_lower for keyword in business_keywords):
            return "general_business"
        
        return "general"

    def _handle_sales_inquiry(self, message: str) -> Dict[str, Any]:
        """Handle sales-related inquiries"""
        
        sales_data = self.business_context.get("sales", {})
        
        # Check for specific sales questions
        if "best selling" in message.lower() or "top product" in message.lower():
            top_products = sales_data.get("top_products", [])
            if top_products:
                response = f"Your best-selling products are:\n"
                for i, product in enumerate(top_products[:3], 1):
                    response += f"{i}. {product['name']} - ${product['revenue']:.2f} revenue\n"
            else:
                response = "I don't have enough sales data to identify your best-selling products yet."
        
        elif "revenue" in message.lower() or "sales total" in message.lower():
            total_revenue = sales_data.get("total_revenue", 0)
            total_sales = sales_data.get("total_sales", 0)
            response = f"Your recent sales performance:\n• Total Revenue: ${total_revenue:.2f}\n• Total Sales: {total_sales}\n• Average Sale: ${total_revenue/total_sales:.2f}" if total_sales > 0 else f"Total Revenue: ${total_revenue:.2f}"
        
        elif "growth" in message.lower() or "trend" in message.lower():
            growth_rate = sales_data.get("growth_rate", 0)
            if growth_rate > 0:
                response = f"Great news! Your sales are growing at {growth_rate:.1f}% compared to the previous period."
            elif growth_rate < 0:
                response = f"Your sales have declined by {abs(growth_rate):.1f}% compared to the previous period. Consider reviewing your marketing strategy."
            else:
                response = "Your sales are stable compared to the previous period."
        
        else:
            response = "I can help you with sales analytics, revenue tracking, product performance, and growth trends. What specific sales information would you like to know?"
        
        return {
            "response": response,
            "suggestions": [
                "What are my best-selling products?",
                "Show me my sales trends",
                "How is my revenue performing?",
                "What's my average sale amount?"
            ]
        }

    def _handle_inventory_inquiry(self, message: str) -> Dict[str, Any]:
        """Handle inventory-related inquiries"""
        
        inventory_data = self.business_context.get("inventory", {})
        
        if "low stock" in message.lower() or "running out" in message.lower():
            low_stock_items = inventory_data.get("low_stock_items", [])
            if low_stock_items:
                response = f"You have {len(low_stock_items)} items running low:\n"
                for item in low_stock_items[:5]:
                    response += f"• {item['name']} - Only {item['quantity']} left (min: {item['min_level']})\n"
            else:
                response = "Great! No items are currently running low on stock."
        
        elif "total inventory" in message.lower() or "inventory value" in message.lower():
            total_items = inventory_data.get("total_items", 0)
            total_value = inventory_data.get("total_value", 0)
            response = f"Inventory Summary:\n• Total Items: {total_items}\n• Total Value: ${total_value:.2f}"
        
        elif "reorder" in message.lower() or "purchase" in message.lower():
            reorder_suggestions = inventory_data.get("reorder_suggestions", [])
            if reorder_suggestions:
                response = f"Reorder Suggestions:\n"
                for item in reorder_suggestions[:3]:
                    response += f"• {item['name']} - Suggested quantity: {item['suggested_quantity']}\n"
            else:
                response = "No immediate reorder suggestions. Your inventory levels look good!"
        
        else:
            response = "I can help you with inventory management, stock levels, reorder suggestions, and inventory valuation. What would you like to know?"
        
        return {
            "response": response,
            "suggestions": [
                "What items are low in stock?",
                "Show me inventory value",
                "What should I reorder?",
                "How many products do I have?"
            ]
        }

    def _handle_employee_inquiry(self, message: str) -> Dict[str, Any]:
        """Handle employee-related inquiries"""
        
        employee_data = self.business_context.get("employees", {})
        
        if "payroll" in message.lower() or "labor cost" in message.lower():
            total_payroll = employee_data.get("total_payroll", 0)
            total_hours = employee_data.get("total_hours", 0)
            response = f"Payroll Summary:\n• Total Payroll Cost: ${total_payroll:.2f}\n• Total Hours Worked: {total_hours:.1f}\n• Average Hourly Rate: ${total_payroll/total_hours:.2f}" if total_hours > 0 else f"Total Payroll Cost: ${total_payroll:.2f}"
        
        elif "schedule" in message.lower() or "shifts" in message.lower():
            total_employees = employee_data.get("total_employees", 0)
            active_employees = employee_data.get("active_employees", 0)
            response = f"Employee Overview:\n• Total Employees: {total_employees}\n• Active Employees: {active_employees}\n• I can help you create optimized schedules based on your sales patterns."
        
        elif "performance" in message.lower() or "productivity" in message.lower():
            response = "I can analyze employee performance based on hours worked and sales correlation. Would you like me to generate a performance report?"
        
        else:
            response = "I can help you with employee scheduling, payroll analysis, performance tracking, and workforce optimization. What would you like to know?"
        
        return {
            "response": response,
            "suggestions": [
                "What's my total payroll cost?",
                "How many employees do I have?",
                "Help me optimize scheduling",
                "Show employee performance"
            ]
        }

    def _handle_financial_inquiry(self, message: str) -> Dict[str, Any]:
        """Handle financial inquiries"""
        
        if "profit" in message.lower() or "expenses" in message.lower():
            # Get recent financial data
            financial_summary = self._get_financial_summary()
            
            profit_loss = financial_summary.get("profit_loss", 0)
            total_expenses = financial_summary.get("total_expenses", 0)
            
            if profit_loss > 0:
                response = f"Financial Health:\n• Profit: ${profit_loss:.2f}\n• Total Expenses: ${total_expenses:.2f}\n• Your business is profitable! 📈"
            else:
                response = f"Financial Health:\n• Loss: ${abs(profit_loss):.2f}\n• Total Expenses: ${total_expenses:.2f}\n• Consider reviewing expenses to improve profitability."
        
        elif "cash flow" in message.lower():
            response = "I can analyze your cash flow patterns and provide insights on improving financial management. Would you like a detailed cash flow analysis?"
        
        elif "budget" in message.lower():
            response = "I can help you create budgets, track expenses by category, and provide recommendations for cost optimization. What specific budget information do you need?"
        
        else:
            response = "I can help you with financial analysis, profit/loss tracking, expense management, and budget planning. What financial insights would you like?"
        
        return {
            "response": response,
            "suggestions": [
                "What's my profit this month?",
                "Show me expense breakdown",
                "How's my cash flow?",
                "Help me create a budget"
            ]
        }

    def _handle_marketing_inquiry(self, message: str) -> Dict[str, Any]:
        """Handle marketing inquiries"""
        
        if "campaign" in message.lower() or "promotion" in message.lower():
            response = "I can help you create targeted marketing campaigns based on your sales data and customer patterns. Would you like me to suggest some campaign ideas?"
        
        elif "customer" in message.lower() or "retention" in message.lower():
            response = "I can analyze customer behavior and suggest retention strategies. What specific customer insights would you like?"
        
        elif "social media" in message.lower():
            response = "I can generate social media content ideas based on your top products and business performance. Would you like some post suggestions?"
        
        else:
            response = "I can help you with marketing campaigns, customer analysis, promotional strategies, and content creation. What marketing support do you need?"
        
        return {
            "response": response,
            "suggestions": [
                "Create a promotional campaign",
                "Generate social media content",
                "Analyze customer behavior",
                "Suggest marketing strategies"
            ]
        }

    def _handle_general_business_inquiry(self, message: str) -> Dict[str, Any]:
        """Handle general business inquiries"""
        
        business_insights = self._get_business_insights()
        
        if "performance" in message.lower() or "overview" in message.lower():
            response = f"Business Performance Overview:\n{business_insights}"
        
        elif "recommendations" in message.lower() or "suggestions" in message.lower():
            recommendations = self._get_business_recommendations()
            response = f"Business Recommendations:\n{recommendations}"
        
        elif "growth" in message.lower() or "improve" in message.lower():
            response = "Based on your data, here are growth opportunities:\n• Focus on promoting your best-selling products\n• Optimize inventory levels to reduce holding costs\n• Consider staff scheduling optimization\n• Implement targeted marketing campaigns"
        
        else:
            response = "I'm your AI business assistant! I can help you with sales analysis, inventory management, employee scheduling, financial insights, and marketing strategies. What would you like to explore?"
        
        return {
            "response": response,
            "suggestions": [
                "Show me business performance",
                "What are my growth opportunities?",
                "Give me recommendations",
                "How can I improve profitability?"
            ]
        }

    def _handle_general_inquiry(self, message: str) -> Dict[str, Any]:
        """Handle general inquiries"""
        
        response = "I'm your AI business assistant for BusinessPilot! I can help you with:\n\n📊 Sales Analytics & Revenue Tracking\n📦 Inventory Management & Stock Alerts\n👥 Employee Scheduling & Payroll\n💰 Financial Analysis & Budgeting\n📢 Marketing Campaigns & Customer Insights\n\nWhat would you like to explore?"
        
        return {
            "response": response,
            "suggestions": [
                "Show me my sales performance",
                "What inventory needs attention?",
                "How are my employees performing?",
                "What's my financial status?"
            ]
        }

    def _get_sales_context(self) -> Dict[str, Any]:
        """Get sales context for AI responses"""
        
        try:
            from app.models.sales import Sale, SaleItem
            
            # Get last 30 days of sales
            thirty_days_ago = datetime.now() - timedelta(days=30)
            
            sales = self.db.query(Sale).filter(Sale.created_at >= thirty_days_ago).all()
            
            total_revenue = sum(sale.total_amount for sale in sales)
            total_sales = len(sales)
            
            # Get top products
            top_products = self.db.query(
                SaleItem.product_name,
                func.sum(SaleItem.quantity).label('total_quantity'),
                func.sum(SaleItem.total_price).label('total_revenue')
            ).join(Sale).filter(
                Sale.created_at >= thirty_days_ago
            ).group_by(SaleItem.product_name).order_by(
                desc('total_revenue')
            ).limit(5).all()
            
            return {
                "total_revenue": total_revenue,
                "total_sales": total_sales,
                "average_sale": total_revenue / total_sales if total_sales > 0 else 0,
                "top_products": [
                    {
                        "name": product.product_name,
                        "quantity": product.total_quantity,
                        "revenue": product.total_revenue
                    }
                    for product in top_products
                ]
            }
        except Exception as e:
            print(f"Error getting sales context: {e}")
            return {}

    def _get_inventory_context(self) -> Dict[str, Any]:
        """Get inventory context for AI responses"""
        
        try:
            from app.models.inventory import InventoryItem
            
            items = self.db.query(InventoryItem).all()
            
            total_items = len(items)
            total_value = sum(item.quantity * item.cost_price for item in items)
            
            # Get low stock items
            low_stock_items = [
                {
                    "name": item.name,
                    "quantity": item.quantity,
                    "min_level": item.min_stock_level
                }
                for item in items
                if item.quantity <= item.min_stock_level
            ]
            
            return {
                "total_items": total_items,
                "total_value": total_value,
                "low_stock_items": low_stock_items
            }
        except Exception as e:
            print(f"Error getting inventory context: {e}")
            return {}

    def _get_employee_context(self) -> Dict[str, Any]:
        """Get employee context for AI responses"""
        
        try:
            from app.models.employee import Employee, Schedule
            
            employees = self.db.query(Employee).all()
            
            # Get recent schedule data
            thirty_days_ago = datetime.now() - timedelta(days=30)
            schedules = self.db.query(Schedule).filter(
                Schedule.date >= thirty_days_ago.date()
            ).all()
            
            total_hours = sum(schedule.hours for schedule in schedules)
            total_payroll = sum(schedule.hours * schedule.employee.hourly_rate for schedule in schedules)
            
            return {
                "total_employees": len(employees),
                "active_employees": len([e for e in employees if e.is_active]),
                "total_hours": total_hours,
                "total_payroll": total_payroll
            }
        except Exception as e:
            print(f"Error getting employee context: {e}")
            return {}

    def _get_financial_summary(self) -> Dict[str, Any]:
        """Get financial summary for AI responses"""
        
        try:
            from app.models.finance import Expense
            from app.models.sales import Sale
            
            thirty_days_ago = datetime.now() - timedelta(days=30)
            
            # Get revenue
            sales = self.db.query(Sale).filter(Sale.created_at >= thirty_days_ago).all()
            total_revenue = sum(sale.total_amount for sale in sales)
            
            # Get expenses
            expenses = self.db.query(Expense).filter(
                Expense.date >= thirty_days_ago.date()
            ).all()
            total_expenses = sum(expense.amount for expense in expenses)
            
            return {
                "total_revenue": total_revenue,
                "total_expenses": total_expenses,
                "profit_loss": total_revenue - total_expenses
            }
        except Exception as e:
            print(f"Error getting financial summary: {e}")
            return {}

    def _get_business_insights(self) -> str:
        """Get business insights summary"""
        
        sales_data = self.business_context.get("sales", {})
        inventory_data = self.business_context.get("inventory", {})
        employee_data = self.business_context.get("employees", {})
        
        insights = []
        
        # Sales insights
        total_revenue = sales_data.get("total_revenue", 0)
        total_sales = sales_data.get("total_sales", 0)
        if total_sales > 0:
            insights.append(f"📊 ${total_revenue:.2f} revenue from {total_sales} sales")
        
        # Inventory insights
        low_stock_count = len(inventory_data.get("low_stock_items", []))
        if low_stock_count > 0:
            insights.append(f"📦 {low_stock_count} items need restocking")
        
        # Employee insights
        total_employees = employee_data.get("total_employees", 0)
        if total_employees > 0:
            insights.append(f"👥 {total_employees} employees on your team")
        
        return "\n".join(insights) if insights else "Getting started with your business analytics..."

    def _get_business_recommendations(self) -> str:
        """Get business recommendations"""
        
        recommendations = []
        
        sales_data = self.business_context.get("sales", {})
        inventory_data = self.business_context.get("inventory", {})
        
        # Top product recommendations
        top_products = sales_data.get("top_products", [])
        if top_products:
            recommendations.append(f"💡 Focus marketing on {top_products[0]['name']} - your top seller")
        
        # Inventory recommendations
        low_stock_count = len(inventory_data.get("low_stock_items", []))
        if low_stock_count > 0:
            recommendations.append(f"🔄 Restock {low_stock_count} items to avoid stockouts")
        
        # General recommendations
        recommendations.extend([
            "📈 Monitor sales trends for seasonal patterns",
            "💰 Track expenses to maintain healthy profit margins",
            "🎯 Use customer data for targeted marketing"
        ])
        
        return "\n".join(recommendations)

    def get_business_summary(self) -> Dict[str, Any]:
        """Get comprehensive business summary"""
        
        # Update business context
        self._initialize_business_context()
        
        return {
            "insights": self._get_business_insights(),
            "recommendations": self._get_business_recommendations(),
            "context": self.business_context,
            "last_updated": datetime.now().isoformat()
        }

    def get_suggested_questions(self) -> List[str]:
        """Get suggested questions for users"""
        
        return [
            "What are my best-selling products this month?",
            "Which items are running low in stock?",
            "How much did I spend on expenses this week?",
            "What's my profit margin?",
            "How many hours did my employees work?",
            "Should I run a promotion?",
            "What's my cash flow looking like?",
            "How can I improve my business performance?",
            "What marketing campaigns should I create?",
            "Show me my business overview"
        ]