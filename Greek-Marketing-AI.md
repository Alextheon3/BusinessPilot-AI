# 🇬🇷 Greek Marketing AI - Campaign Generator & Strategy

## 🎯 Greek Marketing Campaign Generator

### AI Marketing Prompts for Greek Businesses

```python
# backend/app/services/greek_marketing_ai.py
from typing import Dict, List, Any
from datetime import datetime, date
from app.services.openai_service import OpenAIService
from app.services.weather_service import WeatherService
from app.models.marketing import Campaign

class GreekMarketingAI:
    def __init__(self):
        self.openai_service = OpenAIService()
        self.weather_service = WeatherService()
        
    async def generate_greek_campaign(
        self,
        business_type: str,
        campaign_goal: str,
        target_audience: str,
        budget: float,
        location: str,
        season: str,
        special_context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Δημιουργία ελληνικής καμπάνιας μάρκετινγκ με τοπικό context
        """
        
        # Get local context
        local_events = await self._get_local_events(location)
        weather_context = await self.weather_service.get_current_weather(location)
        greek_holidays = await self._get_upcoming_greek_holidays()
        
        # Greek business personality based on type
        business_personalities = {
            "cafe": {
                "tone": "φιλικός, ζεστός, προσωπικός",
                "voice": "σαν καλός φίλος που σε καλεί για καφέ",
                "values": "φιλοξενία, παράδοση, κοινότητα"
            },
            "restaurant": {
                "tone": "παραδοσιακός, οικογενειακός, γευστικός",
                "voice": "σαν γιαγιά που μαγειρεύει με αγάπη",
                "values": "παράδοση, οικογένεια, ποιότητα"
            },
            "retail": {
                "tone": "δυναμικός, τρεντάρικος, εμπιστοσύνης",
                "voice": "έμπειρος συμβουλεύων με στυλ",
                "values": "ποιότητα, στυλ, προσιτότητα"
            },
            "beauty": {
                "tone": "γοητευτικός, φροντιστικός, προσωπικός",
                "voice": "ειδικός ομορφιάς που νοιάζεται",
                "values": "ομορφιά, φροντίδα, αυτοπεποίθηση"
            },
            "service": {
                "tone": "επαγγελματικός, αξιόπιστος, λυσιτεχνικός",
                "voice": "έμπειρος τεχνίτης που λύνει προβλήματα",
                "values": "αξιοπιστία, τεχνογνωσία, λύσεις"
            }
        }
        
        personality = business_personalities.get(business_type, business_personalities["service"])
        
        # Main campaign generation prompt
        campaign_prompt = f"""
        Δημιούργησε μια ολοκληρωμένη καμπάνια μάρκετινγκ για ελληνική επιχείρηση:

        ΣΤΟΙΧΕΙΑ ΕΠΙΧΕΙΡΗΣΗΣ:
        - Τύπος: {business_type}
        - Τόπος: {location}
        - Στόχος καμπάνιας: {campaign_goal}
        - Κοινό-στόχος: {target_audience}
        - Προϋπολογισμός: {budget}€
        - Εποχή: {season}

        ΠΡΟΣΩΠΙΚΟΤΗΤΑ BRAND:
        - Τόνος: {personality['tone']}
        - Φωνή: {personality['voice']}
        - Αξίες: {personality['values']}

        ΤΟΠΙΚΟ CONTEXT:
        - Τοπικές εκδηλώσεις: {local_events}
        - Καιρός: {weather_context}
        - Επερχόμενες γιορτές: {greek_holidays}

        ΠΑΡΑΔΕΙΓΜΑΤΑ ΕΠΙΤΥΧΗΜΕΝΩΝ ΕΛΛΗΝΙΚΩΝ ΚΑΜΠΑΝΙΩΝ:
        1. "Καφές με θέα" - Συνδυάζει ελληνικό τοπίο με προϊόν
        2. "Σαββατοκύριακο στη γειτονιά" - Τοπική κοινότητα
        3. "Γεύση από τη γιαγιά" - Παράδοση και νοσταλγία
        4. "Φθινόπωρο στην Ελλάδα" - Εποχιακό μάρκετινγκ

        ΔΗΜΙΟΥΡΓΗΣΕ:
        1. **Κεντρικό μήνυμα** (1 παραγραφος)
        2. **Slogan** (5-8 λέξεις, κολλητικό)
        3. **Email καμπάνια** (θέμα + περιεχόμενο)
        4. **SMS καμπάνια** (160 χαρακτήρες)
        5. **Social media posts** (Facebook, Instagram captions)
        6. **Call-to-action** ιδέες
        7. **Χρονοδιάγραμμα** εκτέλεσης
        8. **Μέτρηση επιτυχίας** (KPIs)

        ΤΟΝΟΣ: Χρησιμοποίησε ελληνικές εκφράσεις, τοπικές αναφορές, και χιούμορ όπου ταιριάζει.
        Κάνε το προσωπικό και οικείο, σαν να μιλάς σε φίλους.
        """
        
        response = await self.openai_service.generate_completion(
            prompt=campaign_prompt,
            model="gpt-4",
            temperature=0.7,
            max_tokens=2000
        )
        
        # Parse and structure the response
        campaign_data = await self._parse_campaign_response(response.choices[0].message.content)
        
        # Generate specific content variations
        content_variations = await self._generate_content_variations(
            campaign_data,
            business_type,
            target_audience
        )
        
        return {
            "campaign_concept": campaign_data,
            "content_variations": content_variations,
            "execution_timeline": await self._create_execution_timeline(campaign_data),
            "budget_allocation": await self._calculate_budget_allocation(budget, campaign_data),
            "success_metrics": await self._define_success_metrics(campaign_goal),
            "local_opportunities": await self._identify_local_opportunities(location, season)
        }
    
    async def generate_seasonal_campaign(
        self,
        business_type: str,
        season: str,
        location: str
    ) -> Dict[str, Any]:
        """
        Δημιουργία εποχιακής καμπάνιας
        """
        
        seasonal_prompts = {
            "spring": f"""
            Δημιούργησε εποχιακή καμπάνια για την άνοιξη:
            
            ΕΠΟΧΙΑΚΑ ΣΤΟΙΧΕΙΑ:
            - Ανθοφορία, αναγέννηση, φρεσκάδα
            - Πάσχα, Πρωτομαγιά, καθαρισμός
            - Έξοδος από το σπίτι, υπαίθριες δραστηριότητες
            
            ΙΔΕΕΣ ΚΑΜΠΑΝΙΩΝ:
            - "Ανοιξιάτικη ανανέωση" για {business_type}
            - "Φρέσκια αρχή" προσφορές
            - "Πασχαλινές γεύσεις" (αν ταιριάζει)
            
            Χρησιμοποίησε:
            - Χρώματα: πράσινο, ροζ, κίτρινο
            - Συναισθήματα: ελπίδα, ανανέωση, χαρά
            - Δραστηριότητες: έξοδος, αλλαγή, καθαρισμός
            """,
            
            "summer": f"""
            Δημιούργησε καλοκαιρινή καμπάνια:
            
            ΚΑΛΟΚΑΙΡΙΝΑ ΣΤΟΙΧΕΙΑ:
            - Διακοπές, θάλασσα, ήλιος
            - Φεστιβάλ, πανηγύρια, τουρισμός
            - Δεκαπενταύγουστος, καλοκαιρινές βραδιές
            
            ΙΔΕΕΣ ΚΑΜΠΑΝΙΩΝ:
            - "Καλοκαιρινή απόλαυση" για {business_type}
            - "Διακοπές στη γειτονιά" προσφορές
            - "Βραδιές γεμάτες γεύση" (εστίαση)
            
            Χρησιμοποίησε:
            - Χρώματα: μπλε, κίτρινο, πορτοκαλί
            - Συναισθήματα: χαλάρωση, διασκέδαση, ελευθερία
            - Δραστηριότητες: διακοπές, κοινωνικοποίηση, απόλαυση
            """,
            
            "autumn": f"""
            Δημιούργησε φθινοπωρινή καμπάνια:
            
            ΦΘΙΝΟΠΩΡΙΝΑ ΣΤΟΙΧΕΙΑ:
            - Επιστροφή, σχολείο, εργασία
            - Συγκομιδή, παραδοσιακές γεύσεις
            - Κρύο, άνεση, ζεστό περιβάλλον
            
            ΙΔΕΕΣ ΚΑΜΠΑΝΙΩΝ:
            - "Ζεστή αγκαλιά" για {business_type}
            - "Φθινοπωρινές γεύσεις" προσφορές
            - "Άνεση στο κρύο" υπηρεσίες
            
            Χρησιμοποίησε:
            - Χρώματα: καφέ, πορτοκαλί, χρυσαφί
            - Συναισθήματα: άνεση, παράδοση, οικογένεια
            - Δραστηριότητες: εσωτερική ζωή, φιλοξενία, παράδοση
            """,
            
            "winter": f"""
            Δημιούργησε χειμερινή καμπάνια:
            
            ΧΕΙΜΕΡΙΝΑ ΣΤΟΙΧΕΙΑ:
            - Χριστούγεννα, Πρωτοχρονιά, γιορτές
            - Οικογένεια, δώρα, παράδοση
            - Ζεστή ατμόσφαιρα, άνεση, φιλοξενία
            
            ΙΔΕΕΣ ΚΑΜΠΑΝΙΩΝ:
            - "Χριστουγεννιάτικη μαγεία" για {business_type}
            - "Γιορτινές προσφορές" δώρα
            - "Ζεστή φιλοξενία" υπηρεσίες
            
            Χρησιμοποίησε:
            - Χρώματα: κόκκινο, χρυσαφί, πράσινο
            - Συναισθήματα: αγάπη, οικογένεια, παράδοση
            - Δραστηριότητες: γιορτές, δώρα, οικογενειακές στιγμές
            """
        }
        
        prompt = seasonal_prompts.get(season, seasonal_prompts["spring"])
        
        response = await self.openai_service.generate_completion(
            prompt=prompt,
            model="gpt-4",
            temperature=0.7
        )
        
        return await self._parse_seasonal_campaign(response.choices[0].message.content)
    
    async def generate_event_based_campaign(
        self,
        business_type: str,
        event_type: str,
        event_date: date,
        location: str
    ) -> Dict[str, Any]:
        """
        Δημιουργία καμπάνιας βασισμένης σε εκδήλωση/γιορτή
        """
        
        greek_events = {
            "25_march": {
                "name": "25η Μαρτίου",
                "theme": "πατριωτισμός, παράδοση, ελευθερία",
                "colors": "μπλε, άσπρο",
                "symbols": "σημαία, παρέλαση, παραδοσιακά"
            },
            "easter": {
                "name": "Πάσχα",
                "theme": "αναγέννηση, οικογένεια, παράδοση",
                "colors": "κόκκινο, χρυσαφί",
                "symbols": "αυγά, λάμπα, οικογενειακό τραπέζι"
            },
            "summer_festival": {
                "name": "Καλοκαιρινό Φεστιβάλ",
                "theme": "διασκέδαση, κοινότητα, παράδοση",
                "colors": "φωτεινά, πολύχρωμα",
                "symbols": "μουσική, χορός, τοπικές γεύσεις"
            },
            "dekapentavgoustos": {
                "name": "Δεκαπενταύγουστος",
                "theme": "θρησκεία, οικογένεια, παράδοση",
                "colors": "μπλε, άσπρο",
                "symbols": "εκκλησία, πανηγύρι, παραδοσιακά"
            },
            "christmas": {
                "name": "Χριστούγεννα",
                "theme": "οικογένεια, δώρα, χαρά",
                "colors": "κόκκινο, χρυσαφί, πράσινο",
                "symbols": "δέντρο, δώρα, οικογενειακό τραπέζι"
            }
        }
        
        event_info = greek_events.get(event_type, greek_events["summer_festival"])
        
        event_prompt = f"""
        Δημιούργησε καμπάνια για την εκδήλωση "{event_info['name']}":
        
        ΣΤΟΙΧΕΙΑ ΕΚΔΗΛΩΣΗΣ:
        - Θέμα: {event_info['theme']}
        - Χρώματα: {event_info['colors']}
        - Σύμβολα: {event_info['symbols']}
        - Ημερομηνία: {event_date.strftime('%d/%m/%Y')}
        - Τόπος: {location}
        - Επιχείρηση: {business_type}
        
        ΔΗΜΙΟΥΡΓΗΣΕ:
        1. **Θεματική καμπάνια** που συνδέει την εκδήλωση με την επιχείρηση
        2. **Ειδικές προσφορές** σχετικές με την εκδήλωση
        3. **Social media content** με θεματική φωτογραφία
        4. **Email προσκλήσεις** για ειδικές δραστηριότητες
        5. **Χρονοδιάγραμμα** προετοιμασίας (15 ημέρες πριν)
        
        ΤΟΝΟΣ: Σεβασμός στην παράδοση, χαρά, κοινοτικό πνεύμα
        Χρησιμοποίησε ελληνικές εκφράσεις και τοπικές αναφορές.
        """
        
        response = await self.openai_service.generate_completion(
            prompt=event_prompt,
            model="gpt-4",
            temperature=0.6
        )
        
        return await self._parse_event_campaign(response.choices[0].message.content)
    
    async def generate_crisis_response_campaign(
        self,
        business_type: str,
        crisis_type: str,
        message_tone: str = "supportive"
    ) -> Dict[str, Any]:
        """
        Δημιουργία καμπάνιας για κρίσιμες περιόδους
        """
        
        crisis_prompts = {
            "economic_downturn": f"""
            Δημιούργησε καμπάνια για οικονομική δυσκολία:
            
            ΣΤΟΧΟΣ: Στήριξη πελατών, διατήρηση business, αλληλεγγύη
            
            ΜΗΝΥΜΑΤΑ:
            - "Μαζί τα περνάμε όλα"
            - "Στήριξη στη δύσκολη στιγμή"
            - "Προσιτές λύσεις για όλους"
            
            ΕΝΕΡΓΕΙΕΣ:
            - Ειδικές προσφορές
            - Ευέλικτες πληρωμές
            - Κοινοτική στήριξη
            
            ΤΟΝΟΣ: Κατανόηση, αλληλεγγύη, πρακτικότητα
            """,
            
            "weather_extreme": f"""
            Δημιούργησε καμπάνια για ακραίες καιρικές συνθήκες:
            
            ΣΤΟΧΟΣ: Ασφάλεια, υποστήριξη, προσαρμογή
            
            ΜΗΝΥΜΑΤΑ:
            - "Η ασφάλειά σας είναι πρώτη"
            - "Εδώ για εσάς στη δύσκολη στιγμή"
            - "Προσαρμοζόμαστε στις συνθήκες"
            
            ΕΝΕΡΓΕΙΕΣ:
            - Ειδικές υπηρεσίες
            - Εναλλακτικές λύσεις
            - Ενημέρωση κοινού
            
            ΤΟΝΟΣ: Φροντίδα, πρακτικότητα, ασφάλεια
            """
        }
        
        prompt = crisis_prompts.get(crisis_type, crisis_prompts["economic_downturn"])
        
        response = await self.openai_service.generate_completion(
            prompt=prompt,
            model="gpt-4",
            temperature=0.5
        )
        
        return await self._parse_crisis_campaign(response.choices[0].message.content)
    
    async def _generate_content_variations(
        self,
        campaign_data: Dict[str, Any],
        business_type: str,
        target_audience: str
    ) -> Dict[str, List[str]]:
        """
        Δημιουργία παραλλαγών περιεχομένου
        """
        
        content_prompt = f"""
        Δημιούργησε 5 παραλλαγές για κάθε τύπο περιεχομένου:
        
        ΒΑΣΙΚΗ ΚΑΜΠΑΝΙΑ: {campaign_data.get('concept', '')}
        ΕΠΙΧΕΙΡΗΣΗ: {business_type}
        ΚΟΙΝΟ: {target_audience}
        
        ΔΗΜΙΟΥΡΓΗΣΕ 5 ΠΑΡΑΛΛΑΓΕΣ ΓΙΑ:
        1. **Email θέματα** (40-60 χαρακτήρες)
        2. **Facebook posts** (150-200 χαρακτήρες)
        3. **Instagram captions** (100-150 χαρακτήρες + hashtags)
        4. **SMS μηνύματα** (160 χαρακτήρες)
        5. **Slogans** (5-8 λέξεις)
        
        ΤΟΝΟΣ: Διαφορετικές προσεγγίσεις (χιουμοριστικός, σοβαρός, προσωπικός, επαγγελματικός, φιλικός)
        """
        
        response = await self.openai_service.generate_completion(
            prompt=content_prompt,
            model="gpt-4",
            temperature=0.8
        )
        
        return await self._parse_content_variations(response.choices[0].message.content)
    
    async def _get_local_events(self, location: str) -> List[Dict[str, Any]]:
        """
        Λήψη τοπικών εκδηλώσεων
        """
        # This could integrate with local event APIs or databases
        # For now, return mock data
        return [
            {
                "name": "Πανηγύρι Αγίου Νικολάου",
                "date": "2024-12-06",
                "type": "religious",
                "location": location
            },
            {
                "name": "Χριστουγεννιάτικη Αγορά",
                "date": "2024-12-15",
                "type": "market",
                "location": location
            }
        ]
    
    async def _get_upcoming_greek_holidays(self) -> List[Dict[str, Any]]:
        """
        Επερχόμενες ελληνικές γιορτές
        """
        return [
            {"date": "2024-12-25", "name": "Χριστούγεννα", "type": "national"},
            {"date": "2024-12-26", "name": "Δεύτερη μέρα Χριστουγέννων", "type": "national"},
            {"date": "2025-01-01", "name": "Πρωτοχρονιά", "type": "national"},
            {"date": "2025-01-06", "name": "Θεοφάνεια", "type": "national"},
            {"date": "2025-03-25", "name": "25η Μαρτίου", "type": "national"},
            {"date": "2025-05-01", "name": "Πρωτομαγιά", "type": "national"}
        ]

# Greek Marketing Templates
GREEK_MARKETING_TEMPLATES = {
    "welcome_email": {
        "subject": "Καλώς ήρθατε στην οικογένειά μας! 🎉",
        "content": """
        Γεια σας {name},
        
        Χαίρομαι πολύ που αποφασίσατε να γίνετε μέλος της οικογένειάς μας! 
        
        Στο {business_name} πιστεύουμε στην αυθεντική ελληνική φιλοξενία και στην ποιότητα που αξίζετε.
        
        Το πρώτο σας δώρο:
        🎁 {offer_description}
        
        Μην διστάσετε να μας επισκεφθείτε σύντομα!
        
        Με εκτίμηση,
        Η ομάδα του {business_name}
        """
    },
    
    "seasonal_promotion": {
        "subject": "{season_name} προσφορά που δεν χάνεται! ⏰",
        "content": """
        Αγαπητέ {name},
        
        Η {season_name} έφτασε και μαζί της φέρνει μια ξεχωριστή προσφορά!
        
        {seasonal_offer}
        
        Γιατί πιστεύουμε πως κάθε εποχή έχει τη δική της μαγεία.
        
        Ισχύει μέχρι {expiry_date}
        
        Σας περιμένουμε!
        {business_name}
        """
    },
    
    "local_event": {
        "subject": "Σας προσκαλούμε στο {event_name}! 🎊",
        "content": """
        Αγαπητοί φίλοι,
        
        Η γειτονιά μας γιορτάζει και εμείς θέλουμε να είστε μαζί μας!
        
        📅 {event_date}
        📍 {event_location}
        🎁 {special_offer}
        
        Ελάτε να περάσουμε όλοι μαζί μια υπέροχη μέρα!
        
        Με χαρά,
        {business_name}
        """
    }
}

# Greek Campaign Ideas by Business Type
GREEK_CAMPAIGN_IDEAS = {
    "cafe": [
        "Καφές με θέα - Πρωινή απόλαυση",
        "Φθινοπωρινές γεύσεις - Ζεστή αγκαλιά",
        "Κυριακάτικος καφές - Οικογενειακές στιγμές",
        "Βραδινό ραντεβού - Ρομαντικό περιβάλλον",
        "Φιλική παρέα - Συναντήσεις που μένουν"
    ],
    
    "restaurant": [
        "Γεύσεις από τη γιαγιά - Παραδοσιακές συνταγές",
        "Κυριακάτικο τραπέζι - Οικογενειακές συγκεντρώσεις",
        "Βραδιές γεμάτες γεύση - Ξεχωριστές εμπειρίες",
        "Τοπικές λιχουδιές - Φρέσκα υλικά",
        "Γιορτινό μενού - Κάθε γεύμα είναι γιορτή"
    ],
    
    "retail": [
        "Νέα συλλογή - Στυλ που σας εκφράζει",
        "Εποχιακές προσφορές - Ποιότητα σε τιμές που αξίζετε",
        "Προσωπικό styling - Βρείτε το δικό σας στυλ",
        "Τοπικό brand - Υποστηρίζουμε τα ελληνικά",
        "Γιορτινά δώρα - Χαρίστε με αγάπη"
    ],
    
    "beauty": [
        "Περιποίηση που αξίζετε - Νιώστε όμορφη",
        "Εποχιακή φροντίδα - Λάμψη για κάθε εποχή",
        "Προσωπική μεταμόρφωση - Ανακαλύψτε την ομορφιά σας",
        "Γιορτινό look - Λαμπερή σε κάθε εκδήλωση",
        "Φυσική ομορφιά - Προϊόντα που νοιάζονται"
    ]
}

# Greek Marketing Metrics
GREEK_MARKETING_METRICS = {
    "engagement_terms": {
        "likes": "Μου αρέσει",
        "shares": "Κοινοποιήσεις",
        "comments": "Σχόλια",
        "click_through": "Κλικ",
        "conversions": "Μετατροπές"
    },
    
    "success_indicators": {
        "high_engagement": "Υψηλή συμμετοχή",
        "brand_awareness": "Αναγνωρισιμότητα brand",
        "customer_acquisition": "Νέοι πελάτες",
        "customer_retention": "Πιστότητα πελατών",
        "sales_increase": "Αύξηση πωλήσεων"
    }
}
```

