from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime

from app.core.database import get_db
from app.services.profitability_optimizer import profitability_optimizer
from app.services.auth_service import AuthService
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/profitability/dashboard")
async def get_profitability_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get the profitability optimization dashboard
    """
    try:
        dashboard = await profitability_optimizer.get_optimization_dashboard(current_user.id)
        
        logger.info(f"Profitability dashboard retrieved for user {current_user.id}")
        
        return dashboard
        
    except Exception as e:
        logger.error(f"Error getting profitability dashboard: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση του dashboard"
        )

@router.post("/profitability/analyze")
async def analyze_profitability(
    business_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Perform comprehensive profitability analysis
    """
    try:
        # Add user context
        business_data["user_id"] = current_user.id
        
        # Perform analysis
        analysis = await profitability_optimizer.analyze_profitability(business_data)
        
        logger.info(f"Profitability analysis completed for user {current_user.id}")
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing profitability: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάλυση κερδοφορίας"
        )

@router.post("/profitability/simulate")
async def simulate_optimization_impact(
    simulation_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Simulate the impact of implementing specific recommendations
    """
    try:
        recommendation_ids = simulation_data.get("recommendation_ids", [])
        business_data = simulation_data.get("business_data", {})
        
        # Add user context
        business_data["user_id"] = current_user.id
        
        # Simulate impact
        simulation = await profitability_optimizer.simulate_optimization_impact(
            recommendation_ids, business_data
        )
        
        logger.info(f"Optimization simulation completed for user {current_user.id}")
        
        return simulation
        
    except Exception as e:
        logger.error(f"Error simulating optimization impact: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την προσομοίωση"
        )

@router.get("/profitability/metrics")
async def get_profitability_metrics(
    metric_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get profitability metrics with optional filtering
    """
    try:
        # Mock business data - in production, fetch from database
        business_data = {
            "revenue": 150000,
            "costs": 120000,
            "revenue_growth": 0.08,
            "customer_count": 250,
            "customer_ltv": 450,
            "employee_count": 8,
            "user_id": current_user.id
        }
        
        # Extract metrics
        metrics = await profitability_optimizer._extract_profitability_metrics(business_data)
        
        # Filter by type if specified
        if metric_type:
            metrics = {k: v for k, v in metrics.items() if v.type.value == metric_type}
        
        # Convert to serializable format
        metrics_data = []
        for metric in metrics.values():
            metrics_data.append({
                "id": metric.id,
                "name": metric.name,
                "type": metric.type.value,
                "current_value": metric.current_value,
                "target_value": metric.target_value,
                "unit": metric.unit,
                "trend": metric.trend,
                "last_updated": metric.last_updated.isoformat(),
                "benchmark_value": metric.benchmark_value,
                "industry_average": metric.industry_average,
                "performance_status": "above_target" if metric.current_value >= metric.target_value else "below_target",
                "improvement_needed": max(0, metric.target_value - metric.current_value),
                "performance_percentage": (metric.current_value / metric.target_value * 100) if metric.target_value > 0 else 0
            })
        
        return {
            "metrics": metrics_data,
            "total_count": len(metrics_data),
            "filter_applied": metric_type,
            "summary": {
                "above_target": len([m for m in metrics_data if m["performance_status"] == "above_target"]),
                "below_target": len([m for m in metrics_data if m["performance_status"] == "below_target"]),
                "average_performance": sum(m["performance_percentage"] for m in metrics_data) / len(metrics_data) if metrics_data else 0
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting profitability metrics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση μετρικών"
        )

@router.get("/profitability/recommendations")
async def get_optimization_recommendations(
    category: Optional[str] = Query(None),
    impact_level: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get optimization recommendations with filtering
    """
    try:
        # Mock business data - in production, fetch from database
        business_data = {
            "revenue": 150000,
            "costs": 120000,
            "revenue_growth": 0.08,
            "customer_count": 250,
            "customer_ltv": 450,
            "employee_count": 8,
            "user_id": current_user.id
        }
        
        # Get metrics and recommendations
        metrics = await profitability_optimizer._extract_profitability_metrics(business_data)
        recommendations = await profitability_optimizer._generate_optimization_recommendations(metrics, business_data)
        
        # Filter recommendations
        filtered_recommendations = []
        for rec in recommendations.values():
            if category and rec.category.value != category:
                continue
            if impact_level and rec.impact_level.value != impact_level:
                continue
            if difficulty and rec.implementation_difficulty.value != difficulty:
                continue
            
            filtered_recommendations.append({
                "id": rec.id,
                "category": rec.category.value,
                "title": rec.title,
                "description": rec.description,
                "rationale": rec.rationale,
                "expected_impact": rec.expected_impact,
                "impact_level": rec.impact_level.value,
                "implementation_difficulty": rec.implementation_difficulty.value,
                "estimated_timeline": rec.estimated_timeline,
                "estimated_cost": rec.estimated_cost,
                "roi_percentage": rec.roi_percentage,
                "risk_factors": rec.risk_factors,
                "success_metrics": rec.success_metrics,
                "action_steps": rec.action_steps,
                "confidence_score": rec.confidence_score,
                "priority_score": rec.priority_score,
                "created_at": rec.created_at.isoformat(),
                "greek_market_specifics": rec.greek_market_specifics,
                "compliance_considerations": rec.compliance_considerations
            })
        
        # Sort by priority score
        filtered_recommendations.sort(key=lambda x: x["priority_score"], reverse=True)
        
        return {
            "recommendations": filtered_recommendations,
            "total_count": len(filtered_recommendations),
            "filters": {
                "category": category,
                "impact_level": impact_level,
                "difficulty": difficulty
            },
            "summary": {
                "total_potential_impact": sum(r["expected_impact"] for r in filtered_recommendations),
                "average_roi": sum(r["roi_percentage"] for r in filtered_recommendations) / len(filtered_recommendations) if filtered_recommendations else 0,
                "quick_wins": len([r for r in filtered_recommendations if r["implementation_difficulty"] == "easy"]),
                "high_impact": len([r for r in filtered_recommendations if r["impact_level"] == "high"])
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting optimization recommendations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση συστάσεων"
        )

@router.get("/profitability/scenarios")
async def get_business_scenarios(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get business scenarios for forecasting
    """
    try:
        # Mock business data - in production, fetch from database
        business_data = {
            "revenue": 150000,
            "costs": 120000,
            "revenue_growth": 0.08,
            "customer_count": 250,
            "customer_ltv": 450,
            "employee_count": 8,
            "user_id": current_user.id
        }
        
        # Get metrics and scenarios
        metrics = await profitability_optimizer._extract_profitability_metrics(business_data)
        scenarios = await profitability_optimizer._create_business_scenarios(metrics, business_data)
        
        # Convert to serializable format
        scenarios_data = []
        for scenario in scenarios.values():
            scenarios_data.append({
                "id": scenario.id,
                "name": scenario.name,
                "description": scenario.description,
                "assumptions": scenario.assumptions,
                "projected_revenue": scenario.projected_revenue,
                "projected_costs": scenario.projected_costs,
                "projected_profit": scenario.projected_profit,
                "projected_profit_margin": scenario.projected_profit / scenario.projected_revenue if scenario.projected_revenue > 0 else 0,
                "probability": scenario.probability,
                "timeline": scenario.timeline,
                "key_factors": scenario.key_factors,
                "risks": scenario.risks,
                "mitigation_strategies": scenario.mitigation_strategies,
                "revenue_change": ((scenario.projected_revenue - business_data["revenue"]) / business_data["revenue"] * 100) if business_data["revenue"] > 0 else 0,
                "cost_change": ((scenario.projected_costs - business_data["costs"]) / business_data["costs"] * 100) if business_data["costs"] > 0 else 0,
                "profit_change": ((scenario.projected_profit - (business_data["revenue"] - business_data["costs"])) / (business_data["revenue"] - business_data["costs"]) * 100) if (business_data["revenue"] - business_data["costs"]) > 0 else 0
            })
        
        return {
            "scenarios": scenarios_data,
            "total_count": len(scenarios_data),
            "current_metrics": {
                "revenue": business_data["revenue"],
                "costs": business_data["costs"],
                "profit": business_data["revenue"] - business_data["costs"],
                "profit_margin": (business_data["revenue"] - business_data["costs"]) / business_data["revenue"] if business_data["revenue"] > 0 else 0
            },
            "weighted_average": {
                "projected_revenue": sum(s["projected_revenue"] * s["probability"] for s in scenarios_data),
                "projected_costs": sum(s["projected_costs"] * s["probability"] for s in scenarios_data),
                "projected_profit": sum(s["projected_profit"] * s["probability"] for s in scenarios_data)
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting business scenarios: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση σεναρίων"
        )

@router.get("/profitability/insights")
async def get_profitability_insights(
    insight_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get profitability insights
    """
    try:
        # Mock business data - in production, fetch from database
        business_data = {
            "revenue": 150000,
            "costs": 120000,
            "revenue_growth": 0.08,
            "customer_count": 250,
            "customer_ltv": 450,
            "employee_count": 8,
            "user_id": current_user.id
        }
        
        # Get metrics, recommendations, and insights
        metrics = await profitability_optimizer._extract_profitability_metrics(business_data)
        recommendations = await profitability_optimizer._generate_optimization_recommendations(metrics, business_data)
        insights = await profitability_optimizer._generate_profitability_insights(metrics, recommendations)
        
        # Filter by type if specified
        if insight_type:
            insights = {k: v for k, v in insights.items() if v.insight_type == insight_type}
        
        # Convert to serializable format
        insights_data = []
        for insight in insights.values():
            insights_data.append({
                "id": insight.id,
                "insight_type": insight.insight_type,
                "title": insight.title,
                "description": insight.description,
                "data_sources": insight.data_sources,
                "supporting_evidence": insight.supporting_evidence,
                "actionable_recommendations": insight.actionable_recommendations,
                "created_at": insight.created_at.isoformat(),
                "relevance_score": insight.relevance_score,
                "greek_business_context": insight.greek_business_context
            })
        
        # Sort by relevance score
        insights_data.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return {
            "insights": insights_data,
            "total_count": len(insights_data),
            "filter_applied": insight_type,
            "insight_types": list(set(insight["insight_type"] for insight in insights_data)),
            "average_relevance": sum(insight["relevance_score"] for insight in insights_data) / len(insights_data) if insights_data else 0
        }
        
    except Exception as e:
        logger.error(f"Error getting profitability insights: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση insights"
        )

@router.get("/profitability/greek-market-analysis")
async def get_greek_market_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get Greek market-specific analysis
    """
    try:
        # Mock business data - in production, fetch from database
        business_data = {
            "revenue": 150000,
            "costs": 120000,
            "revenue_growth": 0.08,
            "customer_count": 250,
            "customer_ltv": 450,
            "employee_count": 8,
            "user_id": current_user.id
        }
        
        # Get metrics and Greek market analysis
        metrics = await profitability_optimizer._extract_profitability_metrics(business_data)
        greek_analysis = await profitability_optimizer._analyze_greek_market_position(business_data, metrics)
        
        # Add additional Greek market insights
        greek_analysis.update({
            "tax_optimization": {
                "current_tax_burden": 0.35,  # Estimated
                "optimization_opportunities": [
                    "Αξιοποίηση αναπτυξιακών κινήτρων",
                    "Βελτίωση φορολογικού σχεδιασμού",
                    "Επιδοτήσεις και χρηματοδοτήσεις"
                ],
                "potential_savings": 15000
            },
            "labor_market": {
                "current_labor_cost": business_data["costs"] * 0.4,  # Estimated 40% of costs
                "optimization_strategies": [
                    "Προγράμματα εκπαίδευσης ΕΣΠΑ",
                    "Επιδοτήσεις απασχόλησης",
                    "Ευελιξία εργασιακών σχέσεων"
                ],
                "compliance_requirements": [
                    "Εργατική νομοθεσία",
                    "Ασφαλιστικές εισφορές",
                    "Υγιεινή και ασφάλεια"
                ]
            },
            "digital_transformation": {
                "current_digital_maturity": 0.6,  # Scale 0-1
                "government_support": [
                    "Ψηφιακή Μετάβαση",
                    "Ελληνική Βιομηχανία 4.0",
                    "Voucher για ψηφιακές υπηρεσίες"
                ],
                "potential_impact": 25000
            }
        })
        
        return greek_analysis
        
    except Exception as e:
        logger.error(f"Error getting Greek market analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάλυση ελληνικής αγοράς"
        )

@router.get("/profitability/health-score")
async def get_business_health_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get business health score and detailed breakdown
    """
    try:
        # Mock business data - in production, fetch from database
        business_data = {
            "revenue": 150000,
            "costs": 120000,
            "revenue_growth": 0.08,
            "customer_count": 250,
            "customer_ltv": 450,
            "employee_count": 8,
            "user_id": current_user.id
        }
        
        # Get metrics and calculate health score
        metrics = await profitability_optimizer._extract_profitability_metrics(business_data)
        health_score = await profitability_optimizer._calculate_business_health_score(metrics)
        
        # Add trend analysis
        health_score.update({
            "trend_analysis": {
                "direction": "improving",
                "velocity": 0.05,  # 5% improvement per month
                "forecast_3_months": min(health_score["overall_score"] + 0.15, 1.0),
                "forecast_6_months": min(health_score["overall_score"] + 0.25, 1.0),
                "forecast_12_months": min(health_score["overall_score"] + 0.35, 1.0)
            },
            "benchmarking": {
                "industry_average": 0.72,
                "top_quartile": 0.85,
                "your_percentile": 65,
                "gap_to_top_quartile": 0.85 - health_score["overall_score"]
            },
            "action_plan": {
                "immediate_actions": [
                    "Βελτίωση ταμειακών ροών",
                    "Μείωση λειτουργικών κοστών",
                    "Αύξηση πωλήσεων"
                ],
                "short_term_goals": [
                    "Βελτίωση περιθωρίου κέρδους",
                    "Αύξηση παραγωγικότητας",
                    "Βελτίωση πελατειακής εξυπηρέτησης"
                ],
                "long_term_vision": [
                    "Επέκταση αγοράς",
                    "Ψηφιακή μετάβαση",
                    "Βιώσιμη ανάπτυξη"
                ]
            }
        })
        
        return health_score
        
    except Exception as e:
        logger.error(f"Error getting business health score: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά τον υπολογισμό health score"
        )

@router.get("/profitability/optimization-opportunities")
async def get_optimization_opportunities(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get categorized optimization opportunities
    """
    try:
        # Mock business data - in production, fetch from database
        business_data = {
            "revenue": 150000,
            "costs": 120000,
            "revenue_growth": 0.08,
            "customer_count": 250,
            "customer_ltv": 450,
            "employee_count": 8,
            "user_id": current_user.id
        }
        
        # Get metrics and recommendations
        metrics = await profitability_optimizer._extract_profitability_metrics(business_data)
        recommendations = await profitability_optimizer._generate_optimization_recommendations(metrics, business_data)
        
        # Categorize opportunities
        opportunities = {
            "quick_wins": [],
            "high_impact": [],
            "strategic_initiatives": [],
            "innovation_opportunities": []
        }
        
        for rec in recommendations.values():
            rec_data = {
                "id": rec.id,
                "title": rec.title,
                "expected_impact": rec.expected_impact,
                "implementation_difficulty": rec.implementation_difficulty.value,
                "estimated_timeline": rec.estimated_timeline,
                "roi_percentage": rec.roi_percentage,
                "confidence_score": rec.confidence_score
            }
            
            if rec.implementation_difficulty.value == "easy" and rec.estimated_timeline <= 30:
                opportunities["quick_wins"].append(rec_data)
            elif rec.impact_level.value == "high":
                opportunities["high_impact"].append(rec_data)
            elif rec.estimated_timeline > 180:
                opportunities["strategic_initiatives"].append(rec_data)
            else:
                opportunities["innovation_opportunities"].append(rec_data)
        
        # Calculate totals
        total_impact = sum(rec.expected_impact for rec in recommendations.values())
        total_cost = sum(rec.estimated_cost for rec in recommendations.values())
        
        return {
            "opportunities": opportunities,
            "summary": {
                "total_opportunities": len(recommendations),
                "total_potential_impact": total_impact,
                "total_implementation_cost": total_cost,
                "net_benefit": total_impact - total_cost,
                "average_roi": sum(rec.roi_percentage for rec in recommendations.values()) / len(recommendations) if recommendations else 0
            },
            "prioritization_matrix": {
                "high_impact_low_effort": len(opportunities["quick_wins"]),
                "high_impact_high_effort": len(opportunities["high_impact"]),
                "strategic_value": len(opportunities["strategic_initiatives"]),
                "innovation_potential": len(opportunities["innovation_opportunities"])
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting optimization opportunities: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση ευκαιριών"
        )