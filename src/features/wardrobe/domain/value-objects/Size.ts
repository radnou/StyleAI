import { Result } from '@core/types/result';

export type SizeSystem = 'US' | 'EU' | 'UK' | 'UNIVERSAL' | 'NUMERIC';
export type SizeCategory = 'clothing' | 'shoes' | 'accessories';

interface SizeMapping {
  system: SizeSystem;
  value: string;
  numericValue?: number;
}

export class Size {
  private static readonly CLOTHING_SIZES: Record<SizeSystem, string[]> = {
    US: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20'],
    EU: ['32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56', '58', '60'],
    UK: ['4', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30'],
    UNIVERSAL: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'ONE SIZE', 'OS'],
    NUMERIC: [], // Dynamic range
  };

  private static readonly SHOE_SIZES: Record<SizeSystem, string[]> = {
    US: ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '14', '15'],
    EU: ['35', '35.5', '36', '36.5', '37', '37.5', '38', '38.5', '39', '39.5', '40', '40.5', '41', '41.5', '42', '42.5', '43', '43.5', '44', '44.5', '45', '46', '47', '48'],
    UK: ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14'],
    UNIVERSAL: [], // Not applicable for shoes
    NUMERIC: [], // Dynamic range
  };

  private static readonly SIZE_CONVERSIONS: Record<string, SizeMapping[]> = {
    // US Women's clothing to other systems
    'US_0': [
      { system: 'US', value: '0' },
      { system: 'EU', value: '32' },
      { system: 'UK', value: '4' },
      { system: 'UNIVERSAL', value: 'XXS' },
    ],
    'US_2': [
      { system: 'US', value: '2' },
      { system: 'EU', value: '34' },
      { system: 'UK', value: '6' },
      { system: 'UNIVERSAL', value: 'XS' },
    ],
    'US_4': [
      { system: 'US', value: '4' },
      { system: 'EU', value: '36' },
      { system: 'UK', value: '8' },
      { system: 'UNIVERSAL', value: 'S' },
    ],
    'US_6': [
      { system: 'US', value: '6' },
      { system: 'EU', value: '38' },
      { system: 'UK', value: '10' },
      { system: 'UNIVERSAL', value: 'S' },
    ],
    'US_8': [
      { system: 'US', value: '8' },
      { system: 'EU', value: '40' },
      { system: 'UK', value: '12' },
      { system: 'UNIVERSAL', value: 'M' },
    ],
    'US_10': [
      { system: 'US', value: '10' },
      { system: 'EU', value: '42' },
      { system: 'UK', value: '14' },
      { system: 'UNIVERSAL', value: 'M' },
    ],
    'US_12': [
      { system: 'US', value: '12' },
      { system: 'EU', value: '44' },
      { system: 'UK', value: '16' },
      { system: 'UNIVERSAL', value: 'L' },
    ],
    'US_14': [
      { system: 'US', value: '14' },
      { system: 'EU', value: '46' },
      { system: 'UK', value: '18' },
      { system: 'UNIVERSAL', value: 'L' },
    ],
    'US_16': [
      { system: 'US', value: '16' },
      { system: 'EU', value: '48' },
      { system: 'UK', value: '20' },
      { system: 'UNIVERSAL', value: 'XL' },
    ],
    // Universal sizes
    'UNIVERSAL_XS': [
      { system: 'UNIVERSAL', value: 'XS' },
      { system: 'US', value: '2' },
      { system: 'EU', value: '34' },
      { system: 'UK', value: '6' },
    ],
    'UNIVERSAL_S': [
      { system: 'UNIVERSAL', value: 'S' },
      { system: 'US', value: '4-6' },
      { system: 'EU', value: '36-38' },
      { system: 'UK', value: '8-10' },
    ],
    'UNIVERSAL_M': [
      { system: 'UNIVERSAL', value: 'M' },
      { system: 'US', value: '8-10' },
      { system: 'EU', value: '40-42' },
      { system: 'UK', value: '12-14' },
    ],
    'UNIVERSAL_L': [
      { system: 'UNIVERSAL', value: 'L' },
      { system: 'US', value: '12-14' },
      { system: 'EU', value: '44-46' },
      { system: 'UK', value: '16-18' },
    ],
    'UNIVERSAL_XL': [
      { system: 'UNIVERSAL', value: 'XL' },
      { system: 'US', value: '16-18' },
      { system: 'EU', value: '48-50' },
      { system: 'UK', value: '20-22' },
    ],
  };

  private constructor(
    private readonly value: string,
    private readonly system: SizeSystem,
    private readonly category: SizeCategory,
    private readonly numericValue?: number
  ) {}

  public static create(
    value: string,
    system: SizeSystem = 'UNIVERSAL',
    category: SizeCategory = 'clothing'
  ): Result<Size, string> {
    if (!value || value.trim() === '') {
      return Result.fail<Size, string>('Size value cannot be empty');
    }

    const normalizedValue = value.trim().toUpperCase();

    // Handle numeric system differently
    if (system === 'NUMERIC') {
      const numericValue = this.parseNumericSize(normalizedValue);
      if (numericValue === null) {
        return Result.fail<Size, string>('Invalid numeric size format');
      }
      return Result.ok<Size>(new Size(normalizedValue, system, category, numericValue));
    }

    // Validate against predefined sizes
    const validSizes = category === 'shoes' ? this.SHOE_SIZES[system] : this.CLOTHING_SIZES[system];
    
    if (!validSizes || validSizes.length === 0) {
      return Result.fail<Size, string>(`Size system ${system} not supported for ${category}`);
    }

    if (!validSizes.includes(normalizedValue)) {
      // Check if it's a range (e.g., "4-6")
      if (normalizedValue.includes('-') && system === 'UNIVERSAL') {
        return Result.ok<Size>(new Size(normalizedValue, system, category));
      }
      return Result.fail<Size, string>(`Invalid size '${value}' for ${system} ${category} sizing`);
    }

    return Result.ok<Size>(new Size(normalizedValue, system, category));
  }

  public getValue(): string {
    return this.value;
  }

  public getSystem(): SizeSystem {
    return this.system;
  }

  public getCategory(): SizeCategory {
    return this.category;
  }

  public getNumericValue(): number | undefined {
    if (this.numericValue !== undefined) {
      return this.numericValue;
    }

    // Try to extract numeric value from string
    const parsed = Size.parseNumericSize(this.value);
    return parsed || undefined;
  }

  public convertTo(targetSystem: SizeSystem): Result<Size, string> {
    if (this.system === targetSystem) {
      return Result.ok<Size>(this);
    }

    // Look for conversion mapping
    const mappingKey = `${this.system}_${this.value}`;
    const conversions = Size.SIZE_CONVERSIONS[mappingKey];

    if (!conversions) {
      return Result.fail<Size, string>(`No conversion available from ${this.system} ${this.value} to ${targetSystem}`);
    }

    const targetMapping = conversions.find(m => m.system === targetSystem);
    if (!targetMapping) {
      return Result.fail<Size, string>(`No conversion available from ${this.system} ${this.value} to ${targetSystem}`);
    }

    return Size.create(targetMapping.value, targetSystem, this.category);
  }

  public isSmaller(other: Size): boolean {
    if (this.category !== other.category) {
      throw new Error('Cannot compare sizes from different categories');
    }

    if (this.system === other.system) {
      return this.compareWithinSystem(other) < 0;
    }

    // Try to convert to common system
    const otherConverted = other.convertTo(this.system);
    if (otherConverted.succeeded) {
      return this.compareWithinSystem(otherConverted.value) < 0;
    }

    // Fall back to numeric comparison if possible
    const thisNumeric = this.getNumericValue();
    const otherNumeric = other.getNumericValue();
    
    if (thisNumeric !== undefined && otherNumeric !== undefined) {
      return thisNumeric < otherNumeric;
    }

    throw new Error('Cannot compare sizes from different systems without conversion');
  }

  public isLarger(other: Size): boolean {
    if (this.category !== other.category) {
      throw new Error('Cannot compare sizes from different categories');
    }

    return !this.isSmaller(other) && !this.equals(other);
  }

  public equals(other: Size): boolean {
    return this.value === other.value && 
           this.system === other.system && 
           this.category === other.category;
  }

  public isOneSize(): boolean {
    return this.value === 'ONE SIZE' || this.value === 'OS';
  }

  public toString(): string {
    return `${this.value} (${this.system})`;
  }

  private compareWithinSystem(other: Size): number {
    const sizes = this.category === 'shoes' ? Size.SHOE_SIZES[this.system] : Size.CLOTHING_SIZES[this.system];
    const thisIndex = sizes.indexOf(this.value);
    const otherIndex = sizes.indexOf(other.value);

    if (thisIndex === -1 || otherIndex === -1) {
      // Fall back to numeric comparison
      const thisNumeric = this.getNumericValue();
      const otherNumeric = other.getNumericValue();
      
      if (thisNumeric !== undefined && otherNumeric !== undefined) {
        return thisNumeric - otherNumeric;
      }
      
      throw new Error('Cannot compare sizes');
    }

    return thisIndex - otherIndex;
  }

  private static parseNumericSize(value: string): number | null {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      return num;
    }
    return null;
  }

  public static getAvailableSizes(category: SizeCategory, system: SizeSystem): string[] {
    if (system === 'NUMERIC') {
      // Return common numeric sizes
      if (category === 'shoes') {
        return Array.from({ length: 30 }, (_, i) => (35 + i * 0.5).toString());
      }
      return Array.from({ length: 20 }, (_, i) => (i * 2 + 28).toString());
    }

    const sizes = category === 'shoes' ? this.SHOE_SIZES[system] : this.CLOTHING_SIZES[system];
    return [...sizes];
  }

  public static getSizeSystems(): SizeSystem[] {
    return ['US', 'EU', 'UK', 'UNIVERSAL', 'NUMERIC'];
  }

  public getSizeRange(): { min: string; max: string } | null {
    if (!this.value.includes('-')) {
      return null;
    }

    const parts = this.value.split('-');
    if (parts.length !== 2) {
      return null;
    }

    return {
      min: parts[0].trim(),
      max: parts[1].trim(),
    };
  }
}