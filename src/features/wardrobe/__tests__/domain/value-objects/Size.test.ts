import { Size, SizeSystem, SizeCategory } from '../../../domain/value-objects/Size';

describe('Size Value Object', () => {
  describe('create', () => {
    describe('clothing sizes', () => {
      it('should create universal clothing size', () => {
        const result = Size.create('M', 'UNIVERSAL', 'clothing');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('M');
        expect(result.value.getSystem()).toBe('UNIVERSAL');
        expect(result.value.getCategory()).toBe('clothing');
      });

      it('should handle case insensitive input', () => {
        const result = Size.create('xl', 'UNIVERSAL', 'clothing');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('XL');
      });

      it('should handle spaces in input', () => {
        const result = Size.create('  L  ', 'UNIVERSAL', 'clothing');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('L');
      });

      it('should create US numeric clothing size', () => {
        const result = Size.create('8', 'US', 'clothing');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('8');
      });

      it('should create EU clothing size', () => {
        const result = Size.create('40', 'EU', 'clothing');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('40');
      });

      it('should create UK clothing size', () => {
        const result = Size.create('12', 'UK', 'clothing');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('12');
      });

      it('should handle one size', () => {
        const result1 = Size.create('ONE SIZE', 'UNIVERSAL', 'clothing');
        const result2 = Size.create('OS', 'UNIVERSAL', 'clothing');
        
        expect(result1.succeeded).toBe(true);
        expect(result2.succeeded).toBe(true);
        expect(result1.value.isOneSize()).toBe(true);
        expect(result2.value.isOneSize()).toBe(false);
      });

      it('should handle size ranges', () => {
        const result = Size.create('4-6', 'UNIVERSAL', 'clothing');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('4-6');
        
        const range = result.value.getSizeRange();
        expect(range).toEqual({ min: '4', max: '6' });
      });
    });

    describe('shoe sizes', () => {
      it('should create US shoe size', () => {
        const result = Size.create('8.5', 'US', 'shoes');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('8.5');
        expect(result.value.getCategory()).toBe('shoes');
      });

      it('should create EU shoe size', () => {
        const result = Size.create('42', 'EU', 'shoes');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('42');
      });

      it('should create UK shoe size', () => {
        const result = Size.create('7.5', 'UK', 'shoes');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('7.5');
      });

      it('should handle half sizes', () => {
        const sizes = ['6.5', '7.5', '8.5', '9.5'];
        
        sizes.forEach(size => {
          const result = Size.create(size, 'US', 'shoes');
          expect(result.succeeded).toBe(true);
        });
      });
    });

    describe('numeric sizes', () => {
      it('should create numeric size', () => {
        const result = Size.create('32', 'NUMERIC', 'clothing');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('32');
        expect(result.value.getNumericValue()).toBe(32);
      });

      it('should handle decimal numeric sizes', () => {
        const result = Size.create('38.5', 'NUMERIC', 'shoes');
        
        expect(result.succeeded).toBe(true);
        expect(result.value.getValue()).toBe('38.5');
        expect(result.value.getNumericValue()).toBe(38.5);
      });

      it('should reject invalid numeric format', () => {
        const result = Size.create('abc', 'NUMERIC', 'clothing');
        
        expect(result.succeeded).toBe(false);
        expect(result.message).toBe('Invalid numeric size format');
      });

      it('should reject negative numeric sizes', () => {
        const result = Size.create('-5', 'NUMERIC', 'clothing');
        
        expect(result.succeeded).toBe(false);
        expect(result.message).toBe('Invalid numeric size format');
      });
    });

    describe('validation', () => {
      it('should fail for empty size', () => {
        const result = Size.create('', 'UNIVERSAL', 'clothing');
        
        expect(result.succeeded).toBe(false);
        expect(result.message).toBe('Size value cannot be empty');
      });

      it('should fail for whitespace-only size', () => {
        const result = Size.create('   ', 'UNIVERSAL', 'clothing');
        
        expect(result.succeeded).toBe(false);
        expect(result.message).toBe('Size value cannot be empty');
      });

      it('should fail for null size', () => {
        const result = Size.create(null as any, 'UNIVERSAL', 'clothing');
        
        expect(result.succeeded).toBe(false);
        expect(result.message).toBe('Size value cannot be empty');
      });

      it('should fail for invalid size in system', () => {
        const result = Size.create('XXXXL', 'UNIVERSAL', 'clothing');
        
        expect(result.succeeded).toBe(false);
        expect(result.message).toContain('Invalid size');
      });

      it('should fail for shoe size in universal system', () => {
        const result = Size.create('42', 'UNIVERSAL', 'shoes');
        
        expect(result.succeeded).toBe(false);
        expect(result.message).toContain('not supported');
      });
    });
  });

  describe('conversions', () => {
    it('should convert US to EU clothing size', () => {
      const usSize = Size.create('8', 'US', 'clothing');
      expect(usSize.succeeded).toBe(true);
      
      const euSize = usSize.value.convertTo('EU');
      expect(euSize.succeeded).toBe(true);
      expect(euSize.value.getValue()).toBe('40');
    });

    it('should convert universal to US size', () => {
      const universalSize = Size.create('M', 'UNIVERSAL', 'clothing');
      expect(universalSize.succeeded).toBe(true);
      
      const usSize = universalSize.value.convertTo('US');
      expect(usSize.succeeded).toBe(true);
      expect(usSize.value.getValue()).toBe('8-10');
    });

    it('should return same size when converting to same system', () => {
      const size = Size.create('L', 'UNIVERSAL', 'clothing');
      expect(size.succeeded).toBe(true);
      
      const converted = size.value.convertTo('UNIVERSAL');
      expect(converted.succeeded).toBe(true);
      expect(converted.value.equals(size.value)).toBe(true);
    });

    it('should fail conversion when no mapping exists', () => {
      const size = Size.create('XXL', 'UNIVERSAL', 'clothing');
      expect(size.succeeded).toBe(true);
      
      const converted = size.value.convertTo('EU');
      expect(converted.succeeded).toBe(false);
      expect(converted.message).toContain('No conversion available');
    });
  });

  describe('comparisons', () => {
    it('should compare sizes within same system', () => {
      const small = Size.create('S', 'UNIVERSAL', 'clothing');
      const medium = Size.create('M', 'UNIVERSAL', 'clothing');
      const large = Size.create('L', 'UNIVERSAL', 'clothing');
      
      expect(small.succeeded).toBe(true);
      expect(medium.succeeded).toBe(true);
      expect(large.succeeded).toBe(true);
      
      expect(small.value.isSmaller(medium.value)).toBe(true);
      expect(medium.value.isSmaller(large.value)).toBe(true);
      expect(large.value.isLarger(medium.value)).toBe(true);
      expect(medium.value.isLarger(small.value)).toBe(true);
    });

    it('should compare numeric sizes', () => {
      const size36 = Size.create('36', 'EU', 'clothing');
      const size40 = Size.create('40', 'EU', 'clothing');
      
      expect(size36.succeeded).toBe(true);
      expect(size40.succeeded).toBe(true);
      
      expect(size36.value.isSmaller(size40.value)).toBe(true);
      expect(size40.value.isLarger(size36.value)).toBe(true);
    });

    it('should compare shoe sizes with half sizes', () => {
      const size8 = Size.create('8', 'US', 'shoes');
      const size85 = Size.create('8.5', 'US', 'shoes');
      const size9 = Size.create('9', 'US', 'shoes');
      
      expect(size8.succeeded).toBe(true);
      expect(size85.succeeded).toBe(true);
      expect(size9.succeeded).toBe(true);
      
      expect(size8.value.isSmaller(size85.value)).toBe(true);
      expect(size85.value.isSmaller(size9.value)).toBe(true);
    });

    it('should throw error when comparing different categories', () => {
      const clothingSize = Size.create('M', 'UNIVERSAL', 'clothing');
      const shoeSize = Size.create('8', 'US', 'shoes');
      
      expect(clothingSize.succeeded).toBe(true);
      expect(shoeSize.succeeded).toBe(true);
      
      expect(() => clothingSize.value.isSmaller(shoeSize.value))
        .toThrow('Cannot compare sizes from different categories');
    });

    it('should compare sizes from different systems via conversion', () => {
      const usSize = Size.create('8', 'US', 'clothing');
      const euSize = Size.create('38', 'EU', 'clothing');
      
      expect(usSize.succeeded).toBe(true);
      expect(euSize.succeeded).toBe(true);
      
      // US 8 = EU 40, so should be larger than EU 38
      expect(usSize.value.isLarger(euSize.value)).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for identical sizes', () => {
      const size1 = Size.create('M', 'UNIVERSAL', 'clothing');
      const size2 = Size.create('M', 'UNIVERSAL', 'clothing');
      
      expect(size1.succeeded).toBe(true);
      expect(size2.succeeded).toBe(true);
      expect(size1.value.equals(size2.value)).toBe(true);
    });

    it('should return false for different values', () => {
      const size1 = Size.create('M', 'UNIVERSAL', 'clothing');
      const size2 = Size.create('L', 'UNIVERSAL', 'clothing');
      
      expect(size1.succeeded).toBe(true);
      expect(size2.succeeded).toBe(true);
      expect(size1.value.equals(size2.value)).toBe(false);
    });

    it('should return false for same value in different systems', () => {
      const size1 = Size.create('8', 'US', 'clothing');
      const size2 = Size.create('8', 'UK', 'clothing');
      
      expect(size1.succeeded).toBe(true);
      expect(size2.succeeded).toBe(true);
      expect(size1.value.equals(size2.value)).toBe(false);
    });

    it('should return false for same value in different categories', () => {
      const size1 = Size.create('8', 'US', 'clothing');
      const size2 = Size.create('8', 'US', 'shoes');
      
      expect(size1.succeeded).toBe(true);
      expect(size2.succeeded).toBe(true);
      expect(size1.value.equals(size2.value)).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should return string representation', () => {
      const size = Size.create('M', 'UNIVERSAL', 'clothing');
      expect(size.succeeded).toBe(true);
      
      expect(size.value.toString()).toBe('M (UNIVERSAL)');
    });

    it('should extract numeric value from string sizes', () => {
      const size = Size.create('40', 'EU', 'clothing');
      expect(size.succeeded).toBe(true);
      
      expect(size.value.getNumericValue()).toBe(40);
    });

    it('should return undefined for non-numeric sizes', () => {
      const size = Size.create('M', 'UNIVERSAL', 'clothing');
      expect(size.succeeded).toBe(true);
      
      expect(size.value.getNumericValue()).toBeUndefined();
    });

    it('should identify one size items', () => {
      const oneSize = Size.create('ONE SIZE', 'UNIVERSAL', 'clothing');
      const regular = Size.create('M', 'UNIVERSAL', 'clothing');
      
      expect(oneSize.succeeded).toBe(true);
      expect(regular.succeeded).toBe(true);
      
      expect(oneSize.value.isOneSize()).toBe(true);
      expect(regular.value.isOneSize()).toBe(false);
    });

    it('should parse size ranges', () => {
      const rangeSize = Size.create('8-10', 'UNIVERSAL', 'clothing');
      const singleSize = Size.create('M', 'UNIVERSAL', 'clothing');
      
      expect(rangeSize.succeeded).toBe(true);
      expect(singleSize.succeeded).toBe(true);
      
      expect(rangeSize.value.getSizeRange()).toEqual({ min: '8', max: '10' });
      expect(singleSize.value.getSizeRange()).toBeNull();
    });
  });

  describe('static methods', () => {
    it('should return available sizes for clothing', () => {
      const usSizes = Size.getAvailableSizes('clothing', 'US');
      const euSizes = Size.getAvailableSizes('clothing', 'EU');
      
      expect(usSizes).toContain('S');
      expect(usSizes).toContain('M');
      expect(usSizes).toContain('8');
      expect(euSizes).toContain('40');
      expect(euSizes).toContain('42');
    });

    it('should return available sizes for shoes', () => {
      const usShoeSizes = Size.getAvailableSizes('shoes', 'US');
      const euShoeSizes = Size.getAvailableSizes('shoes', 'EU');
      
      expect(usShoeSizes).toContain('8');
      expect(usShoeSizes).toContain('8.5');
      expect(euShoeSizes).toContain('41');
      expect(euShoeSizes).toContain('41.5');
    });

    it('should return numeric sizes for numeric system', () => {
      const numericClothing = Size.getAvailableSizes('clothing', 'NUMERIC');
      const numericShoes = Size.getAvailableSizes('shoes', 'NUMERIC');
      
      expect(numericClothing.length).toBeGreaterThan(0);
      expect(numericShoes.length).toBeGreaterThan(0);
      expect(numericShoes).toContain('38.5');
    });

    it('should return all size systems', () => {
      const systems = Size.getSizeSystems();
      
      expect(systems).toEqual(['US', 'EU', 'UK', 'UNIVERSAL', 'NUMERIC']);
    });
  });
});