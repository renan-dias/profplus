"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Definindo a interface baseada no que o app espera (simulando User do firebase)
export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    logOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

const MOCK_USER: User = {
    uid: "local-user-123",
    email: "professor@profplus.local",
    displayName: "Professor Local",
    photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=profplus",
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Verificar se há usuário salvo no localStorage (simula onAuthStateChanged)
        const checkAuth = () => {
            try {
                const storedUser = localStorage.getItem("profplus_auth");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Error reading auth from localStorage:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const signInWithGoogle = async () => {
        try {
            // Simula delay de rede
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Salva mock session
            localStorage.setItem("profplus_auth", JSON.stringify(MOCK_USER));
            setUser(MOCK_USER);
            router.push("/dashboard");
        } catch (error) {
            console.error("Error signing in locally:", error);
        }
    };

    const logOut = async () => {
        try {
            localStorage.removeItem("profplus_auth");
            setUser(null);
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};
