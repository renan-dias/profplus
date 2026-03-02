"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    FileText,
    LogOut,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    FileCheck2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { user, logOut } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: BookOpen, label: "Disciplinas", href: "/dashboard/disciplinas" },
        { icon: Users, label: "Turmas", href: "/dashboard/turmas" },
        { icon: GraduationCap, label: "Alunos", href: "/dashboard/alunos" },
        { icon: FileText, label: "Minhas Atividades", href: "/dashboard/atividades" },
        { icon: FileCheck2, label: "Correção por IA", href: "/dashboard/correcao" },
    ];

    return (
        <aside
            className={cn(
                "h-screen bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 relative",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className={cn("flex items-center overflow-hidden", collapsed && "justify-center")}>
                    <div className="bg-primary p-2 rounded-lg flex-shrink-0">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="ml-3 font-bold text-xl tracking-tight hidden md:block whitespace-nowrap">
                            ProfPlus
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-6 bg-slate-800 rounded-full p-1 border border-slate-700 hover:bg-slate-700 md:block hidden"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname.startsWith(item.href) &&
                        (item.href === "/dashboard" ? pathname === "/dashboard" : true);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-md transition-colors",
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                                collapsed && "justify-center"
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon size={20} className="flex-shrink-0" />
                            {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar className="h-10 w-10 border border-slate-700 cursor-pointer">
                            <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "Professor"} />
                            <AvatarFallback className="bg-slate-800 text-slate-300">
                                {user?.displayName?.charAt(0) || "P"}
                            </AvatarFallback>
                        </Avatar>
                        {!collapsed && (
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium truncate">{user?.displayName || "Professor"}</span>
                                <span className="text-xs text-slate-400 truncate">{user?.email || ""}</span>
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className={cn(
                        "w-full mt-4 text-slate-400 hover:text-red-400 hover:bg-red-400/10 justify-start",
                        collapsed && "justify-center px-0"
                    )}
                    onClick={logOut}
                    title={collapsed ? "Sair" : undefined}
                >
                    <LogOut size={20} className={cn(!collapsed && "mr-3")} />
                    {!collapsed && <span>Sair</span>}
                </Button>
            </div>
        </aside>
    );
}
