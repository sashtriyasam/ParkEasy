/**
 * Formats a numeric value into a localized currency string.
 * @param amount - The numeric value to format.
 * @param currency - The ISO 4217 currency code (default: 'INR').
 * @param locale - The BCP 47 language tag (default: 'en-IN').
 * @returns A formatted currency string or a placeholder if the amount is nullish.
 */
export const formatCurrency = (
  amount: number | null | undefined,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string => {
  if (amount === null || amount === undefined) return '—';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    console.warn('Currency formatting failed, using fallback:', error);
    return `\u20B9${amount}`;
  }
};
