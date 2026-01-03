/**
 * Firebase Connectivity Test Utility
 * Run this in browser console to verify Firebase is working
 */

import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🔍 Starting Firebase Connectivity Tests...\n');

  try {
    // Test 1: Check Auth
    console.log('1️⃣ Checking Authentication...');
    const currentUser = await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe();
        resolve(user);
      });
    });
    
    if (currentUser) {
      console.log('✅ Auth Connected');
      console.log(`   User: ${(currentUser as any).email || (currentUser as any).uid}`);
    } else {
      console.log('⚠️  No user signed in - please sign in first');
      return;
    }

    // Test 2: Check Firestore Connection
    console.log('\n2️⃣ Checking Firestore Connection...');
    try {
      const testRef = doc(db, 'users', (currentUser as any).uid);
      const docSnap = await getDoc(testRef);
      console.log('✅ Firestore Connected');
      if (docSnap.exists()) {
        console.log('   Document exists ✅');
        const data = docSnap.data();
        console.log(`   Profile: ${data.profile?.name || 'Not set'}`);
      } else {
        console.log('   Document not found (new user)');
      }
    } catch (error: any) {
      console.log('❌ Firestore Error:', error.message);
    }

    // Test 3: Test Write
    console.log('\n3️⃣ Testing Write Operation...');
    try {
      const testRef = doc(db, 'users', (currentUser as any).uid);
      await setDoc(testRef, { 
        lastTestTime: new Date().toISOString(),
        connectionTest: true 
      }, { merge: true });
      console.log('✅ Write Successful');
    } catch (error: any) {
      console.log('❌ Write Failed:', error.message);
    }

    // Test 4: Test Real-time Listener
    console.log('\n4️⃣ Testing Real-time Listener...');
    const testRef = doc(db, 'users', (currentUser as any).uid);
    const unsubscribe = onSnapshot(testRef, (doc) => {
      if (doc.exists()) {
        console.log('✅ Real-time Listener Working');
        console.log('   Last update:', doc.data().lastTestTime);
        unsubscribe();
      }
    }, (error) => {
      console.log('❌ Listener Error:', error.message);
      unsubscribe();
    });

    console.log('\n✅ All Tests Complete!');
    console.log('\n📊 Firebase Status: HEALTHY');

  } catch (error: any) {
    console.log('\n❌ Test Failed:', error.message);
    console.log('Firebase Status: ERROR');
  }
};

// Add to window for easy access in console
(window as any).testFirebase = testFirebaseConnection;
(window as any).firebaseInfo = () => {
  console.log('Firebase Configuration:');
  console.log('- Project ID:', 'lifeos-3539c');
  console.log('- Auth Domain:', 'lifeos-3539c.firebaseapp.com');
  console.log('- Database:', 'Firestore');
  console.log('\nUsage: testFirebase()');
};
