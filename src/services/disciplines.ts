import { firestore } from "@/lib/firebase/config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { Discipline } from "@/types";

const COLLECTION_NAME = "disciplines";

export const getDisciplines = async (userId: string): Promise<Discipline[]> => {
    if (!userId) return [];

    const q = query(
        collection(firestore, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const disciplines: Discipline[] = [];

    querySnapshot.forEach((doc) => {
        disciplines.push({ id: doc.id, ...doc.data() } as Discipline);
    });

    return disciplines;
};

export const createDiscipline = async (data: Omit<Discipline, "id" | "createdAt">): Promise<Discipline> => {
    const newDoc = {
        ...data,
        createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(firestore, COLLECTION_NAME), newDoc);
    return { id: docRef.id, ...newDoc };
};

export const updateDiscipline = async (id: string, data: Partial<Omit<Discipline, "id" | "userId" | "createdAt">>): Promise<void> => {
    const docRef = doc(firestore, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
};

export const deleteDiscipline = async (id: string): Promise<void> => {
    const docRef = doc(firestore, COLLECTION_NAME, id);
    await deleteDoc(docRef);
};
