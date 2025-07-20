describe('Navigation Flow', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    // Complete onboarding and login
    await element(by.text('Commencer l\'aventure')).tap();
    await element(by.id('email-input')).typeText('nav@test.com');
    await element(by.text('Continuer')).tap();
    await element(by.text('Passer')).tap(); // Skip style preferences
    await element(by.text('Passer tout')).tap(); // Skip permissions
    await element(by.text('Découvrir StyleAI')).tap();
  });

  it('should navigate between main tabs', async () => {
    // Should start on Home tab
    await expect(element(by.text('Accueil'))).toBeVisible();
    
    // Navigate to Wardrobe
    await element(by.text('Garde-robe')).tap();
    await expect(element(by.text('Ma Garde-robe'))).toBeVisible();
    
    // Navigate to Style
    await element(by.text('Style')).tap();
    await expect(element(by.text('Assistant Style'))).toBeVisible();
    
    // Navigate to Profile
    await element(by.text('Profil')).tap();
    await expect(element(by.text('Mon Profil'))).toBeVisible();
    
    // Return to Home
    await element(by.text('Accueil')).tap();
    await expect(element(by.text('Bienvenue'))).toBeVisible();
  });

  it('should navigate through home screen sections', async () => {
    // Quick actions
    await element(by.text('Ajouter un article')).tap();
    await expect(element(by.text('Nouvel article'))).toBeVisible();
    await element(by.id('back-button')).tap();
    
    // Recent recommendations
    await element(by.text('Voir toutes les recommandations')).tap();
    await expect(element(by.text('Toutes les recommandations'))).toBeVisible();
    await element(by.id('back-button')).tap();
    
    // Weather widget
    await element(by.text('Suggestions météo')).tap();
    await expect(element(by.text('Recommandations météo'))).toBeVisible();
    await element(by.id('back-button')).tap();
  });

  it('should navigate through wardrobe sections', async () => {
    await element(by.text('Garde-robe')).tap();
    
    // Categories
    await element(by.text('Catégories')).tap();
    await expect(element(by.text('Toutes les catégories'))).toBeVisible();
    await element(by.id('back-button')).tap();
    
    // Search
    await element(by.text('Rechercher')).tap();
    await expect(element(by.text('Recherche avancée'))).toBeVisible();
    await element(by.id('back-button')).tap();
    
    // Filters
    await element(by.id('filter-button')).tap();
    await expect(element(by.text('Filtrer par'))).toBeVisible();
    await element(by.text('Annuler')).tap();
  });

  it('should navigate through style assistant', async () => {
    await element(by.text('Style')).tap();
    
    // Outfit recommendations
    await element(by.text('Recommandations')).tap();
    await expect(element(by.text('Nouvelle recommandation'))).toBeVisible();
    await element(by.id('back-button')).tap();
    
    // Style analysis
    await element(by.text('Analyse photo')).tap();
    await expect(element(by.text('Analyser votre style'))).toBeVisible();
    await element(by.id('back-button')).tap();
    
    // Chat
    await element(by.text('Chat Style')).tap();
    await expect(element(by.text('Assistant virtuel'))).toBeVisible();
    await element(by.id('back-button')).tap();
  });

  it('should navigate through profile sections', async () => {
    await element(by.text('Profil')).tap();
    
    // Edit profile
    await element(by.text('Modifier le profil')).tap();
    await expect(element(by.text('Informations personnelles'))).toBeVisible();
    await element(by.id('back-button')).tap();
    
    // Preferences
    await element(by.text('Préférences')).tap();
    await expect(element(by.text('Préférences de style'))).toBeVisible();
    await element(by.id('back-button')).tap();
    
    // Settings
    await element(by.text('Paramètres')).tap();
    await expect(element(by.text('Paramètres de l\'application'))).toBeVisible();
    await element(by.id('back-button')).tap();
  });

  it('should handle deep navigation and back navigation', async () => {
    // Deep navigation: Home -> Wardrobe -> Item Details -> Edit
    await element(by.text('Garde-robe')).tap();
    
    // Assuming there's an item to tap
    await element(by.id('wardrobe-item-0')).tap();
    await expect(element(by.text('Détails de l\'article'))).toBeVisible();
    
    await element(by.text('Modifier')).tap();
    await expect(element(by.text('Modifier l\'article'))).toBeVisible();
    
    // Navigate back step by step
    await element(by.id('back-button')).tap();
    await expect(element(by.text('Détails de l\'article'))).toBeVisible();
    
    await element(by.id('back-button')).tap();
    await expect(element(by.text('Ma Garde-robe'))).toBeVisible();
  });

  it('should handle tab state preservation', async () => {
    // Navigate to wardrobe and scroll/filter
    await element(by.text('Garde-robe')).tap();
    await element(by.id('filter-button')).tap();
    await element(by.text('Hauts')).tap();
    
    // Switch to another tab
    await element(by.text('Style')).tap();
    
    // Return to wardrobe - should preserve filter state
    await element(by.text('Garde-robe')).tap();
    await expect(element(by.text('Filtré par: Hauts'))).toBeVisible();
  });

  it('should handle navigation errors gracefully', async () => {
    // Try to navigate to non-existent item
    // This would typically be caught by the navigation system
    
    // Simulate by trying to access protected route when not authenticated
    // (This is more relevant for web, but can test error boundaries)
    
    // For now, test that error boundary shows when navigation fails
    await expect(element(by.id('navigation-container'))).toBeVisible();
  });

  it('should support swipe gestures for navigation', async () => {
    // Test swipe between tabs (if implemented)
    await element(by.text('Accueil')).tap();
    
    // Swipe left to go to next tab
    await element(by.id('tab-container')).swipe('left');
    await expect(element(by.text('Garde-robe'))).toBeVisible();
    
    // Swipe right to go back
    await element(by.id('tab-container')).swipe('right');
    await expect(element(by.text('Accueil'))).toBeVisible();
  });

  it('should handle modal navigation', async () => {
    // Open modal from various screens
    await element(by.text('Style')).tap();
    await element(by.text('Nouveau look')).tap();
    
    // Should open modal
    await expect(element(by.text('Créer un nouveau look'))).toBeVisible();
    
    // Close modal
    await element(by.id('close-modal')).tap();
    
    // Should return to previous screen
    await expect(element(by.text('Assistant Style'))).toBeVisible();
  });

  it('should maintain navigation history', async () => {
    // Navigate through multiple screens
    await element(by.text('Garde-robe')).tap();
    await element(by.text('Catégories')).tap();
    await element(by.text('Hauts')).tap();
    
    // Use back gesture/button multiple times
    await device.pressBack(); // Should go to Categories
    await expect(element(by.text('Toutes les catégories'))).toBeVisible();
    
    await device.pressBack(); // Should go to Wardrobe
    await expect(element(by.text('Ma Garde-robe'))).toBeVisible();
  });
});