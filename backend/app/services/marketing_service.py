from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.models.marketing import Campaign
from app.schemas.marketing import CampaignCreate, CampaignUpdate
import openai
import json
import re


class MarketingService:
    def __init__(self, db: Session):
        self.db = db
        # Initialize OpenAI client if API key is available
        try:
            from app.core.config import settings
            if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
                openai.api_key = settings.OPENAI_API_KEY
        except:
            pass

    def create_campaign(self, campaign_create: CampaignCreate) -> Campaign:
        db_campaign = Campaign(
            name=campaign_create.name,
            type=campaign_create.type,
            content=campaign_create.content,
            target_audience=campaign_create.target_audience,
            status="draft",
            scheduled_date=campaign_create.scheduled_date
        )
        self.db.add(db_campaign)
        self.db.commit()
        self.db.refresh(db_campaign)
        return db_campaign

    def get_campaign(self, campaign_id: int) -> Optional[Campaign]:
        return self.db.query(Campaign).filter(Campaign.id == campaign_id).first()

    def get_campaigns(self, skip: int = 0, limit: int = 100, 
                     status: Optional[str] = None,
                     campaign_type: Optional[str] = None) -> List[Campaign]:
        query = self.db.query(Campaign)
        
        if status:
            query = query.filter(Campaign.status == status)
        
        if campaign_type:
            query = query.filter(Campaign.type == campaign_type)
        
        return query.order_by(desc(Campaign.created_at)).offset(skip).limit(limit).all()

    def update_campaign(self, campaign_id: int, campaign_update: CampaignUpdate) -> Optional[Campaign]:
        db_campaign = self.get_campaign(campaign_id)
        if not db_campaign:
            return None
        
        update_data = campaign_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_campaign, field, value)
        
        self.db.commit()
        self.db.refresh(db_campaign)
        return db_campaign

    def delete_campaign(self, campaign_id: int) -> bool:
        db_campaign = self.get_campaign(campaign_id)
        if not db_campaign:
            return False
        
        self.db.delete(db_campaign)
        self.db.commit()
        return True

    def send_campaign(self, campaign_id: int) -> bool:
        db_campaign = self.get_campaign(campaign_id)
        if not db_campaign:
            return False
        
        # Update campaign status
        db_campaign.status = "sent"
        db_campaign.sent_date = datetime.now()
        self.db.commit()
        
        # Here you would integrate with email/SMS services
        # For now, we'll just mark it as sent
        return True

    def generate_campaign_content(self, campaign_type: str, business_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered marketing content based on business context"""
        
        # Get business insights from sales and inventory data
        sales_data = self._get_sales_insights()
        inventory_data = self._get_inventory_insights()
        
        # Create context for AI
        context = {
            "business_type": business_context.get("business_type", "retail"),
            "top_products": sales_data.get("top_products", []),
            "seasonal_trends": sales_data.get("seasonal_trends", []),
            "low_stock_items": inventory_data.get("low_stock", []),
            "campaign_type": campaign_type
        }
        
        # Generate different types of content
        if campaign_type == "email":
            return self._generate_email_content(context)
        elif campaign_type == "sms":
            return self._generate_sms_content(context)
        elif campaign_type == "social":
            return self._generate_social_content(context)
        elif campaign_type == "promotion":
            return self._generate_promotion_content(context)
        else:
            return self._generate_general_content(context)

    def _generate_email_content(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate email marketing content"""
        
        # Create different email templates based on context
        templates = {
            "product_promotion": {
                "subject": "🔥 Special Offer on Your Favorite Items!",
                "content": self._create_product_promotion_email(context),
                "call_to_action": "Shop Now"
            },
            "seasonal": {
                "subject": "🌟 Seasonal Specials Just for You!",
                "content": self._create_seasonal_email(context),
                "call_to_action": "Explore Deals"
            },
            "restock": {
                "subject": "📦 Your Favorites Are Back in Stock!",
                "content": self._create_restock_email(context),
                "call_to_action": "Shop Before It's Gone"
            }
        }
        
        # Select appropriate template
        if context.get("low_stock_items"):
            return templates["restock"]
        elif context.get("seasonal_trends"):
            return templates["seasonal"]
        else:
            return templates["product_promotion"]

    def _generate_sms_content(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate SMS marketing content"""
        
        top_product = context.get("top_products", [{"name": "featured items"}])[0]
        
        sms_templates = [
            f"🎉 Flash Sale! 20% off {top_product['name']}. Limited time only! Reply STOP to opt out.",
            f"💝 Exclusive offer: Buy 2 get 1 FREE on {top_product['name']}. Valid today only!",
            f"🚨 Last chance! {top_product['name']} - 25% off expires tonight. Don't miss out!",
            f"🌟 New arrivals + special discount on {top_product['name']}. Shop now!"
        ]
        
        import random
        return {
            "content": random.choice(sms_templates),
            "character_count": len(random.choice(sms_templates)),
            "estimated_cost": 0.05  # SMS cost estimate
        }

    def _generate_social_content(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate social media content"""
        
        business_type = context.get("business_type", "business")
        top_products = context.get("top_products", [])
        
        social_posts = {
            "instagram": {
                "caption": f"✨ Customer favorites this week! Our {business_type} is proud to feature these amazing products. Which one is your go-to? 💫 #SmallBusiness #CustomerFavorites #QualityProducts",
                "hashtags": ["#SmallBusiness", "#Local", "#CustomerFavorites", "#QualityProducts"],
                "image_suggestion": "Product showcase or customer testimonial"
            },
            "facebook": {
                "content": f"🎯 This week's top performers! Thanks to our amazing customers for making these items our best sellers. What's your favorite? Let us know in the comments! 👇",
                "engagement_tip": "Ask questions to encourage comments and shares"
            },
            "twitter": {
                "content": f"📈 Weekly highlights: These are the products our customers can't get enough of! What's driving your choices? #CustomerChoice #SmallBiz",
                "character_count": 140
            }
        }
        
        return social_posts

    def _generate_promotion_content(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate promotional campaign content"""
        
        promotions = [
            {
                "type": "percentage_discount",
                "discount": "20%",
                "title": "Flash Sale Weekend",
                "description": "Save 20% on all items this weekend only!",
                "urgency": "Limited time offer"
            },
            {
                "type": "buy_one_get_one",
                "title": "BOGO Special",
                "description": "Buy one, get one 50% off on selected items",
                "urgency": "While supplies last"
            },
            {
                "type": "bundle_deal",
                "title": "Bundle & Save",
                "description": "Save 15% when you buy 3 or more items",
                "urgency": "Perfect for gift giving"
            }
        ]
        
        import random
        selected_promo = random.choice(promotions)
        
        return {
            "promotion": selected_promo,
            "email_content": self._create_promotion_email(selected_promo),
            "social_content": self._create_promotion_social(selected_promo)
        }

    def _create_product_promotion_email(self, context: Dict[str, Any]) -> str:
        """Create product promotion email content"""
        
        top_products = context.get("top_products", [])
        if not top_products:
            return "Check out our amazing selection of products with special offers just for you!"
        
        product_list = "\n".join([f"• {product.get('name', 'Featured Item')}" for product in top_products[:3]])
        
        return f"""
        Dear Valued Customer,
        
        We're excited to share some special offers on items that our customers love most!
        
        🌟 Featured This Week:
        {product_list}
        
        Enjoy exclusive savings on these customer favorites. Don't miss out on these limited-time offers!
        
        Best regards,
        Your Store Team
        """

    def _create_seasonal_email(self, context: Dict[str, Any]) -> str:
        """Create seasonal email content"""
        
        current_month = datetime.now().month
        season = self._get_season(current_month)
        
        return f"""
        Dear Customer,
        
        {season} is here, and we have everything you need to make the most of this season!
        
        🍂 Seasonal Highlights:
        • Perfect products for {season.lower()} activities
        • Limited-time seasonal specials
        • New arrivals perfect for the season
        
        Shop now and enjoy the best of what {season.lower()} has to offer!
        
        Warm regards,
        Your Store Team
        """

    def _create_restock_email(self, context: Dict[str, Any]) -> str:
        """Create restock notification email"""
        
        return """
        Great News!
        
        📦 Your favorite items are back in stock!
        
        We know you've been waiting, and we're excited to let you know that popular items are now available again.
        
        • High-demand products restocked
        • Limited quantities available
        • Don't wait - these items sell fast!
        
        Shop now before they're gone again!
        
        Happy Shopping,
        Your Store Team
        """

    def _create_promotion_email(self, promotion: Dict[str, Any]) -> str:
        """Create promotion email content"""
        
        return f"""
        🎉 {promotion['title']}
        
        {promotion['description']}
        
        ⏰ {promotion['urgency']}
        
        Don't miss out on these incredible savings! Shop now and save on your favorite items.
        
        Terms and conditions apply. Offer valid for a limited time only.
        
        Happy Savings,
        Your Store Team
        """

    def _create_promotion_social(self, promotion: Dict[str, Any]) -> str:
        """Create promotion social media content"""
        
        return f"🚨 {promotion['title']}! {promotion['description']} {promotion['urgency']} #Sale #SpecialOffer #LimitedTime"

    def _get_season(self, month: int) -> str:
        """Get current season based on month"""
        
        if month in [12, 1, 2]:
            return "Winter"
        elif month in [3, 4, 5]:
            return "Spring"
        elif month in [6, 7, 8]:
            return "Summer"
        else:
            return "Fall"

    def _get_sales_insights(self) -> Dict[str, Any]:
        """Get sales data for marketing context"""
        
        try:
            from app.models.sales import Sale, SaleItem
            
            # Get top products from last 30 days
            thirty_days_ago = datetime.now() - timedelta(days=30)
            
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
            print(f"Error getting sales insights: {e}")
            return {"top_products": []}

    def _get_inventory_insights(self) -> Dict[str, Any]:
        """Get inventory data for marketing context"""
        
        try:
            from app.models.inventory import InventoryItem
            
            # Get low stock items
            low_stock = self.db.query(InventoryItem).filter(
                InventoryItem.quantity <= InventoryItem.min_stock_level
            ).all()
            
            return {
                "low_stock": [
                    {
                        "name": item.name,
                        "quantity": item.quantity,
                        "min_level": item.min_stock_level
                    }
                    for item in low_stock
                ]
            }
        except Exception as e:
            print(f"Error getting inventory insights: {e}")
            return {"low_stock": []}

    def _generate_general_content(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate general marketing content"""
        
        return {
            "subject": "Special Offers Just for You!",
            "content": "We have amazing deals and products that we think you'll love. Check out our latest offerings!",
            "call_to_action": "Shop Now",
            "type": "general"
        }

    def get_campaign_analytics(self, campaign_id: int) -> Dict[str, Any]:
        """Get campaign performance analytics"""
        
        campaign = self.get_campaign(campaign_id)
        if not campaign:
            return {}
        
        # Mock analytics data - in real implementation, this would come from email/SMS service
        return {
            "campaign_id": campaign_id,
            "campaign_name": campaign.name,
            "sent_date": campaign.sent_date.isoformat() if campaign.sent_date else None,
            "status": campaign.status,
            "estimated_reach": 100,  # Mock data
            "open_rate": 0.25,
            "click_rate": 0.05,
            "conversion_rate": 0.02,
            "total_sends": 100,
            "total_opens": 25,
            "total_clicks": 5,
            "total_conversions": 2
        }

    def get_marketing_suggestions(self, business_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get AI-powered marketing suggestions"""
        
        sales_data = self._get_sales_insights()
        inventory_data = self._get_inventory_insights()
        
        suggestions = []
        
        # Suggest promotions for top products
        if sales_data.get("top_products"):
            suggestions.append({
                "type": "promotion",
                "title": "Promote Best Sellers",
                "description": "Create a campaign featuring your top-selling products",
                "urgency": "medium",
                "estimated_impact": "high"
            })
        
        # Suggest restock notifications
        if inventory_data.get("low_stock"):
            suggestions.append({
                "type": "restock",
                "title": "Restock Notifications",
                "description": "Notify customers when popular items are back in stock",
                "urgency": "high",
                "estimated_impact": "medium"
            })
        
        # Suggest seasonal campaigns
        current_month = datetime.now().month
        season = self._get_season(current_month)
        suggestions.append({
            "type": "seasonal",
            "title": f"{season} Campaign",
            "description": f"Create a {season.lower()}-themed marketing campaign",
            "urgency": "low",
            "estimated_impact": "medium"
        })
        
        return suggestions

    def schedule_campaign(self, campaign_id: int, scheduled_date: datetime) -> bool:
        """Schedule a campaign for future sending"""
        
        db_campaign = self.get_campaign(campaign_id)
        if not db_campaign:
            return False
        
        db_campaign.scheduled_date = scheduled_date
        db_campaign.status = "scheduled"
        self.db.commit()
        
        return True

    def get_campaign_templates(self) -> Dict[str, Any]:
        """Get available campaign templates"""
        
        return {
            "email": {
                "promotion": "Product promotion email template",
                "newsletter": "Monthly newsletter template",
                "seasonal": "Seasonal campaign template",
                "restock": "Restock notification template"
            },
            "sms": {
                "flash_sale": "Flash sale SMS template",
                "reminder": "Appointment reminder template",
                "promotion": "Promotional SMS template"
            },
            "social": {
                "product_showcase": "Product showcase post",
                "customer_testimonial": "Customer testimonial post",
                "behind_the_scenes": "Behind the scenes content"
            }
        }