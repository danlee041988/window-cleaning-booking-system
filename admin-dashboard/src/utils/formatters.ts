import { formatDistanceToNow, format, parseISO, isValid } from 'date-fns';

/**
 * Format currency values
 */
export const formatCurrency = (amount: number, currency = 'GBP'): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '£0.00';
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export const formatNumber = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }

  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format dates in a consistent way
 */
export const formatDate = (date: string | Date, formatString = 'PPP'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }

    return format(dateObj, formatString);
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format date and time
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'PPP p');
};

/**
 * Format time only
 */
export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'p');
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }

    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format duration in minutes to human readable format
 */
export const formatDuration = (minutes: number): string => {
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) {
    return '0 min';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format phone numbers to UK format
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Handle UK mobile numbers
  if (digits.startsWith('44') && digits.length === 13) {
    // +44 7XXX XXX XXX
    return `+44 ${digits.slice(2, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }

  if (digits.startsWith('07') && digits.length === 11) {
    // 07XXX XXX XXX
    return `${digits.slice(0, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }

  // Handle UK landline numbers
  if (digits.startsWith('44') && digits.length >= 12) {
    // +44 1XXX XXX XXX
    return `+44 ${digits.slice(2, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }

  if (digits.startsWith('01') || digits.startsWith('02')) {
    // 01XXX XXX XXX or 02X XXXX XXXX
    if (digits.length === 11) {
      return `${digits.slice(0, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }
  }

  // Return original if no pattern matches
  return phone;
};

/**
 * Format postcode to standard UK format
 */
export const formatPostcode = (postcode: string): string => {
  if (!postcode) return '';

  // Remove spaces and convert to uppercase
  const cleaned = postcode.replace(/\s+/g, '').toUpperCase();

  // UK postcode pattern: 1-2 letters, 1-2 digits, optional letter, space, 1 digit, 2 letters
  const match = cleaned.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)(\d[A-Z]{2})$/);

  if (match) {
    return `${match[1]} ${match[2]}`;
  }

  return postcode; // Return original if doesn't match pattern
};

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Capitalize first letter of each word
 */
export const formatTitle = (str: string): string => {
  if (!str) return '';

  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (str: string, length: number): string => {
  if (!str) return '';
  if (str.length <= length) return str;
  
  return str.slice(0, length).trim() + '...';
};

/**
 * Format lead number with consistent padding
 */
export const formatLeadNumber = (number: number, prefix = 'SWC', year?: number): string => {
  const currentYear = year || new Date().getFullYear();
  const paddedNumber = number.toString().padStart(3, '0');
  
  return `${prefix}-${currentYear}-${paddedNumber}`;
};

/**
 * Format address for display
 */
export const formatAddress = (address: {
  line1?: string;
  line2?: string;
  city?: string;
  postcode?: string;
}): string => {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    formatPostcode(address.postcode || '')
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Format service frequency for display
 */
export const formatFrequency = (frequency: string): string => {
  const frequencyMap: Record<string, string> = {
    '4weekly': 'Every 4 weeks',
    '8weekly': 'Every 8 weeks',
    '12weekly': 'Every 12 weeks',
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'annually': 'Annually',
    'oneoff': 'One-off',
    'adhoc': 'As required'
  };

  return frequencyMap[frequency.toLowerCase()] || formatTitle(frequency);
};

/**
 * Format status name for display
 */
export const formatStatus = (status: string): string => {
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Validate and format email
 */
export const formatEmail = (email: string): string => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Format contact method for display
 */
export const formatContactMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    email: 'Email',
    phone: 'Phone',
    sms: 'SMS/Text',
    whatsapp: 'WhatsApp',
    post: 'Post'
  };

  return methodMap[method.toLowerCase()] || formatTitle(method);
};