import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  NewspaperIcon,
  ClockIcon,
  TagIcon,
  LinkIcon,
  StarIcon,
  EyeIcon,
  ShareIcon,
  BookmarkIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  UserIcon,
  CogIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BellIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  sourceIcon: string;
  author: string;
  publishedAt: string;
  category: 'tax' | 'employment' | 'regulation' | 'subsidies' | 'market' | 'technology' | 'general';
  relevanceScore: number;
  businessImpact: 'high' | 'medium' | 'low';
  urgency: 'breaking' | 'important' | 'normal';
  tags: string[];
  url: string;
  imageUrl?: string;
  isBookmarked: boolean;
  readTime: number;
  relatedBusinessTypes: string[];
  relatedKadCodes: string[];
  actionItems: string[];
  aiSummary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  credibilityScore: number;
  shareCount: number;
  readCount: number;
}

interface NewsSource {
  id: string;
  name: string;
  website: string;
  category: string;
  isActive: boolean;
  trustScore: number;
  updateFrequency: string;
  language: 'el' | 'en';
  specialization: string[];
}

interface NewsPreferences {
  preferredCategories: string[];
  preferredSources: string[];
  maxArticlesPerDay: number;
  minimumRelevanceScore: number;
  notificationSettings: {
    breaking: boolean;
    important: boolean;
    digest: boolean;
    digestTime: string;
  };
  languagePreference: 'el' | 'en' | 'both';
  businessFocus: string[];
}

