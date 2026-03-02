export interface Discipline {
    id: string;
    name: string;
    description: string;
    userId: string;
    createdAt: number;
}

export interface Class {
    id: string;
    name: string;
    disciplineId: string;
    year: string;
    userId: string;
    createdAt: number;
}

export interface Student {
    id: string;
    name: string;
    email?: string;
    registrationNumber?: string;
    classId: string;
    userId: string;
    createdAt: number;
}
