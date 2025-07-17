import asyncio
import aiohttp
import json
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
from urllib.parse import urljoin

from app.core.config import settings

logger = logging.getLogger(__name__)

class GovernmentService(Enum):
    ERGANI = "ergani"
    AADE = "aade"
    DYPA = "dypa"
    KEP = "kep"
    EFKA = "efka"
    OAED = "oaed"
    MINISTRY_DEVELOPMENT = "ministry_development"
    MINISTRY_HEALTH = "ministry_health"
    MINISTRY_LABOR = "ministry_labor"

@dataclass
class APIEndpoint:
    service: GovernmentService
    name: str
    base_url: str
    endpoint: str
    method: str
    auth_type: str  # "api_key", "oauth", "certificate", "none"
    auth_config: Dict[str, Any]
    rate_limit: int  # requests per minute
    timeout: int = 30
    is_active: bool = True

@dataclass
class APIResponse:
    success: bool
    status_code: int
    data: Optional[Dict[str, Any]]
    error_message: Optional[str]
    response_time_ms: int
    timestamp: datetime

class GovernmentAPIService:
    def __init__(self):
        self.session = None
        self.endpoints = self._initialize_endpoints()
        self.rate_limits = {}
        self.last_requests = {}

    def _initialize_endpoints(self) -> Dict[str, APIEndpoint]:
        """Initialize all government API endpoints"""
        return {
            # ΕΡΓΑΝΗ - Employee Registration System
            "ergani_e3_submit": APIEndpoint(
                service=GovernmentService.ERGANI,
                name="Submit E3 Form",
                base_url="https://www.ergani.gov.gr/api/v1/",
                endpoint="employee-registration/e3",
                method="POST",
                auth_type="certificate",
                auth_config={"cert_path": "/path/to/cert.pem", "key_path": "/path/to/key.pem"},
                rate_limit=100
            ),
            "ergani_e4_submit": APIEndpoint(
                service=GovernmentService.ERGANI,
                name="Submit E4 Form",
                base_url="https://www.ergani.gov.gr/api/v1/",
                endpoint="employee-registration/e4",
                method="POST",
                auth_type="certificate",
                auth_config={"cert_path": "/path/to/cert.pem", "key_path": "/path/to/key.pem"},
                rate_limit=100
            ),
            "ergani_status_check": APIEndpoint(
                service=GovernmentService.ERGANI,
                name="Check Submission Status",
                base_url="https://www.ergani.gov.gr/api/v1/",
                endpoint="submissions/{submission_id}/status",
                method="GET",
                auth_type="certificate",
                auth_config={"cert_path": "/path/to/cert.pem", "key_path": "/path/to/key.pem"},
                rate_limit=200
            ),
            
            # ΑΑΔΕ - Tax Administration
            "aade_vat_submit": APIEndpoint(
                service=GovernmentService.AADE,
                name="Submit VAT Return",
                base_url="https://www.aade.gr/myaade/api/v1/",
                endpoint="vat-returns",
                method="POST",
                auth_type="oauth",
                auth_config={"client_id": "your_client_id", "client_secret": "your_client_secret"},
                rate_limit=50
            ),
            "aade_tax_clearance": APIEndpoint(
                service=GovernmentService.AADE,
                name="Request Tax Clearance",
                base_url="https://www.aade.gr/myaade/api/v1/",
                endpoint="tax-clearance",
                method="POST",
                auth_type="oauth",
                auth_config={"client_id": "your_client_id", "client_secret": "your_client_secret"},
                rate_limit=30
            ),
            "aade_business_info": APIEndpoint(
                service=GovernmentService.AADE,
                name="Get Business Information",
                base_url="https://www.aade.gr/myaade/api/v1/",
                endpoint="business-info/{afm}",
                method="GET",
                auth_type="oauth",
                auth_config={"client_id": "your_client_id", "client_secret": "your_client_secret"},
                rate_limit=100
            ),
            
            # ΔΥΠΑ - Employment Agency
            "dypa_job_posting": APIEndpoint(
                service=GovernmentService.DYPA,
                name="Submit Job Posting",
                base_url="https://www.dypa.gov.gr/api/v1/",
                endpoint="job-postings",
                method="POST",
                auth_type="api_key",
                auth_config={"api_key": "your_api_key", "header_name": "X-API-Key"},
                rate_limit=50
            ),
            "dypa_subsidy_application": APIEndpoint(
                service=GovernmentService.DYPA,
                name="Apply for Employment Subsidy",
                base_url="https://www.dypa.gov.gr/api/v1/",
                endpoint="subsidies/applications",
                method="POST",
                auth_type="api_key",
                auth_config={"api_key": "your_api_key", "header_name": "X-API-Key"},
                rate_limit=30
            ),
            "dypa_subsidy_status": APIEndpoint(
                service=GovernmentService.DYPA,
                name="Check Subsidy Status",
                base_url="https://www.dypa.gov.gr/api/v1/",
                endpoint="subsidies/applications/{application_id}/status",
                method="GET",
                auth_type="api_key",
                auth_config={"api_key": "your_api_key", "header_name": "X-API-Key"},
                rate_limit=100
            ),
            
            # ΚΕΠ - Citizens Service Centers
            "kep_license_application": APIEndpoint(
                service=GovernmentService.KEP,
                name="Submit License Application",
                base_url="https://www.kep.gov.gr/api/v1/",
                endpoint="licenses/applications",
                method="POST",
                auth_type="oauth",
                auth_config={"client_id": "your_client_id", "client_secret": "your_client_secret"},
                rate_limit=50
            ),
            "kep_document_status": APIEndpoint(
                service=GovernmentService.KEP,
                name="Check Document Status",
                base_url="https://www.kep.gov.gr/api/v1/",
                endpoint="documents/{document_id}/status",
                method="GET",
                auth_type="oauth",
                auth_config={"client_id": "your_client_id", "client_secret": "your_client_secret"},
                rate_limit=100
            ),
            
            # ΕΦΚΑ - Social Security Organization
            "efka_insurance_registration": APIEndpoint(
                service=GovernmentService.EFKA,
                name="Register for Insurance",
                base_url="https://www.efka.gov.gr/api/v1/",
                endpoint="insurance/registrations",
                method="POST",
                auth_type="certificate",
                auth_config={"cert_path": "/path/to/cert.pem", "key_path": "/path/to/key.pem"},
                rate_limit=50
            ),
            "efka_contribution_payment": APIEndpoint(
                service=GovernmentService.EFKA,
                name="Submit Contribution Payment",
                base_url="https://www.efka.gov.gr/api/v1/",
                endpoint="contributions/payments",
                method="POST",
                auth_type="certificate",
                auth_config={"cert_path": "/path/to/cert.pem", "key_path": "/path/to/key.pem"},
                rate_limit=50
            )
        }

    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={"User-Agent": "BusinessPilot-AI/1.0"}
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()

    async def call_api(self, endpoint_name: str, data: Optional[Dict[str, Any]] = None, 
                      path_params: Optional[Dict[str, str]] = None) -> APIResponse:
        """Make an API call to a government service"""
        
        start_time = datetime.now()
        
        try:
            endpoint = self.endpoints.get(endpoint_name)
            if not endpoint:
                raise ValueError(f"Unknown endpoint: {endpoint_name}")
            
            if not endpoint.is_active:
                raise ValueError(f"Endpoint {endpoint_name} is not active")
            
            # Check rate limit
            if not await self._check_rate_limit(endpoint_name, endpoint.rate_limit):
                raise ValueError(f"Rate limit exceeded for {endpoint_name}")
            
            # Prepare URL
            url = urljoin(endpoint.base_url, endpoint.endpoint)
            if path_params:
                url = url.format(**path_params)
            
            # Prepare headers
            headers = await self._get_auth_headers(endpoint)
            
            # Make request
            async with self.session.request(
                method=endpoint.method,
                url=url,
                json=data if endpoint.method in ["POST", "PUT", "PATCH"] else None,
                params=data if endpoint.method == "GET" else None,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=endpoint.timeout)
            ) as response:
                
                response_time = (datetime.now() - start_time).total_seconds() * 1000
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                success = 200 <= response.status < 300
                
                return APIResponse(
                    success=success,
                    status_code=response.status,
                    data=response_data if success else None,
                    error_message=str(response_data) if not success else None,
                    response_time_ms=int(response_time),
                    timestamp=datetime.now()
                )
                
        except Exception as e:
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            logger.error(f"API call failed for {endpoint_name}: {str(e)}")
            
            return APIResponse(
                success=False,
                status_code=0,
                data=None,
                error_message=str(e),
                response_time_ms=int(response_time),
                timestamp=datetime.now()
            )

    async def _get_auth_headers(self, endpoint: APIEndpoint) -> Dict[str, str]:
        """Get authentication headers for an endpoint"""
        
        headers = {"Content-Type": "application/json"}
        
        if endpoint.auth_type == "api_key":
            header_name = endpoint.auth_config.get("header_name", "X-API-Key")
            headers[header_name] = endpoint.auth_config.get("api_key", "")
            
        elif endpoint.auth_type == "oauth":
            # In production, implement OAuth token retrieval
            token = await self._get_oauth_token(endpoint.auth_config)
            headers["Authorization"] = f"Bearer {token}"
            
        elif endpoint.auth_type == "certificate":
            # Certificate authentication is handled at the SSL level
            pass
            
        return headers

    async def _get_oauth_token(self, auth_config: Dict[str, Any]) -> str:
        """Get OAuth token for authentication"""
        # Mock implementation - in production, implement actual OAuth flow
        return "mock_oauth_token"

    async def _check_rate_limit(self, endpoint_name: str, rate_limit: int) -> bool:
        """Check if request is within rate limit"""
        
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        # Clean old requests
        if endpoint_name in self.last_requests:
            self.last_requests[endpoint_name] = [
                req_time for req_time in self.last_requests[endpoint_name]
                if req_time > minute_ago
            ]
        else:
            self.last_requests[endpoint_name] = []
        
        # Check if we're within rate limit
        if len(self.last_requests[endpoint_name]) >= rate_limit:
            return False
        
        # Add current request
        self.last_requests[endpoint_name].append(now)
        return True

    # Specific government service methods
    
    async def submit_e3_form(self, employee_data: Dict[str, Any]) -> APIResponse:
        """Submit E3 employee registration form to ΕΡΓΑΝΗ"""
        
        # Transform data to ΕΡΓΑΝΗ format
        ergani_data = self._transform_to_ergani_format(employee_data)
        
        return await self.call_api("ergani_e3_submit", data=ergani_data)

    async def submit_e4_form(self, annual_data: Dict[str, Any]) -> APIResponse:
        """Submit E4 annual employee report to ΕΡΓΑΝΗ"""
        
        # Transform data to ΕΡΓΑΝΗ format
        ergani_data = self._transform_to_ergani_e4_format(annual_data)
        
        return await self.call_api("ergani_e4_submit", data=ergani_data)

    async def submit_vat_return(self, vat_data: Dict[str, Any]) -> APIResponse:
        """Submit VAT return to ΑΑΔΕ"""
        
        # Transform data to ΑΑΔΕ format
        aade_data = self._transform_to_aade_format(vat_data)
        
        return await self.call_api("aade_vat_submit", data=aade_data)

    async def apply_for_business_license(self, license_data: Dict[str, Any]) -> APIResponse:
        """Apply for business license through ΚΕΠ"""
        
        # Transform data to ΚΕΠ format
        kep_data = self._transform_to_kep_format(license_data)
        
        return await self.call_api("kep_license_application", data=kep_data)

    async def apply_for_employment_subsidy(self, subsidy_data: Dict[str, Any]) -> APIResponse:
        """Apply for employment subsidy through ΔΥΠΑ"""
        
        # Transform data to ΔΥΠΑ format
        dypa_data = self._transform_to_dypa_format(subsidy_data)
        
        return await self.call_api("dypa_subsidy_application", data=dypa_data)

    async def check_submission_status(self, service: GovernmentService, submission_id: str) -> APIResponse:
        """Check the status of a submitted document"""
        
        endpoint_mapping = {
            GovernmentService.ERGANI: "ergani_status_check",
            GovernmentService.DYPA: "dypa_subsidy_status",
            GovernmentService.KEP: "kep_document_status"
        }
        
        endpoint_name = endpoint_mapping.get(service)
        if not endpoint_name:
            raise ValueError(f"Status check not supported for service: {service}")
        
        return await self.call_api(
            endpoint_name,
            path_params={"submission_id": submission_id}
        )

    async def get_business_info(self, afm: str) -> APIResponse:
        """Get business information from ΑΑΔΕ"""
        
        return await self.call_api(
            "aade_business_info",
            path_params={"afm": afm}
        )

    async def health_check(self) -> Dict[str, Any]:
        """Check the health of all government API endpoints"""
        
        health_results = {}
        
        for endpoint_name, endpoint in self.endpoints.items():
            if not endpoint.is_active:
                continue
                
            try:
                # Make a simple health check request
                response = await self.call_api(endpoint_name)
                
                health_results[endpoint_name] = {
                    "service": endpoint.service.value,
                    "status": "healthy" if response.success else "unhealthy",
                    "response_time_ms": response.response_time_ms,
                    "last_check": response.timestamp.isoformat()
                }
                
            except Exception as e:
                health_results[endpoint_name] = {
                    "service": endpoint.service.value,
                    "status": "error",
                    "error": str(e),
                    "last_check": datetime.now().isoformat()
                }
        
        return {
            "overall_status": "healthy" if all(
                result["status"] == "healthy" 
                for result in health_results.values()
            ) else "degraded",
            "services": health_results,
            "timestamp": datetime.now().isoformat()
        }

    # Data transformation methods
    
    def _transform_to_ergani_format(self, employee_data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform employee data to ΕΡΓΑΝΗ E3 format"""
        
        return {
            "companyAFM": employee_data.get("company_afm"),
            "employeeData": {
                "firstName": employee_data.get("first_name"),
                "lastName": employee_data.get("last_name"),
                "afm": employee_data.get("employee_afm"),
                "amka": employee_data.get("amka"),
                "birthDate": employee_data.get("birth_date"),
                "hireDate": employee_data.get("hire_date"),
                "position": employee_data.get("position"),
                "contractType": employee_data.get("contract_type"),
                "salary": employee_data.get("salary"),
                "workingHours": employee_data.get("working_hours")
            },
            "submissionDate": datetime.now().isoformat(),
            "submitterInfo": {
                "name": employee_data.get("submitter_name"),
                "phone": employee_data.get("submitter_phone"),
                "email": employee_data.get("submitter_email")
            }
        }

    def _transform_to_ergani_e4_format(self, annual_data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform annual data to ΕΡΓΑΝΗ E4 format"""
        
        return {
            "companyAFM": annual_data.get("company_afm"),
            "reportingYear": annual_data.get("reporting_year"),
            "employeeList": annual_data.get("employees", []),
            "totalEmployees": annual_data.get("total_employees"),
            "payrollData": annual_data.get("payroll_data", {}),
            "submissionDate": datetime.now().isoformat()
        }

    def _transform_to_aade_format(self, vat_data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform VAT data to ΑΑΔΕ format"""
        
        return {
            "afm": vat_data.get("afm"),
            "taxPeriod": vat_data.get("tax_period"),
            "taxableTransactions": vat_data.get("taxable_transactions", 0),
            "vatCollected": vat_data.get("vat_collected", 0),
            "vatPaid": vat_data.get("vat_paid", 0),
            "netVAT": vat_data.get("net_vat", 0),
            "submissionDate": datetime.now().isoformat()
        }

    def _transform_to_kep_format(self, license_data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform license data to ΚΕΠ format"""
        
        return {
            "applicantInfo": {
                "name": license_data.get("applicant_name"),
                "afm": license_data.get("afm"),
                "address": license_data.get("address"),
                "phone": license_data.get("phone"),
                "email": license_data.get("email")
            },
            "businessInfo": {
                "companyName": license_data.get("company_name"),
                "businessType": license_data.get("business_type"),
                "kad": license_data.get("kad"),
                "location": license_data.get("location")
            },
            "licenseType": license_data.get("license_type"),
            "documents": license_data.get("documents", []),
            "submissionDate": datetime.now().isoformat()
        }

    def _transform_to_dypa_format(self, subsidy_data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform subsidy data to ΔΥΠΑ format"""
        
        return {
            "companyInfo": {
                "name": subsidy_data.get("company_name"),
                "afm": subsidy_data.get("afm"),
                "kad": subsidy_data.get("kad"),
                "employees": subsidy_data.get("employees"),
                "address": subsidy_data.get("address")
            },
            "subsidyType": subsidy_data.get("subsidy_type"),
            "targetGroup": subsidy_data.get("target_group"),
            "requestedAmount": subsidy_data.get("requested_amount"),
            "justification": subsidy_data.get("justification"),
            "documents": subsidy_data.get("documents", []),
            "submissionDate": datetime.now().isoformat()
        }

# Create global instance
government_api_service = GovernmentAPIService()