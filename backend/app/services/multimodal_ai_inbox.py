import logging
import asyncio
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from enum import Enum
import json
import uuid
from dataclasses import dataclass, asdict
import aiofiles
import base64
from pathlib import Path

logger = logging.getLogger(__name__)

class MessageType(Enum):
    EMAIL = "email"
    CHAT = "chat"
    DOCUMENT = "document"
    VOICE_CALL = "voice_call"
    VIDEO_CALL = "video_call"
    SMS = "sms"
    SOCIAL_MEDIA = "social_media"
    FORM_SUBMISSION = "form_submission"

class Priority(Enum):
    URGENT = "urgent"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class MessageStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    ANALYZED = "analyzed"
    RESPONDED = "responded"
    ARCHIVED = "archived"
    ERROR = "error"

class SentimentType(Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    MIXED = "mixed"

class MessageCategory(Enum):
    SALES_INQUIRY = "sales_inquiry"
    CUSTOMER_SUPPORT = "customer_support"
    INVOICE_PAYMENT = "invoice_payment"
    SUPPLIER_COMMUNICATION = "supplier_communication"
    LEGAL_MATTER = "legal_matter"
    HR_RELATED = "hr_related"
    GENERAL_INQUIRY = "general_inquiry"
    COMPLAINT = "complaint"
    FEEDBACK = "feedback"
    PARTNERSHIP = "partnership"
    MARKETING = "marketing"
    TECHNICAL_SUPPORT = "technical_support"

@dataclass
class AIAnalysisResult:
    sentiment: SentimentType
    confidence: float
    category: MessageCategory
    priority: Priority
    key_entities: List[str]
    action_items: List[str]
    suggested_response: str
    urgency_score: float
    business_impact: str
    similar_cases: List[str]
    recommended_assignee: Optional[str]
    estimated_resolution_time: int  # in minutes
    compliance_flags: List[str]
    financial_implications: Optional[Dict[str, float]]
    next_steps: List[str]

@dataclass
class MultimodalMessage:
    id: str
    type: MessageType
    status: MessageStatus
    sender: str
    recipient: str
    subject: Optional[str]
    content: str
    attachments: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    received_at: datetime
    processed_at: Optional[datetime]
    ai_analysis: Optional[AIAnalysisResult]
    response_generated: Optional[str]
    human_reviewed: bool
    tags: List[str]
    thread_id: Optional[str]
    related_messages: List[str]

class MultimodalAIInbox:
    def __init__(self):
        self.messages: Dict[str, MultimodalMessage] = {}
        self.processing_queue: asyncio.Queue = asyncio.Queue()
        self.ai_models = {
            "text_analysis": "gpt-4",
            "sentiment_analysis": "bert-sentiment",
            "entity_recognition": "spacy-el",
            "document_ocr": "tesseract",
            "voice_transcription": "whisper",
            "translation": "google-translate"
        }
        self.business_rules = self._load_business_rules()
        self.response_templates = self._load_response_templates()

    def _load_business_rules(self) -> Dict[str, Any]:
        """Load business rules for message processing"""
        return {
            "priority_keywords": {
                "urgent": ["επείγον", "άμεσα", "κρίσιμο", "έκτακτο", "urgent", "asap"],
                "high": ["σημαντικό", "προτεραιότητα", "σπουδαίο", "important", "priority"],
                "medium": ["κανονικό", "normal", "standard"],
                "low": ["χαμηλή", "low", "whenever"]
            },
            "category_keywords": {
                "sales_inquiry": ["πωλήσεις", "προσφορά", "τιμή", "αγορά", "sales", "quote", "price"],
                "customer_support": ["βοήθεια", "πρόβλημα", "support", "help", "issue"],
                "invoice_payment": ["τιμολόγιο", "πληρωμή", "invoice", "payment", "bill"],
                "legal_matter": ["νομικό", "συμβόλαιο", "legal", "contract", "lawyer"],
                "complaint": ["παράπονο", "δυσαρεστημένος", "complaint", "unsatisfied", "problem"]
            },
            "auto_response_triggers": {
                "out_of_hours": True,
                "high_volume": True,
                "common_questions": True
            },
            "escalation_rules": {
                "complaint_threshold": 0.7,
                "urgency_threshold": 0.8,
                "financial_amount_threshold": 1000.0
            }
        }

    def _load_response_templates(self) -> Dict[str, str]:
        """Load response templates for different message types"""
        return {
            "acknowledgment": """
Αγαπητέ/ή {sender_name},

Σας ευχαριστούμε για το μήνυμά σας. Έχουμε λάβει το αίτημά σας και θα σας απαντήσουμε το συντομότερο δυνατό.

Αριθμός αναφοράς: {reference_number}
Εκτιμώμενος χρόνος απάντησης: {estimated_time}

Με εκτίμηση,
BusinessPilot AI Assistant
            """,
            "sales_inquiry": """
Αγαπητέ/ή {sender_name},

Σας ευχαριστούμε για το ενδιαφέρον σας για τα προϊόντα/υπηρεσίες μας.

Βάσει του αιτήματός σας, θα χρειαστούμε επιπλέον στοιχεία:
{additional_info_needed}

Ένας εκπρόσωπος πωλήσεων θα επικοινωνήσει μαζί σας εντός 24 ωρών.

Με εκτίμηση,
Τμήμα Πωλήσεων
            """,
            "customer_support": """
Αγαπητέ/ή {sender_name},

Λάβαμε το αίτημά σας για τεχνική υποστήριξη.

Περιγραφή προβλήματος: {issue_description}
Προτεινόμενη λύση: {suggested_solution}

Εάν το πρόβλημα παραμένει, παρακαλώ επικοινωνήστε μαζί μας.

Με εκτίμηση,
Τμήμα Τεχνικής Υποστήριξης
            """,
            "invoice_payment": """
Αγαπητέ/ή {sender_name},

Σχετικά με το τιμολόγιο {invoice_number}:

Κατάσταση: {payment_status}
Ποσό: {amount}€
Προθεσμία: {due_date}

{payment_instructions}

Με εκτίμηση,
Οικονομικό Τμήμα
            """
        }

    async def receive_message(self, message_data: Dict[str, Any]) -> str:
        """Receive and queue a new message for processing"""
        try:
            message_id = str(uuid.uuid4())
            
            # Create message object
            message = MultimodalMessage(
                id=message_id,
                type=MessageType(message_data.get('type', 'email')),
                status=MessageStatus.PENDING,
                sender=message_data.get('sender', ''),
                recipient=message_data.get('recipient', ''),
                subject=message_data.get('subject'),
                content=message_data.get('content', ''),
                attachments=message_data.get('attachments', []),
                metadata=message_data.get('metadata', {}),
                received_at=datetime.utcnow(),
                processed_at=None,
                ai_analysis=None,
                response_generated=None,
                human_reviewed=False,
                tags=[],
                thread_id=message_data.get('thread_id'),
                related_messages=[]
            )
            
            # Store message
            self.messages[message_id] = message
            
            # Queue for processing
            await self.processing_queue.put(message_id)
            
            logger.info(f"Message {message_id} received and queued for processing")
            return message_id
            
        except Exception as e:
            logger.error(f"Error receiving message: {str(e)}")
            raise

    async def process_message(self, message_id: str) -> AIAnalysisResult:
        """Process a message with AI analysis"""
        try:
            message = self.messages.get(message_id)
            if not message:
                raise ValueError(f"Message {message_id} not found")
            
            # Update status
            message.status = MessageStatus.PROCESSING
            message.processed_at = datetime.utcnow()
            
            # Perform AI analysis
            ai_analysis = await self._analyze_message_content(message)
            
            # Update message with analysis
            message.ai_analysis = ai_analysis
            message.status = MessageStatus.ANALYZED
            
            # Generate automatic response if needed
            if self._should_auto_respond(message, ai_analysis):
                response = await self._generate_response(message, ai_analysis)
                message.response_generated = response
                message.status = MessageStatus.RESPONDED
            
            # Apply business rules
            await self._apply_business_rules(message, ai_analysis)
            
            logger.info(f"Message {message_id} processed successfully")
            return ai_analysis
            
        except Exception as e:
            logger.error(f"Error processing message {message_id}: {str(e)}")
            if message_id in self.messages:
                self.messages[message_id].status = MessageStatus.ERROR
            raise

    async def _analyze_message_content(self, message: MultimodalMessage) -> AIAnalysisResult:
        """Analyze message content using AI models"""
        try:
            content = message.content
            
            # Handle different message types
            if message.type == MessageType.DOCUMENT:
                content = await self._extract_document_text(message.attachments)
            elif message.type in [MessageType.VOICE_CALL, MessageType.VIDEO_CALL]:
                content = await self._transcribe_audio(message.attachments)
            
            # Sentiment analysis
            sentiment = await self._analyze_sentiment(content)
            
            # Category classification
            category = await self._classify_message(content, message.type)
            
            # Priority assessment
            priority = await self._assess_priority(content, message.metadata)
            
            # Entity extraction
            entities = await self._extract_entities(content)
            
            # Generate action items
            action_items = await self._generate_action_items(content, category)
            
            # Suggest response
            suggested_response = await self._suggest_response(content, category, sentiment)
            
            # Calculate urgency score
            urgency_score = await self._calculate_urgency_score(content, message.metadata)
            
            # Assess business impact
            business_impact = await self._assess_business_impact(content, entities, category)
            
            # Find similar cases
            similar_cases = await self._find_similar_cases(content, category)
            
            # Recommend assignee
            recommended_assignee = await self._recommend_assignee(category, entities, priority)
            
            # Estimate resolution time
            estimated_time = await self._estimate_resolution_time(category, priority, complexity=len(entities))
            
            # Check compliance
            compliance_flags = await self._check_compliance(content, entities)
            
            # Analyze financial implications
            financial_implications = await self._analyze_financial_implications(content, entities)
            
            # Generate next steps
            next_steps = await self._generate_next_steps(category, priority, entities)
            
            return AIAnalysisResult(
                sentiment=sentiment,
                confidence=0.85,  # Mock confidence score
                category=category,
                priority=priority,
                key_entities=entities,
                action_items=action_items,
                suggested_response=suggested_response,
                urgency_score=urgency_score,
                business_impact=business_impact,
                similar_cases=similar_cases,
                recommended_assignee=recommended_assignee,
                estimated_resolution_time=estimated_time,
                compliance_flags=compliance_flags,
                financial_implications=financial_implications,
                next_steps=next_steps
            )
            
        except Exception as e:
            logger.error(f"Error analyzing message content: {str(e)}")
            raise

    async def _analyze_sentiment(self, content: str) -> SentimentType:
        """Analyze sentiment of message content"""
        # Mock sentiment analysis - in production, use actual ML model
        negative_words = ["κακό", "πρόβλημα", "δυσαρεστημένος", "bad", "problem", "issue"]
        positive_words = ["καλό", "ευχαριστώ", "τέλειο", "good", "thank", "excellent"]
        
        content_lower = content.lower()
        negative_count = sum(1 for word in negative_words if word in content_lower)
        positive_count = sum(1 for word in positive_words if word in content_lower)
        
        if negative_count > positive_count:
            return SentimentType.NEGATIVE
        elif positive_count > negative_count:
            return SentimentType.POSITIVE
        else:
            return SentimentType.NEUTRAL

    async def _classify_message(self, content: str, message_type: MessageType) -> MessageCategory:
        """Classify message into business categories"""
        content_lower = content.lower()
        
        for category, keywords in self.business_rules["category_keywords"].items():
            if any(keyword in content_lower for keyword in keywords):
                return MessageCategory(category)
        
        return MessageCategory.GENERAL_INQUIRY

    async def _assess_priority(self, content: str, metadata: Dict[str, Any]) -> Priority:
        """Assess message priority based on content and metadata"""
        content_lower = content.lower()
        
        for priority, keywords in self.business_rules["priority_keywords"].items():
            if any(keyword in content_lower for keyword in keywords):
                return Priority(priority)
        
        # Check metadata for priority indicators
        if metadata.get('marked_urgent'):
            return Priority.URGENT
        
        return Priority.MEDIUM

    async def _extract_entities(self, content: str) -> List[str]:
        """Extract named entities from content"""
        # Mock entity extraction - in production, use NER model
        entities = []
        
        # Extract emails
        import re
        emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', content)
        entities.extend(emails)
        
        # Extract phone numbers
        phones = re.findall(r'\b\d{10}\b', content)
        entities.extend(phones)
        
        # Extract amounts
        amounts = re.findall(r'€\s*\d+(?:,\d{3})*(?:\.\d{2})?', content)
        entities.extend(amounts)
        
        return entities

    async def _generate_action_items(self, content: str, category: MessageCategory) -> List[str]:
        """Generate action items based on message content and category"""
        action_items = []
        
        if category == MessageCategory.SALES_INQUIRY:
            action_items = [
                "Αποστολή προσφοράς στον πελάτη",
                "Προγραμματισμός τηλεφωνικής επικοινωνίας",
                "Συλλογή επιπλέον στοιχείων πελάτη"
            ]
        elif category == MessageCategory.CUSTOMER_SUPPORT:
            action_items = [
                "Διάγνωση τεχνικού προβλήματος",
                "Αποστολή λύσης στον πελάτη",
                "Παρακολούθηση επίλυσης"
            ]
        elif category == MessageCategory.INVOICE_PAYMENT:
            action_items = [
                "Έλεγχος κατάστασης πληρωμής",
                "Αποστολή υπενθύμισης πληρωμής",
                "Ενημέρωση λογιστηρίου"
            ]
        else:
            action_items = [
                "Αξιολόγηση αιτήματος",
                "Προώθηση στο κατάλληλο τμήμα",
                "Ενημέρωση πελάτη για την πρόοδο"
            ]
        
        return action_items

    async def _suggest_response(self, content: str, category: MessageCategory, sentiment: SentimentType) -> str:
        """Generate suggested response based on analysis"""
        if category == MessageCategory.SALES_INQUIRY:
            return "Σας ευχαριστούμε για το ενδιαφέρον σας. Θα σας αποστείλουμε προσφορά εντός 24 ωρών."
        elif category == MessageCategory.CUSTOMER_SUPPORT:
            return "Λάβαμε το αίτημά σας για υποστήριξη. Θα το εξετάσουμε άμεσα."
        elif category == MessageCategory.COMPLAINT:
            return "Λυπούμαστε για την αναστάτωση. Θα εξετάσουμε το θέμα προτεραιότητα."
        else:
            return "Σας ευχαριστούμε για το μήνυμά σας. Θα σας απαντήσουμε σύντομα."

    async def _calculate_urgency_score(self, content: str, metadata: Dict[str, Any]) -> float:
        """Calculate urgency score (0-1)"""
        score = 0.5  # Base score
        
        # Check for urgent keywords
        urgent_keywords = ["επείγον", "άμεσα", "κρίσιμο", "urgent", "asap"]
        if any(keyword in content.lower() for keyword in urgent_keywords):
            score += 0.3
        
        # Check metadata
        if metadata.get('marked_urgent'):
            score += 0.2
        
        # Check for financial mentions
        if any(symbol in content for symbol in ['€', '$', 'ευρώ', 'euro']):
            score += 0.1
        
        return min(score, 1.0)

    async def _assess_business_impact(self, content: str, entities: List[str], category: MessageCategory) -> str:
        """Assess potential business impact"""
        if category == MessageCategory.COMPLAINT:
            return "Υψηλός κίνδυνος για τη φήμη της εταιρείας"
        elif category == MessageCategory.SALES_INQUIRY:
            return "Δυνητικότητα νέων εσόδων"
        elif category == MessageCategory.LEGAL_MATTER:
            return "Απαιτεί νομική προσοχή"
        else:
            return "Κανονικό επίπεδο επιχειρηματικής σημασίας"

    async def _find_similar_cases(self, content: str, category: MessageCategory) -> List[str]:
        """Find similar historical cases"""
        # Mock similar cases - in production, use vector similarity search
        return [
            f"Παρόμοιο περιστατικό #{uuid.uuid4().hex[:8]}",
            f"Σχετικό αίτημα #{uuid.uuid4().hex[:8]}"
        ]

    async def _recommend_assignee(self, category: MessageCategory, entities: List[str], priority: Priority) -> Optional[str]:
        """Recommend the best assignee for this message"""
        assignee_map = {
            MessageCategory.SALES_INQUIRY: "Τμήμα Πωλήσεων",
            MessageCategory.CUSTOMER_SUPPORT: "Τεχνική Υποστήριξη",
            MessageCategory.INVOICE_PAYMENT: "Οικονομικό Τμήμα",
            MessageCategory.LEGAL_MATTER: "Νομικό Τμήμα",
            MessageCategory.HR_RELATED: "Ανθρώπινοι Πόροι",
            MessageCategory.COMPLAINT: "Διοίκηση"
        }
        
        return assignee_map.get(category, "Γενικό Τμήμα")

    async def _estimate_resolution_time(self, category: MessageCategory, priority: Priority, complexity: int) -> int:
        """Estimate resolution time in minutes"""
        base_times = {
            MessageCategory.SALES_INQUIRY: 60,
            MessageCategory.CUSTOMER_SUPPORT: 45,
            MessageCategory.INVOICE_PAYMENT: 30,
            MessageCategory.LEGAL_MATTER: 120,
            MessageCategory.COMPLAINT: 90
        }
        
        priority_multipliers = {
            Priority.URGENT: 0.5,
            Priority.HIGH: 0.7,
            Priority.MEDIUM: 1.0,
            Priority.LOW: 1.5
        }
        
        base_time = base_times.get(category, 60)
        multiplier = priority_multipliers.get(priority, 1.0)
        complexity_factor = 1 + (complexity * 0.1)
        
        return int(base_time * multiplier * complexity_factor)

    async def _check_compliance(self, content: str, entities: List[str]) -> List[str]:
        """Check for compliance issues"""
        flags = []
        
        # Check for GDPR concerns
        if any(entity for entity in entities if '@' in entity):
            flags.append("GDPR: Προσωπικά δεδομένα εντοπίστηκαν")
        
        # Check for financial regulations
        if any('€' in entity for entity in entities):
            flags.append("Οικονομικές υποχρεώσεις: Απαιτεί έλεγχο")
        
        return flags

    async def _analyze_financial_implications(self, content: str, entities: List[str]) -> Optional[Dict[str, float]]:
        """Analyze financial implications of the message"""
        financial_data = {}
        
        # Extract amounts
        import re
        amounts = re.findall(r'€\s*(\d+(?:,\d{3})*(?:\.\d{2})?)', content)
        if amounts:
            total_amount = sum(float(amount.replace(',', '')) for amount in amounts)
            financial_data['total_amount'] = total_amount
            financial_data['currency'] = 'EUR'
        
        return financial_data if financial_data else None

    async def _generate_next_steps(self, category: MessageCategory, priority: Priority, entities: List[str]) -> List[str]:
        """Generate next steps for message handling"""
        steps = []
        
        if priority == Priority.URGENT:
            steps.append("Άμεση κλήση στον αποστολέα")
        
        if category == MessageCategory.SALES_INQUIRY:
            steps.extend([
                "Προετοιμασία προσφοράς",
                "Προγραμματισμός συνάντησης",
                "Παρακολούθηση πελάτη"
            ])
        elif category == MessageCategory.COMPLAINT:
            steps.extend([
                "Διερεύνηση προβλήματος",
                "Επικοινωνία με πελάτη",
                "Λήψη διορθωτικών μέτρων"
            ])
        
        return steps

    async def _should_auto_respond(self, message: MultimodalMessage, analysis: AIAnalysisResult) -> bool:
        """Determine if message should receive automatic response"""
        # Don't auto-respond to high-priority or complex messages
        if analysis.priority in [Priority.URGENT, Priority.HIGH]:
            return False
        
        # Don't auto-respond to complaints
        if analysis.category == MessageCategory.COMPLAINT:
            return False
        
        # Auto-respond to simple inquiries
        if analysis.category in [MessageCategory.GENERAL_INQUIRY, MessageCategory.SALES_INQUIRY]:
            return True
        
        return False

    async def _generate_response(self, message: MultimodalMessage, analysis: AIAnalysisResult) -> str:
        """Generate automatic response"""
        template_key = analysis.category.value
        template = self.response_templates.get(template_key, self.response_templates["acknowledgment"])
        
        # Format template
        formatted_response = template.format(
            sender_name=message.sender,
            reference_number=message.id[:8],
            estimated_time=f"{analysis.estimated_resolution_time} λεπτά",
            additional_info_needed="Επικοινωνία μαζί σας σύντομα",
            issue_description=message.subject or "Θα εξετάσουμε το αίτημά σας",
            suggested_solution="Θα σας δοθεί λύση το συντομότερο δυνατό",
            invoice_number="TBD",
            payment_status="Υπό εξέταση",
            amount="TBD",
            due_date="TBD",
            payment_instructions="Οδηγίες πληρωμής θα σταλούν σύντομα"
        )
        
        return formatted_response

    async def _apply_business_rules(self, message: MultimodalMessage, analysis: AIAnalysisResult):
        """Apply business rules to processed message"""
        # Tag urgent messages
        if analysis.priority == Priority.URGENT:
            message.tags.append("urgent")
        
        # Tag complaints
        if analysis.category == MessageCategory.COMPLAINT:
            message.tags.append("complaint")
        
        # Tag high-value messages
        if analysis.financial_implications and analysis.financial_implications.get('total_amount', 0) > 1000:
            message.tags.append("high_value")

    async def _extract_document_text(self, attachments: List[Dict[str, Any]]) -> str:
        """Extract text from document attachments"""
        # Mock document text extraction
        return "Extracted text from document attachments"

    async def _transcribe_audio(self, attachments: List[Dict[str, Any]]) -> str:
        """Transcribe audio from voice/video attachments"""
        # Mock audio transcription
        return "Transcribed audio content"

    async def get_message(self, message_id: str) -> Optional[MultimodalMessage]:
        """Get message by ID"""
        return self.messages.get(message_id)

    async def get_messages(self, 
                          status: Optional[MessageStatus] = None,
                          category: Optional[MessageCategory] = None,
                          priority: Optional[Priority] = None,
                          limit: int = 50) -> List[MultimodalMessage]:
        """Get messages with filtering"""
        messages = list(self.messages.values())
        
        # Apply filters
        if status:
            messages = [msg for msg in messages if msg.status == status]
        if category:
            messages = [msg for msg in messages if msg.ai_analysis and msg.ai_analysis.category == category]
        if priority:
            messages = [msg for msg in messages if msg.ai_analysis and msg.ai_analysis.priority == priority]
        
        # Sort by received date (newest first)
        messages.sort(key=lambda x: x.received_at, reverse=True)
        
        return messages[:limit]

    async def get_inbox_statistics(self) -> Dict[str, Any]:
        """Get inbox statistics"""
        total_messages = len(self.messages)
        
        # Count by status
        status_counts = {}
        for status in MessageStatus:
            status_counts[status.value] = sum(1 for msg in self.messages.values() if msg.status == status)
        
        # Count by category
        category_counts = {}
        for category in MessageCategory:
            category_counts[category.value] = sum(
                1 for msg in self.messages.values() 
                if msg.ai_analysis and msg.ai_analysis.category == category
            )
        
        # Count by priority
        priority_counts = {}
        for priority in Priority:
            priority_counts[priority.value] = sum(
                1 for msg in self.messages.values() 
                if msg.ai_analysis and msg.ai_analysis.priority == priority
            )
        
        # Response time statistics
        processed_messages = [msg for msg in self.messages.values() if msg.processed_at]
        avg_response_time = 0
        if processed_messages:
            response_times = [
                (msg.processed_at - msg.received_at).total_seconds() / 60 
                for msg in processed_messages
            ]
            avg_response_time = sum(response_times) / len(response_times)
        
        return {
            "total_messages": total_messages,
            "status_distribution": status_counts,
            "category_distribution": category_counts,
            "priority_distribution": priority_counts,
            "average_response_time_minutes": avg_response_time,
            "auto_response_rate": sum(1 for msg in self.messages.values() if msg.response_generated) / max(total_messages, 1),
            "human_review_rate": sum(1 for msg in self.messages.values() if msg.human_reviewed) / max(total_messages, 1)
        }

    async def search_messages(self, query: str, limit: int = 20) -> List[MultimodalMessage]:
        """Search messages by content"""
        results = []
        query_lower = query.lower()
        
        for message in self.messages.values():
            if (query_lower in message.content.lower() or 
                (message.subject and query_lower in message.subject.lower()) or
                query_lower in message.sender.lower()):
                results.append(message)
        
        return results[:limit]

# Global instance
multimodal_ai_inbox = MultimodalAIInbox()