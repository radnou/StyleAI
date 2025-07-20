import { Color } from '../../../domain/value-objects/Color';

describe('Color Value Object', () => {
  describe('create', () => {
    describe('named colors', () => {
      it('should create color from basic named color', () => {
        const result = Color.create('red');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('red');
        expect(result.value.getHex()).toBe('#ff0000');
        expect(result.value.getRgb()).toEqual({ r: 255, g: 0, b: 0 });
      });

      it('should handle case insensitive named colors', () => {
        const result = Color.create('BLUE');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('blue');
        expect(result.value.getHex()).toBe('#0000ff');
      });

      it('should handle named colors with spaces', () => {
        const result = Color.create('  navy  ');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('navy');
        expect(result.value.getHex()).toBe('#000080');
      });

      it('should support all predefined named colors', () => {
        const namedColors = [
          'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
          'gray', 'orange', 'purple', 'brown', 'pink', 'navy', 'olive',
          'teal', 'silver', 'gold', 'beige', 'tan', 'khaki', 'turquoise',
          'lavender', 'coral', 'salmon', 'peach', 'mint', 'ivory', 'pearl',
        ];

        namedColors.forEach(color => {
          const result = Color.create(color);
          expect(result.succeeded).toBe(true);
        });
      });

      it('should handle grey/gray spelling variants', () => {
        const grey = Color.create('grey');
        const gray = Color.create('gray');
        
        expect(grey.succeeded).toBe(true);
        expect(gray.succeeded).toBe(true);
        expect(grey.value.getHex()).toBe(gray.value.getHex());
      });
    });

    describe('hex colors', () => {
      it('should create color from 6-digit hex', () => {
        const result = Color.create('#ff6b6b');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('#ff6b6b');
        expect(result.value.getHex()).toBe('#ff6b6b');
        expect(result.value.getRgb()).toEqual({ r: 255, g: 107, b: 107 });
      });

      it('should create color from 3-digit hex', () => {
        const result = Color.create('#f00');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('#f00');
        expect(result.value.getHex()).toBe('#ff0000');
        expect(result.value.getRgb()).toEqual({ r: 255, g: 0, b: 0 });
      });

      it('should handle hex without # prefix', () => {
        const result = Color.create('ff6b6b');
        
        expect(result.succeeded).toBe(false);
        expect(result.message).toContain('Invalid color format');
      });

      it('should handle uppercase hex', () => {
        const result = Color.create('#FF6B6B');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('#ff6b6b');
      });

      it('should reject invalid hex values', () => {
        const invalidHexes = ['#gg6b6b', '#ff6b6', '#ff6b6bb', '#'];
        
        invalidHexes.forEach(hex => {
          const result = Color.create(hex);
          expect(result.succeeded).toBe(false);
        });
      });
    });

    describe('rgb colors', () => {
      it('should create color from rgb format', () => {
        const result = Color.create('rgb(255, 107, 107)');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('rgb(255, 107, 107)');
        expect(result.value.getHex()).toBe('#ff6b6b');
        expect(result.value.getRgb()).toEqual({ r: 255, g: 107, b: 107 });
      });

      it('should handle rgb with no spaces', () => {
        const result = Color.create('rgb(255,107,107)');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getRgb()).toEqual({ r: 255, g: 107, b: 107 });
      });

      it('should handle rgb with extra spaces', () => {
        const result = Color.create('rgb( 255 , 107 , 107 )');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getRgb()).toEqual({ r: 255, g: 107, b: 107 });
      });

      it('should reject rgb values out of range', () => {
        const invalidRgbs = [
          'rgb(256, 107, 107)',
          'rgb(255, -1, 107)',
          'rgb(255, 107, 300)',
        ];
        
        invalidRgbs.forEach(rgb => {
          const result = Color.create(rgb);
          expect(result.succeeded).toBe(false);
          expect(result.message).toContain('RGB values must be between 0 and 255');
        });
      });

      it('should handle edge case rgb values', () => {
        const result = Color.create('rgb(0, 0, 0)');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getHex()).toBe('#000000');
      });
    });

    describe('rgba colors', () => {
      it('should create color from rgba format', () => {
        const result = Color.create('rgba(255, 107, 107, 0.5)');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('rgba(255, 107, 107, 0.5)');
        expect(result.value.getHex()).toBe('#ff6b6b');
        expect(result.value.getRgb()).toEqual({ r: 255, g: 107, b: 107 });
      });

      it('should handle alpha value 0', () => {
        const result = Color.create('rgba(255, 107, 107, 0)');
        
        expect(result.succeeded).toBe(true);
      });

      it('should handle alpha value 1', () => {
        const result = Color.create('rgba(255, 107, 107, 1)');
        
        expect(result.succeeded).toBe(true);
      });

      it('should handle decimal alpha values', () => {
        const result = Color.create('rgba(255, 107, 107, 0.75)');
        
        expect(result.succeeded).toBe(true);
      });

      it('should reject invalid alpha values', () => {
        const invalidRgbas = [
          'rgba(255, 107, 107, 1.5)',
          'rgba(255, 107, 107, -0.5)',
          'rgba(255, 107, 107, 2)',
        ];
        
        invalidRgbas.forEach(rgba => {
          const result = Color.create(rgba);
          expect(result.succeeded).toBe(false);
          expect(result.message).toContain('Alpha value must be between 0 and 1');
        });
      });
    });

    describe('validation', () => {
      it('should fail for empty color', () => {
        const result = Color.create('');
        
        expect(result.succeeded).toBe(false);
        expect(result.message).toBe('Color cannot be empty');
      });

      it('should fail for whitespace-only color', () => {
        const result = Color.create('   ');
        
        expect(result.succeeded).toBe(false);
        expect(result.message).toBe('Color cannot be empty');
      });

      it('should fail for null color', () => {
        const result = Color.create(null as any);
        
        expect(result.succeeded).toBe(false);
        expect(result.message).toBe('Color cannot be empty');
      });

      it('should fail for undefined color', () => {
        const result = Color.create(undefined as any);
        
        expect(result.succeeded).toBe(false);
        expect(result.message).toBe('Color cannot be empty');
      });

      it('should fail for invalid color format', () => {
        const result = Color.create('not-a-color');
        
        expect(result.succeeded).toBe(false);
        expect(result.message).toBe('Invalid color format');
      });
    });
  });

  describe('conversions', () => {
    it('should convert named color to hex', () => {
      const result = Color.create('red');
      expect(result.succeeded).toBe(true);
      
      expect(result.value.toHex()).toBe('#ff0000');
    });

    it('should convert hex to rgb', () => {
      const result = Color.create('#ff6b6b');
      expect(result.succeeded).toBe(true);
      
      expect(result.value.toRgb()).toBe('rgb(255, 107, 107)');
    });

    it('should convert rgb to hex', () => {
      const result = Color.create('rgb(255, 107, 107)');
      expect(result.succeeded).toBe(true);
      
      expect(result.value.toHex()).toBe('#ff6b6b');
    });

    it('should convert to rgba with default alpha', () => {
      const result = Color.create('#ff6b6b');
      expect(result.succeeded).toBe(true);
      
      expect(result.value.toRgba()).toBe('rgba(255, 107, 107, 1)');
    });

    it('should convert to rgba with custom alpha', () => {
      const result = Color.create('#ff6b6b');
      expect(result.succeeded).toBe(true);
      
      expect(result.value.toRgba(0.5)).toBe('rgba(255, 107, 107, 0.5)');
    });
  });

  describe('color properties', () => {
    describe('isNeutral', () => {
      it('should identify neutral named colors', () => {
        const neutralColors = ['black', 'white', 'gray', 'navy', 'beige', 'brown'];
        
        neutralColors.forEach(color => {
          const result = Color.create(color);
          expect(result.succeeded).toBe(true);
          expect(result.value.isNeutral()).toBe(true);
        });
      });

      it('should identify non-neutral colors', () => {
        const nonNeutralColors = ['red', 'blue', 'green', 'yellow', 'orange'];
        
        nonNeutralColors.forEach(color => {
          const result = Color.create(color);
          expect(result.succeeded).toBe(true);
          expect(result.value.isNeutral()).toBe(false);
        });
      });

      it('should identify grayscale rgb as neutral', () => {
        const result = Color.create('rgb(128, 128, 128)');
        expect(result.succeeded).toBe(true);
        expect(result.value.isNeutral()).toBe(true);
      });

      it('should identify near-grayscale as neutral', () => {
        const result = Color.create('rgb(120, 125, 130)');
        expect(result.succeeded).toBe(true);
        expect(result.value.isNeutral()).toBe(true);
      });

      it('should not identify colorful rgb as neutral', () => {
        const result = Color.create('rgb(255, 0, 0)');
        expect(result.succeeded).toBe(true);
        expect(result.value.isNeutral()).toBe(false);
      });
    });

    describe('isDark/isLight', () => {
      it('should identify dark colors', () => {
        const darkColors = ['black', 'navy', 'brown', '#333333'];
        
        darkColors.forEach(color => {
          const result = Color.create(color);
          expect(result.succeeded).toBe(true);
          expect(result.value.isDark()).toBe(true);
          expect(result.value.isLight()).toBe(false);
        });
      });

      it('should identify light colors', () => {
        const lightColors = ['white', 'yellow', 'pink', '#eeeeee'];
        
        lightColors.forEach(color => {
          const result = Color.create(color);
          expect(result.succeeded).toBe(true);
          expect(result.value.isLight()).toBe(true);
          expect(result.value.isDark()).toBe(false);
        });
      });

      it('should handle edge case luminance', () => {
        const gray = Color.create('gray');
        expect(gray.succeeded).toBe(true);
        
        // Gray should be considered dark (luminance < 0.5)
        expect(gray.value.isDark()).toBe(true);
      });
    });

    describe('getContrast', () => {
      it('should calculate maximum contrast', () => {
        const black = Color.create('black');
        const white = Color.create('white');
        
        expect(black.succeeded).toBe(true);
        expect(white.succeeded).toBe(true);
        
        const contrast = black.value.getContrast(white.value);
        expect(contrast).toBeCloseTo(21, 0); // Maximum contrast ratio
      });

      it('should calculate minimum contrast', () => {
        const color1 = Color.create('#ff0000');
        const color2 = Color.create('#ff0000');
        
        expect(color1.succeeded).toBe(true);
        expect(color2.succeeded).toBe(true);
        
        const contrast = color1.value.getContrast(color2.value);
        expect(contrast).toBe(1); // Same color = no contrast
      });

      it('should calculate contrast symmetrically', () => {
        const color1 = Color.create('navy');
        const color2 = Color.create('white');
        
        expect(color1.succeeded).toBe(true);
        expect(color2.succeeded).toBe(true);
        
        const contrast1 = color1.value.getContrast(color2.value);
        const contrast2 = color2.value.getContrast(color1.value);
        
        expect(contrast1).toBe(contrast2);
      });
    });
  });

  describe('equals', () => {
    it('should return true for same hex values', () => {
      const color1 = Color.create('#ff6b6b');
      const color2 = Color.create('#ff6b6b');
      
      expect(color1.succeeded).toBe(true);
      expect(color2.succeeded).toBe(true);
      expect(color1.value.equals(color2.value)).toBe(true);
    });

    it('should return true for equivalent colors in different formats', () => {
      const hex = Color.create('#ff0000');
      const rgb = Color.create('rgb(255, 0, 0)');
      const named = Color.create('red');
      
      expect(hex.succeeded).toBe(true);
      expect(rgb.succeeded).toBe(true);
      expect(named.succeeded).toBe(true);
      
      expect(hex.value.equals(rgb.value)).toBe(true);
      expect(rgb.value.equals(named.value)).toBe(true);
      expect(hex.value.equals(named.value)).toBe(true);
    });

    it('should return false for different colors', () => {
      const color1 = Color.create('red');
      const color2 = Color.create('blue');
      
      expect(color1.succeeded).toBe(true);
      expect(color2.succeeded).toBe(true);
      expect(color1.value.equals(color2.value)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle pure black', () => {
      const black = Color.create('rgb(0, 0, 0)');
      expect(black.succeeded).toBe(true);
      expect(black.value.getHex()).toBe('#000000');
      expect(black.value.isDark()).toBe(true);
      expect(black.value.isNeutral()).toBe(true);
    });

    it('should handle pure white', () => {
      const white = Color.create('rgb(255, 255, 255)');
      expect(white.succeeded).toBe(true);
      expect(white.value.getHex()).toBe('#ffffff');
      expect(white.value.isLight()).toBe(true);
      expect(white.value.isNeutral()).toBe(true);
    });

    it('should maintain immutability of RGB values', () => {
      const result = Color.create('red');
      expect(result.succeeded).toBe(true);
      
      const rgb1 = result.value.getRgb();
      rgb1.r = 0;
      
      const rgb2 = result.value.getRgb();
      expect(rgb2.r).toBe(255); // Should not be modified
    });
  });
});