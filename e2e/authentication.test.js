describe('Authentication Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to authentication if needed
    await element(by.text('Se connecter')).tap();
  });

  it('should login with valid credentials', async () => {
    // Login Screen
    await expect(element(by.text('Connexion'))).toBeVisible();
    
    // Fill login form
    await element(by.id('email-input')).typeText('test@styleai.com');
    await element(by.id('password-input')).typeText('password123');
    
    // Submit login
    await element(by.text('Se connecter')).tap();
    
    // Wait for navigation to main app
    await waitFor(element(by.text('Accueil')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should register a new user', async () => {
    // Navigate to register
    await element(by.text('Créer un compte')).tap();
    
    await expect(element(by.text('Inscription'))).toBeVisible();
    
    // Fill registration form
    await element(by.id('firstName-input')).typeText('New');
    await element(by.id('lastName-input')).typeText('User');
    await element(by.id('email-input')).typeText('newuser@styleai.com');
    await element(by.id('password-input')).typeText('newpassword123');
    await element(by.id('confirmPassword-input')).typeText('newpassword123');
    
    // Accept terms
    await element(by.id('terms-checkbox')).tap();
    
    // Submit registration
    await element(by.text('Créer le compte')).tap();
    
    // Should navigate to email verification
    await expect(element(by.text('Vérification email'))).toBeVisible();
  });

  it('should handle login errors', async () => {
    // Try login with invalid credentials
    await element(by.id('email-input')).typeText('invalid@test.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.text('Se connecter')).tap();
    
    // Should show error message
    await expect(element(by.text('Identifiants incorrects'))).toBeVisible();
  });

  it('should reset password', async () => {
    // Navigate to forgot password
    await element(by.text('Mot de passe oublié ?')).tap();
    
    await expect(element(by.text('Réinitialiser le mot de passe'))).toBeVisible();
    
    // Enter email
    await element(by.id('email-input')).typeText('test@styleai.com');
    await element(by.text('Envoyer le lien')).tap();
    
    // Should show confirmation
    await expect(element(by.text('Email de réinitialisation envoyé'))).toBeVisible();
  });

  it('should login with Google (mock)', async () => {
    // Mock Google sign-in for testing
    await element(by.id('google-signin-button')).tap();
    
    // In a real test, this would open Google auth flow
    // For testing, we'll mock success
    await waitFor(element(by.text('Accueil')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should logout successfully', async () => {
    // First login
    await element(by.id('email-input')).typeText('test@styleai.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.text('Se connecter')).tap();
    
    await waitFor(element(by.text('Accueil'))).toBeVisible();
    
    // Navigate to profile
    await element(by.text('Profil')).tap();
    
    // Logout
    await element(by.text('Déconnexion')).tap();
    
    // Confirm logout
    await element(by.text('Confirmer')).tap();
    
    // Should return to welcome screen
    await expect(element(by.text('Bienvenue'))).toBeVisible();
  });

  it('should validate registration form', async () => {
    await element(by.text('Créer un compte')).tap();
    
    // Try to submit empty form
    await element(by.text('Créer le compte')).tap();
    
    // Should show validation errors
    await expect(element(by.text('Le prénom est obligatoire'))).toBeVisible();
    await expect(element(by.text('L\'email est obligatoire'))).toBeVisible();
    
    // Test password mismatch
    await element(by.id('firstName-input')).typeText('Test');
    await element(by.id('lastName-input')).typeText('User');
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('confirmPassword-input')).typeText('different');
    
    await element(by.text('Créer le compte')).tap();
    
    await expect(element(by.text('Les mots de passe ne correspondent pas'))).toBeVisible();
  });

  it('should handle network errors gracefully', async () => {
    // Simulate network error by using invalid credentials that would trigger network timeout
    await element(by.id('email-input')).typeText('network@error.test');
    await element(by.id('password-input')).typeText('timeout');
    await element(by.text('Se connecter')).tap();
    
    // Should show network error message
    await expect(element(by.text('Erreur de connexion. Vérifiez votre connexion internet.'))).toBeVisible();
  });
});