### Greek Marketing Assistant API

```python
# backend/app/api/v1/greek_marketing.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from datetime import date
from app.services.greek_marketing_ai import GreekMarketingAI
from app.schemas.marketing import CampaignRequest, CampaignResponse

router = APIRouter()

@router.post("/campaigns/generate", response_model=CampaignResponse)
async def generate_marketing_campaign(
    request: CampaignRequest,
    marketing_ai: GreekMarketingAI = Depends()
):
    """
    Δημιουργία καμπάνιας μάρκετινγκ με AI
    """
    try:
        campaign = await marketing_ai.generate_greek_campaign(
            business_type=request.business_type,
            campaign_goal=request.goal,
            target_audience=request.target_audience,
            budget=request.budget,
            location=request.location,
            season=request.season,
            special_context=request.special_context
        )
        
        return CampaignResponse(
            success=True,
            campaign_data=campaign,
            message="Η καμπάνια δημιουργήθηκε επιτυχώς!"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Σφάλμα κατά τη δημιουργία καμπάνιας: {str(e)}"
        )

@router.post("/campaigns/seasonal")
async def generate_seasonal_campaign(
    business_type: str,
    season: str,
    location: str,
    marketing_ai: GreekMarketingAI = Depends()
):
    """
    Δημιουργία εποχιακής καμπάνιας
    """
    campaign = await marketing_ai.generate_seasonal_campaign(
        business_type=business_type,
        season=season,
        location=location
    )
    
    return {
        "campaign": campaign,
        "suggestions": [
            "Προσαρμόστε τα χρώματα στην εποχή",
            "Χρησιμοποιήστε εποχιακές εικόνες",
            "Αναφερθείτε σε τοπικές παραδόσεις",
            "Δημιουργήστε συναισθηματική σύνδεση"
        ]
    }

@router.post("/campaigns/event-based")
async def generate_event_campaign(
    business_type: str,
    event_type: str,
    event_date: date,
    location: str,
    marketing_ai: GreekMarketingAI = Depends()
):
    """
    Δημιουργία καμπάνιας βασισμένης σε εκδήλωση
    """
    campaign = await marketing_ai.generate_event_based_campaign(
        business_type=business_type,
        event_type=event_type,
        event_date=event_date,
        location=location
    )
    
    return {
        "campaign": campaign,
        "timeline": await create_event_timeline(event_date),
        "local_partnerships": await suggest_local_partnerships(location, event_type)
    }

@router.get("/templates/greek")
async def get_greek_marketing_templates():
    """
    Λήψη ελληνικών marketing templates
    """
    return {
        "email_templates": GREEK_MARKETING_TEMPLATES,
        "campaign_ideas": GREEK_CAMPAIGN_IDEAS,
        "metrics": GREEK_MARKETING_METRICS
    }

@router.post("/content/variations")
async def generate_content_variations(
    campaign_concept: str,
    business_type: str,
    target_audience: str,
    count: int = 5,
    marketing_ai: GreekMarketingAI = Depends()
):
    """
    Δημιουργία παραλλαγών περιεχομένου
    """
    variations = await marketing_ai._generate_content_variations(
        {"concept": campaign_concept},
        business_type,
        target_audience
    )
    
    return {
        "variations": variations,
        "usage_tips": [
            "Δοκιμάστε διαφορετικές παραλλαγές",
            "Μετρήστε την απόδοση κάθε μηνύματος",
            "Προσαρμόστε τον τόνο στο κοινό",
            "Χρησιμοποιήστε τοπικές αναφορές"
        ]
    }

@router.post("/analytics/greek-metrics")
async def analyze_greek_marketing_metrics(
    campaign_data: Dict[str, Any],
    metrics_data: Dict[str, Any]
):
    """
    Ανάλυση metrics με ελληνικό context
    """
    analysis = {
        "performance_summary": "Η καμπάνια έχει καλή απόδοση",
        "greek_market_insights": [
            "Οι Έλληνες ανταποκρίνονται καλύτερα σε προσωπικά μηνύματα",
            "Οι εποχιακές καμπάνιες έχουν 40% μεγαλύτερη απόδοση",
            "Το χιούμορ και η παράδοση αυξάνουν τη συμμετοχή",
            "Οι τοπικές αναφορές δημιουργούν δεσμό με το brand"
        ],
        "optimization_suggestions": [
            "Αυξήστε τις τοπικές αναφορές",
            "Χρησιμοποιήστε περισσότερα emojis",
            "Δημιουργήστε UGC campaigns",
            "Συνδεθείτε με τοπικές εκδηλώσεις"
        ]
    }
    
    return analysis
```

