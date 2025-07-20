describe('Wardrobe Management', () => {
  beforeAll(async () => {
    // Login before wardrobe tests
    await device.reloadReactNative();
    await element(by.text('Se connecter')).tap();
    await element(by.id('email-input')).typeText('test@styleai.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.text('Se connecter')).tap();
    await waitFor(element(by.text('Accueil'))).toBeVisible();
  });

  beforeEach(async () => {
    // Navigate to wardrobe
    await element(by.text('Garde-robe')).tap();
    await expect(element(by.text('Ma Garde-robe'))).toBeVisible();
  });

  it('should add a new clothing item via camera', async () => {
    // Tap add item button
    await element(by.id('add-item-button')).tap();
    
    // Select camera option
    await element(by.text('Appareil photo')).tap();
    
    // Mock camera capture (in real test, this would open camera)
    // For testing, we'll simulate selection of a test image
    
    // Fill item details
    await expect(element(by.text('Détails de l\'article'))).toBeVisible();
    
    await element(by.id('item-name-input')).typeText('T-shirt bleu');
    
    // Select category
    await element(by.id('category-selector')).tap();
    await element(by.text('Hauts')).tap();
    
    // Select color
    await element(by.id('color-selector')).tap();
    await element(by.text('Bleu')).tap();
    
    // Select size
    await element(by.id('size-selector')).tap();
    await element(by.text('M')).tap();
    
    // Add tags
    await element(by.id('tags-input')).typeText('casual, été');
    
    // Save item
    await element(by.text('Sauvegarder')).tap();
    
    // Should return to wardrobe with new item
    await expect(element(by.text('T-shirt bleu'))).toBeVisible();
  });

  it('should add item from photo gallery', async () => {
    await element(by.id('add-item-button')).tap();
    
    // Select gallery option
    await element(by.text('Galerie')).tap();
    
    // Mock gallery selection
    // Fill item details
    await element(by.id('item-name-input')).typeText('Jeans noir');
    await element(by.id('category-selector')).tap();
    await element(by.text('Bas')).tap();
    await element(by.text('Sauvegarder')).tap();
    
    await expect(element(by.text('Jeans noir'))).toBeVisible();
  });

  it('should edit an existing item', async () => {
    // Tap on an existing item
    await element(by.text('T-shirt bleu')).tap();
    
    // Tap edit button
    await element(by.id('edit-item-button')).tap();
    
    // Modify name
    await element(by.id('item-name-input')).clearText();
    await element(by.id('item-name-input')).typeText('T-shirt bleu marine');
    
    // Save changes
    await element(by.text('Sauvegarder')).tap();
    
    // Should show updated name
    await expect(element(by.text('T-shirt bleu marine'))).toBeVisible();
  });

  it('should delete an item', async () => {
    // Tap on item to view details
    await element(by.text('Jeans noir')).tap();
    
    // Tap delete button
    await element(by.id('delete-item-button')).tap();
    
    // Confirm deletion
    await element(by.text('Supprimer')).tap();
    
    // Should return to wardrobe without the item
    await expect(element(by.text('Jeans noir'))).not.toBeVisible();
  });

  it('should filter items by category', async () => {
    // Open category filter
    await element(by.id('category-filter')).tap();
    
    // Select "Hauts" category
    await element(by.text('Hauts')).tap();
    
    // Should only show tops
    await expect(element(by.text('T-shirt bleu marine'))).toBeVisible();
    
    // Clear filter
    await element(by.text('Tous')).tap();
    
    // Should show all items again
    await expect(element(by.text('T-shirt bleu marine'))).toBeVisible();
  });

  it('should search for items', async () => {
    // Open search
    await element(by.id('search-input')).tap();
    
    // Search for "t-shirt"
    await element(by.id('search-input')).typeText('t-shirt');
    
    // Should show matching items
    await expect(element(by.text('T-shirt bleu marine'))).toBeVisible();
    
    // Clear search
    await element(by.id('search-input')).clearText();
  });

  it('should view item statistics', async () => {
    // Navigate to statistics
    await element(by.id('stats-button')).tap();
    
    await expect(element(by.text('Statistiques de garde-robe'))).toBeVisible();
    
    // Should show item counts
    await expect(element(by.text('Total d\'articles'))).toBeVisible();
    await expect(element(by.text('Par catégorie'))).toBeVisible();
    await expect(element(by.text('Par couleur'))).toBeVisible();
  });

  it('should handle empty wardrobe state', async () => {
    // If wardrobe is empty, should show empty state
    // This test assumes we start with empty wardrobe or after clearing all items
    
    // Clear all items first (implementation dependent)
    // For now, assume empty state
    
    await expect(element(by.text('Votre garde-robe est vide'))).toBeVisible();
    await expect(element(by.text('Ajoutez votre premier article'))).toBeVisible();
  });

  it('should handle AI categorization', async () => {
    await element(by.id('add-item-button')).tap();
    await element(by.text('Appareil photo')).tap();
    
    // After image capture, AI should suggest category
    await expect(element(by.text('Suggestion IA'))).toBeVisible();
    
    // Accept AI suggestion
    await element(by.text('Accepter la suggestion')).tap();
    
    // Should auto-fill category and details
    await expect(element(by.id('category-selector'))).toHaveText('Hauts');
  });

  it('should sync items across devices', async () => {
    // Add an item
    await element(by.id('add-item-button')).tap();
    await element(by.text('Galerie')).tap();
    await element(by.id('item-name-input')).typeText('Article de test sync');
    await element(by.text('Sauvegarder')).tap();
    
    // Force sync
    await element(by.id('sync-button')).tap();
    
    // Should show sync success
    await expect(element(by.text('Synchronisation réussie'))).toBeVisible();
  });
});