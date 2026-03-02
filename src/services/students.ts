import { firestore } from "@/lib/firebase/config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, writeBatch } from "firebase/firestore";
import { Student } from "@/types";

const COLLECTION_NAME = "students";

export const getStudents = async (userId: string, classId?: string): Promise<Student[]> => {
    if (!userId) return [];

    const constraints = [where("userId", "==", userId)];

    if (classId) {
        constraints.push(where("classId", "==", classId));
    }

    constraints.push(orderBy("createdAt", "desc"));

    const q = query(collection(firestore, COLLECTION_NAME), ...constraints);

    const querySnapshot = await getDocs(q);
    const students: Student[] = [];

    querySnapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() } as Student);
    });

    return students;
};

export const createStudent = async (data: Omit<Student, "id" | "createdAt">): Promise<Student> => {
    const newDoc = {
        ...data,
        createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(firestore, COLLECTION_NAME), newDoc);
    return { id: docRef.id, ...newDoc };
};

export const createStudentsBulk = async (students: Omit<Student, "id" | "createdAt">[]): Promise<void> => {
    const batch = writeBatch(firestore);

    students.forEach(studentData => {
        const docRef = doc(collection(firestore, COLLECTION_NAME));
        batch.set(docRef, { ...studentData, createdAt: Date.now() });
    });

    await batch.commit();
};

export const updateStudent = async (id: string, data: Partial<Omit<Student, "id" | "userId" | "createdAt">>): Promise<void> => {
    const docRef = doc(firestore, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
};

export const deleteStudent = async (id: string): Promise<void> => {
    const docRef = doc(firestore, COLLECTION_NAME, id);
    await deleteDoc(docRef);
};
