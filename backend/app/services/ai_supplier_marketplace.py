import logging
import asyncio
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from enum import Enum
import json
import uuid
from dataclasses import dataclass, asdict
import numpy as np
from decimal import Decimal
import statistics

logger = logging.getLogger(__name__)

class SupplierCategory(Enum):
    MANUFACTURING = "manufacturing"
    SERVICES = "services"
    TECHNOLOGY = "technology"
    LOGISTICS = "logistics"
    MARKETING = "marketing"
    CONSULTING = "consulting"
    MATERIALS = "materials"
    EQUIPMENT = "equipment"
    PROFESSIONAL = "professional"
    MAINTENANCE = "maintenance"

class SupplierStatus(Enum):
    ACTIVE = "active"
    PENDING = "pending"
    VERIFIED = "verified"
    SUSPENDED = "suspended"
    BLACKLISTED = "blacklisted"

class QualityRating(Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    AVERAGE = "average"
    POOR = "poor"
    UNRATED = "unrated"

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ContractType(Enum):
    ONE_TIME = "one_time"
    RECURRING = "recurring"
    LONG_TERM = "long_term"
    FRAMEWORK = "framework"

@dataclass
class SupplierProfile:
    id: str
    name: str
    category: SupplierCategory
    status: SupplierStatus
    contact_info: Dict[str, str]
    description: str
    specialties: List[str]
    location: str
    established_year: int
    employee_count: int
    annual_revenue: Optional[float]
    certifications: List[str]
    quality_rating: QualityRating
    reliability_score: float
    cost_competitiveness: float
    response_time: float  # hours
    payment_terms: str
    minimum_order: Optional[float]
    capacity_utilization: float
    risk_assessment: RiskLevel
    languages: List[str]
    business_hours: str
    website: Optional[str]
    social_media: Dict[str, str]
    insurance_coverage: Optional[float]
    tax_compliance: bool
    environmental_certifications: List[str]
    greek_market_experience: int  # years
    created_at: datetime
    last_updated: datetime

@dataclass
class SupplierReview:
    id: str
    supplier_id: str
    reviewer_id: str
    reviewer_name: str
    rating: float
    title: str
    content: str
    aspects: Dict[str, float]  # quality, delivery, communication, value
    verified_purchase: bool
    project_value: Optional[float]
    project_duration: Optional[int]
    would_recommend: bool
    helpful_votes: int
    created_at: datetime
    response_from_supplier: Optional[str]
    response_date: Optional[datetime]

@dataclass
class SupplierQuote:
    id: str
    supplier_id: str
    request_id: str
    description: str
    items: List[Dict[str, Any]]
    total_amount: float
    currency: str
    validity_period: int  # days
    delivery_time: str
    payment_terms: str
    special_conditions: List[str]
    discount_tiers: List[Dict[str, Any]]
    warranty_terms: str
    support_included: bool
    ai_confidence_score: float
    competitive_analysis: Dict[str, Any]
    status: str
    created_at: datetime
    expires_at: datetime

@dataclass
class SupplierRecommendation:
    id: str
    supplier_id: str
    match_score: float
    category: str
    recommendation_reason: str
    strengths: List[str]
    potential_concerns: List[str]
    estimated_cost: float
    estimated_timeline: str
    risk_factors: List[str]
    similar_projects: List[str]
    negotiation_tips: List[str]
    contract_suggestions: List[str]
    greek_market_insights: List[str]
    created_at: datetime

@dataclass
class SupplierRequest:
    id: str
    user_id: int
    category: SupplierCategory
    title: str
    description: str
    requirements: List[str]
    budget_range: Tuple[float, float]
    timeline: str
    location_preference: Optional[str]
    quality_requirements: List[str]
    compliance_needs: List[str]
    preferred_payment_terms: str
    additional_criteria: Dict[str, Any]
    status: str
    created_at: datetime
    deadline: datetime
    received_quotes: List[str]
    selected_supplier: Optional[str]

class AISupplierMarketplace:
    def __init__(self):
        self.suppliers: Dict[str, SupplierProfile] = {}
        self.reviews: Dict[str, SupplierReview] = {}
        self.quotes: Dict[str, SupplierQuote] = {}
        self.recommendations: Dict[str, SupplierRecommendation] = {}
        self.requests: Dict[str, SupplierRequest] = {}
        self.ai_models = {
            "supplier_matching": "collaborative_filtering",
            "quality_prediction": "random_forest",
            "price_optimization": "linear_regression",
            "risk_assessment": "gradient_boosting",
            "sentiment_analysis": "bert",
            "demand_forecasting": "lstm"
        }
        self.greek_market_data = self._load_greek_market_data()
        self.matching_algorithms = self._initialize_matching_algorithms()

    def _load_greek_market_data(self) -> Dict[str, Any]:
        """Load Greek market-specific data for supplier analysis"""
        return {
            "industry_insights": {
                "manufacturing": {
                    "average_lead_time": 15,
                    "quality_standards": ["ISO 9001", "CE Marking"],
                    "typical_payment_terms": "30 days",
                    "seasonal_factors": {"Q1": 0.8, "Q2": 1.1, "Q3": 0.9, "Q4": 1.2}
                },
                "services": {
                    "average_response_time": 4,
                    "common_certifications": ["ISO 27001", "GDPR Compliance"],
                    "typical_payment_terms": "15 days",
                    "seasonal_factors": {"Q1": 0.9, "Q2": 1.0, "Q3": 1.1, "Q4": 1.0}
                },
                "technology": {
                    "innovation_rate": 0.85,
                    "skill_availability": 0.75,
                    "typical_payment_terms": "immediate",
                    "seasonal_factors": {"Q1": 1.0, "Q2": 1.1, "Q3": 0.9, "Q4": 1.0}
                }
            },
            "regional_preferences": {
                "athens": {"logistics_advantage": 0.9, "cost_factor": 1.1},
                "thessaloniki": {"logistics_advantage": 0.8, "cost_factor": 0.9},
                "patras": {"logistics_advantage": 0.7, "cost_factor": 0.8},
                "heraklion": {"logistics_advantage": 0.6, "cost_factor": 0.85}
            },
            "compliance_requirements": {
                "tax_compliance": ["AFM", "VAT Registration", "Social Security"],
                "environmental": ["Waste Management", "Energy Efficiency"],
                "labor": ["Ergani Declaration", "Insurance Coverage"],
                "quality": ["Greek Standards", "EU Regulations"]
            },
            "payment_culture": {
                "average_payment_delay": 45,  # days
                "preferred_methods": ["Bank Transfer", "Check", "Cash"],
                "credit_terms": {"small_business": 15, "medium_business": 30, "large_business": 45}
            }
        }

    def _initialize_matching_algorithms(self) -> Dict[str, Any]:
        """Initialize AI matching algorithms"""
        return {
            "content_based": {
                "weights": {
                    "category_match": 0.25,
                    "location_proximity": 0.15,
                    "quality_rating": 0.20,
                    "price_competitiveness": 0.15,
                    "reliability_score": 0.15,
                    "capacity_availability": 0.10
                }
            },
            "collaborative": {
                "user_similarity_threshold": 0.7,
                "item_similarity_threshold": 0.6,
                "min_reviews_required": 3
            },
            "hybrid": {
                "content_weight": 0.6,
                "collaborative_weight": 0.4
            }
        }

    async def add_supplier(self, supplier_data: Dict[str, Any]) -> str:
        """Add a new supplier to the marketplace"""
        try:
            supplier_id = str(uuid.uuid4())
            
            # Validate and process supplier data
            supplier = SupplierProfile(
                id=supplier_id,
                name=supplier_data["name"],
                category=SupplierCategory(supplier_data["category"]),
                status=SupplierStatus.PENDING,
                contact_info=supplier_data.get("contact_info", {}),
                description=supplier_data.get("description", ""),
                specialties=supplier_data.get("specialties", []),
                location=supplier_data.get("location", ""),
                established_year=supplier_data.get("established_year", 2020),
                employee_count=supplier_data.get("employee_count", 1),
                annual_revenue=supplier_data.get("annual_revenue"),
                certifications=supplier_data.get("certifications", []),
                quality_rating=QualityRating.UNRATED,
                reliability_score=0.5,
                cost_competitiveness=0.5,
                response_time=24.0,
                payment_terms=supplier_data.get("payment_terms", "30 days"),
                minimum_order=supplier_data.get("minimum_order"),
                capacity_utilization=0.0,
                risk_assessment=RiskLevel.MEDIUM,
                languages=supplier_data.get("languages", ["Greek"]),
                business_hours=supplier_data.get("business_hours", "9:00-17:00"),
                website=supplier_data.get("website"),
                social_media=supplier_data.get("social_media", {}),
                insurance_coverage=supplier_data.get("insurance_coverage"),
                tax_compliance=supplier_data.get("tax_compliance", False),
                environmental_certifications=supplier_data.get("environmental_certifications", []),
                greek_market_experience=supplier_data.get("greek_market_experience", 0),
                created_at=datetime.utcnow(),
                last_updated=datetime.utcnow()
            )
            
            # Perform AI-powered risk assessment
            risk_score = await self._assess_supplier_risk(supplier)
            supplier.risk_assessment = self._convert_risk_score_to_level(risk_score)
            
            # Store supplier
            self.suppliers[supplier_id] = supplier
            
            logger.info(f"New supplier added: {supplier.name} ({supplier_id})")
            
            return supplier_id
            
        except Exception as e:
            logger.error(f"Error adding supplier: {str(e)}")
            raise

    async def find_suppliers(self, request_data: Dict[str, Any]) -> List[SupplierRecommendation]:
        """Find and recommend suppliers based on requirements"""
        try:
            # Create supplier request
            request_id = str(uuid.uuid4())
            request = SupplierRequest(
                id=request_id,
                user_id=request_data["user_id"],
                category=SupplierCategory(request_data["category"]),
                title=request_data["title"],
                description=request_data["description"],
                requirements=request_data.get("requirements", []),
                budget_range=(request_data.get("min_budget", 0), request_data.get("max_budget", 100000)),
                timeline=request_data.get("timeline", "ASAP"),
                location_preference=request_data.get("location_preference"),
                quality_requirements=request_data.get("quality_requirements", []),
                compliance_needs=request_data.get("compliance_needs", []),
                preferred_payment_terms=request_data.get("preferred_payment_terms", "30 days"),
                additional_criteria=request_data.get("additional_criteria", {}),
                status="active",
                created_at=datetime.utcnow(),
                deadline=datetime.utcnow() + timedelta(days=30),
                received_quotes=[],
                selected_supplier=None
            )
            
            self.requests[request_id] = request
            
            # Find matching suppliers
            matching_suppliers = await self._find_matching_suppliers(request)
            
            # Generate AI recommendations
            recommendations = []
            for supplier_id, match_score in matching_suppliers:
                recommendation = await self._generate_supplier_recommendation(
                    supplier_id, request, match_score
                )
                recommendations.append(recommendation)
            
            # Sort by match score
            recommendations.sort(key=lambda x: x.match_score, reverse=True)
            
            return recommendations[:10]  # Return top 10 recommendations
            
        except Exception as e:
            logger.error(f"Error finding suppliers: {str(e)}")
            raise

    async def _find_matching_suppliers(self, request: SupplierRequest) -> List[Tuple[str, float]]:
        """Find suppliers matching the request criteria"""
        try:
            matching_suppliers = []
            
            for supplier_id, supplier in self.suppliers.items():
                if supplier.status not in [SupplierStatus.ACTIVE, SupplierStatus.VERIFIED]:
                    continue
                
                # Calculate match score
                match_score = await self._calculate_match_score(supplier, request)
                
                if match_score >= 0.3:  # Minimum threshold
                    matching_suppliers.append((supplier_id, match_score))
            
            return matching_suppliers
            
        except Exception as e:
            logger.error(f"Error finding matching suppliers: {str(e)}")
            raise

    async def _calculate_match_score(self, supplier: SupplierProfile, request: SupplierRequest) -> float:
        """Calculate how well a supplier matches the request"""
        try:
            weights = self.matching_algorithms["content_based"]["weights"]
            score = 0.0
            
            # Category match
            if supplier.category == request.category:
                score += weights["category_match"] * 1.0
            elif self._is_related_category(supplier.category, request.category):
                score += weights["category_match"] * 0.7
            
            # Location proximity
            if request.location_preference:
                proximity_score = self._calculate_location_proximity(
                    supplier.location, request.location_preference
                )
                score += weights["location_proximity"] * proximity_score
            else:
                score += weights["location_proximity"] * 0.5  # Neutral if no preference
            
            # Quality rating
            quality_score = self._convert_quality_rating_to_score(supplier.quality_rating)
            score += weights["quality_rating"] * quality_score
            
            # Price competitiveness (within budget)
            price_score = await self._calculate_price_competitiveness(supplier, request)
            score += weights["price_competitiveness"] * price_score
            
            # Reliability score
            score += weights["reliability_score"] * supplier.reliability_score
            
            # Capacity availability
            capacity_score = 1.0 - supplier.capacity_utilization
            score += weights["capacity_availability"] * capacity_score
            
            # Apply Greek market bonuses
            if supplier.greek_market_experience > 5:
                score += 0.05  # Bonus for experience
            
            if supplier.tax_compliance:
                score += 0.03  # Bonus for compliance
            
            if "Greek" in supplier.languages:
                score += 0.02  # Bonus for Greek language
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating match score: {str(e)}")
            return 0.0

    def _is_related_category(self, supplier_category: SupplierCategory, request_category: SupplierCategory) -> bool:
        """Check if supplier category is related to request category"""
        related_categories = {
            SupplierCategory.MANUFACTURING: [SupplierCategory.MATERIALS, SupplierCategory.EQUIPMENT],
            SupplierCategory.TECHNOLOGY: [SupplierCategory.SERVICES, SupplierCategory.CONSULTING],
            SupplierCategory.SERVICES: [SupplierCategory.CONSULTING, SupplierCategory.PROFESSIONAL],
            SupplierCategory.LOGISTICS: [SupplierCategory.SERVICES, SupplierCategory.EQUIPMENT],
            SupplierCategory.MARKETING: [SupplierCategory.SERVICES, SupplierCategory.CONSULTING]
        }
        
        return request_category in related_categories.get(supplier_category, [])

    def _calculate_location_proximity(self, supplier_location: str, preferred_location: str) -> float:
        """Calculate proximity score based on location"""
        if not supplier_location or not preferred_location:
            return 0.5
        
        # Exact match
        if supplier_location.lower() == preferred_location.lower():
            return 1.0
        
        # Check if both are in major cities
        major_cities = ["athens", "thessaloniki", "patras", "heraklion", "volos", "larissa"]
        supplier_city = supplier_location.lower()
        preferred_city = preferred_location.lower()
        
        if supplier_city in major_cities and preferred_city in major_cities:
            return 0.8  # High score for major cities
        elif supplier_city in major_cities or preferred_city in major_cities:
            return 0.6  # Medium score if one is major city
        else:
            return 0.4  # Lower score for other locations

    def _convert_quality_rating_to_score(self, rating: QualityRating) -> float:
        """Convert quality rating to numeric score"""
        rating_scores = {
            QualityRating.EXCELLENT: 1.0,
            QualityRating.GOOD: 0.8,
            QualityRating.AVERAGE: 0.6,
            QualityRating.POOR: 0.3,
            QualityRating.UNRATED: 0.5
        }
        return rating_scores.get(rating, 0.5)

    async def _calculate_price_competitiveness(self, supplier: SupplierProfile, request: SupplierRequest) -> float:
        """Calculate price competitiveness score"""
        try:
            # Get average market price for this category
            market_avg = await self._get_market_average_price(request.category)
            
            # Estimate supplier's likely price based on their competitiveness score
            estimated_price = market_avg * (2.0 - supplier.cost_competitiveness)
            
            min_budget, max_budget = request.budget_range
            
            # Check if estimated price is within budget
            if estimated_price <= max_budget:
                # Calculate competitiveness within budget
                if estimated_price <= min_budget:
                    return 1.0  # Excellent price
                else:
                    # Linear scale between min and max budget
                    return 1.0 - ((estimated_price - min_budget) / (max_budget - min_budget)) * 0.5
            else:
                # Price is over budget
                return 0.0
            
        except Exception as e:
            logger.error(f"Error calculating price competitiveness: {str(e)}")
            return 0.5

    async def _get_market_average_price(self, category: SupplierCategory) -> float:
        """Get average market price for a category"""
        # Mock market prices - in production, calculate from historical data
        market_prices = {
            SupplierCategory.MANUFACTURING: 50000,
            SupplierCategory.SERVICES: 25000,
            SupplierCategory.TECHNOLOGY: 75000,
            SupplierCategory.LOGISTICS: 15000,
            SupplierCategory.MARKETING: 30000,
            SupplierCategory.CONSULTING: 45000,
            SupplierCategory.MATERIALS: 20000,
            SupplierCategory.EQUIPMENT: 60000,
            SupplierCategory.PROFESSIONAL: 35000,
            SupplierCategory.MAINTENANCE: 18000
        }
        
        return market_prices.get(category, 30000)

    async def _generate_supplier_recommendation(self, supplier_id: str, request: SupplierRequest, match_score: float) -> SupplierRecommendation:
        """Generate AI-powered supplier recommendation"""
        try:
            supplier = self.suppliers[supplier_id]
            
            # Generate recommendation reason
            reason = await self._generate_recommendation_reason(supplier, request, match_score)
            
            # Identify strengths
            strengths = await self._identify_supplier_strengths(supplier, request)
            
            # Identify potential concerns
            concerns = await self._identify_potential_concerns(supplier, request)
            
            # Estimate cost
            estimated_cost = await self._estimate_project_cost(supplier, request)
            
            # Estimate timeline
            estimated_timeline = await self._estimate_project_timeline(supplier, request)
            
            # Identify risk factors
            risk_factors = await self._identify_risk_factors(supplier, request)
            
            # Find similar projects
            similar_projects = await self._find_similar_projects(supplier, request)
            
            # Generate negotiation tips
            negotiation_tips = await self._generate_negotiation_tips(supplier, request)
            
            # Generate contract suggestions
            contract_suggestions = await self._generate_contract_suggestions(supplier, request)
            
            # Generate Greek market insights
            greek_insights = await self._generate_greek_market_insights(supplier, request)
            
            recommendation = SupplierRecommendation(
                id=str(uuid.uuid4()),
                supplier_id=supplier_id,
                match_score=match_score,
                category=supplier.category.value,
                recommendation_reason=reason,
                strengths=strengths,
                potential_concerns=concerns,
                estimated_cost=estimated_cost,
                estimated_timeline=estimated_timeline,
                risk_factors=risk_factors,
                similar_projects=similar_projects,
                negotiation_tips=negotiation_tips,
                contract_suggestions=contract_suggestions,
                greek_market_insights=greek_insights,
                created_at=datetime.utcnow()
            )
            
            return recommendation
            
        except Exception as e:
            logger.error(f"Error generating supplier recommendation: {str(e)}")
            raise

    async def _generate_recommendation_reason(self, supplier: SupplierProfile, request: SupplierRequest, match_score: float) -> str:
        """Generate explanation for why this supplier is recommended"""
        reasons = []
        
        if supplier.category == request.category:
            reasons.append(f"Ειδικότητα στον τομέα {supplier.category.value}")
        
        if supplier.quality_rating in [QualityRating.EXCELLENT, QualityRating.GOOD]:
            reasons.append(f"Υψηλή ποιότητα υπηρεσιών ({supplier.quality_rating.value})")
        
        if supplier.reliability_score > 0.8:
            reasons.append("Υψηλή αξιοπιστία")
        
        if supplier.greek_market_experience > 5:
            reasons.append(f"Πολυετής εμπειρία στην ελληνική αγορά ({supplier.greek_market_experience} χρόνια)")
        
        if supplier.response_time <= 12:
            reasons.append("Γρήγορος χρόνος απόκρισης")
        
        if reasons:
            return f"Συνιστάται λόγω: {', '.join(reasons)}"
        else:
            return f"Καλή επιλογή με {match_score*100:.0f}% συμβατότητα"

    async def _identify_supplier_strengths(self, supplier: SupplierProfile, request: SupplierRequest) -> List[str]:
        """Identify supplier strengths relevant to the request"""
        strengths = []
        
        if supplier.certifications:
            strengths.append(f"Πιστοποιήσεις: {', '.join(supplier.certifications)}")
        
        if supplier.employee_count > 50:
            strengths.append("Μεγάλη ομάδα εργαζομένων")
        elif supplier.employee_count > 10:
            strengths.append("Σταθερή ομάδα εργαζομένων")
        
        if supplier.established_year < 2010:
            strengths.append("Πολυετής εμπειρία στον κλάδο")
        
        if supplier.insurance_coverage and supplier.insurance_coverage > 100000:
            strengths.append("Υψηλή ασφαλιστική κάλυψη")
        
        if supplier.tax_compliance:
            strengths.append("Πλήρης φορολογική συμμόρφωση")
        
        if supplier.environmental_certifications:
            strengths.append("Περιβαλλοντικές πιστοποιήσεις")
        
        return strengths

    async def _identify_potential_concerns(self, supplier: SupplierProfile, request: SupplierRequest) -> List[str]:
        """Identify potential concerns about the supplier"""
        concerns = []
        
        if supplier.quality_rating == QualityRating.UNRATED:
            concerns.append("Δεν υπάρχουν αξιολογήσεις ποιότητας")
        elif supplier.quality_rating == QualityRating.POOR:
            concerns.append("Χαμηλή αξιολόγηση ποιότητας")
        
        if supplier.reliability_score < 0.6:
            concerns.append("Χαμηλή αξιοπιστία")
        
        if supplier.response_time > 48:
            concerns.append("Αργός χρόνος απόκρισης")
        
        if supplier.capacity_utilization > 0.9:
            concerns.append("Υψηλή πληρότητα - πιθανή καθυστέρηση")
        
        if supplier.greek_market_experience < 2:
            concerns.append("Περιορισμένη εμπειρία στην ελληνική αγορά")
        
        if not supplier.tax_compliance:
            concerns.append("Δεν είναι πλήρως φορολογικά συμμορφωμένος")
        
        if supplier.risk_assessment in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
            concerns.append("Υψηλός κίνδυνος συνεργασίας")
        
        return concerns

    async def _estimate_project_cost(self, supplier: SupplierProfile, request: SupplierRequest) -> float:
        """Estimate project cost based on supplier and request"""
        # Base cost from market average
        base_cost = await self._get_market_average_price(request.category)
        
        # Adjust based on supplier's cost competitiveness
        supplier_factor = 2.0 - supplier.cost_competitiveness
        
        # Adjust based on quality rating
        quality_factor = self._convert_quality_rating_to_score(supplier.quality_rating)
        
        # Adjust based on location
        location_factor = self.greek_market_data["regional_preferences"].get(
            supplier.location.lower(), {"cost_factor": 1.0}
        )["cost_factor"]
        
        estimated_cost = base_cost * supplier_factor * quality_factor * location_factor
        
        # Ensure within budget range if specified
        min_budget, max_budget = request.budget_range
        if min_budget > 0 and max_budget > min_budget:
            estimated_cost = max(min_budget, min(estimated_cost, max_budget))
        
        return estimated_cost

    async def _estimate_project_timeline(self, supplier: SupplierProfile, request: SupplierRequest) -> str:
        """Estimate project timeline"""
        # Base timeline from industry data
        industry_data = self.greek_market_data["industry_insights"].get(
            supplier.category.value, {"average_lead_time": 20}
        )
        base_timeline = industry_data["average_lead_time"]
        
        # Adjust based on supplier capacity
        if supplier.capacity_utilization > 0.8:
            base_timeline *= 1.3
        elif supplier.capacity_utilization < 0.5:
            base_timeline *= 0.8
        
        # Adjust based on quality requirements
        if "urgent" in request.timeline.lower():
            base_timeline *= 0.7
        elif "quality" in str(request.quality_requirements).lower():
            base_timeline *= 1.2
        
        return f"{int(base_timeline)} ημέρες"

    async def _identify_risk_factors(self, supplier: SupplierProfile, request: SupplierRequest) -> List[str]:
        """Identify risk factors for the collaboration"""
        risk_factors = []
        
        if supplier.risk_assessment == RiskLevel.HIGH:
            risk_factors.append("Υψηλός κίνδυνος συνεργασίας")
        
        if supplier.capacity_utilization > 0.9:
            risk_factors.append("Κίνδυνος καθυστέρησης λόγω πληρότητας")
        
        if not supplier.insurance_coverage:
            risk_factors.append("Έλλειψη ασφαλιστικής κάλυψης")
        
        if supplier.established_year > 2020:
            risk_factors.append("Νέα εταιρεία - περιορισμένη εμπειρία")
        
        if supplier.employee_count < 3:
            risk_factors.append("Μικρή ομάδα - κίνδυνος διαθεσιμότητας")
        
        return risk_factors

    async def _find_similar_projects(self, supplier: SupplierProfile, request: SupplierRequest) -> List[str]:
        """Find similar projects completed by the supplier"""
        # Mock similar projects - in production, query from database
        similar_projects = [
            f"Παρόμοιο έργο στον τομέα {supplier.category.value}",
            f"Συνεργασία με εταιρεία παρόμοιου μεγέθους",
            f"Εκτέλεση έργου σε {supplier.location}"
        ]
        
        return similar_projects

    async def _generate_negotiation_tips(self, supplier: SupplierProfile, request: SupplierRequest) -> List[str]:
        """Generate negotiation tips for working with this supplier"""
        tips = []
        
        if supplier.cost_competitiveness < 0.7:
            tips.append("Δυνατότητα διαπραγμάτευσης τιμής")
        
        if supplier.capacity_utilization < 0.6:
            tips.append("Ευκαιρία για γρηγορότερη παράδοση")
        
        if supplier.greek_market_experience > 10:
            tips.append("Αξιοποιήστε την τοπική εμπειρία τους")
        
        payment_terms = supplier.payment_terms
        if "30" in payment_terms:
            tips.append("Δοκιμάστε να διαπραγματευτείτε για 45 ημέρες πληρωμής")
        
        tips.append("Ζητήστε αναλυτική κοστολόγηση")
        tips.append("Συμφωνήστε σε σαφή χρονοδιάγραμμα")
        
        return tips

    async def _generate_contract_suggestions(self, supplier: SupplierProfile, request: SupplierRequest) -> List[str]:
        """Generate contract suggestions"""
        suggestions = []
        
        suggestions.append("Συμπεριλάβετε ρήτρα ποινής για καθυστέρηση")
        suggestions.append("Ορίστε σαφή κριτήρια ποιότητας")
        suggestions.append("Προβλέψτε δικαιώματα τροποποίησης")
        
        if supplier.risk_assessment != RiskLevel.LOW:
            suggestions.append("Ζητήστε εγγυητικές επιστολές")
        
        if not supplier.insurance_coverage:
            suggestions.append("Απαιτήστε ασφαλιστική κάλυψη")
        
        suggestions.append("Συμπεριλάβετε ρήτρα εμπιστευτικότητας")
        suggestions.append("Ορίστε διαδικασία επίλυσης διαφορών")
        
        return suggestions

    async def _generate_greek_market_insights(self, supplier: SupplierProfile, request: SupplierRequest) -> List[str]:
        """Generate Greek market-specific insights"""
        insights = []
        
        if supplier.location.lower() == "athens":
            insights.append("Κεντρική τοποθεσία με καλή πρόσβαση σε υπηρεσίες")
        elif supplier.location.lower() == "thessaloniki":
            insights.append("Ισχυρή παρουσία στη Βόρεια Ελλάδα")
        
        if supplier.greek_market_experience > 10:
            insights.append("Βαθιά κατανόηση της ελληνικής αγοράς")
        
        if supplier.tax_compliance:
            insights.append("Πλήρης συμμόρφωση με την ελληνική φορολογία")
        
        category_insights = self.greek_market_data["industry_insights"].get(
            supplier.category.value, {}
        )
        
        if category_insights:
            insights.append(f"Τυπικοί όροι πληρωμής: {category_insights.get('typical_payment_terms', 'N/A')}")
        
        insights.append("Προσέξτε τις εποχιακές διακυμάνσεις")
        insights.append("Σημασία της προσωπικής σχέσης στην ελληνική αγορά")
        
        return insights

    async def _assess_supplier_risk(self, supplier: SupplierProfile) -> float:
        """Assess supplier risk using AI"""
        try:
            risk_score = 0.0
            
            # Financial stability indicators
            if supplier.annual_revenue:
                if supplier.annual_revenue < 50000:
                    risk_score += 0.3
                elif supplier.annual_revenue < 200000:
                    risk_score += 0.1
            else:
                risk_score += 0.2  # Unknown revenue is risky
            
            # Experience indicators
            years_active = datetime.utcnow().year - supplier.established_year
            if years_active < 2:
                risk_score += 0.3
            elif years_active < 5:
                risk_score += 0.1
            
            # Compliance indicators
            if not supplier.tax_compliance:
                risk_score += 0.2
            
            if not supplier.insurance_coverage:
                risk_score += 0.15
            
            # Capacity indicators
            if supplier.employee_count < 3:
                risk_score += 0.1
            
            # Market experience
            if supplier.greek_market_experience < 2:
                risk_score += 0.15
            
            return min(risk_score, 1.0)
            
        except Exception as e:
            logger.error(f"Error assessing supplier risk: {str(e)}")
            return 0.5

    def _convert_risk_score_to_level(self, risk_score: float) -> RiskLevel:
        """Convert risk score to risk level"""
        if risk_score >= 0.8:
            return RiskLevel.CRITICAL
        elif risk_score >= 0.6:
            return RiskLevel.HIGH
        elif risk_score >= 0.3:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW

    async def add_supplier_review(self, review_data: Dict[str, Any]) -> str:
        """Add a review for a supplier"""
        try:
            review_id = str(uuid.uuid4())
            
            review = SupplierReview(
                id=review_id,
                supplier_id=review_data["supplier_id"],
                reviewer_id=review_data["reviewer_id"],
                reviewer_name=review_data["reviewer_name"],
                rating=review_data["rating"],
                title=review_data["title"],
                content=review_data["content"],
                aspects=review_data.get("aspects", {}),
                verified_purchase=review_data.get("verified_purchase", False),
                project_value=review_data.get("project_value"),
                project_duration=review_data.get("project_duration"),
                would_recommend=review_data.get("would_recommend", True),
                helpful_votes=0,
                created_at=datetime.utcnow(),
                response_from_supplier=None,
                response_date=None
            )
            
            self.reviews[review_id] = review
            
            # Update supplier's quality rating
            await self._update_supplier_quality_rating(review_data["supplier_id"])
            
            logger.info(f"Review added for supplier {review_data['supplier_id']}")
            
            return review_id
            
        except Exception as e:
            logger.error(f"Error adding supplier review: {str(e)}")
            raise

    async def _update_supplier_quality_rating(self, supplier_id: str):
        """Update supplier's quality rating based on reviews"""
        try:
            supplier = self.suppliers.get(supplier_id)
            if not supplier:
                return
            
            # Get all reviews for this supplier
            supplier_reviews = [r for r in self.reviews.values() if r.supplier_id == supplier_id]
            
            if not supplier_reviews:
                return
            
            # Calculate average rating
            total_rating = sum(r.rating for r in supplier_reviews)
            avg_rating = total_rating / len(supplier_reviews)
            
            # Convert to quality rating
            if avg_rating >= 4.5:
                supplier.quality_rating = QualityRating.EXCELLENT
            elif avg_rating >= 3.5:
                supplier.quality_rating = QualityRating.GOOD
            elif avg_rating >= 2.5:
                supplier.quality_rating = QualityRating.AVERAGE
            else:
                supplier.quality_rating = QualityRating.POOR
            
            # Update reliability score
            supplier.reliability_score = avg_rating / 5.0
            
            supplier.last_updated = datetime.utcnow()
            
        except Exception as e:
            logger.error(f"Error updating supplier quality rating: {str(e)}")

    async def get_supplier_recommendations(self, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Get personalized supplier recommendations"""
        try:
            # Get user's recent requests to understand preferences
            user_requests = [r for r in self.requests.values() if r.user_id == user_id]
            
            if not user_requests:
                # Return general recommendations for new users
                return await self._get_general_recommendations(limit)
            
            # Analyze user preferences
            preferred_categories = self._analyze_user_preferences(user_requests)
            
            # Get recommendations based on preferences
            recommendations = []
            for category, weight in preferred_categories.items():
                category_suppliers = [
                    s for s in self.suppliers.values() 
                    if s.category == category and s.status == SupplierStatus.VERIFIED
                ]
                
                # Sort by quality and reliability
                category_suppliers.sort(
                    key=lambda x: (x.quality_rating.value, x.reliability_score), 
                    reverse=True
                )
                
                for supplier in category_suppliers[:3]:  # Top 3 per category
                    recommendations.append({
                        "supplier_id": supplier.id,
                        "name": supplier.name,
                        "category": supplier.category.value,
                        "quality_rating": supplier.quality_rating.value,
                        "reliability_score": supplier.reliability_score,
                        "location": supplier.location,
                        "specialties": supplier.specialties,
                        "recommendation_reason": f"Βάσει προτίμησης για {category.value}",
                        "match_score": weight
                    })
            
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Error getting supplier recommendations: {str(e)}")
            return []

    def _analyze_user_preferences(self, user_requests: List[SupplierRequest]) -> Dict[SupplierCategory, float]:
        """Analyze user preferences based on request history"""
        category_counts = {}
        
        for request in user_requests:
            category = request.category
            category_counts[category] = category_counts.get(category, 0) + 1
        
        # Convert to weights
        total_requests = len(user_requests)
        preferences = {}
        
        for category, count in category_counts.items():
            preferences[category] = count / total_requests
        
        return preferences

    async def _get_general_recommendations(self, limit: int) -> List[Dict[str, Any]]:
        """Get general supplier recommendations for new users"""
        try:
            # Get top-rated suppliers across all categories
            top_suppliers = sorted(
                [s for s in self.suppliers.values() if s.status == SupplierStatus.VERIFIED],
                key=lambda x: (x.quality_rating.value, x.reliability_score),
                reverse=True
            )
            
            recommendations = []
            for supplier in top_suppliers[:limit]:
                recommendations.append({
                    "supplier_id": supplier.id,
                    "name": supplier.name,
                    "category": supplier.category.value,
                    "quality_rating": supplier.quality_rating.value,
                    "reliability_score": supplier.reliability_score,
                    "location": supplier.location,
                    "specialties": supplier.specialties,
                    "recommendation_reason": "Κορυφαίος προμηθευτής",
                    "match_score": supplier.reliability_score
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting general recommendations: {str(e)}")
            return []

    async def get_marketplace_statistics(self) -> Dict[str, Any]:
        """Get marketplace statistics"""
        try:
            total_suppliers = len(self.suppliers)
            active_suppliers = len([s for s in self.suppliers.values() if s.status == SupplierStatus.ACTIVE])
            verified_suppliers = len([s for s in self.suppliers.values() if s.status == SupplierStatus.VERIFIED])
            
            # Category distribution
            category_counts = {}
            for supplier in self.suppliers.values():
                category = supplier.category.value
                category_counts[category] = category_counts.get(category, 0) + 1
            
            # Average ratings
            rated_suppliers = [s for s in self.suppliers.values() if s.quality_rating != QualityRating.UNRATED]
            avg_quality = sum(self._convert_quality_rating_to_score(s.quality_rating) for s in rated_suppliers) / len(rated_suppliers) if rated_suppliers else 0
            
            # Recent activity
            recent_requests = len([r for r in self.requests.values() if r.created_at > datetime.utcnow() - timedelta(days=30)])
            recent_reviews = len([r for r in self.reviews.values() if r.created_at > datetime.utcnow() - timedelta(days=30)])
            
            return {
                "total_suppliers": total_suppliers,
                "active_suppliers": active_suppliers,
                "verified_suppliers": verified_suppliers,
                "category_distribution": category_counts,
                "average_quality_score": avg_quality,
                "total_requests": len(self.requests),
                "recent_requests": recent_requests,
                "total_reviews": len(self.reviews),
                "recent_reviews": recent_reviews,
                "marketplace_growth": {
                    "new_suppliers_this_month": len([s for s in self.suppliers.values() if s.created_at > datetime.utcnow() - timedelta(days=30)]),
                    "active_requests": len([r for r in self.requests.values() if r.status == "active"]),
                    "completion_rate": 0.85  # Mock completion rate
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting marketplace statistics: {str(e)}")
            return {}

# Global instance
ai_supplier_marketplace = AISupplierMarketplace()

# Add sample suppliers for demonstration
async def initialize_sample_data():
    """Initialize sample suppliers for demonstration"""
    
    sample_suppliers = [
        {
            "name": "TechSolutions Athens",
            "category": "technology",
            "contact_info": {
                "email": "info@techsolutions.gr",
                "phone": "+30 210 123 4567",
                "address": "Λεωφ. Κηφισίας 123, Αθήνα"
            },
            "description": "Εξειδικευμένη εταιρεία στην ανάπτυξη λογισμικού και ψηφιακών λύσεων για επιχειρήσεις",
            "specialties": ["Web Development", "Mobile Apps", "Cloud Solutions", "AI Integration"],
            "location": "Athens",
            "established_year": 2015,
            "employee_count": 25,
            "annual_revenue": 500000,
            "certifications": ["ISO 27001", "AWS Partner", "Microsoft Partner"],
            "payment_terms": "30 days",
            "minimum_order": 5000,
            "languages": ["Greek", "English"],
            "business_hours": "9:00-18:00",
            "website": "https://techsolutions.gr",
            "social_media": {
                "linkedin": "techsolutions-athens",
                "facebook": "techsolutions.gr"
            },
            "insurance_coverage": 500000,
            "tax_compliance": True,
            "environmental_certifications": ["Green IT"],
            "greek_market_experience": 8
        },
        {
            "name": "Mediterranean Logistics",
            "category": "logistics",
            "contact_info": {
                "email": "contact@medlogistics.gr",
                "phone": "+30 2310 987 654",
                "address": "Λιμάνι Θεσσαλονίκης, Θεσσαλονίκη"
            },
            "description": "Παροχή υπηρεσιών logistics και μεταφοράς σε όλη την Ελλάδα και τη Μεσόγειο",
            "specialties": ["Freight Transport", "Warehousing", "Supply Chain", "Import/Export"],
            "location": "Thessaloniki",
            "established_year": 2008,
            "employee_count": 45,
            "annual_revenue": 750000,
            "certifications": ["ISO 9001", "IATA", "AEO"],
            "payment_terms": "45 days",
            "minimum_order": 2000,
            "languages": ["Greek", "English", "Italian"],
            "business_hours": "24/7",
            "website": "https://medlogistics.gr",
            "social_media": {
                "linkedin": "mediterranean-logistics"
            },
            "insurance_coverage": 1000000,
            "tax_compliance": True,
            "environmental_certifications": ["Green Logistics"],
            "greek_market_experience": 15
        },
        {
            "name": "Hellenic Marketing Pro",
            "category": "marketing",
            "contact_info": {
                "email": "hello@hellenicmarketing.gr",
                "phone": "+30 210 555 7890",
                "address": "Ερμού 45, Αθήνα"
            },
            "description": "Πλήρες φάσμα υπηρεσιών marketing και διαφήμισης με έμφαση στην ελληνική αγορά",
            "specialties": ["Digital Marketing", "Brand Strategy", "Social Media", "Content Creation"],
            "location": "Athens",
            "established_year": 2012,
            "employee_count": 18,
            "annual_revenue": 350000,
            "certifications": ["Google Partner", "Facebook Marketing Partner"],
            "payment_terms": "30 days",
            "minimum_order": 3000,
            "languages": ["Greek", "English"],
            "business_hours": "9:00-17:00",
            "website": "https://hellenicmarketing.gr",
            "social_media": {
                "linkedin": "hellenic-marketing-pro",
                "facebook": "hellenicmarketing.gr",
                "instagram": "hellenicmarketing"
            },
            "insurance_coverage": 250000,
            "tax_compliance": True,
            "environmental_certifications": [],
            "greek_market_experience": 11
        },
        {
            "name": "Industrial Solutions Crete",
            "category": "manufacturing",
            "contact_info": {
                "email": "info@industrialcrete.gr",
                "phone": "+30 2810 123 456",
                "address": "ΒΙΠΕ Ηρακλείου, Κρήτη"
            },
            "description": "Κατασκευή και συναρμολόγηση βιομηχανικών εξαρτημάτων και μηχανημάτων",
            "specialties": ["Metal Fabrication", "Assembly", "Quality Control", "Custom Manufacturing"],
            "location": "Heraklion",
            "established_year": 2005,
            "employee_count": 35,
            "annual_revenue": 620000,
            "certifications": ["ISO 9001", "CE Marking", "OHSAS 18001"],
            "payment_terms": "60 days",
            "minimum_order": 8000,
            "languages": ["Greek", "English", "German"],
            "business_hours": "7:00-15:00",
            "website": "https://industrialcrete.gr",
            "social_media": {
                "linkedin": "industrial-solutions-crete"
            },
            "insurance_coverage": 800000,
            "tax_compliance": True,
            "environmental_certifications": ["ISO 14001"],
            "greek_market_experience": 18
        },
        {
            "name": "Greek Business Consultants",
            "category": "consulting",
            "contact_info": {
                "email": "contact@greekbizcon.gr",
                "phone": "+30 210 888 9999",
                "address": "Βασιλίσσης Σοφίας 100, Αθήνα"
            },
            "description": "Συμβουλευτικές υπηρεσίες για επιχειρήσεις με εξειδίκευση στην ελληνική αγορά",
            "specialties": ["Business Strategy", "Financial Planning", "Legal Compliance", "Market Research"],
            "location": "Athens",
            "established_year": 2010,
            "employee_count": 12,
            "annual_revenue": 280000,
            "certifications": ["ACCA", "ICAEW"],
            "payment_terms": "15 days",
            "minimum_order": 2500,
            "languages": ["Greek", "English"],
            "business_hours": "9:00-17:00",
            "website": "https://greekbizcon.gr",
            "social_media": {
                "linkedin": "greek-business-consultants"
            },
            "insurance_coverage": 300000,
            "tax_compliance": True,
            "environmental_certifications": [],
            "greek_market_experience": 13
        }
    ]
    
    for supplier_data in sample_suppliers:
        try:
            await ai_supplier_marketplace.add_supplier(supplier_data)
            logger.info(f"Added sample supplier: {supplier_data['name']}")
        except Exception as e:
            logger.error(f"Error adding sample supplier {supplier_data['name']}: {str(e)}")
    
    # Add sample reviews
    supplier_ids = list(ai_supplier_marketplace.suppliers.keys())
    if supplier_ids:
        sample_reviews = [
            {
                "supplier_id": supplier_ids[0],
                "reviewer_id": "user123",
                "reviewer_name": "Γιάννης Παπαδόπουλος",
                "rating": 4.5,
                "title": "Εξαιρετική συνεργασία",
                "content": "Πολύ καλή δουλειά στην ανάπτυξη της εφαρμογής μας. Τήρησαν τις προθεσμίες και η επικοινωνία ήταν άψογη.",
                "aspects": {"quality": 4.5, "delivery": 4.0, "communication": 5.0, "value": 4.0},
                "verified_purchase": True,
                "project_value": 15000,
                "project_duration": 45,
                "would_recommend": True
            },
            {
                "supplier_id": supplier_ids[1],
                "reviewer_id": "user456",
                "reviewer_name": "Μαρία Κωνσταντίνου",
                "rating": 4.8,
                "title": "Άψογη logistics",
                "content": "Πολύ αξιόπιστη εταιρεία. Διαχειρίστηκαν τις μεταφορές μας με πολύ προσοχή και ταχύτητα.",
                "aspects": {"quality": 5.0, "delivery": 4.5, "communication": 4.5, "value": 5.0},
                "verified_purchase": True,
                "project_value": 8000,
                "project_duration": 30,
                "would_recommend": True
            }
        ]
        
        for review_data in sample_reviews:
            try:
                await ai_supplier_marketplace.add_supplier_review(review_data)
                logger.info(f"Added sample review for supplier {review_data['supplier_id']}")
            except Exception as e:
                logger.error(f"Error adding sample review: {str(e)}")
    
    logger.info("Sample data initialization completed")

# Initialize sample data when the module is imported
import asyncio
_sample_data_initialized = False

def initialize_sample_data_sync():
    """Initialize sample data synchronously"""
    global _sample_data_initialized
    if _sample_data_initialized:
        return
    
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If there's already a running event loop, schedule the task
            asyncio.create_task(initialize_sample_data())
        else:
            # If no event loop is running, run it synchronously
            loop.run_until_complete(initialize_sample_data())
        _sample_data_initialized = True
    except RuntimeError:
        # If there's no event loop, we'll initialize later when one is available
        pass

def ensure_sample_data_initialized():
    """Ensure sample data is initialized, call this from endpoints"""
    global _sample_data_initialized
    if not _sample_data_initialized:
        try:
            asyncio.create_task(initialize_sample_data())
            _sample_data_initialized = True
        except RuntimeError:
            pass