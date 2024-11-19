// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { collection, onSnapshot, doc, updateDoc, getDoc, addDoc, getDocs, deleteDoc, setDoc } from 'firebase/firestore';
import { DocumentReference, Timestamp } from 'firebase/firestore'; 
import { query, orderBy, where } from 'firebase/firestore';
import { WorkType, JobRecord } from './classes';
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export const collectJobsFeed = async (): Promise<JobRecord[]> => {
  // Define local variables
  const returnList: JobRecord[] = []
  const q = query(
    collection(db, "li-jd-postings"),
    //where('status', '==', null),
    orderBy('post_time', 'desc')
);
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const record = doc.data()
    console.log(record)
    returnList.push({
      uuid: record.uuid,
      title: record.title,
      department: record.department,
      subtitle: record.subtitle,
      description: record.description,
      location_tier: record.location_tier,
      employer: record.employer,
      work_type: record.work_type,
      jd_url: record.jd_url,
      promoter_name: record.promoter_name,
      promoter_link: record.promoter_link,
      data_url: record.data_url,
      proximity: record.proximity,
      promoter_headline: record.promoter_headline,
      status: record.status,
      freshness: record.freshness,
      fresh_min: record.fresh_min,
      post_time: record.post_time,
    });
  })
  return returnList;
};

export const recordJFUpdate = async (record: JobRecord, status: string): Promise<void> => {
  try {
      // Log for debugging
      console.log('Archiving job with id:', record.uuid, 'and new status:', status);

      // 1. Get a reference to the original job document
      const jd_ref = doc(db, 'li-jd-postings', record.uuid);

      // 2. Delete the original document from the 'li-jd-postings' collection
      await deleteDoc(jd_ref);
      console.log('Job deleted from li-jd-postings');

      // 3. Create a reference to the 'li-jd-postings-archived' collection
      const archived_ref = doc(db, 'li-jd-postings-archived', record.uuid);

      // 4. Write the record to the 'li-jd-postings-archived' collection with the new status
      await setDoc(archived_ref, { ...record, status: status });
      console.log('Job archived to li-jd-postings-archived with new status:', status);

  } catch (error) {
      console.error('Error updating job record:', error);
  }
};