const BusinessNewsManager: React.FC = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'publishedAt' | 'relevanceScore' | 'businessImpact'>('publishedAt');
  const [showPreferences, setShowPreferences] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'digest'>('cards');
  const [preferences, setPreferences] = useState<NewsPreferences>({
    preferredCategories: ['tax', 'employment', 'subsidies'],
    preferredSources: ['gov.gr', 'kathimerini.gr', 'capital.gr'],
    maxArticlesPerDay: 20,
    minimumRelevanceScore: 0.6,
    notificationSettings: {
      breaking: true,
      important: true,
      digest: true,
      digestTime: '08:00'
    },
    languagePreference: 'el',
    businessFocus: ['56.30.00']
  });

  // Mock business profile for news filtering
  const businessProfile = {
    kad: '56.30.00',
    kadDescription: 'Καφετέριες και λοιπά καταστήματα παρασκευής και πώλησης ποτών',
    region: 'Αττική',
    employees: 3,
    businessType: 'εστίαση',
    interests: ['φορολογικά', 'εργασιακά', 'τουρισμός', 'τεχνολογία']
  };

  const newsSources: NewsSource[] = [
    {
      id: 'gov_gr',
      name: 'Gov.gr',
      website: 'https://www.gov.gr',
      category: 'Κυβερνητικό',
      isActive: true,
      trustScore: 0.95,
      updateFrequency: 'Καθημερινά',
      language: 'el',
      specialization: ['νομοθεσία', 'φόροι', 'εργασιακά']
    },
    {
      id: 'aade_gr',
      name: 'ΑΑΔΕ',
      website: 'https://www.aade.gr',
      category: 'Φορολογικό',
      isActive: true,
      trustScore: 0.98,
      updateFrequency: 'Καθημερινά',
      language: 'el',
      specialization: ['φπα', 'φόροι', 'δηλώσεις']
    },
    {
      id: 'kathimerini_gr',
      name: 'Καθημερινή',
      website: 'https://www.kathimerini.gr',
      category: 'Οικονομικό',
      isActive: true,
      trustScore: 0.88,
      updateFrequency: 'Καθημερινά',
      language: 'el',
      specialization: ['οικονομία', 'επιχειρήσεις', 'αγορά']
    },
    {
      id: 'capital_gr',
      name: 'Capital.gr',
      website: 'https://www.capital.gr',
      category: 'Επιχειρηματικό',
      isActive: true,
      trustScore: 0.85,
      updateFrequency: 'Καθημερινά',
      language: 'el',
      specialization: ['startup', 'επιχειρήσεις', 'χρηματοδότηση']
    },
    {
      id: 'reporter_gr',
      name: 'Reporter.gr',
      website: 'https://www.reporter.gr',
      category: 'Επιχειρηματικό',
      isActive: true,
      trustScore: 0.82,
      updateFrequency: 'Καθημερινά',
      language: 'el',
      specialization: ['αγορά', 'καταναλωτές', 'τάσεις']
    }
  ];

  useEffect(() => {
    loadMockNews();
  }, []);

  const loadMockNews = () => {
    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        title: 'Νέα Μέτρα Στήριξης για Επιχειρήσεις Εστίασης - Επιδότηση έως €10.000',
        summary: 'Το Υπουργείο Ανάπτυξης ανακοινώνει νέο πακέτο στήριξης για επιχειρήσεις εστίασης που επλήγησαν από την πανδημία.',
        content: 'Το Υπουργείο Ανάπτυξης και Επενδύσεων ανακοίνωσε σήμερα ένα νέο πακέτο στήριξης για επιχειρήσεις εστίασης, με επιδοτήσεις που φτάνουν τα €10.000 ανά επιχείρηση. Το πρόγραμμα αφορά επιχειρήσεις με έως 20 εργαζόμενους που επλήγησαν από την πανδημία COVID-19...',
        source: 'Gov.gr',
        sourceIcon: '🏛️',
        author: 'Υπουργείο Ανάπτυξης',
        publishedAt: '2024-02-15T09:30:00Z',
        category: 'subsidies',
        relevanceScore: 0.95,
        businessImpact: 'high',
        urgency: 'breaking',
        tags: ['επιδότηση', 'εστίαση', 'covid-19', 'στήριξη'],
        url: 'https://www.gov.gr/ipiresies/ependusi-kai-anaptiksi/epidotiseis/nea-metra-stiriksis-estiasis',
        imageUrl: 'https://example.com/restaurant-support.jpg',
        isBookmarked: false,
        readTime: 3,
        relatedBusinessTypes: ['εστίαση', 'καφετέριες', 'εστιατόρια'],
        relatedKadCodes: ['56.30.00', '56.10.00', '56.21.00'],
        actionItems: [
          'Ελέγξτε αν η επιχείρησή σας πληροί τις προϋποθέσεις',
          'Συγκεντρώστε τα απαιτούμενα δικαιολογητικά',
          'Υποβάλετε αίτηση μέχρι 31/03/2024'
        ],
        aiSummary: 'Νέα επιδότηση €10.000 για επιχειρήσεις εστίασης με έως 20 εργαζόμενους. Η καφετέρια σας πληροί τις προϋποθέσεις.',
        sentiment: 'positive',
        credibilityScore: 0.95,
        shareCount: 234,
        readCount: 1567
      },
      {
        id: '2',
        title: 'Αλλαγές στη Δήλωση ΦΠΑ από 1η Μαρτίου 2024',
        summary: 'Η ΑΑΔΕ ανακοινώνει σημαντικές αλλαγές στη δήλωση ΦΠΑ που θα ισχύσουν από τον Μάρτιο.',
        content: 'Από την 1η Μαρτίου 2024, η Ανεξάρτητη Αρχή Δημοσίων Εσόδων (ΑΑΔΕ) εισάγει νέες αλλαγές στη δήλωση ΦΠΑ. Οι κυριότερες αλλαγές αφορούν την προσθήκη νέων κωδικών για ψηφιακές υπηρεσίες και την αλλαγή των προθεσμιών υποβολής...',
        source: 'ΑΑΔΕ',
        sourceIcon: '🏛️',
        author: 'ΑΑΔΕ - Τμήμα Επικοινωνίας',
        publishedAt: '2024-02-14T14:15:00Z',
        category: 'tax',
        relevanceScore: 0.88,
        businessImpact: 'high',
        urgency: 'important',
        tags: ['φπα', 'δήλωση', 'ααδε', 'αλλαγές'],
        url: 'https://www.aade.gr/menoy/deltia-typoy/allages-dilosi-fpa-martioy-2024',
        isBookmarked: true,
        readTime: 4,
        relatedBusinessTypes: ['όλες οι επιχειρήσεις'],
        relatedKadCodes: ['all'],
        actionItems: [
          'Μελετήστε τις νέες αλλαγές στη δήλωση ΦΠΑ',
          'Ενημερώστε τον λογιστή σας',
          'Προετοιμάστε τα απαιτούμενα στοιχεία'
        ],
        aiSummary: 'Σημαντικές αλλαγές στη δήλωση ΦΠΑ από Μάρτιο. Επηρεάζει όλες τις επιχειρήσεις συμπεριλαμβανομένης της δικής σας.',
        sentiment: 'neutral',
        credibilityScore: 0.98,
        shareCount: 456,
        readCount: 2341
      },
      {
        id: '3',
        title: 'Ανάκαμψη στον Κλάδο Εστίασης - Αύξηση Τζίρου 15% τον Ιανουάριο',
        summary: 'Θετικά σήματα για τον κλάδο εστίασης με αύξηση του τζίρου κατά 15% τον Ιανουάριο σε σχέση με το αντίστοιχο διάστημα του 2023.',
        content: 'Σύμφωνα με τα πρώτα στοιχεία που επεξεργάστηκε το Ινστιτούτο Μικρών Επιχειρήσεων (ΙΜΕ), ο κλάδος εστίασης παρουσιάζει σημαντική ανάκαμψη με αύξηση του τζίρου κατά 15% τον Ιανουάριο...',
        source: 'Capital.gr',
        sourceIcon: '💼',
        author: 'Μαρία Παπαδοπούλου',
        publishedAt: '2024-02-13T16:45:00Z',
        category: 'market',
        relevanceScore: 0.92,
        businessImpact: 'medium',
        urgency: 'normal',
        tags: ['εστίαση', 'ανάκαμψη', 'τζίρος', 'στατιστικά'],
        url: 'https://www.capital.gr/epiheiriseis/3678234/anakampsi-ston-klado-estiasis-ayxisi-tziroy-15-ton-ianoyario',
        imageUrl: 'https://example.com/restaurant-recovery.jpg',
        isBookmarked: false,
        readTime: 5,
        relatedBusinessTypes: ['εστίαση', 'καφετέριες', 'εστιατόρια'],
        relatedKadCodes: ['56.30.00', '56.10.00', '56.21.00'],
        actionItems: [
          'Αναλύστε τα δικά σας νούμερα πωλήσεων',
          'Εξετάστε στρατηγικές αύξησης τζίρου',
          'Παρακολουθήστε τις τάσεις της αγοράς'
        ],
        aiSummary: 'Ο κλάδος εστίασης αναδρομεί με αύξηση τζίρου 15%. Καλή ευκαιρία για εστιατόρια και καφετέριες.',
        sentiment: 'positive',
        credibilityScore: 0.85,
        shareCount: 123,
        readCount: 987
      },
      {
        id: '4',
        title: 'Νέο Πρόγραμμα Ψηφιακής Εκπαίδευσης για Μικρές Επιχειρήσεις',
        summary: 'Ξεκινά νέο πρόγραμμα δωρεάν ψηφιακής εκπαίδευσης για μικρές επιχειρήσεις με έμφαση στο e-commerce και τα social media.',
        content: 'Το Υπουργείο Ψηφιακής Διακυβέρνησης σε συνεργασία με τον Σύνδεσμο Επιχειρήσεων Πληροφορικής και Επικοινωνιών Ελλάδας (ΣΕΠΕ) ανακοινώνουν το νέο πρόγραμμα ψηφιακής εκπαίδευσης...',
        source: 'Reporter.gr',
        sourceIcon: '📰',
        author: 'Γιάννης Κωνσταντίνου',
        publishedAt: '2024-02-12T11:20:00Z',
        category: 'technology',
        relevanceScore: 0.78,
        businessImpact: 'medium',
        urgency: 'normal',
        tags: ['ψηφιακή εκπαίδευση', 'e-commerce', 'social media', 'δωρεάν'],
        url: 'https://www.reporter.gr/Eidiseis/Oikonomia/Neo-programma-psifiakis-ekpaideysis-gia-mikres-epiheiriseis',
        isBookmarked: false,
        readTime: 3,
        relatedBusinessTypes: ['όλες οι επιχειρήσεις'],
        relatedKadCodes: ['all'],
        actionItems: [
          'Εγγραφείτε στο πρόγραμμα εκπαίδευσης',
          'Επιλέξτε τα modules που σας ενδιαφέρουν',
          'Προγραμματίστε τη συμμετοχή σας'
        ],
        aiSummary: 'Δωρεάν ψηφιακή εκπαίδευση για μικρές επιχειρήσεις. Καλή ευκαιρία για βελτίωση των ψηφιακών δεξιοτήτων.',
        sentiment: 'positive',
        credibilityScore: 0.82,
        shareCount: 89,
        readCount: 654
      },
      {
        id: '5',
        title: 'Προσοχή: Νέα Απάτη με Ψεύτικα Email από "ΑΑΔΕ"',
        summary: 'Η ΑΑΔΕ προειδοποιεί για νέα κύμα απάτης με ψεύτικα email που ζητούν στοιχεία επιχειρήσεων.',
        content: 'Η Ανεξάρτητη Αρχή Δημοσίων Εσόδων (ΑΑΔΕ) εκδίδει έκτακτη ανακοίνωση για νέο κύμα απάτης που στοχεύει επιχειρήσεις. Τα ψεύτικα email φαίνονται να προέρχονται από την ΑΑΔΕ...',
        source: 'ΑΑΔΕ',
        sourceIcon: '🏛️',
        author: 'ΑΑΔΕ - Τμήμα Ασφάλειας',
        publishedAt: '2024-02-11T10:00:00Z',
        category: 'regulation',
        relevanceScore: 0.85,
        businessImpact: 'high',
        urgency: 'breaking',
        tags: ['ασφάλεια', 'απάτη', 'email', 'προειδοποίηση'],
        url: 'https://www.aade.gr/menoy/deltia-typoy/prosoxh-nea-apati-me-pseytika-email-apo-aade',
        isBookmarked: true,
        readTime: 2,
        relatedBusinessTypes: ['όλες οι επιχειρήσεις'],
        relatedKadCodes: ['all'],
        actionItems: [
          'Προειδοποιήστε το προσωπικό σας',
          'Ελέγξτε τα εισερχόμενα email',
          'Μην δώσετε στοιχεία σε ύποπτα email'
        ],
        aiSummary: 'Νέα απάτη με ψεύτικα email από "ΑΑΔΕ". Σημαντικό για την ασφάλεια της επιχείρησης.',
        sentiment: 'negative',
        credibilityScore: 0.98,
        shareCount: 345,
        readCount: 1897
      },
      {
        id: '6',
        title: 'Τάσεις Καταναλωτικής Συμπεριφοράς 2024 - Αύξηση στα Premium Προϊόντα',
        summary: 'Νέα έρευνα δείχνει αλλαγές στις προτιμήσεις των καταναλωτών με αύξηση της ζήτησης για premium προϊόντα.',
        content: 'Σύμφωνα με νέα έρευνα της εταιρείας Market Research Hellas, οι Έλληνες καταναλωτές εμφανίζουν αλλαγές στις προτιμήσεις τους το 2024...',
        source: 'Καθημερινή',
        sourceIcon: '📰',
        author: 'Άννα Γεωργίου',
        publishedAt: '2024-02-10T08:30:00Z',
        category: 'market',
        relevanceScore: 0.73,
        businessImpact: 'medium',
        urgency: 'normal',
        tags: ['καταναλωτές', 'τάσεις', 'premium', 'έρευνα'],
        url: 'https://www.kathimerini.gr/economy/562078234/taseis-katanalotikis-symperiforas-2024-ayxisi-sta-premium-proionta',
        imageUrl: 'https://example.com/consumer-trends.jpg',
        isBookmarked: false,
        readTime: 6,
        relatedBusinessTypes: ['λιανική πώληση', 'εστίαση', 'υπηρεσίες'],
        relatedKadCodes: ['47.11.00', '56.30.00', '96.02.00'],
        actionItems: [
          'Αναλύστε τις προτιμήσεις των πελατών σας',
          'Εξετάστε premium εναλλακτικές',
          'Προσαρμόστε τη στρατηγική μάρκετινγκ'
        ],
        aiSummary: 'Αύξηση ζήτησης για premium προϊόντα. Ευκαιρία για αναβάθμιση του μενού της καφετέριας.',
        sentiment: 'positive',
        credibilityScore: 0.88,
        shareCount: 156,
        readCount: 743
      }
    ];

    // Filter based on business profile and preferences
    const filteredArticles = mockArticles.filter(article => {
      // Check relevance score
      if (article.relevanceScore < preferences.minimumRelevanceScore) {
        return false;
      }

      // Check category preferences
      if (preferences.preferredCategories.length > 0 && 
          !preferences.preferredCategories.includes(article.category)) {
        return false;
      }

      // Check business relevance
      if (article.relatedKadCodes.length > 0 && 
          !article.relatedKadCodes.includes('all') &&
          !article.relatedKadCodes.includes(businessProfile.kad)) {
        return false;
      }

      return true;
    });

    setArticles(filteredArticles.slice(0, preferences.maxArticlesPerDay));
  };

  const handleBookmark = (articleId: string) => {
    setArticles(prev => 
      prev.map(article => 
        article.id === articleId 
          ? { ...article, isBookmarked: !article.isBookmarked }
          : article
      )
    );
    toast.success('Άρθρο προστέθηκε στους σελιδοδείκτες!');
  };

  const handleShare = (article: NewsArticle) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.url
      });
    } else {
      navigator.clipboard.writeText(article.url);
      toast.success('Σύνδεσμος αντιγράφηκε!');
    }
  };

  const handleMarkAsRead = (articleId: string) => {
    setArticles(prev =>
      prev.map(article =>
        article.id === articleId
          ? { ...article, readCount: article.readCount + 1 }
          : article
      )
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tax': return 'bg-red-100 text-red-800';
      case 'employment': return 'bg-blue-100 text-blue-800';
      case 'regulation': return 'bg-purple-100 text-purple-800';
      case 'subsidies': return 'bg-green-100 text-green-800';
      case 'market': return 'bg-yellow-100 text-yellow-800';
      case 'technology': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'tax': return 'Φορολογικά';
      case 'employment': return 'Εργασιακά';
      case 'regulation': return 'Νομοθεσία';
      case 'subsidies': return 'Επιδοτήσεις';
      case 'market': return 'Αγορά';
      case 'technology': return 'Τεχνολογία';
      default: return 'Γενικά';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'breaking': return 'bg-red-600 text-white';
      case 'important': return 'bg-orange-600 text-white';
      case 'normal': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'breaking': return 'Έκτακτο';
      case 'important': return 'Σημαντικό';
      case 'normal': return 'Κανονικό';
      default: return urgency;
    }
  };

  const getBusinessImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      case 'neutral': return '➡️';
      default: return '➡️';
    }
  };

  const filteredArticles = articles.filter(article => {
    const categoryMatch = filterCategory === 'all' || article.category === filterCategory;
    const urgencyMatch = filterUrgency === 'all' || article.urgency === filterUrgency;
    const searchMatch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return categoryMatch && urgencyMatch && searchMatch;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'publishedAt':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'relevanceScore':
        return b.relevanceScore - a.relevanceScore;
      case 'businessImpact':
        const impactOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return impactOrder[b.businessImpact] - impactOrder[a.businessImpact];
      default:
        return 0;
    }
  });

  const getNewsStats = () => {
    return {
      total: articles.length,
      breaking: articles.filter(a => a.urgency === 'breaking').length,
      important: articles.filter(a => a.urgency === 'important').length,
      highImpact: articles.filter(a => a.businessImpact === 'high').length,
      bookmarked: articles.filter(a => a.isBookmarked).length,
      averageRelevance: articles.reduce((sum, a) => sum + a.relevanceScore, 0) / articles.length
    };
  };

  const stats = getNewsStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Επιχειρηματικές Ειδήσεις
        </h1>
        <p className="text-gray-600">
          Εξατομικευμένες ειδήσεις και αναλύσεις για την επιχείρησή σας
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Σύνολο</p>
              <p className="text-xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <NewspaperIcon className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Έκτακτα</p>
              <p className="text-xl font-bold text-red-600">{stats.breaking}</p>
            </div>
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Σημαντικά</p>
              <p className="text-xl font-bold text-orange-600">{stats.important}</p>
            </div>
            <InformationCircleIcon className="w-6 h-6 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Υψηλό Impact</p>
              <p className="text-xl font-bold text-green-600">{stats.highImpact}</p>
            </div>
            <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Σελιδοδείκτες</p>
              <p className="text-xl font-bold text-purple-600">{stats.bookmarked}</p>
            </div>
            <BookmarkIcon className="w-6 h-6 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Συνάφεια</p>
              <p className="text-xl font-bold text-indigo-600">{Math.round(stats.averageRelevance * 100)}%</p>
            </div>
            <ChartBarIcon className="w-6 h-6 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Αναζήτηση ειδήσεων..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Όλες οι Κατηγορίες</option>
              <option value="tax">Φορολογικά</option>
              <option value="employment">Εργασιακά</option>
              <option value="regulation">Νομοθεσία</option>
              <option value="subsidies">Επιδοτήσεις</option>
              <option value="market">Αγορά</option>
              <option value="technology">Τεχνολογία</option>
            </select>

            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Όλα τα Επίπεδα</option>
              <option value="breaking">Έκτακτα</option>
              <option value="important">Σημαντικά</option>
              <option value="normal">Κανονικά</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="publishedAt">Ταξινόμηση: Ημερομηνία</option>
              <option value="relevanceScore">Ταξινόμηση: Συνάφεια</option>
              <option value="businessImpact">Ταξινόμηση: Επίπτωση</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <EyeIcon className="w-4 h-4" />
              {viewMode === 'cards' ? 'Λίστα' : 'Κάρτες'}
            </button>
            
            <button
              onClick={() => setShowPreferences(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <CogIcon className="w-4 h-4" />
              Ρυθμίσεις
            </button>
          </div>
        </div>
      </div>

      {/* News Articles */}
      <div className={viewMode === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {sortedArticles.map((article) => (
          <div
            key={article.id}
            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
              viewMode === 'list' ? 'p-4' : 'p-6'
            }`}
            onClick={() => {
              setSelectedArticle(article);
              handleMarkAsRead(article.id);
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{article.sourceIcon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{article.source}</p>
                  <p className="text-xs text-gray-500">{article.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(article.urgency)}`}>
                  {getUrgencyLabel(article.urgency)}
                </span>
                <span className="text-lg">{getSentimentIcon(article.sentiment)}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
              {article.title}
            </h3>

            {/* Summary */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {article.summary}
            </p>

            {/* AI Summary */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">AI Ανάλυση</span>
              </div>
              <p className="text-sm text-blue-800">{article.aiSummary}</p>
            </div>

            {/* Tags and Category */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(article.category)}`}>
                {getCategoryLabel(article.category)}
              </span>
              {article.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {/* Metrics */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{article.readTime}min</span>
                </div>
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4" />
                  <span>{Math.round(article.relevanceScore * 100)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                  <span className={getBusinessImpactColor(article.businessImpact)}>
                    {article.businessImpact === 'high' ? 'Υψηλό' : 
                     article.businessImpact === 'medium' ? 'Μέσο' : 'Χαμηλό'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {new Date(article.publishedAt).toLocaleDateString('el-GR')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmark(article.id);
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    article.isBookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <BookmarkIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(article);
                  }}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <ShareIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{article.readCount} αναγνώσεις</span>
                <span>{article.shareCount} κοινοποιήσεις</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedArticles.length === 0 && (
        <div className="text-center py-12">
          <NewspaperIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Δεν βρέθηκαν ειδήσεις
          </h3>
          <p className="text-gray-500">
            Δοκιμάστε να αλλάξετε τα κριτήρια αναζήτησης ή τα φίλτρα.
          </p>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedArticle.sourceIcon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedArticle.source}</h2>
                    <p className="text-gray-600">{selectedArticle.author}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Article Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getUrgencyColor(selectedArticle.urgency)}`}>
                    {getUrgencyLabel(selectedArticle.urgency)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(selectedArticle.category)}`}>
                    {getCategoryLabel(selectedArticle.category)}
                  </span>
                  <span className="text-2xl">{getSentimentIcon(selectedArticle.sentiment)}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h1>
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(selectedArticle.publishedAt).toLocaleString('el-GR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{selectedArticle.readTime} λεπτά ανάγνωσης</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4" />
                    <span>{Math.round(selectedArticle.relevanceScore * 100)}% συνάφεια</span>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">AI Ανάλυση για την Επιχείρησή σας</h3>
                </div>
                <p className="text-blue-800">{selectedArticle.aiSummary}</p>
              </div>

              {/* Action Items */}
              {selectedArticle.actionItems.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Προτεινόμενες Ενέργειες</h3>
                  </div>
                  <ul className="space-y-2">
                    {selectedArticle.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRightIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-green-800">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Content */}
              <div className="prose max-w-none mb-6">
                <p className="text-lg text-gray-800 leading-relaxed">{selectedArticle.content}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedArticle.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleBookmark(selectedArticle.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedArticle.isBookmarked 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <BookmarkIcon className="w-4 h-4" />
                    {selectedArticle.isBookmarked ? 'Αποθηκευμένο' : 'Αποθήκευση'}
                  </button>
                  <button
                    onClick={() => handleShare(selectedArticle)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ShareIcon className="w-4 h-4" />
                    Κοινοποίηση
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    Διαβάστε Πλήρες Άρθρο
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessNewsManager;