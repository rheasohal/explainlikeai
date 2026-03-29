import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';


// ─── Create a profile doc for new users ──────────────────────────────────────


export async function createUserProfile(uid: string, email: string) {
  const ref = doc(db, 'profiles', uid);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    await setDoc(ref, {
      email,
      role: 'user',
      createdAt: serverTimestamp(),
    });
  }
}


// ─── Get user role ────────────────────────────────────────────────────────────


export async function getUserRole(uid: string): Promise<'user' | 'admin'> {
  const ref = doc(db, 'profiles', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data().role as 'user' | 'admin';
  return 'user';
}


// ─── Save a new chat session ──────────────────────────────────────────────────


export async function saveSession(
  userId: string,
  topic: string,
  level: string,
  interest: string
): Promise<string> {
  const ref = await addDoc(collection(db, 'chatSessions'), {
    userId,
    topic,
    level,
    interest,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}


// ─── Save a message to a session ─────────────────────────────────────────────


export async function saveMessage(
  sessionId: string,
  role: 'user' | 'model',
  content: string
) {
  await addDoc(collection(db, 'chatSessions', sessionId, 'messages'), {
    role,
    content,
    createdAt: serverTimestamp(),
  });
}


// ─── Load all sessions for a user ────────────────────────────────────────────


export async function getUserSessions(userId: string) {
  console.log("DEBUG fetching sessions for userId:", userId);
  
  try {
    // Try without orderBy first to bypass index requirement
    const q = query(
      collection(db, 'chatSessions'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    console.log("DEBUG sessions found:", snap.docs.length);
    snap.docs.forEach(d => console.log("DEBUG doc:", d.id, d.data()));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("DEBUG query error:", err);
    return [];
  }
}




// ─── Load messages for a session ─────────────────────────────────────────────


export async function getSessionMessages(sessionId: string) {
  const q = query(
    collection(db, 'chatSessions', sessionId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}


// ─── Admin: load all sessions across all users ───────────────────────────────


export async function getAllSessions() {
  const q = query(
    collection(db, 'chatSessions'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}


// ─── Admin: load all profiles ────────────────────────────────────────────────


export async function getAllProfiles() {
  const snap = await getDocs(collection(db, 'profiles'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}



