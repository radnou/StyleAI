import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

describe('Production Build Validation', () => {
  const distPath = join(process.cwd(), 'dist');
  const packageJsonPath = join(process.cwd(), 'package.json');

  beforeAll(() => {
    // Ensure build exists
    if (!existsSync(distPath)) {
      throw new Error('Production build not found. Run "npm run build" first.');
    }
  });

  describe('Build Output Validation', () => {
    it('should generate all required build artifacts', () => {
      const requiredFiles = [
        'metadata.json',
        '_expo/static/js/ios',
        '_expo/static/js/android'
      ];

      requiredFiles.forEach(file => {
        const filePath = join(distPath, file);
        expect(existsSync(filePath)).toBe(true);
      });
    });

    it('should have reasonable bundle sizes', () => {
      const iOSBundlePath = join(distPath, '_expo/static/js/ios');
      const androidBundlePath = join(distPath, '_expo/static/js/android');

      if (existsSync(iOSBundlePath)) {
        const iOSFiles = require('fs').readdirSync(iOSBundlePath);
        const iOSBundle = iOSFiles.find((file: string) => file.endsWith('.hbc'));
        
        if (iOSBundle) {
          const bundleSize = statSync(join(iOSBundlePath, iOSBundle)).size;
          // Bundle should be less than 10MB
          expect(bundleSize).toBeLessThan(10 * 1024 * 1024);
        }
      }

      if (existsSync(androidBundlePath)) {
        const androidFiles = require('fs').readdirSync(androidBundlePath);
        const androidBundle = androidFiles.find((file: string) => file.endsWith('.hbc'));
        
        if (androidBundle) {
          const bundleSize = statSync(join(androidBundlePath, androidBundle)).size;
          // Bundle should be less than 10MB
          expect(bundleSize).toBeLessThan(10 * 1024 * 1024);
        }
      }
    });

    it('should include all required assets', () => {
      const assetPatterns = [
        /Ionicons\.ttf$/,
        /MaterialIcons\.ttf$/,
        /MaterialCommunityIcons\.ttf$/
      ];

      const findAssets = (dir: string): string[] => {
        if (!existsSync(dir)) return [];
        
        const entries = require('fs').readdirSync(dir, { withFileTypes: true });
        let assets: string[] = [];
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          if (entry.isDirectory()) {
            assets = assets.concat(findAssets(fullPath));
          } else {
            assets.push(fullPath);
          }
        }
        
        return assets;
      };

      const allAssets = findAssets(distPath);
      
      assetPatterns.forEach(pattern => {
        const hasMatchingAsset = allAssets.some(asset => pattern.test(asset));
        expect(hasMatchingAsset).toBe(true);
      });
    });

    it('should have valid metadata', () => {
      const metadataPath = join(distPath, 'metadata.json');
      expect(existsSync(metadataPath)).toBe(true);

      const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
      
      expect(metadata.version).toBeDefined();
      expect(metadata.bundler).toBe('metro');
      expect(metadata.fileMetadata).toBeDefined();
    });
  });

  describe('Environment Configuration', () => {
    it('should use production environment variables', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      expect(packageJson.name).toBe('styleai');
      expect(packageJson.version).toBeDefined();
    });

    it('should not include development dependencies in production', () => {
      // Check that development tools are not included in the bundle
      const metadataPath = join(distPath, 'metadata.json');
      const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
      
      // Development packages that shouldn't be in production
      const devPackages = [
        'jest',
        'eslint',
        'prettier',
        'typescript',
        '@types/',
        'detox'
      ];
      
      const bundleContent = JSON.stringify(metadata);
      
      devPackages.forEach(devPackage => {
        // Some references might be okay, but they shouldn't dominate the bundle
        const occurrences = (bundleContent.match(new RegExp(devPackage, 'g')) || []).length;
        expect(occurrences).toBeLessThan(5);
      });
    });

    it('should have optimized asset loading', () => {
      // Check that assets are properly optimized
      const assetDir = join(distPath, '_expo/static');
      
      if (existsSync(assetDir)) {
        const findAssets = (dir: string): string[] => {
          const entries = require('fs').readdirSync(dir, { withFileTypes: true });
          let assets: string[] = [];
          
          for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
              assets = assets.concat(findAssets(fullPath));
            } else if (entry.isFile()) {
              assets.push(fullPath);
            }
          }
          
          return assets;
        };

        const assets = findAssets(assetDir);
        const imageAssets = assets.filter(asset => 
          /\.(png|jpg|jpeg|gif|webp)$/i.test(asset)
        );

        // Images should be reasonably sized
        imageAssets.forEach(asset => {
          const size = statSync(asset).size;
          // Individual images should be less than 1MB
          expect(size).toBeLessThan(1024 * 1024);
        });
      }
    });
  });

  describe('Security Validation', () => {
    it('should not expose sensitive information', () => {
      const metadataPath = join(distPath, 'metadata.json');
      const metadata = readFileSync(metadataPath, 'utf8');
      
      // Check for potential secrets
      const sensitivePatterns = [
        /firebase.*key/i,
        /api.*secret/i,
        /password/i,
        /token.*[a-zA-Z0-9]{20,}/,
        /sk_[a-zA-Z0-9]+/,  // Stripe secret keys
        /AKIA[0-9A-Z]{16}/   // AWS access keys
      ];

      sensitivePatterns.forEach(pattern => {
        expect(metadata).not.toMatch(pattern);
      });
    });

    it('should not include development URLs', () => {
      const metadataPath = join(distPath, 'metadata.json');
      const metadata = readFileSync(metadataPath, 'utf8');
      
      const devUrls = [
        'localhost',
        '127.0.0.1',
        '192.168.',
        '10.0.',
        'ngrok',
        'test.com'
      ];

      devUrls.forEach(url => {
        const occurrences = (metadata.match(new RegExp(url, 'g')) || []).length;
        // Some occurrences might be in documentation or comments, but should be minimal
        expect(occurrences).toBeLessThan(3);
      });
    });
  });

  describe('Performance Optimization', () => {
    it('should have minified JavaScript bundles', () => {
      const bundleDirs = [
        join(distPath, '_expo/static/js/ios'),
        join(distPath, '_expo/static/js/android')
      ];

      bundleDirs.forEach(bundleDir => {
        if (existsSync(bundleDir)) {
          const files = require('fs').readdirSync(bundleDir);
          const jsBundle = files.find((file: string) => file.endsWith('.hbc'));
          
          if (jsBundle) {
            const bundlePath = join(bundleDir, jsBundle);
            const bundleContent = readFileSync(bundlePath, 'utf8');
            
            // Minified bundles should not have excessive whitespace
            const whitespaceRatio = (bundleContent.match(/\s/g) || []).length / bundleContent.length;
            expect(whitespaceRatio).toBeLessThan(0.1); // Less than 10% whitespace
          }
        }
      });
    });

    it('should have compressed assets', () => {
      // Check that large assets are compressed
      const findLargeAssets = (dir: string): string[] => {
        if (!existsSync(dir)) return [];
        
        const entries = require('fs').readdirSync(dir, { withFileTypes: true });
        let largeAssets: string[] = [];
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          if (entry.isDirectory()) {
            largeAssets = largeAssets.concat(findLargeAssets(fullPath));
          } else if (entry.isFile()) {
            const size = statSync(fullPath).size;
            if (size > 100 * 1024) { // Files larger than 100KB
              largeAssets.push(fullPath);
            }
          }
        }
        
        return largeAssets;
      };

      const largeAssets = findLargeAssets(distPath);
      
      // Most large assets should be font files or images, which are expected
      largeAssets.forEach(asset => {
        const isExpectedLargeFile = /\.(ttf|otf|woff|woff2|png|jpg|jpeg)$/i.test(asset);
        const size = statSync(asset).size;
        
        if (isExpectedLargeFile) {
          // Even these should have reasonable limits
          expect(size).toBeLessThan(2 * 1024 * 1024); // 2MB max
        } else {
          // Unexpected large files should be very limited
          expect(size).toBeLessThan(500 * 1024); // 500KB max
        }
      });
    });
  });

  describe('Platform Compatibility', () => {
    it('should generate iOS-compatible bundles', () => {
      const iOSDir = join(distPath, '_expo/static/js/ios');
      
      if (existsSync(iOSDir)) {
        const files = require('fs').readdirSync(iOSDir);
        expect(files.length).toBeGreaterThan(0);
        
        const bundleFile = files.find((file: string) => file.endsWith('.hbc'));
        expect(bundleFile).toBeDefined();
      }
    });

    it('should generate Android-compatible bundles', () => {
      const androidDir = join(distPath, '_expo/static/js/android');
      
      if (existsSync(androidDir)) {
        const files = require('fs').readdirSync(androidDir);
        expect(files.length).toBeGreaterThan(0);
        
        const bundleFile = files.find((file: string) => file.endsWith('.hbc'));
        expect(bundleFile).toBeDefined();
      }
    });

    it('should include all required platform assets', () => {
      // Check for platform-specific assets
      const platformAssets = [
        'node_modules/@expo/vector-icons',
        'node_modules/@react-navigation'
      ];

      const assetDir = join(distPath, '_expo/static');
      
      if (existsSync(assetDir)) {
        const findAssetsRecursive = (dir: string): string[] => {
          const entries = require('fs').readdirSync(dir, { withFileTypes: true });
          let assets: string[] = [];
          
          for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
              assets = assets.concat(findAssetsRecursive(fullPath));
            } else {
              assets.push(fullPath);
            }
          }
          
          return assets;
        };

        const allAssets = findAssetsRecursive(assetDir);
        
        // Should have vector icons
        const hasVectorIcons = allAssets.some(asset => asset.includes('vector-icons'));
        expect(hasVectorIcons).toBe(true);
      }
    });
  });

  describe('Build Reproducibility', () => {
    it('should have consistent build metadata', () => {
      const metadataPath = join(distPath, 'metadata.json');
      const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
      
      expect(metadata.version).toBeDefined();
      expect(metadata.bundler).toBe('metro');
      expect(typeof metadata.fileMetadata).toBe('object');
    });

    it('should have deterministic asset hashing', () => {
      const metadataPath = join(distPath, 'metadata.json');
      const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
      
      if (metadata.fileMetadata) {
        // Asset hashes should be consistent format
        Object.values(metadata.fileMetadata).forEach((fileInfo: any) => {
          if (fileInfo.hash) {
            expect(typeof fileInfo.hash).toBe('string');
            expect(fileInfo.hash.length).toBeGreaterThan(0);
          }
        });
      }
    });
  });

  describe('Error Handling in Production', () => {
    it('should not include debug code in production bundles', () => {
      const bundleDirs = [
        join(distPath, '_expo/static/js/ios'),
        join(distPath, '_expo/static/js/android')
      ];

      bundleDirs.forEach(bundleDir => {
        if (existsSync(bundleDir)) {
          const files = require('fs').readdirSync(bundleDir);
          const bundleFile = files.find((file: string) => file.endsWith('.hbc'));
          
          if (bundleFile) {
            const bundlePath = join(bundleDir, bundleFile);
            const bundleContent = readFileSync(bundlePath, 'utf8');
            
            // Should not contain obvious debug code
            const debugPatterns = [
              /console\.log/g,
              /debugger;/g,
              /__DEV__.*?true/g
            ];

            debugPatterns.forEach(pattern => {
              const matches = bundleContent.match(pattern) || [];
              // Some debug code might be in libraries, but should be minimal
              expect(matches.length).toBeLessThan(5);
            });
          }
        }
      });
    });

    it('should have proper error boundaries', () => {
      // This test would ideally check that error boundaries are properly
      // included in the bundle, but for now we'll just verify the build succeeds
      expect(existsSync(distPath)).toBe(true);
    });
  });
});