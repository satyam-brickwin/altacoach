import { TrainingContent } from '@/types';

/**
 * Detect the language of a given text
 * In a real app, this would use a language detection library
 * @param text The text to detect language from
 * @returns ISO language code (en, fr, de, it, etc.) or null if can't detect
 */
export function detectLanguage(text: string): string | null {
  // This is a very simplistic implementation 
  // In a real app, use a proper language detection library
  const lowerText = text.toLowerCase();
  
  // French indicators
  if (
    lowerText.includes('bonjour') ||
    lowerText.includes('merci') ||
    lowerText.includes('comment') ||
    lowerText.includes('s\'il vous plaît') ||
    lowerText.includes('je suis')
  ) {
    return 'fr';
  }
  
  // German indicators
  if (
    lowerText.includes('guten tag') ||
    lowerText.includes('danke') ||
    lowerText.includes('bitte') ||
    lowerText.includes('ich bin')
  ) {
    return 'de';
  }
  
  // Italian indicators
  if (
    lowerText.includes('ciao') ||
    lowerText.includes('grazie') ||
    lowerText.includes('per favore') ||
    lowerText.includes('sono')
  ) {
    return 'it';
  }
  
  // Default to English if no clear indicators
  // In a real app, this would be much more sophisticated
  return 'en';
}

/**
 * Retrieve training content relevant to a query in the specified language
 * @param query The user's query
 * @param language The language code to filter content by
 * @returns Array of relevant training content
 */
export async function getTrainingContent(
  query: string,
  language: string = 'en'
): Promise<TrainingContent[]> {
  // In a real app, this would:
  // 1. Query a vector database for semantically similar content
  // 2. Filter by language
  // 3. Return the most relevant matches
  
  // For now, we'll return mock data
  const mockTrainingContent: TrainingContent[] = [
    {
      id: '1',
      title: language === 'fr' ? 'Introduction aux ventes' : 'Introduction to Sales',
      contentType: 'COURSE',
      language,
      content: language === 'fr' 
        ? 'Les bases des techniques de vente efficaces, y compris l\'établissement de rapports, la compréhension des besoins et la présentation de solutions.'
        : 'The basics of effective sales techniques, including building rapport, understanding needs, and presenting solutions.',
    },
    {
      id: '2',
      title: language === 'fr' ? 'Gestion des objections' : 'Handling Objections',
      contentType: 'GUIDE',
      language,
      content: language === 'fr'
        ? 'Comment répondre efficacement aux objections courantes des clients en utilisant la méthode LAER: Écouter, Accuser réception, Explorer, Répondre.'
        : 'How to effectively respond to common customer objections using the LAER method: Listen, Acknowledge, Explore, Respond.',
    },
    {
      id: '3',
      title: language === 'fr' ? 'Scénarios pratiques' : 'Practice Scenarios',
      contentType: 'EXERCISE',
      language,
      content: language === 'fr'
        ? 'Une collection de scénarios pratiques pour s\'entraîner à gérer différentes situations client.'
        : 'A collection of practice scenarios to train on handling different customer situations.',
    },
  ];
  
  return mockTrainingContent;
}

/**
 * Formats a date to a readable string
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Truncates text to a specified length
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generates a random ID
 * @param length Length of the ID
 * @returns Random ID string
 */
export function generateId(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Debounces a function
 * @param func The function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Capitalizes the first letter of a string
 * @param str The string to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Checks if a string is a valid email
 * @param email The email to validate
 * @returns Whether the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Groups an array by a key
 * @param array The array to group
 * @param key The key to group by
 * @returns Grouped object
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Formats a number with commas
 * @param num The number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Safely parses JSON
 * @param json The JSON string to parse
 * @param fallback Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    return fallback;
  }
} 