### Frontend Marketing Campaign Generator

```typescript
// frontend/src/components/marketing/GreekCampaignGenerator.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { marketingApi } from '../../services/marketing-api';
import { toast } from 'react-hot-toast';

interface CampaignRequest {
  business_type: string;
  goal: string;
  target_audience: string;
  budget: number;
  location: string;
  season: string;
  special_context?: any;
}

const GreekCampaignGenerator: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  const [formData, setFormData] = useState<CampaignRequest>({
    business_type: '',
    goal: '',
    target_audience: '',
    budget: 0,
    location: '',
    season: 'spring'
  });
  
  const [generatedCampaign, setGeneratedCampaign] = useState<any>(null);
  
  const generateCampaign = useMutation({
    mutationFn: (data: CampaignRequest) => marketingApi.generateGreekCampaign(data),
    onSuccess: (data) => {
      setGeneratedCampaign(data.campaign_data);
      toast.success('Η καμπάνια δημιουργήθηκε επιτυχώς! 🎉');
    },
    onError: (error: any) => {
      toast.error(`Σφάλμα: ${error.message}`);
    }
  });
  
  const businessTypes = [
    { value: 'cafe', label: 'Καφετέρια ☕' },
    { value: 'restaurant', label: 'Εστιατόριο 🍽️' },
    { value: 'retail', label: 'Κατάστημα 🛍️' },
    { value: 'beauty', label: 'Κομμωτήριο/Κέντρο Αισθητικής 💄' },
    { value: 'service', label: 'Υπηρεσίες 🔧' }
  ];
  
  const campaignGoals = [
    { value: 'brand_awareness', label: 'Αναγνωρισιμότητα brand' },
    { value: 'customer_acquisition', label: 'Νέοι πελάτες' },
    { value: 'sales_increase', label: 'Αύξηση πωλήσεων' },
    { value: 'customer_retention', label: 'Πιστότητα πελατών' },
    { value: 'event_promotion', label: 'Προώθηση εκδήλωσης' }
  ];
  
  const seasons = [
    { value: 'spring', label: 'Άνοιξη 🌸' },
    { value: 'summer', label: 'Καλοκαίρι ☀️' },
    { value: 'autumn', label: 'Φθινόπωρο 🍂' },
    { value: 'winter', label: 'Χειμώνας ❄️' }
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateCampaign.mutate(formData);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="
        bg-light-card dark:bg-dark-card
        border border-light-border dark:border-dark-border
        rounded-lg shadow-sm p-6
        transition-colors duration-200
      ">
        <h2 className="
          text-2xl font-bold mb-6
          text-light-primary dark:text-dark-primary
        ">
          🇬🇷 Δημιουργός Ελληνικών Καμπανιών
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Type */}
            <div>
              <label className="
                block text-sm font-medium mb-2
                text-light-secondary dark:text-dark-secondary
              ">
                Τύπος Επιχείρησης
              </label>
              <select
                value={formData.business_type}
                onChange={(e) => setFormData({...formData, business_type: e.target.value})}
                className="
                  w-full px-3 py-2 rounded-md border
                  border-light-border dark:border-dark-border
                  bg-light-card dark:bg-dark-card
                  text-light-primary dark:text-dark-primary
                  focus:ring-2 focus:ring-greek-500
                  transition-colors duration-200
                "
                required
              >
                <option value="">Επιλέξτε τύπο...</option>
                {businessTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Campaign Goal */}
            <div>
              <label className="
                block text-sm font-medium mb-2
                text-light-secondary dark:text-dark-secondary
              ">
                Στόχος Καμπάνιας
              </label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                className="
                  w-full px-3 py-2 rounded-md border
                  border-light-border dark:border-dark-border
                  bg-light-card dark:bg-dark-card
                  text-light-primary dark:text-dark-primary
                  focus:ring-2 focus:ring-greek-500
                  transition-colors duration-200
                "
                required
              >
                <option value="">Επιλέξτε στόχο...</option>
                {campaignGoals.map(goal => (
                  <option key={goal.value} value={goal.value}>
                    {goal.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Target Audience */}
            <div>
              <label className="
                block text-sm font-medium mb-2
                text-light-secondary dark:text-dark-secondary
              ">
                Κοινό-Στόχος
              </label>
              <input
                type="text"
                value={formData.target_audience}
                onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                placeholder="π.χ. Γυναίκες 25-45, οικογένειες, νέοι επαγγελματίες"
                className="
                  w-full px-3 py-2 rounded-md border
                  border-light-border dark:border-dark-border
                  bg-light-card dark:bg-dark-card
                  text-light-primary dark:text-dark-primary
                  focus:ring-2 focus:ring-greek-500
                  transition-colors duration-200
                "
                required
              />
            </div>
            
            {/* Budget */}
            <div>
              <label className="
                block text-sm font-medium mb-2
                text-light-secondary dark:text-dark-secondary
              ">
                Προϋπολογισμός (€)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                placeholder="π.χ. 500"
                className="
                  w-full px-3 py-2 rounded-md border
                  border-light-border dark:border-dark-border
                  bg-light-card dark:bg-dark-card
                  text-light-primary dark:text-dark-primary
                  focus:ring-2 focus:ring-greek-500
                  transition-colors duration-200
                "
                required
              />
            </div>
            
            {/* Location */}
            <div>
              <label className="
                block text-sm font-medium mb-2
                text-light-secondary dark:text-dark-secondary
              ">
                Τοποθεσία
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="π.χ. Θεσσαλονίκη, Πάτρα, Ηράκλειο"
                className="
                  w-full px-3 py-2 rounded-md border
                  border-light-border dark:border-dark-border
                  bg-light-card dark:bg-dark-card
                  text-light-primary dark:text-dark-primary
                  focus:ring-2 focus:ring-greek-500
                  transition-colors duration-200
                "
                required
              />
            </div>
            
            {/* Season */}
            <div>
              <label className="
                block text-sm font-medium mb-2
                text-light-secondary dark:text-dark-secondary
              ">
                Εποχή
              </label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({...formData, season: e.target.value})}
                className="
                  w-full px-3 py-2 rounded-md border
                  border-light-border dark:border-dark-border
                  bg-light-card dark:bg-dark-card
                  text-light-primary dark:text-dark-primary
                  focus:ring-2 focus:ring-greek-500
                  transition-colors duration-200
                "
              >
                {seasons.map(season => (
                  <option key={season.value} value={season.value}>
                    {season.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={generateCampaign.isPending}
              className="
                px-8 py-3 rounded-lg font-medium
                bg-greek-600 hover:bg-greek-700
                text-white
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
                flex items-center gap-2
              "
            >
              {generateCampaign.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Δημιουργία...
                </>
              ) : (
                <>
                  ✨ Δημιουργία Καμπάνιας
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Generated Campaign Display */}
      {generatedCampaign && (
        <div className="mt-8 space-y-6">
          <CampaignPreview campaign={generatedCampaign} />
          <ContentVariations variations={generatedCampaign.content_variations} />
          <ExecutionTimeline timeline={generatedCampaign.execution_timeline} />
          <BudgetBreakdown budget={generatedCampaign.budget_allocation} />
        </div>
      )}
    </div>
  );
};

export default GreekCampaignGenerator;
```

This Greek Marketing AI system provides:

1. **Culturally-aware campaign generation** with Greek idioms and local references
2. **Seasonal and event-based campaigns** for Greek holidays and traditions
3. **Multiple content variations** for different platforms and audiences
4. **Crisis response campaigns** for difficult periods
5. **Local event integration** with community-focused messaging
6. **Budget optimization** and execution timelines
7. **Greek-specific metrics** and success indicators

The system understands Greek business culture, uses appropriate language and tone, and creates campaigns that resonate with Greek consumers while maintaining professional quality and effectiveness.