import React, { useState } from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

interface TaxisNetLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const TaxisNetLogin: React.FC<TaxisNetLoginProps> = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { setUser } = useAuthStore();

  const handleTaxisNetLogin = async () => {
    setIsLoading(true);
    
    try {
      // Call backend to get TaxisNet authorization URL
      const response = await fetch('/api/v1/auth/taxisnet/login', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Αποτυχία σύνδεσης με TaxisNet');
      }

      const data = await response.json();
      
      // Store state for callback verification
      sessionStorage.setItem('taxisnet_state', data.state);
      
      // Redirect to TaxisNet
      window.location.href = data.authorization_url;
      
    } catch (error) {
      console.error('TaxisNet login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Σφάλμα σύνδεσης με TaxisNet';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAFM = async () => {
    const afm = prompt('Εισάγετε τον ΑΦΜ σας για επαλήθευση:');
    
    if (!afm || afm.length !== 9) {
      toast.error('Παρακαλώ εισάγετε έγκυρο ΑΦΜ (9 ψηφία)');
      return;
    }

    try {
      const response = await fetch('/api/v1/auth/taxisnet/verify-afm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ afm }),
      });

      if (!response.ok) {
        throw new Error('Αποτυχία επαλήθευσης ΑΦΜ');
      }

      const data = await response.json();
      
      if (data.valid) {
        toast.success(`Έγκυρος ΑΦΜ! Επιχείρηση: ${data.business_name || 'Μη διαθέσιμο'}`);
      } else {
        toast.error('Μη έγκυρος ΑΦΜ');
      }
      
    } catch (error) {
      console.error('AFM verification error:', error);
      toast.error('Σφάλμα κατά την επαλήθευση ΑΦΜ');
    }
  };

  return (
    <div className="space-y-6">
      {/* TaxisNet Login Button */}
      <div className="relative">
        <button
          onClick={handleTaxisNetLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Σύνδεση...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>Σύνδεση με TaxisNet</span>
            </div>
          )}
        </button>
        
        {/* Official TaxisNet badge */}
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          Επίσημο
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
          Πλεονεκτήματα σύνδεσης με TaxisNet:
        </h3>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
          <li>• Αυτόματη συμπλήρωση στοιχείων επιχείρησης</li>
          <li>• Πρόσβαση σε φορολογικές υποχρεώσεις</li>
          <li>• Λήψη πιστοποιητικών ενημερότητας</li>
          <li>• Ασφαλής και επιβεβαιωμένη πιστοποίηση</li>
        </ul>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">ή</span>
        </div>
      </div>

      {/* AFM Verification */}
      <button
        onClick={handleVerifyAFM}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
      >
        <span>Επαλήθευση ΑΦΜ</span>
      </button>

      {/* Information */}
      <div className="space-y-3">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span>Σημαντικές πληροφορίες</span>
        </button>

        {showInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p>
                <strong>Ασφάλεια:</strong> Η σύνδεση με TaxisNet είναι πλήρως ασφαλής και γίνεται 
                μέσω του επίσημου OAuth2 protocol της ΑΑΔΕ.
              </p>
              <p>
                <strong>Δεδομένα:</strong> Δεν αποθηκεύουμε τα διαπιστευτήρια σας. Μόνο τα 
                απαραίτητα στοιχεία για τη λειτουργία της πλατφόρμας.
              </p>
              <p>
                <strong>Προαιρετικό:</strong> Η σύνδεση με TaxisNet είναι προαιρετική και μπορείτε 
                να χρησιμοποιήσετε την πλατφόρμα χωρίς αυτή.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Help */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Αντιμετωπίζετε πρόβλημα; {' '}
          <a 
            href="mailto:support@businesspilot.ai" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Επικοινωνήστε μαζί μας
          </a>
        </p>
      </div>
    </div>
  );
};

export default TaxisNetLogin;