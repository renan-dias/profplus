import { addDoc, deleteDoc, getDocs, updateDoc } from "@/lib/storage";
import { Student } from "@/types";

const COLLECTION_NAME = "students";

export const getStudents = async (userId: string, classId?: string): Promise<Student[]> => {
    if (!userId) return [];

    return getDocs<Student>(
        COLLECTION_NAME,
        (item) => {
            if (item.userId !== userId) return false;
            if (classId && item.classId !== classId) return false;
            return true;
        },
        (a, b) => b.createdAt - a.createdAt
    );
};

export const createStudent = async (data: Omit<Student, "id" | "createdAt">): Promise<Student> => {
    const newDoc = {
        ...data,
        createdAt: Date.now(),
    };

    return addDoc<Student>(COLLECTION_NAME, newDoc);
};

export const createStudentsBulk = async (students: Omit<Student, "id" | "createdAt">[]): Promise<void> => {
    // Para simplificar, vamos criar os estudantes sequencialmente como promises no "banco local"
    const promises = students.map(studentData => {
        return addDoc<Student>(COLLECTION_NAME, {
            ...studentData,
            createdAt: Date.now(),
        });
    });

    await Promise.all(promises);
};

export const updateStudent = async (id: string, data: Partial<Omit<Student, "id" | "userId" | "createdAt">>): Promise<void> => {
    return updateDoc<Student>(COLLECTION_NAME, id, data);
};

export const deleteStudent = async (id: string): Promise<void> => {
    return deleteDoc<Student>(COLLECTION_NAME, id);
};
