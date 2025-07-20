import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import * as express from 'express';

// Initialize Firebase Admin
admin.initializeApp();

// CORS options
const corsOptions = {
  origin: true,
  credentials: true,
};

// Auth functions
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    await admin.firestore().collection('users').doc(user.uid).set({
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    functions.logger.info('User document created successfully', { uid: user.uid });
  } catch (error) {
    functions.logger.error('Error creating user document', { uid: user.uid, error });
  }
});

export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete user document and all subcollections
    const userRef = admin.firestore().collection('users').doc(user.uid);
    
    // Delete subcollections
    const subcollections = ['wardrobe', 'analyses', 'licenses', 'styleProfile'];
    
    for (const subcollection of subcollections) {
      const snapshot = await userRef.collection(subcollection).get();
      const batch = admin.firestore().batch();
      
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    }
    
    // Delete main user document
    await userRef.delete();
    
    functions.logger.info('User data cleanup completed', { uid: user.uid });
  } catch (error) {
    functions.logger.error('Error during user cleanup', { uid: user.uid, error });
  }
});

// Style analysis API
const styleApp = express();
styleApp.use(cors(corsOptions));

styleApp.post('/analyze', async (req, res) => {
  try {
    // Verify authentication
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // TODO: Implement Gemini API integration for style analysis
    res.status(501).json({ error: 'Style analysis not implemented yet' });
  } catch (error) {
    functions.logger.error('Style analysis error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const styleAnalysis = functions.https.onRequest(styleApp);

// Billing functions placeholder
export const handlePayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // TODO: Implement payment processing
  throw new functions.https.HttpsError('unimplemented', 'Payment processing not implemented yet');
});