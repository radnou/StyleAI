describe('Onboarding Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete the full onboarding flow', async () => {
    // Welcome Screen
    await expect(element(by.text('Bienvenue sur StyleAI'))).toBeVisible();
    await element(by.text('Commencer l\'aventure')).tap();

    // Personal Info Screen
    await expect(element(by.text('Informations personnelles'))).toBeVisible();
    
    // Fill personal information
    await element(by.id('firstName-input')).typeText('Test');
    await element(by.id('lastName-input')).typeText('User');
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('birthDate-input')).typeText('1990-01-01');
    
    // Continue to next step
    await element(by.text('Continuer')).tap();

    // Style Preferences Screen
    await expect(element(by.text('Styles préférés'))).toBeVisible();
    
    // Select style preferences
    await element(by.text('Casual')).tap();
    await element(by.text('Moderne')).tap();
    
    // Select color preferences
    await element(by.text('Noir')).tap();
    await element(by.text('Blanc')).tap();
    
    // Set budget range (simulate slider interaction)
    await element(by.id('budget-slider')).adjustSliderToPosition(0.5);
    
    // Continue to permissions
    await element(by.text('Continuer')).tap();

    // Permissions Screen
    await expect(element(by.text('Autorisations'))).toBeVisible();
    
    // Grant camera permission
    await element(by.text('Accorder')).atIndex(0).tap();
    
    // Grant photos permission
    await element(by.text('Accorder')).atIndex(1).tap();
    
    // Skip notifications permission for testing
    await element(by.text('Plus tard')).tap();
    
    // Continue to completion
    await element(by.text('Terminer')).tap();

    // Completion Screen
    await expect(element(by.text('Félicitations !'))).toBeVisible();
    await expect(element(by.text('Votre profil StyleAI est maintenant configuré'))).toBeVisible();
    
    // Navigate to main app
    await element(by.text('Découvrir StyleAI')).tap();

    // Should now be in the main app
    await expect(element(by.text('Accueil'))).toBeVisible();
  });

  it('should allow skipping optional steps', async () => {
    // Welcome Screen
    await expect(element(by.text('Bienvenue sur StyleAI'))).toBeVisible();
    await element(by.text('Commencer l\'aventure')).tap();

    // Skip personal info with minimal data
    await element(by.id('email-input')).typeText('minimal@example.com');
    await element(by.text('Continuer')).tap();

    // Skip style preferences
    await element(by.text('Passer')).tap();

    // Skip all permissions
    await element(by.text('Passer tout')).tap();

    // Should still reach completion
    await expect(element(by.text('Configuration terminée'))).toBeVisible();
  });

  it('should validate required fields', async () => {
    // Welcome Screen
    await element(by.text('Commencer l\'aventure')).tap();

    // Try to continue without email
    await element(by.text('Continuer')).tap();

    // Should show validation error
    await expect(element(by.text('L\'email est obligatoire'))).toBeVisible();

    // Fill invalid email
    await element(by.id('email-input')).typeText('invalid-email');
    await element(by.text('Continuer')).tap();

    // Should show email format error
    await expect(element(by.text('Format d\'email invalide'))).toBeVisible();
  });

  it('should persist progress on app restart', async () => {
    // Complete first step
    await element(by.text('Commencer l\'aventure')).tap();
    await element(by.id('email-input')).typeText('persistence@example.com');
    await element(by.text('Continuer')).tap();

    // Restart app
    await device.reloadReactNative();

    // Should resume from style preferences step
    await expect(element(by.text('Styles préférés'))).toBeVisible();
  });
});