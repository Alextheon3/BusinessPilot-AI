// Date utilities for BusinessPilot AI

/**
 * Safely get urgency level for a deadline
 */
export const getUrgencyLevel = (deadline?: string): 'urgent' | 'warning' | 'normal' | null => {
  if (!deadline) return null;
  
  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    
    // Reset time to start of day for accurate comparison
    deadlineDate.setHours(23, 59, 59, 999);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'urgent';
    if (diffDays <= 30) return 'warning';
    return 'normal';
  } catch (error) {
    console.error('Invalid deadline format:', deadline);
    return null;
  }
};

/**
 * Calculate days until deadline
 */
export const getDaysUntilDeadline = (deadline: string): number => {
  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    
    deadlineDate.setHours(23, 59, 59, 999);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Invalid deadline format:', deadline);
    return 0;
  }
};

/**
 * Format date for Greek locale
 */
export const formatGreekDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Invalid date format:', date);
    return '';
  }
};

/**
 * Format date for Greek locale (short format)
 */
export const formatGreekDateShort = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('el-GR');
  } catch (error) {
    console.error('Invalid date format:', date);
    return '';
  }
};

/**
 * Format time for Greek locale
 */
export const formatGreekTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('el-GR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Invalid date format:', date);
    return '';
  }
};

/**
 * Get relative time in Greek
 */
export const getRelativeTimeGreek = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'μόλις τώρα';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} λεπτά πριν`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ώρες πριν`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ημέρες πριν`;
    } else {
      return formatGreekDateShort(dateObj);
    }
  } catch (error) {
    console.error('Invalid date format:', date);
    return '';
  }
};

/**
 * Check if date is today
 */
export const isToday = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    return dateObj.toDateString() === today.toDateString();
  } catch (error) {
    console.error('Invalid date format:', date);
    return false;
  }
};

/**
 * Check if date is this week
 */
export const isThisWeek = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return dateObj >= oneWeekAgo && dateObj <= today;
  } catch (error) {
    console.error('Invalid date format:', date);
    return false;
  }
};

/**
 * Get next occurrence of a specific day of month
 */
export const getNextMonthlyDeadline = (dayOfMonth: number): Date => {
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
  
  if (thisMonth > today) {
    return thisMonth;
  } else {
    return new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth);
  }
};

/**
 * Get next occurrence of a specific month and day
 */
export const getNextAnnualDeadline = (month: number, day: number): Date => {
  const today = new Date();
  const thisYear = new Date(today.getFullYear(), month - 1, day);
  
  if (thisYear > today) {
    return thisYear;
  } else {
    return new Date(today.getFullYear() + 1, month - 1, day);
  }
};

/**
 * Parse Greek date string (DD/MM/YYYY or DD-MM-YYYY)
 */
export const parseGreekDate = (dateString: string): Date | null => {
  try {
    const parts = dateString.split(/[\/\-]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      
      const date = new Date(year, month, day);
      
      // Validate the date
      if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
        return date;
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing Greek date:', dateString);
    return null;
  }
};

/**
 * Get business days between two dates
 */
export const getBusinessDays = (startDate: Date, endDate: Date): number => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let businessDays = 0;
    
    for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        businessDays++;
      }
    }
    
    return businessDays;
  } catch (error) {
    console.error('Error calculating business days:', error);
    return 0;
  }
};

/**
 * Check if date is a business day
 */
export const isBusinessDay = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dayOfWeek = dateObj.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Not Sunday or Saturday
  } catch (error) {
    console.error('Invalid date format:', date);
    return false;
  }
};