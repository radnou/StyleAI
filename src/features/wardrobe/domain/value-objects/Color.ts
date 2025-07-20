import { Result } from '@core/types/result';

export class Color {
  private static readonly HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  private static readonly RGB_REGEX = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  private static readonly RGBA_REGEX = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/;
  
  private static readonly NAMED_COLORS = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
    'gray', 'grey', 'orange', 'purple', 'brown', 'pink', 'navy', 'olive',
    'teal', 'silver', 'gold', 'beige', 'tan', 'khaki', 'turquoise',
    'lavender', 'coral', 'salmon', 'peach', 'mint', 'ivory', 'pearl',
  ];

  private static readonly NEUTRAL_COLORS = [
    'black', 'white', 'gray', 'grey', 'beige', 'tan', 'brown', 'navy',
    'ivory', 'pearl', 'silver', 'charcoal', 'slate', 'taupe',
  ];

  private constructor(
    private readonly value: string,
    private readonly hex: string,
    private readonly rgb: { r: number; g: number; b: number }
  ) {}

  public static create(color: string): Result<Color, string> {
    if (!color || color.trim() === '') {
      return Result.fail<Color, string>('Color cannot be empty');
    }

    const trimmedColor = color.trim().toLowerCase();

    // Check if it's a named color
    if (this.NAMED_COLORS.includes(trimmedColor)) {
      const hex = this.namedColorToHex(trimmedColor);
      const rgb = this.hexToRgb(hex);
      return Result.ok<Color>(new Color(trimmedColor, hex, rgb));
    }

    // Check if it's hex format
    if (this.HEX_REGEX.test(trimmedColor)) {
      const normalizedHex = this.normalizeHex(trimmedColor);
      const rgb = this.hexToRgb(normalizedHex);
      return Result.ok<Color>(new Color(trimmedColor, normalizedHex, rgb));
    }

    // Check if it's RGB format
    const rgbMatch = trimmedColor.match(this.RGB_REGEX);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);

      if (!this.isValidRgbValue(r) || !this.isValidRgbValue(g) || !this.isValidRgbValue(b)) {
        return Result.fail<Color, string>('RGB values must be between 0 and 255');
      }

      const hex = this.rgbToHex(r, g, b);
      return Result.ok<Color>(new Color(trimmedColor, hex, { r, g, b }));
    }

    // Check if it's RGBA format
    const rgbaMatch = trimmedColor.match(this.RGBA_REGEX);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1], 10);
      const g = parseInt(rgbaMatch[2], 10);
      const b = parseInt(rgbaMatch[3], 10);
      const a = parseFloat(rgbaMatch[4]);

      if (!this.isValidRgbValue(r) || !this.isValidRgbValue(g) || !this.isValidRgbValue(b)) {
        return Result.fail<Color, string>('RGB values must be between 0 and 255');
      }

      if (a < 0 || a > 1) {
        return Result.fail<Color, string>('Alpha value must be between 0 and 1');
      }

      const hex = this.rgbToHex(r, g, b);
      return Result.ok<Color>(new Color(trimmedColor, hex, { r, g, b }));
    }

    return Result.fail<Color, string>('Invalid color format');
  }

  public getValue(): string {
    return this.value;
  }

  public getHex(): string {
    return this.hex;
  }

  public getRgb(): { r: number; g: number; b: number } {
    return { ...this.rgb };
  }

  public toHex(): string {
    return this.hex;
  }

  public toRgb(): string {
    return `rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b})`;
  }

  public toRgba(alpha: number = 1): string {
    return `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${alpha})`;
  }

  public isNeutral(): boolean {
    // Check if the color name is in neutral list
    if (Color.NEUTRAL_COLORS.includes(this.value)) {
      return true;
    }

    // Check if it's a grayscale color (R, G, B values are close)
    const { r, g, b } = this.rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    return diff <= 20; // Tolerance for near-grayscale colors
  }

  public isDark(): boolean {
    // Calculate relative luminance
    const { r, g, b } = this.rgb;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }

  public isLight(): boolean {
    return !this.isDark();
  }

  public getContrast(other: Color): number {
    // Calculate contrast ratio between two colors
    const lum1 = this.getRelativeLuminance();
    const lum2 = other.getRelativeLuminance();
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  public equals(other: Color): boolean {
    return this.hex === other.hex;
  }

  private getRelativeLuminance(): number {
    const { r, g, b } = this.rgb;
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  }

  private static isValidRgbValue(value: number): boolean {
    return value >= 0 && value <= 255;
  }

  private static normalizeHex(hex: string): string {
    if (hex.length === 4) {
      // Convert #RGB to #RRGGBB
      return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    return hex;
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const normalizedHex = hex.replace('#', '');
    const r = parseInt(normalizedHex.substring(0, 2), 16);
    const g = parseInt(normalizedHex.substring(2, 4), 16);
    const b = parseInt(normalizedHex.substring(4, 6), 16);
    return { r, g, b };
  }

  private static rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  private static namedColorToHex(name: string): string {
    // Basic color mappings
    const colorMap: Record<string, string> = {
      black: '#000000',
      white: '#ffffff',
      red: '#ff0000',
      green: '#008000',
      blue: '#0000ff',
      yellow: '#ffff00',
      cyan: '#00ffff',
      magenta: '#ff00ff',
      gray: '#808080',
      grey: '#808080',
      orange: '#ffa500',
      purple: '#800080',
      brown: '#a52a2a',
      pink: '#ffc0cb',
      navy: '#000080',
      olive: '#808000',
      teal: '#008080',
      silver: '#c0c0c0',
      gold: '#ffd700',
      beige: '#f5f5dc',
      tan: '#d2b48c',
      khaki: '#f0e68c',
      turquoise: '#40e0d0',
      lavender: '#e6e6fa',
      coral: '#ff7f50',
      salmon: '#fa8072',
      peach: '#ffdab9',
      mint: '#98ff98',
      ivory: '#fffff0',
      pearl: '#faf0e6',
    };

    return colorMap[name] || '#000000';
  }
}