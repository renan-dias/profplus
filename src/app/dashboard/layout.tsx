"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-off-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <main className="flex-1 overflow-y-auto p-6 pb-20">
                    {children}
                </main>
                {/* Footer persistente do Dashboard */}
                <div className="absolute bottom-0 w-full p-4 text-center bg-white/80 backdrop-blur-sm border-t border-slate-200">
                    <p className="text-sm text-slate-500">
                        Feito com 💝 para os professores. Criado por <a href="https://github.com/renan-dias" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-slate-800 transition-colors">github.com/renan-dias</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
