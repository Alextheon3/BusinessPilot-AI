from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime, timedelta
import json
import uuid

from app.core.database import get_db
from app.services.ai_supplier_marketplace import (
    ai_supplier_marketplace,
    SupplierCategory,
    SupplierStatus,
    QualityRating,
    RiskLevel,
    ensure_sample_data_initialized
)
from app.services.auth_service import AuthService
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/suppliers/register")
async def register_supplier(
    supplier_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Register a new supplier in the marketplace
    """
    try:
        # Add user context
        supplier_data["registered_by"] = current_user.id
        
        # Register supplier
        supplier_id = await ai_supplier_marketplace.add_supplier(supplier_data)
        
        logger.info(f"Supplier registered by user {current_user.id}: {supplier_id}")
        
        return {
            "supplier_id": supplier_id,
            "status": "registered",
            "message": "Ο προμηθευτής καταχωρήθηκε επιτυχώς και περιμένει έγκριση",
            "next_steps": [
                "Αναμονή επαλήθευσης εγγράφων",
                "Έλεγχος συμμόρφωσης",
                "Ενεργοποίηση προφίλ"
            ]
        }
        
    except ValueError as e:
        logger.error(f"Validation error in supplier registration: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error registering supplier: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την καταχώρηση του προμηθευτή"
        )

@router.post("/suppliers/find")
async def find_suppliers(
    request_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Find suppliers based on requirements using AI matching
    """
    try:
        # Add user context
        request_data["user_id"] = current_user.id
        
        # Find matching suppliers
        recommendations = await ai_supplier_marketplace.find_suppliers(request_data)
        
        # Convert to serializable format
        response_recommendations = []
        for rec in recommendations:
            response_recommendations.append({
                "supplier_id": rec.supplier_id,
                "match_score": rec.match_score,
                "category": rec.category,
                "recommendation_reason": rec.recommendation_reason,
                "strengths": rec.strengths,
                "potential_concerns": rec.potential_concerns,
                "estimated_cost": rec.estimated_cost,
                "estimated_timeline": rec.estimated_timeline,
                "risk_factors": rec.risk_factors,
                "similar_projects": rec.similar_projects,
                "negotiation_tips": rec.negotiation_tips,
                "contract_suggestions": rec.contract_suggestions,
                "greek_market_insights": rec.greek_market_insights,
                "created_at": rec.created_at.isoformat()
            })
        
        logger.info(f"Found {len(recommendations)} supplier recommendations for user {current_user.id}")
        
        return {
            "request_id": request_data.get("request_id"),
            "recommendations": response_recommendations,
            "total_found": len(response_recommendations),
            "search_criteria": {
                "category": request_data.get("category"),
                "budget_range": [request_data.get("min_budget", 0), request_data.get("max_budget", 100000)],
                "location_preference": request_data.get("location_preference"),
                "timeline": request_data.get("timeline")
            },
            "ai_insights": {
                "matching_algorithm": "hybrid_ai_matching",
                "confidence_level": 0.85,
                "market_analysis": f"Βρέθηκαν {len(recommendations)} κατάλληλοι προμηθευτές"
            }
        }
        
    except ValueError as e:
        logger.error(f"Validation error in supplier search: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error finding suppliers: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την αναζήτηση προμηθευτών"
        )

@router.get("/suppliers/{supplier_id}")
async def get_supplier_details(
    supplier_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get detailed information about a specific supplier
    """
    try:
        supplier = ai_supplier_marketplace.suppliers.get(supplier_id)
        
        if not supplier:
            raise HTTPException(
                status_code=404,
                detail="Ο προμηθευτής δεν βρέθηκε"
            )
        
        # Get supplier reviews
        supplier_reviews = [r for r in ai_supplier_marketplace.reviews.values() if r.supplier_id == supplier_id]
        
        # Convert to serializable format
        reviews_data = []
        for review in supplier_reviews:
            reviews_data.append({
                "id": review.id,
                "reviewer_name": review.reviewer_name,
                "rating": review.rating,
                "title": review.title,
                "content": review.content,
                "aspects": review.aspects,
                "verified_purchase": review.verified_purchase,
                "project_value": review.project_value,
                "would_recommend": review.would_recommend,
                "helpful_votes": review.helpful_votes,
                "created_at": review.created_at.isoformat()
            })
        
        supplier_data = {
            "id": supplier.id,
            "name": supplier.name,
            "category": supplier.category.value,
            "status": supplier.status.value,
            "contact_info": supplier.contact_info,
            "description": supplier.description,
            "specialties": supplier.specialties,
            "location": supplier.location,
            "established_year": supplier.established_year,
            "employee_count": supplier.employee_count,
            "annual_revenue": supplier.annual_revenue,
            "certifications": supplier.certifications,
            "quality_rating": supplier.quality_rating.value,
            "reliability_score": supplier.reliability_score,
            "cost_competitiveness": supplier.cost_competitiveness,
            "response_time": supplier.response_time,
            "payment_terms": supplier.payment_terms,
            "minimum_order": supplier.minimum_order,
            "capacity_utilization": supplier.capacity_utilization,
            "risk_assessment": supplier.risk_assessment.value,
            "languages": supplier.languages,
            "business_hours": supplier.business_hours,
            "website": supplier.website,
            "social_media": supplier.social_media,
            "insurance_coverage": supplier.insurance_coverage,
            "tax_compliance": supplier.tax_compliance,
            "environmental_certifications": supplier.environmental_certifications,
            "greek_market_experience": supplier.greek_market_experience,
            "created_at": supplier.created_at.isoformat(),
            "last_updated": supplier.last_updated.isoformat(),
            "reviews": reviews_data,
            "statistics": {
                "total_reviews": len(reviews_data),
                "average_rating": sum(r["rating"] for r in reviews_data) / len(reviews_data) if reviews_data else 0,
                "recommendation_rate": sum(1 for r in reviews_data if r["would_recommend"]) / len(reviews_data) if reviews_data else 0
            }
        }
        
        return supplier_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting supplier details: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση στοιχείων προμηθευτή"
        )

@router.get("/suppliers")
async def get_suppliers(
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get suppliers with filtering and pagination
    """
    try:
        # Ensure sample data is initialized
        ensure_sample_data_initialized()
        suppliers = list(ai_supplier_marketplace.suppliers.values())
        
        # Apply filters
        if category:
            suppliers = [s for s in suppliers if s.category.value == category]
        
        if location:
            suppliers = [s for s in suppliers if location.lower() in s.location.lower()]
        
        if status:
            suppliers = [s for s in suppliers if s.status.value == status]
        
        if min_rating is not None:
            suppliers = [s for s in suppliers if s.reliability_score >= min_rating]
        
        # Sort by reliability score (descending)
        suppliers.sort(key=lambda x: x.reliability_score, reverse=True)
        
        # Apply pagination
        total_count = len(suppliers)
        suppliers = suppliers[offset:offset + limit]
        
        # Convert to serializable format
        suppliers_data = []
        for supplier in suppliers:
            suppliers_data.append({
                "id": supplier.id,
                "name": supplier.name,
                "category": supplier.category.value,
                "status": supplier.status.value,
                "description": supplier.description,
                "location": supplier.location,
                "specialties": supplier.specialties,
                "quality_rating": supplier.quality_rating.value,
                "reliability_score": supplier.reliability_score,
                "cost_competitiveness": supplier.cost_competitiveness,
                "response_time": supplier.response_time,
                "languages": supplier.languages,
                "certifications": supplier.certifications,
                "greek_market_experience": supplier.greek_market_experience,
                "created_at": supplier.created_at.isoformat()
            })
        
        return {
            "suppliers": suppliers_data,
            "total_count": total_count,
            "limit": limit,
            "offset": offset,
            "filters": {
                "category": category,
                "location": location,
                "status": status,
                "min_rating": min_rating
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting suppliers: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση προμηθευτών"
        )

@router.post("/suppliers/{supplier_id}/reviews")
async def add_supplier_review(
    supplier_id: str,
    review_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Add a review for a supplier
    """
    try:
        # Check if supplier exists
        supplier = ai_supplier_marketplace.suppliers.get(supplier_id)
        if not supplier:
            raise HTTPException(
                status_code=404,
                detail="Ο προμηθευτής δεν βρέθηκε"
            )
        
        # Add reviewer information
        review_data["supplier_id"] = supplier_id
        review_data["reviewer_id"] = current_user.id
        review_data["reviewer_name"] = current_user.full_name or current_user.email
        
        # Add review
        review_id = await ai_supplier_marketplace.add_supplier_review(review_data)
        
        logger.info(f"Review added for supplier {supplier_id} by user {current_user.id}")
        
        return {
            "review_id": review_id,
            "supplier_id": supplier_id,
            "status": "added",
            "message": "Η αξιολόγηση καταχωρήθηκε επιτυχώς",
            "impact": "Η αξιολόγηση θα επηρεάσει τη συνολική βαθμολογία του προμηθευτή"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding supplier review: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την προσθήκη αξιολόγησης"
        )

@router.get("/marketplace/recommendations")
async def get_personalized_recommendations(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get personalized supplier recommendations for the user
    """
    try:
        recommendations = await ai_supplier_marketplace.get_supplier_recommendations(
            current_user.id, limit
        )
        
        return {
            "recommendations": recommendations,
            "total_count": len(recommendations),
            "personalization_level": "high" if len(recommendations) > 5 else "medium",
            "based_on": "Ιστορικό αιτημάτων και προτιμήσεις",
            "refresh_interval": "24 hours"
        }
        
    except Exception as e:
        logger.error(f"Error getting personalized recommendations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση προτάσεων"
        )

@router.get("/marketplace/statistics")
async def get_marketplace_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get marketplace statistics and insights
    """
    try:
        stats = await ai_supplier_marketplace.get_marketplace_statistics()
        
        # Add additional insights
        stats["insights"] = {
            "most_active_category": max(stats["category_distribution"].items(), key=lambda x: x[1])[0] if stats["category_distribution"] else None,
            "growth_trend": "increasing",
            "market_health": "good",
            "user_satisfaction": 4.2,
            "top_rated_suppliers": stats["verified_suppliers"] * 0.3,
            "demand_trends": {
                "technology": "increasing",
                "services": "stable",
                "manufacturing": "seasonal"
            }
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting marketplace statistics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση στατιστικών"
        )

@router.get("/marketplace/categories")
async def get_supplier_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get available supplier categories with descriptions
    """
    try:
        categories = [
            {
                "id": "manufacturing",
                "name": "Παραγωγή",
                "description": "Παραγωγή προϊόντων και κατασκευή",
                "icon": "🏭",
                "typical_projects": ["Παραγωγή προϊόντων", "Κατασκευή εξαρτημάτων", "Συναρμολόγηση"],
                "average_timeline": "15-30 ημέρες",
                "price_range": "€5,000 - €50,000"
            },
            {
                "id": "services",
                "name": "Υπηρεσίες",
                "description": "Επιχειρηματικές και επαγγελματικές υπηρεσίες",
                "icon": "🔧",
                "typical_projects": ["Συμβουλευτικές υπηρεσίες", "Υποστήριξη", "Εκπαίδευση"],
                "average_timeline": "5-15 ημέρες",
                "price_range": "€1,000 - €25,000"
            },
            {
                "id": "technology",
                "name": "Τεχνολογία",
                "description": "Λύσεις τεχνολογίας και λογισμικού",
                "icon": "💻",
                "typical_projects": ["Ανάπτυξη λογισμικού", "IT υποστήριξη", "Ψηφιακές λύσεις"],
                "average_timeline": "10-45 ημέρες",
                "price_range": "€2,000 - €75,000"
            },
            {
                "id": "logistics",
                "name": "Logistics",
                "description": "Μεταφορά, αποθήκευση και logistics",
                "icon": "🚚",
                "typical_projects": ["Μεταφορά εμπορευμάτων", "Αποθήκευση", "Διανομή"],
                "average_timeline": "1-7 ημέρες",
                "price_range": "€500 - €15,000"
            },
            {
                "id": "marketing",
                "name": "Marketing",
                "description": "Υπηρεσίες marketing και διαφήμισης",
                "icon": "📱",
                "typical_projects": ["Διαφημιστικές καμπάνιες", "Social media", "SEO"],
                "average_timeline": "7-30 ημέρες",
                "price_range": "€1,500 - €30,000"
            },
            {
                "id": "consulting",
                "name": "Συμβουλευτικές",
                "description": "Επαγγελματικές συμβουλευτικές υπηρεσίες",
                "icon": "👥",
                "typical_projects": ["Στρατηγικός σχεδιασμός", "Βελτιστοποίηση", "Ανάλυση"],
                "average_timeline": "10-60 ημέρες",
                "price_range": "€3,000 - €45,000"
            },
            {
                "id": "materials",
                "name": "Υλικά",
                "description": "Πρώτες ύλες και υλικά",
                "icon": "📦",
                "typical_projects": ["Προμήθεια υλικών", "Πρώτες ύλες", "Εξαρτήματα"],
                "average_timeline": "3-14 ημέρες",
                "price_range": "€800 - €20,000"
            },
            {
                "id": "equipment",
                "name": "Εξοπλισμός",
                "description": "Μηχανήματα και εξοπλισμός",
                "icon": "⚙️",
                "typical_projects": ["Αγορά μηχανημάτων", "Εξοπλισμός γραφείου", "Εργαλεία"],
                "average_timeline": "7-21 ημέρες",
                "price_range": "€2,000 - €60,000"
            }
        ]
        
        return {
            "categories": categories,
            "total_categories": len(categories),
            "popular_categories": ["technology", "services", "manufacturing"],
            "emerging_categories": ["consulting", "marketing"],
            "seasonal_categories": ["logistics", "materials"]
        }
        
    except Exception as e:
        logger.error(f"Error getting supplier categories: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση κατηγοριών"
        )

@router.get("/marketplace/trends")
async def get_market_trends(
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get market trends and insights
    """
    try:
        # Mock trend data - in production, calculate from actual data
        trends = {
            "period": period,
            "demand_trends": {
                "technology": {"growth": 15.2, "trend": "increasing"},
                "services": {"growth": 8.7, "trend": "stable"},
                "manufacturing": {"growth": -2.3, "trend": "decreasing"},
                "logistics": {"growth": 12.1, "trend": "increasing"},
                "marketing": {"growth": 22.5, "trend": "increasing"},
                "consulting": {"growth": 6.8, "trend": "stable"}
            },
            "price_trends": {
                "technology": {"change": 5.2, "trend": "increasing"},
                "services": {"change": 2.1, "trend": "stable"},
                "manufacturing": {"change": -1.2, "trend": "decreasing"},
                "logistics": {"change": 8.3, "trend": "increasing"},
                "marketing": {"change": 3.7, "trend": "stable"},
                "consulting": {"change": 4.1, "trend": "increasing"}
            },
            "quality_trends": {
                "average_rating": 4.2,
                "improvement_rate": 0.1,
                "certification_adoption": 0.68
            },
            "regional_insights": {
                "athens": {"activity": "high", "growth": 12.3},
                "thessaloniki": {"activity": "medium", "growth": 8.7},
                "patras": {"activity": "medium", "growth": 6.2},
                "other": {"activity": "low", "growth": 4.1}
            },
            "seasonal_patterns": {
                "Q1": {"activity_multiplier": 0.85, "demand_focus": ["technology", "consulting"]},
                "Q2": {"activity_multiplier": 1.1, "demand_focus": ["manufacturing", "logistics"]},
                "Q3": {"activity_multiplier": 0.95, "demand_focus": ["services", "marketing"]},
                "Q4": {"activity_multiplier": 1.2, "demand_focus": ["technology", "materials"]}
            },
            "emerging_trends": [
                "Αυξημένη ζήτηση για ψηφιακές λύσεις",
                "Έμφαση στην περιβαλλοντική βιωσιμότητα",
                "Προτίμηση για τοπικούς προμηθευτές",
                "Ανάπτυξη υβριδικών μοντέλων εργασίας",
                "Αυξημένες απαιτήσεις για πιστοποιήσεις"
            ]
        }
        
        return trends
        
    except Exception as e:
        logger.error(f"Error getting market trends: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση τάσεων αγοράς"
        )

@router.post("/marketplace/quote-request")
async def request_quote(
    quote_request: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Request a quote from suppliers
    """
    try:
        # Add user context
        quote_request["user_id"] = current_user.id
        quote_request["status"] = "pending"
        quote_request["created_at"] = datetime.utcnow().isoformat()
        
        # Generate quote request ID
        quote_request_id = str(uuid.uuid4())
        quote_request["id"] = quote_request_id
        
        # Find suitable suppliers
        supplier_ids = quote_request.get("supplier_ids", [])
        if not supplier_ids:
            # Auto-find suppliers if none specified
            find_request = {
                "user_id": current_user.id,
                "category": quote_request.get("category", "services"),
                "title": quote_request.get("title", "Quote Request"),
                "description": quote_request.get("description", ""),
                "min_budget": quote_request.get("budget", {}).get("min", 0),
                "max_budget": quote_request.get("budget", {}).get("max", 100000)
            }
            
            recommendations = await ai_supplier_marketplace.find_suppliers(find_request)
            supplier_ids = [rec.supplier_id for rec in recommendations[:5]]  # Top 5 suppliers
        
        # Send quote request to suppliers (mock implementation)
        quote_responses = []
        for supplier_id in supplier_ids:
            supplier = ai_supplier_marketplace.suppliers.get(supplier_id)
            if supplier:
                quote_responses.append({
                    "supplier_id": supplier_id,
                    "supplier_name": supplier.name,
                    "status": "sent",
                    "expected_response_time": f"{supplier.response_time} ώρες",
                    "estimated_delivery": await ai_supplier_marketplace._estimate_project_timeline(supplier, None)
                })
        
        logger.info(f"Quote request sent to {len(quote_responses)} suppliers by user {current_user.id}")
        
        return {
            "quote_request_id": quote_request_id,
            "status": "sent",
            "suppliers_contacted": len(quote_responses),
            "quote_responses": quote_responses,
            "estimated_responses": f"{len(quote_responses)} προσφορές αναμένονται",
            "follow_up_date": (datetime.utcnow() + timedelta(days=3)).isoformat(),
            "ai_insights": {
                "market_competitiveness": "high",
                "expected_response_rate": 0.75,
                "average_quote_time": "24-48 ώρες"
            }
        }
        
    except Exception as e:
        logger.error(f"Error requesting quote: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την αποστολή αιτήματος προσφοράς"
        )

@router.get("/marketplace/performance")
async def get_marketplace_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get marketplace performance metrics
    """
    try:
        performance = {
            "overall_health": {
                "score": 8.7,
                "level": "excellent",
                "trend": "improving"
            },
            "supplier_metrics": {
                "active_suppliers": len([s for s in ai_supplier_marketplace.suppliers.values() if s.status == SupplierStatus.ACTIVE]),
                "average_response_time": 18.5,
                "quality_score": 4.2,
                "reliability_rate": 0.89,
                "completion_rate": 0.92
            },
            "transaction_metrics": {
                "total_requests": len(ai_supplier_marketplace.requests),
                "successful_matches": len(ai_supplier_marketplace.requests) * 0.85,
                "average_project_value": 15000,
                "repeat_customer_rate": 0.65
            },
            "efficiency_metrics": {
                "matching_accuracy": 0.87,
                "time_to_match": 2.3,  # hours
                "negotiation_success_rate": 0.78,
                "contract_completion_rate": 0.91
            },
            "growth_metrics": {
                "new_suppliers_monthly": 12,
                "new_requests_monthly": 45,
                "revenue_growth": 0.15,
                "market_expansion": 0.08
            },
            "user_satisfaction": {
                "overall_rating": 4.3,
                "recommendation_rate": 0.82,
                "feature_adoption": 0.71,
                "support_satisfaction": 4.1
            }
        }
        
        return performance
        
    except Exception as e:
        logger.error(f"Error getting marketplace performance: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση μετρικών απόδοσης"
        )