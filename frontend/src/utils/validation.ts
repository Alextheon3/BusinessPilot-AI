// Validation utilities for BusinessPilot AI

import { FORM_VALIDATION } from '../constants/business';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateQuery = (query: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!query || query.trim().length === 0) {
    errors.push('Το ερώτημα δεν μπορεί να είναι κενό');
  } else if (query.trim().length < FORM_VALIDATION.MIN_QUERY_LENGTH) {
    errors.push(`Το ερώτημα πρέπει να έχει τουλάχιστον ${FORM_VALIDATION.MIN_QUERY_LENGTH} χαρακτήρες`);
  } else if (query.length > FORM_VALIDATION.MAX_QUERY_LENGTH) {
    errors.push(`Το ερώτημα δεν μπορεί να υπερβαίνει τους ${FORM_VALIDATION.MAX_QUERY_LENGTH} χαρακτήρες`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAFM = (afm: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!afm || afm.trim().length === 0) {
    errors.push('Το ΑΦΜ είναι υποχρεωτικό');
  } else if (!FORM_VALIDATION.AFM_PATTERN.test(afm)) {
    errors.push('Το ΑΦΜ πρέπει να αποτελείται από 9 ψηφία');
  } else if (!isValidAFMChecksum(afm)) {
    errors.push('Το ΑΦΜ δεν είναι έγκυρο');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email || email.trim().length === 0) {
    errors.push('Το email είναι υποχρεωτικό');
  } else if (!FORM_VALIDATION.EMAIL_PATTERN.test(email)) {
    errors.push('Το email δεν είναι έγκυρο');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone || phone.trim().length === 0) {
    errors.push('Το τηλέφωνο είναι υποχρεωτικό');
  } else if (!FORM_VALIDATION.PHONE_PATTERN.test(phone.replace(/\s/g, ''))) {
    errors.push('Το τηλέφωνο πρέπει να έχει 10 ψηφία');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateBusinessProfile = (profile: Partial<BusinessProfile>): ValidationResult => {
  const errors: string[] = [];
  
  if (!profile.name || profile.name.trim().length === 0) {
    errors.push('Η επωνυμία είναι υποχρεωτική');
  }
  
  if (profile.afm) {
    const afmValidation = validateAFM(profile.afm);
    if (!afmValidation.isValid) {
      errors.push(...afmValidation.errors);
    }
  }
  
  if (profile.email) {
    const emailValidation = validateEmail(profile.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }
  }
  
  if (profile.phone) {
    const phoneValidation = validatePhone(profile.phone);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.errors);
    }
  }
  
  if (profile.employees && profile.employees < 0) {
    errors.push('Ο αριθμός εργαζομένων δεν μπορεί να είναι αρνητικός');
  }
  
  if (profile.revenue && profile.revenue < 0) {
    errors.push('Τα έσοδα δεν μπορούν να είναι αρνητικά');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// AFM checksum validation (Greek tax number validation)
const isValidAFMChecksum = (afm: string): boolean => {
  if (afm.length !== 9) return false;
  
  const digits = afm.split('').map(Number);
  const checkDigit = digits[8];
  
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * Math.pow(2, 8 - i);
  }
  
  const remainder = sum % 11;
  const calculatedCheckDigit = remainder < 2 ? remainder : 11 - remainder;
  
  return calculatedCheckDigit === checkDigit;
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim();
};

export const validateDate = (dateString: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!dateString) {
    errors.push('Η ημερομηνία είναι υποχρεωτική');
  } else {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      errors.push('Η ημερομηνία δεν είναι έγκυρη');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateDeadline = (deadline: string): ValidationResult => {
  const dateValidation = validateDate(deadline);
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const errors: string[] = [];
  const deadlineDate = new Date(deadline);
  const today = new Date();
  
  if (deadlineDate <= today) {
    errors.push('Η προθεσμία δεν μπορεί να είναι στο παρελθόν');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};