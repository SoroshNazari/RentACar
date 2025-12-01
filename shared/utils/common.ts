// Gemeinsame Utilities für Frontend und Backend

export class DateUtils {
  static formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('de-DE');
  }

  static formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString('de-DE');
  }

  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

export class StringUtils {
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static truncate(str: string, length: number): string {
    return str.length > length ? str.substring(0, length) + '...' : str;
  }

  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export class ValidationUtils {
  static isRequired(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  static minLength(min: number) {
    return (value: string) => value.length >= min;
  }

  static maxLength(max: number) {
    return (value: string) => value.length <= max;
  }
}