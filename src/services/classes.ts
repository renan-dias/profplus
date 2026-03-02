import { firestore } from "@/lib/firebase/config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { Class } from "@/types";

const COLLECTION_NAME = "classes";

export const getClasses = async (userId: string): Promise<Class[]> => {
    if (!userId) return [];

    const q = query(
        collection(firestore, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const classes: Class[] = [];

    querySnapshot.forEach((doc) => {
        classes.push({ id: doc.id, ...doc.data() } as Class);
    });

    return classes;
};

export const createClass = async (data: Omit<Class, "id" | "createdAt">): Promise<Class> => {
    const newDoc = {
        ...data,
        createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(firestore, COLLECTION_NAME), newDoc);
    return { id: docRef.id, ...newDoc };
};

export const updateClass = async (id: string, data: Partial<Omit<Class, "id" | "userId" | "createdAt">>): Promise<void> => {
    const docRef = doc(firestore, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
};

export const deleteClass = async (id: string): Promise<void> => {
    const docRef = doc(firestore, COLLECTION_NAME, id);
    await deleteDoc(docRef);
};
