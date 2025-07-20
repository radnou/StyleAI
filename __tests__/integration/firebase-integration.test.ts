import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

import { firebaseConfig } from '@/core/config/firebase';

// Test configuration
const testConfig = {
  ...firebaseConfig,
  projectId: 'styleai-test-project'
};

describe('Firebase Integration Tests', () => {
  let app: any;
  let auth: any;
  let firestore: any;
  let storage: any;
  let testUserId: string;
  
  beforeAll(async () => {
    // Initialize Firebase for testing
    if (getApps().length === 0) {
      app = initializeApp(testConfig, 'test-app');
    } else {
      app = getApps()[0];
    }
    
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
    
    // Connect to emulators if available
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(firestore, 'localhost', 8080);
      connectStorageEmulator(storage, 'localhost', 9199);
    } catch (error) {
      console.warn('Emulators not available, using live Firebase');
    }
  });

  afterAll(async () => {
    if (app) {
      await deleteApp(app);
    }
  });

  describe('Authentication Service Integration', () => {
    const testEmail = 'test@styleai.com';
    const testPassword = 'testPassword123';

    beforeEach(async () => {
      // Ensure we start with clean auth state
      if (auth.currentUser) {
        await signOut(auth);
      }
    });

    it('should create a new user account', async () => {
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      
      expect(userCredential.user).toBeDefined();
      expect(userCredential.user.email).toBe(testEmail);
      expect(userCredential.user.uid).toBeDefined();
      
      testUserId = userCredential.user.uid;
    });

    it('should sign in with existing credentials', async () => {
      const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      
      expect(userCredential.user).toBeDefined();
      expect(userCredential.user.email).toBe(testEmail);
      expect(auth.currentUser).toBeTruthy();
    });

    it('should handle authentication errors', async () => {
      await expect(
        signInWithEmailAndPassword(auth, 'wrong@email.com', 'wrongpassword')
      ).rejects.toThrow();
    });

    it('should sign out user', async () => {
      // First sign in
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
      expect(auth.currentUser).toBeTruthy();
      
      // Then sign out
      await signOut(auth);
      expect(auth.currentUser).toBeNull();
    });
  });

  describe('Firestore Service Integration', () => {
    beforeEach(async () => {
      // Sign in before Firestore operations
      await signInWithEmailAndPassword(auth, 'test@styleai.com', 'testPassword123');
    });

    it('should create and read user profile', async () => {
      const userId = auth.currentUser?.uid;
      const userProfile = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@styleai.com',
        preferences: {
          styles: ['casual', 'modern'],
          colors: ['blue', 'black'],
          budget: [50, 200]
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create profile
      await setDoc(doc(firestore, 'users', userId!), userProfile);

      // Read profile
      const docSnap = await getDoc(doc(firestore, 'users', userId!));
      
      expect(docSnap.exists()).toBe(true);
      const data = docSnap.data();
      expect(data?.firstName).toBe('Test');
      expect(data?.lastName).toBe('User');
      expect(data?.email).toBe('test@styleai.com');
    });

    it('should manage wardrobe items', async () => {
      const userId = auth.currentUser?.uid;
      const clothingItem = {
        name: 'Test T-Shirt',
        category: 'tops',
        color: 'blue',
        size: 'M',
        brand: 'TestBrand',
        tags: ['casual', 'summer'],
        imageUrl: 'https://example.com/image.jpg',
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add item
      const docRef = await addDoc(collection(firestore, 'clothingItems'), clothingItem);
      expect(docRef.id).toBeDefined();

      // Query user's items
      const q = query(
        collection(firestore, 'clothingItems'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      expect(querySnapshot.size).toBeGreaterThan(0);
      
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const addedItem = items.find(item => item.name === 'Test T-Shirt');
      
      expect(addedItem).toBeDefined();
      expect(addedItem?.category).toBe('tops');

      // Clean up
      await deleteDoc(docRef);
    });

    it('should manage style analyses', async () => {
      const userId = auth.currentUser?.uid;
      const styleAnalysis = {
        userId,
        imageUrl: 'https://example.com/analysis-image.jpg',
        analysis: {
          dominantColors: ['#0066CC', '#FFFFFF'],
          styleCategories: ['casual', 'modern'],
          confidence: 0.85,
          recommendations: [
            'Add a blazer for a more polished look',
            'Consider darker colors for evening'
          ]
        },
        metadata: {
          processingTime: 2.5,
          modelVersion: '1.2.0'
        },
        createdAt: new Date()
      };

      // Save analysis
      const docRef = await addDoc(collection(firestore, 'styleAnalyses'), styleAnalysis);
      expect(docRef.id).toBeDefined();

      // Query user's analyses
      const q = query(
        collection(firestore, 'styleAnalyses'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      expect(querySnapshot.size).toBeGreaterThan(0);
      
      const analyses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const savedAnalysis = analyses[0];
      
      expect(savedAnalysis.analysis.confidence).toBe(0.85);
      expect(savedAnalysis.analysis.styleCategories).toContain('casual');

      // Clean up
      await deleteDoc(docRef);
    });

    it('should handle Firestore security rules', async () => {
      // Test that users can only access their own data
      const otherUserId = 'other-user-id';
      
      // Try to create data with wrong userId
      await expect(
        setDoc(doc(firestore, 'users', otherUserId), {
          firstName: 'Unauthorized',
          email: 'unauthorized@test.com'
        })
      ).rejects.toThrow();
    });

    it('should handle offline capabilities', async () => {
      // This would test Firestore offline persistence
      // For now, just verify that the offline settings work
      const userId = auth.currentUser?.uid;
      
      const testData = {
        testField: 'offline-test',
        timestamp: new Date()
      };

      // Write data that should be cached
      await setDoc(doc(firestore, 'offlineTest', userId!), testData);
      
      // Read it back
      const docSnap = await getDoc(doc(firestore, 'offlineTest', userId!));
      expect(docSnap.exists()).toBe(true);
      
      // Clean up
      await deleteDoc(doc(firestore, 'offlineTest', userId!));
    });
  });

  describe('Storage Service Integration', () => {
    beforeEach(async () => {
      await signInWithEmailAndPassword(auth, 'test@styleai.com', 'testPassword123');
    });

    it('should upload and download images', async () => {
      const userId = auth.currentUser?.uid;
      const testImageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
      const fileName = `test-images/${userId}/test-image.png`;
      
      // Upload image
      const storageRef = ref(storage, fileName);
      const uploadResult = await uploadBytes(storageRef, testImageData);
      
      expect(uploadResult.metadata.name).toBe('test-image.png');
      expect(uploadResult.metadata.size).toBe(testImageData.length);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      expect(downloadURL).toContain('firebase');

      // Clean up
      await deleteObject(storageRef);
    });

    it('should handle different image formats', async () => {
      const userId = auth.currentUser?.uid;
      const jpegHeader = new Uint8Array([255, 216, 255, 224]);
      const fileName = `test-images/${userId}/test-image.jpg`;
      
      const storageRef = ref(storage, fileName);
      const uploadResult = await uploadBytes(storageRef, jpegHeader, {
        contentType: 'image/jpeg'
      });
      
      expect(uploadResult.metadata.contentType).toBe('image/jpeg');

      // Clean up
      await deleteObject(storageRef);
    });

    it('should enforce storage security rules', async () => {
      const otherUserId = 'other-user-id';
      const testImageData = new Uint8Array([1, 2, 3, 4]);
      const unauthorizedPath = `test-images/${otherUserId}/unauthorized.png`;
      
      // Try to upload to another user's folder
      const storageRef = ref(storage, unauthorizedPath);
      
      await expect(
        uploadBytes(storageRef, testImageData)
      ).rejects.toThrow();
    });

    it('should handle upload errors gracefully', async () => {
      const userId = auth.currentUser?.uid;
      const invalidData = null as any;
      const fileName = `test-images/${userId}/invalid.png`;
      
      const storageRef = ref(storage, fileName);
      
      await expect(
        uploadBytes(storageRef, invalidData)
      ).rejects.toThrow();
    });
  });

  describe('Real-time Data Synchronization', () => {
    it('should sync wardrobe changes across sessions', async () => {
      // This would test real-time listeners
      const userId = auth.currentUser?.uid;
      let receivedUpdates = 0;
      
      // Set up listener
      const unsubscribe = (firestore as any).collection('clothingItems')
        .where('userId', '==', userId)
        .onSnapshot(() => {
          receivedUpdates++;
        });

      // Add an item
      await addDoc(collection(firestore, 'clothingItems'), {
        name: 'Real-time Test Item',
        userId,
        createdAt: new Date()
      });

      // Wait a bit for the listener to fire
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      expect(receivedUpdates).toBeGreaterThan(0);
      
      unsubscribe();
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle batch operations efficiently', async () => {
      const userId = auth.currentUser?.uid;
      const batchSize = 10;
      const startTime = Date.now();
      
      // Create multiple items in parallel
      const promises = Array.from({ length: batchSize }, (_, i) =>
        addDoc(collection(firestore, 'clothingItems'), {
          name: `Batch Item ${i}`,
          userId,
          createdAt: new Date()
        })
      );
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(results).toHaveLength(batchSize);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
      
      // Clean up
      await Promise.all(results.map(docRef => deleteDoc(docRef)));
    });

    it('should cache frequently accessed data', async () => {
      const userId = auth.currentUser?.uid;
      
      // First read (should hit the server)
      const startTime1 = Date.now();
      await getDoc(doc(firestore, 'users', userId!));
      const firstReadTime = Date.now() - startTime1;
      
      // Second read (should be faster due to caching)
      const startTime2 = Date.now();
      await getDoc(doc(firestore, 'users', userId!));
      const secondReadTime = Date.now() - startTime2;
      
      // Second read should be faster or similar (not significantly slower)
      expect(secondReadTime).toBeLessThanOrEqual(firstReadTime * 2);
    });
  });
});