"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, GraduationCap, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDisciplines } from "@/services/disciplines";
import { getClasses } from "@/services/classes";
import { getStudents } from "@/services/students";

export default function DashboardPage() {
    const { user } = useAuth();
    const [counts, setCounts] = useState({ disciplines: 0, classes: 0, students: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            async function loadData() {
                try {
                    const [disciplines, classes, students] = await Promise.all([
                        getDisciplines(user!.uid),
                        getClasses(user!.uid),
                        getStudents(user!.uid)
                    ]);
                    setCounts({
                        disciplines: disciplines.length,
                        classes: classes.length,
                        students: students.length,
                    });
                } catch (error) {
                    console.error("Erro ao carregar os dados do dashboard", error);
                } finally {
                    setLoading(false);
                }
            }
            loadData();
        }
    }, [user]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-2">Visão geral das suas turmas e atividades.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "..." : counts.classes}</div>
                        <p className="text-xs text-slate-500">Neste semestre</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alunos Matriculados</CardTitle>
                        <GraduationCap className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "..." : counts.students}</div>
                        <p className="text-xs text-slate-500">Total de alunos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
                        <BookOpen className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "..." : counts.disciplines}</div>
                        <p className="text-xs text-slate-500">Cadastradas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atividades Geradas</CardTitle>
                        <FileText className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-slate-500">Este mês</p>
                    </CardContent>
                </Card>
            </div>

            {/* Placeholder para Atividades Recentes ou Gráficos */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Desempenho Geral</CardTitle>
                        <CardDescription>Média de notas das turmas cadastradas.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center bg-slate-50/50 rounded-md border border-dashed border-slate-200 m-6">
                        <p className="text-slate-400 text-sm">Ainda não há dados suficientes das correções.</p>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Atividades Recentes</CardTitle>
                        <CardDescription>Últimas provas geradas com IA.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <p className="text-slate-400 text-sm">Nenhuma atividade recente encontrada.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
