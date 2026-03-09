// Simple id generator since we can't use uuid without adding it to package.json
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getCollection = <T>(collectionName: string): T[] => {
    if (typeof window === 'undefined') return [];

    try {
        const item = window.localStorage.getItem(collectionName);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error(`Error reading collection ${collectionName} from localStorage`, error);
        return [];
    }
}

export const saveCollection = <T>(collectionName: string, data: T[]): void => {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(collectionName, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving collection ${collectionName} to localStorage`, error);
    }
}

export const filterCollection = <T>(collectionName: string, predicate: (item: T) => boolean): T[] => {
    const items = getCollection<T>(collectionName);
    return items.filter(predicate);
}

export const addDoc = async <T extends { id?: string }>(collectionName: string, doc: Omit<T, 'id'>): Promise<T> => {
    // Simulate async network request
    await new Promise(resolve => setTimeout(resolve, 50));

    const items = getCollection<T>(collectionName);

    const newDoc = {
        ...doc,
        id: generateId()
    } as unknown as T;

    items.push(newDoc);
    saveCollection(collectionName, items);

    return newDoc;
}

export const updateDoc = async <T extends { id: string }>(collectionName: string, id: string, docData: Partial<T>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 50));

    const items = getCollection<T>(collectionName);
    const index = items.findIndex(item => item.id === id);

    if (index !== -1) {
        items[index] = { ...items[index], ...docData };
        saveCollection(collectionName, items);
    }
}

export const deleteDoc = async <T extends { id: string }>(collectionName: string, id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 50));

    const items = getCollection<T>(collectionName);
    const newItems = items.filter(item => item.id !== id);
    saveCollection(collectionName, newItems);
}

export const getDocs = async <T>(collectionName: string, predicate?: (item: T) => boolean, sortFn?: (a: T, b: T) => number): Promise<T[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));

    let items = getCollection<T>(collectionName);

    if (predicate) {
        items = items.filter(predicate);
    }

    if (sortFn) {
        items = items.sort(sortFn);
    }

    return items;
}
