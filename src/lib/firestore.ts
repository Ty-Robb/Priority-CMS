import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import type { ContentPiece, PageStructure } from '@/types';

// Collection references
const CONTENT_COLLECTION = 'content';
const TEMPLATES_COLLECTION = 'templates';

// Content operations
export async function getContentById(id: string): Promise<ContentPiece | null> {
  try {
    const docRef = doc(db, CONTENT_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Convert Firestore Timestamps to ISO strings
      const createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : data.createdAt;
        
      const updatedAt = data.updatedAt instanceof Timestamp 
        ? data.updatedAt.toDate().toISOString() 
        : data.updatedAt;
      
      return { 
        id: docSnap.id, 
        ...data,
        createdAt,
        updatedAt
      } as ContentPiece;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting content by ID:", error);
    throw error;
  }
}

export async function getAllContent(): Promise<ContentPiece[]> {
  try {
    const contentRef = collection(db, CONTENT_COLLECTION);
    const q = query(contentRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore Timestamps to ISO strings
      const createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : data.createdAt;
        
      const updatedAt = data.updatedAt instanceof Timestamp 
        ? data.updatedAt.toDate().toISOString() 
        : data.updatedAt;
      
      return { 
        id: doc.id, 
        ...data,
        createdAt,
        updatedAt
      };
    }) as ContentPiece[];
  } catch (error) {
    console.error("Error getting all content:", error);
    throw error;
  }
}

export async function getContentByStatus(status: 'Draft' | 'Published' | 'Archived'): Promise<ContentPiece[]> {
  try {
    const contentRef = collection(db, CONTENT_COLLECTION);
    const q = query(
      contentRef, 
      where('status', '==', status),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore Timestamps to ISO strings
      const createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : data.createdAt;
        
      const updatedAt = data.updatedAt instanceof Timestamp 
        ? data.updatedAt.toDate().toISOString() 
        : data.updatedAt;
      
      return { 
        id: doc.id, 
        ...data,
        createdAt,
        updatedAt
      };
    }) as ContentPiece[];
  } catch (error) {
    console.error("Error getting content by status:", error);
    throw error;
  }
}

export async function createContent(content: Omit<ContentPiece, 'id'>): Promise<ContentPiece> {
  try {
    // Use serverTimestamp for consistent timestamps
    const contentWithTimestamps = {
      ...content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, CONTENT_COLLECTION), contentWithTimestamps);
    
    // Get the newly created document to return with proper timestamps
    const newDoc = await getDoc(docRef);
    const data = newDoc.data();
    
    // Convert Firestore Timestamps to ISO strings
    const createdAt = data?.createdAt instanceof Timestamp 
      ? data.createdAt.toDate().toISOString() 
      : new Date().toISOString();
      
    const updatedAt = data?.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate().toISOString() 
      : new Date().toISOString();
    
    return { 
      id: docRef.id, 
      ...content,
      createdAt,
      updatedAt
    };
  } catch (error) {
    console.error("Error creating content:", error);
    throw error;
  }
}

export async function updateContent(id: string, content: Partial<ContentPiece>): Promise<void> {
  try {
    const docRef = doc(db, CONTENT_COLLECTION, id);
    
    // Add server timestamp for updatedAt
    const contentWithTimestamp = {
      ...content,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, contentWithTimestamp);
  } catch (error) {
    console.error("Error updating content:", error);
    throw error;
  }
}

export async function deleteContent(id: string): Promise<void> {
  try {
    const docRef = doc(db, CONTENT_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting content:", error);
    throw error;
  }
}

// Template operations
export async function getTemplateById(id: string): Promise<PageStructure | null> {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as PageStructure;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting template by ID:", error);
    throw error;
  }
}

export async function getAllTemplates(): Promise<PageStructure[]> {
  try {
    const templatesRef = collection(db, TEMPLATES_COLLECTION);
    const querySnapshot = await getDocs(templatesRef);
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as PageStructure[];
  } catch (error) {
    console.error("Error getting all templates:", error);
    throw error;
  }
}

export async function createTemplate(template: Omit<PageStructure, 'id'>): Promise<PageStructure> {
  try {
    const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), template);
    return { id: docRef.id, ...template };
  } catch (error) {
    console.error("Error creating template:", error);
    throw error;
  }
}

export async function updateTemplate(id: string, template: Partial<PageStructure>): Promise<void> {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, id);
    await updateDoc(docRef, template);
  } catch (error) {
    console.error("Error updating template:", error);
    throw error;
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
}
