import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  RocketLaunchIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyEuroIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CloudIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BellIcon,
  CogIcon,
  ArrowRightIcon,
  StarIcon,
  LightBulbIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import PageLayout from '../components/Common/PageLayout';
import { toast } from 'react-hot-toast';

interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceAnnual: number;
  popular: boolean;
  features: PlanFeature[];
  color: string;
  icon: any;
  buttonText: string;
  savings?: number;
}

const Upgrade: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'BusinessPilot Basic',
      description: 'Ιδανικό για μικρές επιχειρήσεις που ξεκινούν',
      price: 0,
      priceAnnual: 0,
      popular: false,
      color: 'from-slate-500 to-slate-600',
      icon: DocumentTextIcon,
      buttonText: 'Τρέχον Πλάνο',
      features: [
        { name: 'Βασικό dashboard', included: true },
        { name: 'Έως 5 έντυπα/μήνα', included: true },
        { name: 'Email υποστήριξη', included: true },
        { name: 'Βασικές αναφορές', included: true },
        { name: 'AI βοηθός (περιορισμένο)', included: true },
        { name: 'Προηγμένα analytics', included: false },
        { name: 'Απεριόριστα έντυπα', included: false },
        { name: 'Προτεραιότητα υποστήριξης', included: false },
        { name: 'Εξαγωγή δεδομένων', included: false },
        { name: 'API πρόσβαση', included: false },
        { name: 'Προσαρμοσμένες αναφορές', included: false },
        { name: 'Πολλαπλοί χρήστες', included: false }
      ]
    },
    {
      id: 'pro',
      name: 'BusinessPilot Pro',
      description: 'Για αναπτυσσόμενες επιχειρήσεις με περισσότερες ανάγκες',
      price: 49.99,
      priceAnnual: 499.99,
      popular: true,
      color: 'from-blue-600 to-purple-600',
      icon: ChartBarIcon,
      buttonText: 'Αναβάθμιση σε Pro',
      savings: 100,
      features: [
        { name: 'Πλήρες dashboard', included: true },
        { name: 'Απεριόριστα έντυπα', included: true },
        { name: 'Προτεραιότητα υποστήριξης', included: true },
        { name: 'Προηγμένα analytics', included: true },
        { name: 'AI βοηθός (πλήρες)', included: true },
        { name: 'Εξαγωγή δεδομένων', included: true },
        { name: 'Προσαρμοσμένες αναφορές', included: true },
        { name: 'Έως 5 χρήστες', included: true },
        { name: 'API πρόσβαση', included: true },
        { name: 'Αυτόματες υπενθυμίσεις', included: true },
        { name: 'Ενσωμάτωση λογιστικού', included: false },
        { name: 'Απεριόριστοι χρήστες', included: false }
      ]
    },
    {
      id: 'enterprise',
      name: 'BusinessPilot Enterprise',
      description: 'Για μεγάλες επιχειρήσεις με εξειδικευμένες ανάγκες',
      price: 149.99,
      priceAnnual: 1499.99,
      popular: false,
      color: 'from-emerald-600 to-green-600',
      icon: TrophyIcon,
      buttonText: 'Αναβάθμιση σε Enterprise',
      savings: 300,
      features: [
        { name: 'Όλα από το Pro', included: true },
        { name: 'Απεριόριστοι χρήστες', included: true },
        { name: 'Ενσωμάτωση λογιστικού', included: true },
        { name: 'Προσωπικός account manager', included: true },
        { name: 'Προτεραιότητα ανάπτυξης', included: true },
        { name: 'Εξειδικευμένη εκπαίδευση', included: true },
        { name: 'SLA 99.9%', included: true },
        { name: 'Προσαρμοσμένες ενσωματώσεις', included: true },
        { name: 'Λευκή ετικέτα', included: true },
        { name: 'Τοπική εγκατάσταση', included: true },
        { name: 'GDPR συμμόρφωση', included: true },
        { name: 'Ασφάλεια enterprise', included: true }
      ]
    }
  ];

  const currentPlan = plans.find(plan => plan.id === 'basic'); // Mock current plan

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    toast.success('Η αναβάθμιση ολοκληρώθηκε επιτυχώς!');
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  const features = [
    {
      icon: SparklesIcon,
      title: 'AI Βοηθός',
      description: 'Προηγμένος AI βοηθός για γραφειοκρατία, επιδοτήσεις και επιχειρηματικές αποφάσεις',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: DocumentTextIcon,
      title: 'Αυτόματα Έντυπα',
      description: 'Αυτόματη συμπλήρωση και υποβολή όλων των απαιτούμενων εντύπων',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BellIcon,
      title: 'Έξυπνες Υπενθυμίσεις',
      description: 'Ποτέ μην χάσετε προθεσμία με έξυπνες υπενθυμίσεις και ειδοποιήσεις',
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: ChartBarIcon,
      title: 'Αναλυτικά Στοιχεία',
      description: 'Λεπτομερή analytics για την επίδοση της επιχείρησής σας',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Ασφάλεια Enterprise',
      description: 'Υψηλότερα επίπεδα ασφάλειας με κρυπτογράφηση και 2FA',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: CloudIcon,
      title: 'Cloud Sync',
      description: 'Συγχρονισμός σε όλες τις συσκευές με αυτόματα backups',
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  const testimonials = [
    {
      name: 'Μαρία Παπαδοπούλου',
      business: 'Καφετέρια Αθηνών',
      text: 'Το BusinessPilot μου εξοικονόμησε ώρες κάθε εβδομάδα. Η γραφειοκρατία δεν είναι πλέον πρόβλημα!',
      rating: 5
    },
    {
      name: 'Γιάννης Κωνσταντίνου',
      business: 'Μίνι Μάρκετ',
      text: 'Οι αυτόματες υπενθυμίσεις για φόρους και επιδοτήσεις με βοήθησαν να μην χάσω καμία προθεσμία.',
      rating: 5
    },
    {
      name: 'Ελένη Γεωργίου',
      business: 'Λογιστικό Γραφείο',
      text: 'Χρησιμοποιώ το Enterprise plan για τους πελάτες μου. Η αποδοτικότητα αυξήθηκε κατά 300%!',
      rating: 5
    }
  ];

  const faq = [
    {
      question: 'Μπορώ να αλλάξω πλάνο οποιαδήποτε στιγμή;',
      answer: 'Ναι, μπορείτε να αναβαθμίσετε ή να υποβαθμίσετε το πλάνο σας οποιαδήποτε στιγμή. Οι αλλαγές θα εφαρμοστούν στην επόμενη χρέωση.'
    },
    {
      question: 'Τι συμβαίνει αν ακυρώσω τη συνδρομή μου;',
      answer: 'Θα έχετε πρόσβαση στο πλάνο σας μέχρι το τέλος της τρέχουσας περιόδου χρέωσης. Μετά θα μεταφερθείτε στο δωρεάν πλάνο.'
    },
    {
      question: 'Υπάρχει δοκιμαστική περίοδος;',
      answer: 'Ναι, όλα τα πληρωμένα πλάνα έχουν 14 ημέρες δωρεάν δοκιμή. Δεν χρειάζεται πιστωτική κάρτα για να ξεκινήσετε.'
    },
    {
      question: 'Παρέχετε υποστήριξη στα ελληνικά;',
      answer: 'Ναι, η υποστήριξή μας λειτουργεί στα ελληνικά 24/7 για τα πληρωμένα πλάνα και σε εργάσιμες ώρες για το δωρεάν πλάνο.'
    }
  ];

  return (
    <PageLayout
      title="Αναβάθμιση Πλάνου"
      subtitle="Επιλέξτε το πλάνο που ταιριάζει στις ανάγκες της επιχείρησής σας"
      icon={<RocketLaunchIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl shadow-lg">
          <SparklesIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Αναβάθμιση</span>
        </div>
      }
    >
      <div className="space-y-12">
        {/* Current Plan Status */}
        <div className={`rounded-2xl p-6 border backdrop-blur-xl ${
          isDarkMode 
            ? 'bg-slate-800/40 border-slate-700/50' 
            : 'bg-white/40 border-white/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-slate-600 rounded-xl flex items-center justify-center mr-4">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Τρέχον Πλάνο: {currentPlan?.name}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Έχετε χρησιμοποιήσει 3 από 5 έντυπα αυτόν τον μήνα
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Δωρεάν
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Για πάντα
              </p>
            </div>
          </div>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center">
          <div className={`p-2 rounded-xl border ${
            isDarkMode 
              ? 'bg-slate-800/40 border-slate-700/50' 
              : 'bg-white/40 border-white/20'
          }`}>
            <div className="flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  billingPeriod === 'monthly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : isDarkMode 
                      ? 'text-slate-300 hover:text-white' 
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Μηνιαίως
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2 rounded-lg transition-all duration-200 relative ${
                  billingPeriod === 'annual'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : isDarkMode 
                      ? 'text-slate-300 hover:text-white' 
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ετήσιως
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 border backdrop-blur-xl transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? isDarkMode 
                    ? 'bg-gradient-to-b from-blue-800/40 to-purple-800/40 border-blue-700/50' 
                    : 'bg-gradient-to-b from-blue-50/60 to-purple-50/60 border-blue-200/50'
                  : isDarkMode 
                    ? 'bg-slate-800/40 border-slate-700/50' 
                    : 'bg-white/40 border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    Πιο Δημοφιλές
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="text-center mb-6">
                <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  €{billingPeriod === 'monthly' ? plan.price : plan.priceAnnual}
                  {plan.price > 0 && (
                    <span className={`text-lg font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      /{billingPeriod === 'monthly' ? 'μήνα' : 'χρόνο'}
                    </span>
                  )}
                </div>
                {billingPeriod === 'annual' && plan.savings && (
                  <div className="text-sm text-green-600 font-medium">
                    Εξοικονόμηση €{plan.savings}/χρόνο
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    {feature.included ? (
                      <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XMarkIcon className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${
                      feature.included 
                        ? isDarkMode ? 'text-slate-300' : 'text-slate-700'
                        : isDarkMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => plan.id !== 'basic' && handleUpgrade(plan.id)}
                disabled={plan.id === 'basic'}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                  plan.id === 'basic'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg`
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className={`rounded-2xl p-8 border backdrop-blur-xl ${
          isDarkMode 
            ? 'bg-slate-800/40 border-slate-700/50' 
            : 'bg-white/40 border-white/20'
        }`}>
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Χαρακτηριστικά BusinessPilot
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Όλα όσα χρειάζεστε για τη διαχείριση της επιχείρησής σας
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className={`rounded-2xl p-8 border backdrop-blur-xl ${
          isDarkMode 
            ? 'bg-slate-800/40 border-slate-700/50' 
            : 'bg-white/40 border-white/20'
        }`}>
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Τι λένε οι πελάτες μας
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`p-6 rounded-xl border ${
                isDarkMode 
                  ? 'bg-slate-700/40 border-slate-600/50' 
                  : 'bg-white/40 border-slate-200/50'
              }`}>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  "{testimonial.text}"
                </p>
                <div>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {testimonial.name}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {testimonial.business}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className={`rounded-2xl p-8 border backdrop-blur-xl ${
          isDarkMode 
            ? 'bg-slate-800/40 border-slate-700/50' 
            : 'bg-white/40 border-white/20'
        }`}>
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Συχνές Ερωτήσεις
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faq.map((item, index) => (
              <div key={index} className={`p-6 rounded-xl border ${
                isDarkMode 
                  ? 'bg-slate-700/40 border-slate-600/50' 
                  : 'bg-white/40 border-slate-200/50'
              }`}>
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {item.question}
                </h3>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`rounded-2xl p-8 border backdrop-blur-xl text-center ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-800/40 to-purple-800/40 border-blue-700/50' 
            : 'bg-gradient-to-r from-blue-50/60 to-purple-50/60 border-blue-200/50'
        }`}>
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Έτοιμοι να ξεκινήσετε;
          </h2>
          <p className={`text-lg mb-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Επιλέξτε το πλάνο που σας ταιριάζει και αρχίστε να εξοικονομείτε χρόνο σήμερα
          </p>
          <button
            onClick={() => handleUpgrade('pro')}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            <RocketLaunchIcon className="w-5 h-5 mr-2" />
            Ξεκινήστε τη Δωρεάν Δοκιμή
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 border backdrop-blur-xl ${
            isDarkMode 
              ? 'bg-slate-800/90 border-slate-700/50' 
              : 'bg-white/90 border-white/20'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Επιβεβαίωση Αναβάθμισης
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                }`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${
                isDarkMode 
                  ? 'bg-slate-700/40 border-slate-600/50' 
                  : 'bg-slate-50/40 border-slate-200/50'
              }`}>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {plans.find(p => p.id === selectedPlan)?.name}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  €{billingPeriod === 'monthly' 
                    ? plans.find(p => p.id === selectedPlan)?.price 
                    : plans.find(p => p.id === selectedPlan)?.priceAnnual} / {billingPeriod === 'monthly' ? 'μήνα' : 'χρόνο'}
                </p>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Δωρεάν δοκιμή 14 ημερών. Ακυρώστε οποιαδήποτε στιγμή.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handlePayment}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  <CreditCardIcon className="w-4 h-4 mr-2" />
                  Ξεκίνημα Δοκιμής
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className={`px-4 py-3 rounded-xl transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-slate-700 text-white hover:bg-slate-600' 
                      : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                  }`}
                >
                  Ακύρωση
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Upgrade;