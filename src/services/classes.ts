import { addDoc, deleteDoc, getDocs, updateDoc } from "@/lib/storage";
import { Class } from "@/types";

const COLLECTION_NAME = "classes";

export const getClasses = async (userId: string): Promise<Class[]> => {
    if (!userId) return [];

    return getDocs<Class>(
        COLLECTION_NAME,
        (item) => item.userId === userId,
        (a, b) => b.createdAt - a.createdAt
    );
};

export const createClass = async (data: Omit<Class, "id" | "createdAt">): Promise<Class> => {
    const newDoc = {
        ...data,
        createdAt: Date.now(),
    };

    return addDoc<Class>(COLLECTION_NAME, newDoc);
};

export const updateClass = async (id: string, data: Partial<Omit<Class, "id" | "userId" | "createdAt">>): Promise<void> => {
    return updateDoc<Class>(COLLECTION_NAME, id, data);
};

export const deleteClass = async (id: string): Promise<void> => {
    return deleteDoc<Class>(COLLECTION_NAME, id);
};
