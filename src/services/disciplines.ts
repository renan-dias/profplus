import { addDoc, deleteDoc, getDocs, updateDoc } from "@/lib/storage";
import { Discipline } from "@/types";

const COLLECTION_NAME = "disciplines";

export const getDisciplines = async (userId: string): Promise<Discipline[]> => {
    if (!userId) return [];

    return getDocs<Discipline>(
        COLLECTION_NAME,
        (item) => item.userId === userId,
        (a, b) => b.createdAt - a.createdAt
    );
};

export const createDiscipline = async (data: Omit<Discipline, "id" | "createdAt">): Promise<Discipline> => {
    const newDoc = {
        ...data,
        createdAt: Date.now(),
    };

    return addDoc<Discipline>(COLLECTION_NAME, newDoc);
};

export const updateDiscipline = async (id: string, data: Partial<Omit<Discipline, "id" | "userId" | "createdAt">>): Promise<void> => {
    return updateDoc<Discipline>(COLLECTION_NAME, id, data);
};

export const deleteDiscipline = async (id: string): Promise<void> => {
    return deleteDoc<Discipline>(COLLECTION_NAME, id);
};
