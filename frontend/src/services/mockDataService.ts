// Mock data service for offline development
export class MockDataService {
  private static instance: MockDataService;
  private data: any = {};

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  private initializeMockData() {
    // Dashboard Statistics
    this.data.dashboardStats = {
      total_sales: 1247,
      total_revenue: 15678.50,
      average_sale: 12.57,
      growth_rate: 8.3,
      top_products: [
        { product_name: 'Ελληνικός Καφές Premium', total_quantity: 156, total_revenue: 1248.00 },
        { product_name: 'Φρέσκο Γάλα Βιολογικό', total_quantity: 234, total_revenue: 1170.00 },
        { product_name: 'Παραδοσιακό Τυρί Φέτα', total_quantity: 89, total_revenue: 890.00 },
        { product_name: 'Ελληνικό Μέλι Θυμάρι', total_quantity: 67, total_revenue: 670.00 },
        { product_name: 'Φρέσκα Αυγά Βιολογικά', total_quantity: 123, total_revenue: 492.00 }
      ],
      sales_by_day: [
        { date: '2024-01-15', count: 45, revenue: 567.80 },
        { date: '2024-01-16', count: 38, revenue: 445.20 },
        { date: '2024-01-17', count: 52, revenue: 634.50 },
        { date: '2024-01-18', count: 41, revenue: 523.40 },
        { date: '2024-01-19', count: 47, revenue: 588.90 },
        { date: '2024-01-20', count: 55, revenue: 678.30 },
        { date: '2024-01-21', count: 49, revenue: 598.70 }
      ]
    };

    // Stock Alerts
    this.data.stockAlerts = [
      { product_name: 'Ελληνικός Καφές Premium', current_stock: 5, min_stock: 20, urgency: 'high' },
      { product_name: 'Φρέσκο Γάλα Βιολογικό', current_stock: 12, min_stock: 30, urgency: 'medium' },
      { product_name: 'Παραδοσιακό Τυρί Φέτα', current_stock: 3, min_stock: 15, urgency: 'critical' }
    ];

    // Payment Reminders
    this.data.paymentReminders = [
      { title: 'Πληρωμή Προμηθευτή - Καφές', amount: 1250.00, days_remaining: 2 },
      { title: 'Ενοίκιο Καταστήματος', amount: 850.00, days_remaining: 5 },
      { title: 'Ηλεκτρικό Ρεύμα', amount: 125.50, days_remaining: 8 }
    ];

    // Recent Invoices
    this.data.recentInvoices = [
      { supplier_name: 'Γαλακτοκομείο Δόδωνη', amount: 567.80, status: 'pending' },
      { supplier_name: 'Εταιρεία Καφέ Αθήνας', amount: 1234.50, status: 'paid' },
      { supplier_name: 'Τυροκομείο Κρήτης', amount: 345.20, status: 'pending' }
    ];

    // Business News
    this.data.businessNews = [
      {
        title: 'Νέες Επιδοτήσεις για Μικρές Επιχειρήσεις',
        excerpt: 'Η κυβέρνηση ανακοίνωσε νέο πρόγραμμα επιδοτήσεων για τη στήριξη των μικρών επιχειρήσεων',
        date: '2024-01-21',
        category: 'Επιδοτήσεις'
      },
      {
        title: 'Αλλαγές στη Φορολογία Επιχειρήσεων',
        excerpt: 'Νέες φορολογικές ρυθμίσεις που επηρεάζουν τις επιχειρήσεις από τον Φεβρουάριο',
        date: '2024-01-20',
        category: 'Φορολογία'
      },
      {
        title: 'Ψηφιακή Μετάβαση για Επιχειρήσεις',
        excerpt: 'Προγράμματα στήριξης για την ψηφιακή αναβάθμιση των επιχειρήσεων',
        date: '2024-01-19',
        category: 'Τεχνολογία'
      }
    ];

    // Subsidies
    this.data.subsidies = [
      {
        title: 'Πρόγραμμα Ενίσχυσης Μικρών Επιχειρήσεων',
        amount: '€5,000 - €25,000',
        deadline: '2024-03-31',
        status: 'active',
        description: 'Επιδότηση για τον εκσυγχρονισμό εξοπλισμού και τη στήριξη της λειτουργίας'
      },
      {
        title: 'Ψηφιακή Μετάβαση',
        amount: '€2,000 - €10,000',
        deadline: '2024-04-15',
        status: 'active',
        description: 'Χρηματοδότηση για την ψηφιακή αναβάθμιση και τη δημιουργία e-shop'
      },
      {
        title: 'Πράσινη Ανάπτυξη',
        amount: '€3,000 - €15,000',
        deadline: '2024-05-01',
        status: 'coming_soon',
        description: 'Επιδότηση για περιβαλλοντικά φιλικές επενδύσεις'
      }
    ];

    // Suppliers
    this.data.suppliers = [
      {
        name: 'Γαλακτοκομείο Δόδωνη',
        category: 'Γαλακτοκομικά',
        contact: '+30 210 123 4567',
        email: 'info@dodoni.gr',
        rating: 4.8,
        lastOrder: '2024-01-18'
      },
      {
        name: 'Εταιρεία Καφέ Αθήνας',
        category: 'Καφές & Αναψυκτικά',
        contact: '+30 210 987 6543',
        email: 'orders@athenscoffe.gr',
        rating: 4.6,
        lastOrder: '2024-01-15'
      },
      {
        name: 'Τυροκομείο Κρήτης',
        category: 'Τυροκομικά',
        contact: '+30 2810 456 789',
        email: 'sales@cretancheese.gr',
        rating: 4.9,
        lastOrder: '2024-01-20'
      }
    ];
  }

  public getDashboardStats(dateRange: string = '7d'): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.data.dashboardStats);
      }, 800); // Simulate API delay
    });
  }

  public getStockAlerts(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.data.stockAlerts);
      }, 500);
    });
  }

  public getPaymentReminders(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.data.paymentReminders);
      }, 600);
    });
  }

  public getRecentInvoices(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.data.recentInvoices);
      }, 700);
    });
  }

  public getBusinessNews(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.data.businessNews);
      }, 400);
    });
  }

  public getSubsidies(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.data.subsidies);
      }, 500);
    });
  }

  public getSuppliers(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.data.suppliers);
      }, 450);
    });
  }

  // Helper method to check if we're in offline mode
  public static isOfflineMode(): boolean {
    return !navigator.onLine || process.env.NODE_ENV === 'development';
  }

  // Update data dynamically (for testing purposes)
  public updateData(key: string, value: any): void {
    this.data[key] = value;
  }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance();