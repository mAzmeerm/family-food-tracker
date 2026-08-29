import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { FamilyMember } from '../types';

const COLLECTION_NAME = 'family_members';

const DEFAULT_MEMBERS = ['Abang Amin', 'Aiman', 'Mak', 'Bapak'];

export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    const members: FamilyMember[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      members.push({
        id: docSnap.id,
        name: data.name,
        createdAt: data.createdAt,
      });
    });

    // If empty, auto-seed default members for the family
    if (members.length === 0) {
      return await seedDefaultFamilyMembers();
    }

    return members;
  } catch (error) {
    console.error('Error fetching family members:', error);
    throw error;
  }
};

export const addFamilyMember = async (name: string): Promise<FamilyMember> => {
  try {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Family member name cannot be empty');
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      name: trimmedName,
      createdAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      name: trimmedName,
    };
  } catch (error) {
    console.error('Error adding family member:', error);
    throw error;
  }
};

export const deleteFamilyMember = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting family member:', error);
    throw error;
  }
};

export const seedDefaultFamilyMembers = async (): Promise<FamilyMember[]> => {
  try {
    const seeded: FamilyMember[] = [];
    for (const name of DEFAULT_MEMBERS) {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        name,
        createdAt: serverTimestamp(),
      });
      seeded.push({ id: docRef.id, name });
    }
    return seeded;
  } catch (error) {
    console.error('Error seeding family members:', error);
    return DEFAULT_MEMBERS.map((name, index) => ({ id: `default-${index}`, name }));
  }
};
