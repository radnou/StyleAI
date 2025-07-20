import { Timestamp } from 'firebase/firestore';

/**
 * Utility class for converting between Firebase Timestamps and JavaScript Dates
 */
export class TimestampConverter {
  /**
   * Converts Firebase Timestamp to JavaScript Date
   * @param timestamp Firebase Timestamp
   * @returns JavaScript Date
   */
  static toDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }

  /**
   * Converts JavaScript Date to Firebase Timestamp
   * @param date JavaScript Date
   * @returns Firebase Timestamp
   */
  static fromDate(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  }

  /**
   * Converts Firebase Timestamp to JavaScript Date, handling null/undefined
   * @param timestamp Firebase Timestamp or null/undefined
   * @returns JavaScript Date or null
   */
  static toDateOrNull(timestamp: Timestamp | null | undefined): Date | null {
    if (!timestamp) return null;
    return timestamp.toDate();
  }

  /**
   * Converts JavaScript Date to Firebase Timestamp, handling null/undefined
   * @param date JavaScript Date or null/undefined
   * @returns Firebase Timestamp or null
   */
  static fromDateOrNull(date: Date | null | undefined): Timestamp | null {
    if (!date) return null;
    return Timestamp.fromDate(date);
  }

  /**
   * Converts Firebase Timestamp to JavaScript Date, with default fallback
   * @param timestamp Firebase Timestamp or null/undefined
   * @param defaultDate Default date to use if timestamp is null/undefined
   * @returns JavaScript Date
   */
  static toDateWithDefault(timestamp: Timestamp | null | undefined, defaultDate: Date): Date {
    if (!timestamp) return defaultDate;
    return timestamp.toDate();
  }

  /**
   * Converts JavaScript Date to Firebase Timestamp, with default fallback
   * @param date JavaScript Date or null/undefined
   * @param defaultDate Default date to use if date is null/undefined
   * @returns Firebase Timestamp
   */
  static fromDateWithDefault(date: Date | null | undefined, defaultDate: Date): Timestamp {
    if (!date) return Timestamp.fromDate(defaultDate);
    return Timestamp.fromDate(date);
  }

  /**
   * Gets current timestamp as Firebase Timestamp
   * @returns Current Firebase Timestamp
   */
  static now(): Timestamp {
    return Timestamp.now();
  }

  /**
   * Gets current timestamp as JavaScript Date
   * @returns Current JavaScript Date
   */
  static nowAsDate(): Date {
    return new Date();
  }

  /**
   * Creates Firebase Timestamp from seconds and nanoseconds
   * @param seconds Seconds since epoch
   * @param nanoseconds Nanoseconds
   * @returns Firebase Timestamp
   */
  static fromSeconds(seconds: number, nanoseconds: number = 0): Timestamp {
    return new Timestamp(seconds, nanoseconds);
  }

  /**
   * Creates Firebase Timestamp from milliseconds
   * @param milliseconds Milliseconds since epoch
   * @returns Firebase Timestamp
   */
  static fromMillis(milliseconds: number): Timestamp {
    return Timestamp.fromMillis(milliseconds);
  }

  /**
   * Converts Firebase Timestamp to milliseconds
   * @param timestamp Firebase Timestamp
   * @returns Milliseconds since epoch
   */
  static toMillis(timestamp: Timestamp): number {
    return timestamp.toMillis();
  }

  /**
   * Converts Firebase Timestamp to seconds
   * @param timestamp Firebase Timestamp
   * @returns Seconds since epoch
   */
  static toSeconds(timestamp: Timestamp): number {
    return timestamp.seconds;
  }

  /**
   * Compares two Firebase Timestamps
   * @param timestamp1 First timestamp
   * @param timestamp2 Second timestamp
   * @returns -1 if first is before second, 0 if equal, 1 if first is after second
   */
  static compare(timestamp1: Timestamp, timestamp2: Timestamp): number {
    if (timestamp1.seconds < timestamp2.seconds) return -1;
    if (timestamp1.seconds > timestamp2.seconds) return 1;
    if (timestamp1.nanoseconds < timestamp2.nanoseconds) return -1;
    if (timestamp1.nanoseconds > timestamp2.nanoseconds) return 1;
    return 0;
  }

  /**
   * Checks if two Firebase Timestamps are equal
   * @param timestamp1 First timestamp
   * @param timestamp2 Second timestamp
   * @returns True if equal, false otherwise
   */
  static isEqual(timestamp1: Timestamp, timestamp2: Timestamp): boolean {
    return timestamp1.isEqual(timestamp2);
  }

  /**
   * Checks if timestamp is before another timestamp
   * @param timestamp1 First timestamp
   * @param timestamp2 Second timestamp
   * @returns True if first is before second
   */
  static isBefore(timestamp1: Timestamp, timestamp2: Timestamp): boolean {
    return this.compare(timestamp1, timestamp2) < 0;
  }

  /**
   * Checks if timestamp is after another timestamp
   * @param timestamp1 First timestamp
   * @param timestamp2 Second timestamp
   * @returns True if first is after second
   */
  static isAfter(timestamp1: Timestamp, timestamp2: Timestamp): boolean {
    return this.compare(timestamp1, timestamp2) > 0;
  }

  /**
   * Adds milliseconds to Firebase Timestamp
   * @param timestamp Base timestamp
   * @param milliseconds Milliseconds to add
   * @returns New timestamp with added milliseconds
   */
  static addMillis(timestamp: Timestamp, milliseconds: number): Timestamp {
    return Timestamp.fromMillis(timestamp.toMillis() + milliseconds);
  }

  /**
   * Adds seconds to Firebase Timestamp
   * @param timestamp Base timestamp
   * @param seconds Seconds to add
   * @returns New timestamp with added seconds
   */
  static addSeconds(timestamp: Timestamp, seconds: number): Timestamp {
    return new Timestamp(timestamp.seconds + seconds, timestamp.nanoseconds);
  }

  /**
   * Adds minutes to Firebase Timestamp
   * @param timestamp Base timestamp
   * @param minutes Minutes to add
   * @returns New timestamp with added minutes
   */
  static addMinutes(timestamp: Timestamp, minutes: number): Timestamp {
    return this.addSeconds(timestamp, minutes * 60);
  }

  /**
   * Adds hours to Firebase Timestamp
   * @param timestamp Base timestamp
   * @param hours Hours to add
   * @returns New timestamp with added hours
   */
  static addHours(timestamp: Timestamp, hours: number): Timestamp {
    return this.addMinutes(timestamp, hours * 60);
  }

  /**
   * Adds days to Firebase Timestamp
   * @param timestamp Base timestamp
   * @param days Days to add
   * @returns New timestamp with added days
   */
  static addDays(timestamp: Timestamp, days: number): Timestamp {
    return this.addHours(timestamp, days * 24);
  }

  /**
   * Calculates difference between two timestamps in milliseconds
   * @param timestamp1 First timestamp
   * @param timestamp2 Second timestamp
   * @returns Difference in milliseconds (timestamp1 - timestamp2)
   */
  static diffMillis(timestamp1: Timestamp, timestamp2: Timestamp): number {
    return timestamp1.toMillis() - timestamp2.toMillis();
  }

  /**
   * Calculates difference between two timestamps in seconds
   * @param timestamp1 First timestamp
   * @param timestamp2 Second timestamp
   * @returns Difference in seconds (timestamp1 - timestamp2)
   */
  static diffSeconds(timestamp1: Timestamp, timestamp2: Timestamp): number {
    return Math.floor(this.diffMillis(timestamp1, timestamp2) / 1000);
  }

  /**
   * Calculates difference between two timestamps in minutes
   * @param timestamp1 First timestamp
   * @param timestamp2 Second timestamp
   * @returns Difference in minutes (timestamp1 - timestamp2)
   */
  static diffMinutes(timestamp1: Timestamp, timestamp2: Timestamp): number {
    return Math.floor(this.diffSeconds(timestamp1, timestamp2) / 60);
  }

  /**
   * Calculates difference between two timestamps in hours
   * @param timestamp1 First timestamp
   * @param timestamp2 Second timestamp
   * @returns Difference in hours (timestamp1 - timestamp2)
   */
  static diffHours(timestamp1: Timestamp, timestamp2: Timestamp): number {
    return Math.floor(this.diffMinutes(timestamp1, timestamp2) / 60);
  }

  /**
   * Calculates difference between two timestamps in days
   * @param timestamp1 First timestamp
   * @param timestamp2 Second timestamp
   * @returns Difference in days (timestamp1 - timestamp2)
   */
  static diffDays(timestamp1: Timestamp, timestamp2: Timestamp): number {
    return Math.floor(this.diffHours(timestamp1, timestamp2) / 24);
  }

  /**
   * Checks if timestamp is expired (before current time)
   * @param timestamp Timestamp to check
   * @returns True if expired, false otherwise
   */
  static isExpired(timestamp: Timestamp): boolean {
    return this.isBefore(timestamp, this.now());
  }

  /**
   * Checks if timestamp is within the last N milliseconds
   * @param timestamp Timestamp to check
   * @param milliseconds Number of milliseconds to check within
   * @returns True if within the time window, false otherwise
   */
  static isWithinLast(timestamp: Timestamp, milliseconds: number): boolean {
    const now = this.now();
    const diff = this.diffMillis(now, timestamp);
    return diff >= 0 && diff <= milliseconds;
  }

  /**
   * Checks if timestamp is within the last N seconds
   * @param timestamp Timestamp to check
   * @param seconds Number of seconds to check within
   * @returns True if within the time window, false otherwise
   */
  static isWithinLastSeconds(timestamp: Timestamp, seconds: number): boolean {
    return this.isWithinLast(timestamp, seconds * 1000);
  }

  /**
   * Checks if timestamp is within the last N minutes
   * @param timestamp Timestamp to check
   * @param minutes Number of minutes to check within
   * @returns True if within the time window, false otherwise
   */
  static isWithinLastMinutes(timestamp: Timestamp, minutes: number): boolean {
    return this.isWithinLastSeconds(timestamp, minutes * 60);
  }

  /**
   * Checks if timestamp is within the last N hours
   * @param timestamp Timestamp to check
   * @param hours Number of hours to check within
   * @returns True if within the time window, false otherwise
   */
  static isWithinLastHours(timestamp: Timestamp, hours: number): boolean {
    return this.isWithinLastMinutes(timestamp, hours * 60);
  }

  /**
   * Checks if timestamp is within the last N days
   * @param timestamp Timestamp to check
   * @param days Number of days to check within
   * @returns True if within the time window, false otherwise
   */
  static isWithinLastDays(timestamp: Timestamp, days: number): boolean {
    return this.isWithinLastHours(timestamp, days * 24);
  }

  /**
   * Formats timestamp to ISO string
   * @param timestamp Firebase Timestamp
   * @returns ISO string representation
   */
  static toISOString(timestamp: Timestamp): string {
    return timestamp.toDate().toISOString();
  }

  /**
   * Parses ISO string to Firebase Timestamp
   * @param isoString ISO string
   * @returns Firebase Timestamp
   */
  static fromISOString(isoString: string): Timestamp {
    return Timestamp.fromDate(new Date(isoString));
  }

  /**
   * Formats timestamp to locale string
   * @param timestamp Firebase Timestamp
   * @param locale Locale string (optional)
   * @param options Formatting options (optional)
   * @returns Formatted string
   */
  static toLocaleString(timestamp: Timestamp, locale?: string, options?: Intl.DateTimeFormatOptions): string {
    return timestamp.toDate().toLocaleString(locale, options);
  }

  /**
   * Gets start of day for timestamp
   * @param timestamp Firebase Timestamp
   * @returns Timestamp at start of day (00:00:00)
   */
  static startOfDay(timestamp: Timestamp): Timestamp {
    const date = timestamp.toDate();
    date.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(date);
  }

  /**
   * Gets end of day for timestamp
   * @param timestamp Firebase Timestamp
   * @returns Timestamp at end of day (23:59:59.999)
   */
  static endOfDay(timestamp: Timestamp): Timestamp {
    const date = timestamp.toDate();
    date.setHours(23, 59, 59, 999);
    return Timestamp.fromDate(date);
  }

  /**
   * Gets start of week for timestamp
   * @param timestamp Firebase Timestamp
   * @returns Timestamp at start of week (Sunday 00:00:00)
   */
  static startOfWeek(timestamp: Timestamp): Timestamp {
    const date = timestamp.toDate();
    const day = date.getDay();
    const diff = date.getDate() - day;
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(date);
  }

  /**
   * Gets start of month for timestamp
   * @param timestamp Firebase Timestamp
   * @returns Timestamp at start of month (1st day 00:00:00)
   */
  static startOfMonth(timestamp: Timestamp): Timestamp {
    const date = timestamp.toDate();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(date);
  }

  /**
   * Gets start of year for timestamp
   * @param timestamp Firebase Timestamp
   * @returns Timestamp at start of year (Jan 1st 00:00:00)
   */
  static startOfYear(timestamp: Timestamp): Timestamp {
    const date = timestamp.toDate();
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(date);
  }
}