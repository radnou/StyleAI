const fs = require('fs');
const path = require('path');

// Map of Tamagui icon names to Ionicons names
const iconMap = {
  'Sparkles': 'sparkles',
  'Wand2': 'wand',
  'Heart': 'heart',
  'Star': 'star',
  'Camera': 'camera',
  'ImageIcon': 'image',
  'Upload': 'cloud-upload',
  'Target': 'target',
  'X': 'close',
  'ChevronLeft': 'chevron-back',
  'ChevronRight': 'chevron-forward',
  'HelpCircle': 'help-circle',
  'Check': 'checkmark',
  'Info': 'information-circle',
  'AlertCircle': 'alert-circle',
  'User': 'person',
  'Settings': 'settings',
  'Plus': 'add',
  'Minus': 'remove',
  'ArrowRight': 'arrow-forward',
  'ArrowLeft': 'arrow-back',
  'ArrowUp': 'arrow-up',
  'ArrowDown': 'arrow-down',
  'Home': 'home',
  'Search': 'search',
  'Filter': 'filter',
  'Edit': 'create',
  'Delete': 'trash',
  'Save': 'save',
  'Share': 'share',
  'Eye': 'eye',
  'EyeOff': 'eye-off',
  'Lock': 'lock-closed',
  'Unlock': 'lock-open',
  'Mail': 'mail',
  'Phone': 'call',
  'Calendar': 'calendar',
  'Clock': 'time',
  'Map': 'map',
  'Bell': 'notifications',
  'BellOff': 'notifications-off',
  'Menu': 'menu',
  'MoreVertical': 'ellipsis-vertical',
  'MoreHorizontal': 'ellipsis-horizontal',
  'Refresh': 'refresh',
  'Download': 'download',
  'Copy': 'copy',
  'Cut': 'cut',
  'Paste': 'clipboard',
  'Folder': 'folder',
  'File': 'document',
  'Globe': 'globe',
  'Wifi': 'wifi',
  'Battery': 'battery-full',
  'Volume': 'volume-high',
  'VolumeOff': 'volume-mute',
  'Play': 'play',
  'Pause': 'pause',
  'Stop': 'stop',
  'SkipBack': 'play-skip-back',
  'SkipForward': 'play-skip-forward',
  'Repeat': 'repeat',
  'Shuffle': 'shuffle',
  'Bookmark': 'bookmark',
  'Flag': 'flag',
  'Tag': 'pricetag',
  'Gift': 'gift',
  'Award': 'ribbon',
  'Trophy': 'trophy',
  'Zap': 'flash',
  'Sun': 'sunny',
  'Moon': 'moon',
  'Cloud': 'cloud',
  'Umbrella': 'umbrella',
  'Thermometer': 'thermometer',
  'Compass': 'compass',
  'Navigation': 'navigate',
  'Layers': 'layers',
  'Layout': 'grid',
  'Sidebar': 'reorder-three',
  'Maximize': 'expand',
  'Minimize': 'contract',
  'RotateCcw': 'refresh-circle',
  'RotateCw': 'refresh-circle',
  'Undo': 'arrow-undo',
  'Redo': 'arrow-redo',
  'Bold': 'text',
  'Italic': 'text',
  'Underline': 'text',
  'Code': 'code',
  'Link': 'link',
  'Unlink': 'unlink',
  'AlignLeft': 'text',
  'AlignCenter': 'text',
  'AlignRight': 'text',
  'List': 'list',
  'Grid': 'grid',
  'Package': 'cube',
  'Truck': 'car',
  'CreditCard': 'card',
  'ShoppingCart': 'cart',
  'ShoppingBag': 'bag',
  'Percent': 'percent',
  'DollarSign': 'cash',
  'PoundSterling': 'cash',
  'Euro': 'cash',
  'Yen': 'cash',
  'Bitcoin': 'logo-bitcoin',
  'Wifi': 'wifi',
  'WifiOff': 'wifi-off',
  'Bluetooth': 'bluetooth',
  'Cpu': 'hardware-chip',
  'HardDrive': 'save',
  'Smartphone': 'phone-portrait',
  'Tablet': 'tablet-portrait',
  'Monitor': 'desktop',
  'Laptop': 'laptop',
  'Printer': 'print',
  'Scanner': 'scan',
  'Keyboard': 'keypad',
  'Mouse': 'mouse',
  'Headphones': 'headset',
  'Mic': 'mic',
  'MicOff': 'mic-off',
  'Video': 'videocam',
  'VideoOff': 'videocam-off',
  'Activity': 'pulse',
  'BarChart': 'bar-chart',
  'PieChart': 'pie-chart',
  'TrendingUp': 'trending-up',
  'TrendingDown': 'trending-down'
};

function replaceIconsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains tamagui/lucide-icons import
    if (!content.includes('@tamagui/lucide-icons')) {
      return false;
    }
    
    console.log(`Processing: ${filePath}`);
    
    // Replace import statement
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@tamagui\/lucide-icons['"];?/g;
    const importMatch = content.match(importRegex);
    
    if (importMatch) {
      // Replace with Ionicons import
      content = content.replace(importRegex, "import { Ionicons } from '@expo/vector-icons';");
      
      // Extract icon names from the import
      const iconNames = importMatch[0].match(/\{([^}]+)\}/)[1]
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      // Replace icon usages
      iconNames.forEach(iconName => {
        const ioniconsName = iconMap[iconName] || iconName.toLowerCase();
        
        // Replace JSX usage patterns
        const patterns = [
          // <IconName />
          new RegExp(`<${iconName}\\s*/>`, 'g'),
          // <IconName size={...} />
          new RegExp(`<${iconName}\\s+size=\\{([^}]+)\\}\\s*/>`, 'g'),
          // <IconName color="..." />
          new RegExp(`<${iconName}\\s+color=\\{?["']([^"']+)["']\\}?\\s*/>`, 'g'),
          // <IconName size={...} color="..." />
          new RegExp(`<${iconName}\\s+size=\\{([^}]+)\\}\\s+color=\\{?["']([^"']+)["']\\}?\\s*/>`, 'g'),
          // <IconName color="..." size={...} />
          new RegExp(`<${iconName}\\s+color=\\{?["']([^"']+)["']\\}?\\s+size=\\{([^}]+)\\}\\s*/>`, 'g'),
          // icon={<IconName />}
          new RegExp(`icon=\\{<${iconName}\\s*/>\\}`, 'g'),
          // icon={<IconName size={...} />}
          new RegExp(`icon=\\{<${iconName}\\s+size=\\{([^}]+)\\}\\s*/>\\}`, 'g'),
          // icon={<IconName color="..." />}
          new RegExp(`icon=\\{<${iconName}\\s+color=\\{?["']([^"']+)["']\\}?\\s*/>\\}`, 'g'),
          // icon={<IconName size={...} color="..." />}
          new RegExp(`icon=\\{<${iconName}\\s+size=\\{([^}]+)\\}\\s+color=\\{?["']([^"']+)["']\\}?\\s*/>\\}`, 'g'),
          // icon={<IconName color="..." size={...} />}
          new RegExp(`icon=\\{<${iconName}\\s+color=\\{?["']([^"']+)["']\\}?\\s+size=\\{([^}]+)\\}\\s*/>\\}`, 'g'),
        ];
        
        // Apply replacements
        patterns.forEach((pattern, index) => {
          content = content.replace(pattern, (match, ...args) => {
            const size = args[0] || '20';
            const color = args[1] || args[0];
            
            switch (index) {
              case 0: // <IconName />
                return `<Ionicons name="${ioniconsName}" size={20} />`;
              case 1: // <IconName size={...} />
                return `<Ionicons name="${ioniconsName}" size={${size}} />`;
              case 2: // <IconName color="..." />
                return `<Ionicons name="${ioniconsName}" size={20} color="${color}" />`;
              case 3: // <IconName size={...} color="..." />
                return `<Ionicons name="${ioniconsName}" size={${size}} color="${args[1]}" />`;
              case 4: // <IconName color="..." size={...} />
                return `<Ionicons name="${ioniconsName}" size={${args[1]}} color="${color}" />`;
              case 5: // icon={<IconName />}
                return `icon={<Ionicons name="${ioniconsName}" size={20} />}`;
              case 6: // icon={<IconName size={...} />}
                return `icon={<Ionicons name="${ioniconsName}" size={${size}} />}`;
              case 7: // icon={<IconName color="..." />}
                return `icon={<Ionicons name="${ioniconsName}" size={20} color="${color}" />}`;
              case 8: // icon={<IconName size={...} color="..." />}
                return `icon={<Ionicons name="${ioniconsName}" size={${size}} color="${args[1]}" />}`;
              case 9: // icon={<IconName color="..." size={...} />}
                return `icon={<Ionicons name="${ioniconsName}" size={${args[1]}} color="${color}" />}`;
              default:
                return match;
            }
          });
        });
      });
      
      // Write the modified content back
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Get list of files to process
const filesToProcess = [
  '/Users/radnoumanemossabely/Projects/StyleAI/src/shared/components/onboarding/Tooltip.tsx',
  '/Users/radnoumanemossabely/Projects/StyleAI/src/screens/onboarding/CompletionScreen.tsx',
  '/Users/radnoumanemossabely/Projects/StyleAI/src/screens/onboarding/EnhancedPermissionsScreen.tsx',
  '/Users/radnoumanemossabely/Projects/StyleAI/src/screens/onboarding/EnhancedStylePreferencesScreen.tsx',
  '/Users/radnoumanemossabely/Projects/StyleAI/src/screens/onboarding/ProfileSetupScreen.tsx',
  '/Users/radnoumanemossabely/Projects/StyleAI/src/shared/components/onboarding/StepIndicator.tsx',
  '/Users/radnoumanemossabely/Projects/StyleAI/src/shared/components/onboarding/ProgressBar.tsx'
];

let processedCount = 0;
filesToProcess.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    if (replaceIconsInFile(filePath)) {
      processedCount++;
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log(`\nProcessed ${processedCount} files successfully.`);