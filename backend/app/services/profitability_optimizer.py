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

class OptimizationCategory(Enum):
    COST_REDUCTION = "cost_reduction"
    REVENUE_INCREASE = "revenue_increase"
    PROCESS_IMPROVEMENT = "process_improvement"
    RESOURCE_OPTIMIZATION = "resource_optimization"
    PRICING_STRATEGY = "pricing_strategy"
    CUSTOMER_RETENTION = "customer_retention"
    MARKET_EXPANSION = "market_expansion"
    OPERATIONAL_EFFICIENCY = "operational_efficiency"

class ImpactLevel(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ImplementationDifficulty(Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    COMPLEX = "complex"

class MetricType(Enum):
    FINANCIAL = "financial"
    OPERATIONAL = "operational"
    CUSTOMER = "customer"
    EMPLOYEE = "employee"
    MARKET = "market"

@dataclass
class ProfitabilityMetric:
    id: str
    name: str
    type: MetricType
    current_value: float
    target_value: float
    unit: str
    trend: str  # "up", "down", "stable"
    last_updated: datetime
    data_points: List[Tuple[datetime, float]]
    benchmark_value: Optional[float] = None
    industry_average: Optional[float] = None

@dataclass
class OptimizationRecommendation:
    id: str
    category: OptimizationCategory
    title: str
    description: str
    rationale: str
    expected_impact: float  # Expected profit increase in euros
    impact_level: ImpactLevel
    implementation_difficulty: ImplementationDifficulty
    estimated_timeline: int  # days
    estimated_cost: float
    roi_percentage: float
    risk_factors: List[str]
    success_metrics: List[str]
    action_steps: List[str]
    related_metrics: List[str]
    confidence_score: float
    created_at: datetime
    priority_score: float
    dependencies: List[str]
    compliance_considerations: List[str]
    greek_market_specifics: List[str]

@dataclass
class BusinessScenario:
    id: str
    name: str
    description: str
    assumptions: Dict[str, Any]
    projected_revenue: float
    projected_costs: float
    projected_profit: float
    probability: float
    timeline: int  # months
    key_factors: List[str]
    risks: List[str]
    mitigation_strategies: List[str]

@dataclass
class ProfitabilityInsight:
    id: str
    insight_type: str
    title: str
    description: str
    data_sources: List[str]
    supporting_evidence: List[str]
    actionable_recommendations: List[str]
    created_at: datetime
    relevance_score: float
    greek_business_context: str

class ProfitabilityOptimizer:
    def __init__(self):
        self.metrics: Dict[str, ProfitabilityMetric] = {}
        self.recommendations: Dict[str, OptimizationRecommendation] = {}
        self.scenarios: Dict[str, BusinessScenario] = {}
        self.insights: Dict[str, ProfitabilityInsight] = {}
        self.optimization_rules = self._load_optimization_rules()
        self.greek_market_data = self._load_greek_market_data()
        self.ai_models = {
            "demand_forecasting": "prophet",
            "price_optimization": "gradient_boosting",
            "customer_segmentation": "kmeans",
            "cost_prediction": "linear_regression",
            "market_analysis": "nlp_sentiment"
        }

    def _load_optimization_rules(self) -> Dict[str, Any]:
        """Load optimization rules and thresholds"""
        return {
            "profit_margin_thresholds": {
                "excellent": 0.30,
                "good": 0.20,
                "average": 0.15,
                "poor": 0.10
            },
            "cost_optimization_targets": {
                "operational_costs": 0.05,  # 5% reduction target
                "marketing_costs": 0.10,
                "administrative_costs": 0.08,
                "inventory_costs": 0.12
            },
            "revenue_growth_targets": {
                "monthly": 0.02,  # 2% monthly growth
                "quarterly": 0.08,
                "yearly": 0.25
            },
            "kpi_benchmarks": {
                "customer_acquisition_cost": 50.0,
                "customer_lifetime_value": 500.0,
                "employee_productivity": 1000.0,
                "inventory_turnover": 6.0
            },
            "alert_thresholds": {
                "profit_margin_drop": 0.03,
                "cost_increase": 0.15,
                "revenue_decline": 0.10,
                "cash_flow_negative": 0.0
            }
        }

    def _load_greek_market_data(self) -> Dict[str, Any]:
        """Load Greek market-specific data and insights"""
        return {
            "tax_rates": {
                "corporate_tax": 0.22,
                "vat_standard": 0.24,
                "vat_reduced": 0.13,
                "withholding_tax": 0.15
            },
            "labor_costs": {
                "minimum_wage": 760.0,
                "social_security_employer": 0.2478,
                "social_security_employee": 0.1606,
                "average_salary_multiplier": 1.45
            },
            "market_conditions": {
                "inflation_rate": 0.04,
                "gdp_growth": 0.025,
                "unemployment_rate": 0.125,
                "consumer_confidence": 0.72
            },
            "industry_benchmarks": {
                "retail": {"profit_margin": 0.18, "inventory_turnover": 4.2},
                "manufacturing": {"profit_margin": 0.22, "productivity": 1200},
                "services": {"profit_margin": 0.25, "utilization": 0.75},
                "technology": {"profit_margin": 0.35, "growth_rate": 0.40}
            },
            "seasonal_patterns": {
                "Q1": {"sales_multiplier": 0.85, "costs_multiplier": 0.95},
                "Q2": {"sales_multiplier": 1.05, "costs_multiplier": 1.02},
                "Q3": {"sales_multiplier": 0.95, "costs_multiplier": 0.98},
                "Q4": {"sales_multiplier": 1.25, "costs_multiplier": 1.08}
            }
        }

    async def analyze_profitability(self, business_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive profitability analysis"""
        try:
            # Extract key metrics
            metrics = await self._extract_profitability_metrics(business_data)
            
            # Generate recommendations
            recommendations = await self._generate_optimization_recommendations(metrics, business_data)
            
            # Create business scenarios
            scenarios = await self._create_business_scenarios(metrics, business_data)
            
            # Generate insights
            insights = await self._generate_profitability_insights(metrics, recommendations)
            
            # Calculate overall health score
            health_score = await self._calculate_business_health_score(metrics)
            
            # Greek market analysis
            greek_analysis = await self._analyze_greek_market_position(business_data, metrics)
            
            return {
                "analysis_id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat(),
                "business_health_score": health_score,
                "key_metrics": [asdict(metric) for metric in metrics.values()],
                "recommendations": [asdict(rec) for rec in recommendations.values()],
                "scenarios": [asdict(scenario) for scenario in scenarios.values()],
                "insights": [asdict(insight) for insight in insights.values()],
                "greek_market_analysis": greek_analysis,
                "optimization_summary": {
                    "total_potential_profit_increase": sum(rec.expected_impact for rec in recommendations.values()),
                    "quick_wins": [rec for rec in recommendations.values() if rec.implementation_difficulty == ImplementationDifficulty.EASY],
                    "high_impact_initiatives": [rec for rec in recommendations.values() if rec.impact_level == ImpactLevel.HIGH],
                    "priority_actions": sorted(recommendations.values(), key=lambda x: x.priority_score, reverse=True)[:5]
                }
            }
            
        except Exception as e:
            logger.error(f"Error in profitability analysis: {str(e)}")
            raise

    async def _extract_profitability_metrics(self, business_data: Dict[str, Any]) -> Dict[str, ProfitabilityMetric]:
        """Extract and calculate key profitability metrics"""
        metrics = {}
        
        # Financial metrics
        revenue = business_data.get("revenue", 0)
        costs = business_data.get("costs", 0)
        profit = revenue - costs
        
        metrics["profit_margin"] = ProfitabilityMetric(
            id="profit_margin",
            name="Περιθώριο Κέρδους",
            type=MetricType.FINANCIAL,
            current_value=profit / revenue if revenue > 0 else 0,
            target_value=0.20,
            unit="percentage",
            trend="stable",
            last_updated=datetime.utcnow(),
            data_points=[(datetime.utcnow(), profit / revenue if revenue > 0 else 0)],
            benchmark_value=0.18,
            industry_average=0.15
        )
        
        metrics["revenue_growth"] = ProfitabilityMetric(
            id="revenue_growth",
            name="Ανάπτυξη Εσόδων",
            type=MetricType.FINANCIAL,
            current_value=business_data.get("revenue_growth", 0.05),
            target_value=0.25,
            unit="percentage",
            trend="up",
            last_updated=datetime.utcnow(),
            data_points=[(datetime.utcnow(), business_data.get("revenue_growth", 0.05))],
            benchmark_value=0.20,
            industry_average=0.15
        )
        
        # Operational metrics
        metrics["cost_efficiency"] = ProfitabilityMetric(
            id="cost_efficiency",
            name="Αποδοτικότητα Κόστους",
            type=MetricType.OPERATIONAL,
            current_value=costs / revenue if revenue > 0 else 1,
            target_value=0.70,
            unit="ratio",
            trend="down",
            last_updated=datetime.utcnow(),
            data_points=[(datetime.utcnow(), costs / revenue if revenue > 0 else 1)],
            benchmark_value=0.75,
            industry_average=0.80
        )
        
        # Customer metrics
        customer_count = business_data.get("customer_count", 100)
        metrics["customer_lifetime_value"] = ProfitabilityMetric(
            id="customer_lifetime_value",
            name="Αξία Πελάτη",
            type=MetricType.CUSTOMER,
            current_value=business_data.get("customer_ltv", 400),
            target_value=600,
            unit="euros",
            trend="up",
            last_updated=datetime.utcnow(),
            data_points=[(datetime.utcnow(), business_data.get("customer_ltv", 400))],
            benchmark_value=500,
            industry_average=450
        )
        
        # Employee metrics
        employee_count = business_data.get("employee_count", 5)
        metrics["employee_productivity"] = ProfitabilityMetric(
            id="employee_productivity",
            name="Παραγωγικότητα Εργαζομένων",
            type=MetricType.EMPLOYEE,
            current_value=revenue / employee_count if employee_count > 0 else 0,
            target_value=120000,
            unit="euros_per_employee",
            trend="stable",
            last_updated=datetime.utcnow(),
            data_points=[(datetime.utcnow(), revenue / employee_count if employee_count > 0 else 0)],
            benchmark_value=100000,
            industry_average=85000
        )
        
        return metrics

    async def _generate_optimization_recommendations(self, metrics: Dict[str, ProfitabilityMetric], business_data: Dict[str, Any]) -> Dict[str, OptimizationRecommendation]:
        """Generate AI-powered optimization recommendations"""
        recommendations = {}
        
        # Analyze profit margin
        profit_margin = metrics.get("profit_margin")
        if profit_margin and profit_margin.current_value < 0.15:
            recommendations["improve_profit_margin"] = OptimizationRecommendation(
                id="improve_profit_margin",
                category=OptimizationCategory.COST_REDUCTION,
                title="Βελτίωση Περιθωρίου Κέρδους",
                description="Το περιθώριο κέρδους είναι κάτω από τον βιομηχανικό μέσο όρο. Απαιτείται άμεση δράση.",
                rationale="Χαμηλό περιθώριο κέρδους επηρεάζει τη βιωσιμότητα και την ανάπτυξη της επιχείρησης.",
                expected_impact=50000,
                impact_level=ImpactLevel.HIGH,
                implementation_difficulty=ImplementationDifficulty.MEDIUM,
                estimated_timeline=90,
                estimated_cost=5000,
                roi_percentage=900,
                risk_factors=["Αντίσταση πελατών σε αυξήσεις τιμών", "Ανταγωνιστικές πιέσεις"],
                success_metrics=["Αύξηση περιθωρίου κέρδους κατά 5%", "Διατήρηση πελατειακής βάσης"],
                action_steps=[
                    "Ανάλυση κόστους προϊόντων/υπηρεσιών",
                    "Εντοπισμός περιττών εξόδων",
                    "Αξιολόγηση τιμολογιακής πολιτικής",
                    "Διαπραγμάτευση με προμηθευτές",
                    "Βελτιστοποίηση λειτουργικών διαδικασιών"
                ],
                related_metrics=["profit_margin", "cost_efficiency"],
                confidence_score=0.85,
                created_at=datetime.utcnow(),
                priority_score=0.90,
                dependencies=[],
                compliance_considerations=["Νομοθεσία προστασίας καταναλωτή", "Φορολογικές υποχρεώσεις"],
                greek_market_specifics=["Υψηλός ΦΠΑ 24%", "Εποχιακότητα στην Ελλάδα"]
            )
        
        # Analyze customer metrics
        customer_ltv = metrics.get("customer_lifetime_value")
        if customer_ltv and customer_ltv.current_value < 500:
            recommendations["increase_customer_value"] = OptimizationRecommendation(
                id="increase_customer_value",
                category=OptimizationCategory.CUSTOMER_RETENTION,
                title="Αύξηση Αξίας Πελάτη",
                description="Η αξία πελάτη είναι κάτω από τον στόχο. Ευκαιρία για βελτίωση.",
                rationale="Υψηλότερη αξία πελάτη σημαίνει μεγαλύτερη κερδοφορία χωρίς επιπλέον κόστος απόκτησης.",
                expected_impact=30000,
                impact_level=ImpactLevel.MEDIUM,
                implementation_difficulty=ImplementationDifficulty.MEDIUM,
                estimated_timeline=120,
                estimated_cost=8000,
                roi_percentage=275,
                risk_factors=["Αλλαγή συμπεριφοράς πελατών", "Ανταγωνιστικές προσφορές"],
                success_metrics=["Αύξηση μέσης αξίας παραγγελίας", "Βελτίωση συχνότητας αγορών"],
                action_steps=[
                    "Ανάλυση πελατειακής συμπεριφοράς",
                    "Δημιουργία προγραμμάτων πιστότητας",
                    "Cross-selling και up-selling στρατηγικές",
                    "Βελτίωση εξυπηρέτησης πελατών",
                    "Προσωποποίηση προσφορών"
                ],
                related_metrics=["customer_lifetime_value"],
                confidence_score=0.75,
                created_at=datetime.utcnow(),
                priority_score=0.70,
                dependencies=[],
                compliance_considerations=["GDPR για δεδομένα πελατών", "Προστασία προσωπικών δεδομένων"],
                greek_market_specifics=["Ελληνική νοοτροπία πιστότητας", "Εποχιακές συνήθειες"]
            )
        
        # Analyze employee productivity
        employee_productivity = metrics.get("employee_productivity")
        if employee_productivity and employee_productivity.current_value < 100000:
            recommendations["improve_productivity"] = OptimizationRecommendation(
                id="improve_productivity",
                category=OptimizationCategory.OPERATIONAL_EFFICIENCY,
                title="Βελτίωση Παραγωγικότητας",
                description="Η παραγωγικότητα εργαζομένων μπορεί να βελτιωθεί σημαντικά.",
                rationale="Υψηλότερη παραγωγικότητα αυξάνει τα έσοδα χωρίς ανάλογη αύξηση κόστους.",
                expected_impact=25000,
                impact_level=ImpactLevel.MEDIUM,
                implementation_difficulty=ImplementationDifficulty.MEDIUM,
                estimated_timeline=180,
                estimated_cost=12000,
                roi_percentage=108,
                risk_factors=["Αντίσταση στην αλλαγή", "Χρόνος εκμάθησης"],
                success_metrics=["Αύξηση παραγωγικότητας κατά 20%", "Βελτίωση ποιότητας εργασίας"],
                action_steps=[
                    "Εκπαίδευση προσωπικού",
                    "Βελτίωση διαδικασιών",
                    "Τεχνολογικές λύσεις",
                    "Κίνητρα απόδοσης",
                    "Καλύτερη διαχείριση χρόνου"
                ],
                related_metrics=["employee_productivity"],
                confidence_score=0.80,
                created_at=datetime.utcnow(),
                priority_score=0.65,
                dependencies=[],
                compliance_considerations=["Εργατικό δίκαιο", "Ασφάλεια εργασίας"],
                greek_market_specifics=["Ελληνική εργατική νομοθεσία", "Συλλογικές συμβάσεις"]
            )
        
        # Cost optimization recommendation
        cost_efficiency = metrics.get("cost_efficiency")
        if cost_efficiency and cost_efficiency.current_value > 0.80:
            recommendations["optimize_costs"] = OptimizationRecommendation(
                id="optimize_costs",
                category=OptimizationCategory.COST_REDUCTION,
                title="Βελτιστοποίηση Κόστους",
                description="Υπάρχει σημαντικό περιθώριο μείωσης λειτουργικών κοστών.",
                rationale="Μείωση κόστους αυξάνει άμεσα την κερδοφορία χωρίς επίπτωση στα έσοδα.",
                expected_impact=40000,
                impact_level=ImpactLevel.HIGH,
                implementation_difficulty=ImplementationDifficulty.EASY,
                estimated_timeline=60,
                estimated_cost=2000,
                roi_percentage=1900,
                risk_factors=["Επίπτωση στην ποιότητα", "Δυσαρέσκεια εργαζομένων"],
                success_metrics=["Μείωση κόστους κατά 10%", "Διατήρηση ποιότητας υπηρεσιών"],
                action_steps=[
                    "Audit λειτουργικών εξόδων",
                    "Διαπραγμάτευση με προμηθευτές",
                    "Ψηφιοποίηση διαδικασιών",
                    "Εξοικονόμηση ενέργειας",
                    "Βελτιστοποίηση αποθεμάτων"
                ],
                related_metrics=["cost_efficiency"],
                confidence_score=0.90,
                created_at=datetime.utcnow(),
                priority_score=0.95,
                dependencies=[],
                compliance_considerations=["Φορολογικές υποχρεώσεις", "Συμβάσεις προμηθευτών"],
                greek_market_specifics=["Ελληνικές φορολογικές απαιτήσεις", "Τοπικοί προμηθευτές"]
            )
        
        return recommendations

    async def _create_business_scenarios(self, metrics: Dict[str, ProfitabilityMetric], business_data: Dict[str, Any]) -> Dict[str, BusinessScenario]:
        """Create business scenarios for forecasting"""
        scenarios = {}
        
        current_revenue = business_data.get("revenue", 100000)
        current_costs = business_data.get("costs", 80000)
        
        # Optimistic scenario
        scenarios["optimistic"] = BusinessScenario(
            id="optimistic",
            name="Αισιόδοξο Σενάριο",
            description="Υλοποίηση όλων των βασικών συστάσεων με επιτυχία",
            assumptions={
                "revenue_growth": 0.30,
                "cost_reduction": 0.15,
                "market_expansion": 0.20,
                "efficiency_improvement": 0.25
            },
            projected_revenue=current_revenue * 1.30,
            projected_costs=current_costs * 0.85,
            projected_profit=(current_revenue * 1.30) - (current_costs * 0.85),
            probability=0.25,
            timeline=12,
            key_factors=[
                "Επιτυχής υλοποίηση όλων των συστάσεων",
                "Ευνοϊκές συνθήκες αγοράς",
                "Υψηλή απόδοση εργαζομένων",
                "Στρατηγικές συνεργασίες"
            ],
            risks=[
                "Υπερβολικά αισιόδοξες προβλέψεις",
                "Αναπάντεχες αλλαγές στην αγορά",
                "Ανταγωνιστικές πιέσεις"
            ],
            mitigation_strategies=[
                "Σταδιακή υλοποίηση",
                "Συνεχής παρακολούθηση",
                "Εφεδρικά σχέδια"
            ]
        )
        
        # Realistic scenario
        scenarios["realistic"] = BusinessScenario(
            id="realistic",
            name="Ρεαλιστικό Σενάριο",
            description="Μέτρια υλοποίηση συστάσεων με κανονικές συνθήκες αγοράς",
            assumptions={
                "revenue_growth": 0.15,
                "cost_reduction": 0.08,
                "market_expansion": 0.10,
                "efficiency_improvement": 0.12
            },
            projected_revenue=current_revenue * 1.15,
            projected_costs=current_costs * 0.92,
            projected_profit=(current_revenue * 1.15) - (current_costs * 0.92),
            probability=0.60,
            timeline=12,
            key_factors=[
                "Μέτρια υλοποίηση συστάσεων",
                "Σταθερές συνθήκες αγοράς",
                "Κανονική απόδοση εργαζομένων",
                "Σταδιακή βελτίωση"
            ],
            risks=[
                "Αργή υλοποίηση αλλαγών",
                "Ανταγωνιστικές πιέσεις",
                "Οικονομική αστάθεια"
            ],
            mitigation_strategies=[
                "Εστίαση σε κρίσιμες αλλαγές",
                "Καλύτερη επικοινωνία",
                "Ευελιξία στην εκτέλεση"
            ]
        )
        
        # Conservative scenario
        scenarios["conservative"] = BusinessScenario(
            id="conservative",
            name="Συντηρητικό Σενάριο",
            description="Ελάχιστες αλλαγές με δυσμενείς συνθήκες",
            assumptions={
                "revenue_growth": 0.05,
                "cost_reduction": 0.03,
                "market_expansion": 0.02,
                "efficiency_improvement": 0.05
            },
            projected_revenue=current_revenue * 1.05,
            projected_costs=current_costs * 0.97,
            projected_profit=(current_revenue * 1.05) - (current_costs * 0.97),
            probability=0.15,
            timeline=12,
            key_factors=[
                "Ελάχιστη υλοποίηση αλλαγών",
                "Δυσμενείς συνθήκες αγοράς",
                "Αντίσταση στην αλλαγή",
                "Περιορισμένοι πόροι"
            ],
            risks=[
                "Στασιμότητα επιχείρησης",
                "Απώλεια ανταγωνιστικότητας",
                "Οικονομική κρίση"
            ],
            mitigation_strategies=[
                "Εστίαση σε βασικά",
                "Διατήρηση ρευστότητας",
                "Προετοιμασία για ανάκαμψη"
            ]
        )
        
        return scenarios

    async def _generate_profitability_insights(self, metrics: Dict[str, ProfitabilityMetric], recommendations: Dict[str, OptimizationRecommendation]) -> Dict[str, ProfitabilityInsight]:
        """Generate actionable business insights"""
        insights = {}
        
        # Profitability trend insight
        insights["profitability_trend"] = ProfitabilityInsight(
            id="profitability_trend",
            insight_type="trend_analysis",
            title="Τάση Κερδοφορίας",
            description="Η κερδοφορία σας εμφανίζει σταθερή αλλά μέτρια απόδοση με δυνατότητες βελτίωσης.",
            data_sources=["profit_margin", "revenue_growth", "cost_efficiency"],
            supporting_evidence=[
                "Περιθώριο κέρδους 5% κάτω από τον μέσο όρο της βιομηχανίας",
                "Σταθερή αύξηση εσόδων αλλά αργή",
                "Κόστος αυξάνεται ταχύτερα από τα έσοδα"
            ],
            actionable_recommendations=[
                "Άμεση εστίαση σε μείωση κόστους",
                "Βελτίωση τιμολογιακής στρατηγικής",
                "Αύξηση παραγωγικότητας"
            ],
            created_at=datetime.utcnow(),
            relevance_score=0.95,
            greek_business_context="Στο ελληνικό επιχειρηματικό περιβάλλον, η διατήρηση κερδοφορίας είναι κρίσιμη λόγω των υψηλών φορολογικών υποχρεώσεων και της οικονομικής αστάθειας."
        )
        
        # Customer value insight
        insights["customer_optimization"] = ProfitabilityInsight(
            id="customer_optimization",
            insight_type="customer_analysis",
            title="Βελτιστοποίηση Πελατειακής Αξίας",
            description="Υπάρχει σημαντικό περιθώριο αύξησης της αξίας που αντλείτε από τους υπάρχοντες πελάτες.",
            data_sources=["customer_lifetime_value", "customer_acquisition_cost"],
            supporting_evidence=[
                "Χαμηλή συχνότητα επαναλαμβανόμενων αγορών",
                "Περιορισμένη αξιοποίηση cross-selling",
                "Υψηλό κόστος απόκτησης νέων πελατών"
            ],
            actionable_recommendations=[
                "Ανάπτυξη προγραμμάτων πιστότητας",
                "Βελτίωση εξυπηρέτησης πελατών",
                "Στρατηγικές διατήρησης πελατών"
            ],
            created_at=datetime.utcnow(),
            relevance_score=0.88,
            greek_business_context="Οι Έλληνες καταναλωτές εκτιμούν τη προσωπική εξυπηρέτηση και τη δημιουργία σχέσεων εμπιστοσύνης με τις επιχειρήσεις."
        )
        
        # Market opportunity insight
        insights["market_opportunity"] = ProfitabilityInsight(
            id="market_opportunity",
            insight_type="market_analysis",
            title="Ευκαιρίες Αγοράς",
            description="Εντοπίστηκαν νέες ευκαιρίες στην αγορά που μπορούν να αυξήσουν τα έσοδα.",
            data_sources=["market_analysis", "competitor_analysis"],
            supporting_evidence=[
                "Αυξανόμενη ζήτηση για ψηφιακές υπηρεσίες",
                "Κενά στην αγορά από ανταγωνιστές",
                "Νέες τεχνολογικές τάσεις"
            ],
            actionable_recommendations=[
                "Επέκταση σε νέα κανάλια πώλησης",
                "Ανάπτυξη νέων προϊόντων/υπηρεσιών",
                "Στρατηγικές συνεργασίες"
            ],
            created_at=datetime.utcnow(),
            relevance_score=0.82,
            greek_business_context="Η ελληνική αγορά παρουσιάζει ευκαιρίες στον τομέα της ψηφιακής μετάβασης και της βιωσιμότητας."
        )
        
        return insights

    async def _calculate_business_health_score(self, metrics: Dict[str, ProfitabilityMetric]) -> Dict[str, Any]:
        """Calculate overall business health score"""
        try:
            scores = {}
            
            # Financial health (40% weight)
            profit_margin = metrics.get("profit_margin")
            revenue_growth = metrics.get("revenue_growth")
            
            financial_score = 0
            if profit_margin:
                financial_score += (profit_margin.current_value / 0.30) * 0.6  # 60% of financial score
            if revenue_growth:
                financial_score += (revenue_growth.current_value / 0.25) * 0.4  # 40% of financial score
            
            scores["financial_health"] = min(financial_score, 1.0)
            
            # Operational efficiency (30% weight)
            cost_efficiency = metrics.get("cost_efficiency")
            employee_productivity = metrics.get("employee_productivity")
            
            operational_score = 0
            if cost_efficiency:
                operational_score += (1 - cost_efficiency.current_value) * 0.5  # Lower is better
            if employee_productivity:
                operational_score += (employee_productivity.current_value / 120000) * 0.5
            
            scores["operational_efficiency"] = min(operational_score, 1.0)
            
            # Customer satisfaction (20% weight)
            customer_ltv = metrics.get("customer_lifetime_value")
            customer_score = 0
            if customer_ltv:
                customer_score = customer_ltv.current_value / 600
            
            scores["customer_satisfaction"] = min(customer_score, 1.0)
            
            # Market position (10% weight)
            market_score = 0.75  # Mock score - would be calculated from market data
            scores["market_position"] = market_score
            
            # Overall score
            overall_score = (
                scores["financial_health"] * 0.40 +
                scores["operational_efficiency"] * 0.30 +
                scores["customer_satisfaction"] * 0.20 +
                scores["market_position"] * 0.10
            )
            
            # Determine health level
            if overall_score >= 0.85:
                health_level = "Εξαιρετική"
                color = "green"
            elif overall_score >= 0.70:
                health_level = "Καλή"
                color = "blue"
            elif overall_score >= 0.55:
                health_level = "Μέτρια"
                color = "yellow"
            else:
                health_level = "Χρήζει Βελτίωσης"
                color = "red"
            
            return {
                "overall_score": overall_score,
                "health_level": health_level,
                "color": color,
                "component_scores": scores,
                "recommendations_count": len([s for s in scores.values() if s < 0.70]),
                "strengths": [k for k, v in scores.items() if v >= 0.80],
                "improvement_areas": [k for k, v in scores.items() if v < 0.60]
            }
            
        except Exception as e:
            logger.error(f"Error calculating business health score: {str(e)}")
            return {
                "overall_score": 0.5,
                "health_level": "Άγνωστη",
                "color": "gray",
                "component_scores": {},
                "recommendations_count": 0,
                "strengths": [],
                "improvement_areas": []
            }

    async def _analyze_greek_market_position(self, business_data: Dict[str, Any], metrics: Dict[str, ProfitabilityMetric]) -> Dict[str, Any]:
        """Analyze business position in Greek market context"""
        try:
            analysis = {
                "market_context": {
                    "economic_environment": "Σταδιακή ανάκαμψη μετά την κρίση",
                    "key_challenges": [
                        "Υψηλή φορολογία",
                        "Περιορισμένη ρευστότητα",
                        "Γραφειοκρατία",
                        "Ανταγωνισμός από εισαγωγές"
                    ],
                    "opportunities": [
                        "Ψηφιακή μετάβαση",
                        "Τουρισμός",
                        "Εξαγωγές",
                        "Πράσινη ανάπτυξη"
                    ]
                },
                "competitive_position": {
                    "relative_performance": "Μέτρια απόδοση σε σχέση με τον κλάδο",
                    "market_share": "Εκτιμώμενο 2-5% τοπικής αγοράς",
                    "differentiators": [
                        "Τοπική εξυπηρέτηση",
                        "Προσωποποιημένη προσέγγιση",
                        "Γνώση ελληνικής αγοράς"
                    ]
                },
                "greek_specific_recommendations": [
                    "Αξιοποίηση φορολογικών κινήτρων",
                    "Συμμετοχή σε ευρωπαϊκά προγράμματα",
                    "Εστίαση σε εξαγωγές",
                    "Βελτίωση ψηφιακής παρουσίας"
                ],
                "regulatory_considerations": [
                    "Συμμόρφωση με GDPR",
                    "Φορολογικές υποχρεώσεις",
                    "Εργατική νομοθεσία",
                    "Περιβαλλοντικές απαιτήσεις"
                ],
                "seasonal_impact": {
                    "high_season": "Ιούνιος - Σεπτέμβριος",
                    "low_season": "Ιανουάριος - Μάρτιος",
                    "recommendations": [
                        "Διαχείριση ταμειακών ροών",
                        "Εποχιακές προσφορές",
                        "Διαφοροποίηση προϊόντων"
                    ]
                }
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing Greek market position: {str(e)}")
            return {"error": "Σφάλμα ανάλυσης αγοράς"}

    async def get_optimization_dashboard(self, user_id: int) -> Dict[str, Any]:
        """Get optimization dashboard data"""
        try:
            # Mock business data - in production, fetch from database
            business_data = {
                "revenue": 150000,
                "costs": 120000,
                "revenue_growth": 0.08,
                "customer_count": 250,
                "customer_ltv": 450,
                "employee_count": 8
            }
            
            # Perform analysis
            analysis = await self.analyze_profitability(business_data)
            
            # Get quick wins
            quick_wins = [rec for rec in analysis["recommendations"] if rec["implementation_difficulty"] == "easy"]
            
            # Get priority metrics
            priority_metrics = [metric for metric in analysis["key_metrics"] if metric["current_value"] < metric["target_value"]]
            
            dashboard = {
                "summary": {
                    "business_health_score": analysis["business_health_score"],
                    "total_potential_impact": analysis["optimization_summary"]["total_potential_profit_increase"],
                    "quick_wins_count": len(quick_wins),
                    "priority_actions_count": len(analysis["optimization_summary"]["priority_actions"])
                },
                "key_metrics": priority_metrics[:6],  # Top 6 metrics
                "recommendations": analysis["optimization_summary"]["priority_actions"][:5],  # Top 5 recommendations
                "scenarios": analysis["scenarios"],
                "insights": analysis["insights"][:3],  # Top 3 insights
                "greek_market_context": analysis["greek_market_analysis"],
                "last_updated": datetime.utcnow().isoformat()
            }
            
            return dashboard
            
        except Exception as e:
            logger.error(f"Error getting optimization dashboard: {str(e)}")
            raise

    async def simulate_optimization_impact(self, recommendation_ids: List[str], business_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate the impact of implementing specific recommendations"""
        try:
            # Get current metrics
            current_metrics = await self._extract_profitability_metrics(business_data)
            
            # Calculate impact
            total_impact = 0
            implementation_cost = 0
            timeline = 0
            
            for rec_id in recommendation_ids:
                # Mock recommendation data - in production, fetch from database
                if rec_id == "optimize_costs":
                    total_impact += 40000
                    implementation_cost += 2000
                    timeline = max(timeline, 60)
                elif rec_id == "improve_profit_margin":
                    total_impact += 50000
                    implementation_cost += 5000
                    timeline = max(timeline, 90)
                # Add more recommendations as needed
            
            # Calculate ROI
            roi = (total_impact - implementation_cost) / implementation_cost * 100 if implementation_cost > 0 else 0
            
            # Project new metrics
            current_revenue = business_data.get("revenue", 0)
            current_costs = business_data.get("costs", 0)
            
            projected_revenue = current_revenue * 1.15  # 15% increase
            projected_costs = current_costs * 0.92  # 8% reduction
            projected_profit = projected_revenue - projected_costs
            
            return {
                "simulation_id": str(uuid.uuid4()),
                "recommendations_count": len(recommendation_ids),
                "projected_impact": {
                    "total_profit_increase": total_impact,
                    "implementation_cost": implementation_cost,
                    "net_benefit": total_impact - implementation_cost,
                    "roi_percentage": roi,
                    "timeline_days": timeline
                },
                "projected_metrics": {
                    "revenue": projected_revenue,
                    "costs": projected_costs,
                    "profit": projected_profit,
                    "profit_margin": projected_profit / projected_revenue if projected_revenue > 0 else 0
                },
                "risk_assessment": {
                    "implementation_risk": "Μέτριος",
                    "market_risk": "Χαμηλός",
                    "financial_risk": "Χαμηλός",
                    "overall_risk": "Μέτριος"
                },
                "success_probability": 0.75,
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error simulating optimization impact: {str(e)}")
            raise

# Global instance
profitability_optimizer = ProfitabilityOptimizer()