// utils/firebaseUtils.js

import { firestore } from '../firebase';

export const createUserProfile = async (uid, email, name,PhoneNumber) => {
  try {
    const usersCollection = firestore.collection('users');
    await usersCollection.doc(uid).set({
      name: name,
      email: email
      
      // Add more fields as needed
    });
    console.log('User profile created successfully');
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};
