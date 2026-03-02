"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Class, Discipline } from "@/types";
import { getClasses, createClass, updateClass, deleteClass } from "@/services/classes";
import { getDisciplines } from "@/services/disciplines";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ClassesPage() {
    const { user } = useAuth();
    const [classes, setClasses] = useState<Class[]>([]);
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({ name: "", year: "", disciplineId: "" });

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [classesData, disciplinesData] = await Promise.all([
                getClasses(user!.uid),
                getDisciplines(user!.uid)
            ]);
            setClasses(classesData);
            setDisciplines(disciplinesData);
        } catch (error) {
            toast.error("Erro ao carregar dados");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.disciplineId) {
            toast.warning("Nome da turma e disciplina são obrigatórios.");
            return;
        }

        try {
            if (editingId) {
                await updateClass(editingId, formData);
                toast.success("Turma atualizada com sucesso!");
            } else {
                await createClass({
                    ...formData,
                    userId: user!.uid,
                });
                toast.success("Turma cadastrada com sucesso!");
            }
            handleCloseDialog();
            loadData();
        } catch (error) {
            toast.error("Erro ao salvar turma.");
            console.error(error);
        }
    };

    const handleEdit = (cls: Class) => {
        setFormData({ name: cls.name, year: cls.year, disciplineId: cls.disciplineId });
        setEditingId(cls.id);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta turma?")) {
            try {
                await deleteClass(id);
                toast.success("Turma excluída com sucesso.");
                loadData();
            } catch (error) {
                toast.error("Erro ao excluir turma.");
                console.error(error);
            }
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingId(null);
        setFormData({ name: "", year: "", disciplineId: "" });
    };

    const getDisciplineName = (disciplineId: string) => {
        const discipline = disciplines.find(d => d.id === disciplineId);
        return discipline ? discipline.name : "Desconhecida";
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Turmas</h1>
                    <p className="text-slate-500 mt-1">Gerencie suas turmas e associe às disciplinas.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    if (!open) handleCloseDialog();
                    else setIsDialogOpen(true);
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus size={16} /> Nova Turma
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingId ? "Editar Turma" : "Nova Turma"}</DialogTitle>
                                <DialogDescription>
                                    Preencha os dados abaixo. Uma turma deve ser vinculada a uma disciplina.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome da Turma</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: 1º Ano A"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">Ano Letivo (Opcional)</Label>
                                    <Input
                                        id="year"
                                        placeholder="Ex: 2024"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discipline">Disciplina</Label>
                                    <Select
                                        value={formData.disciplineId}
                                        onValueChange={(val) => setFormData({ ...formData, disciplineId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma disciplina" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {disciplines.length === 0 ? (
                                                <SelectItem value="empty" disabled>Nenhuma disciplina encontrada</SelectItem>
                                            ) : (
                                                disciplines.map(d => (
                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={disciplines.length === 0}>Salvar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-md border border-slate-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Turma</TableHead>
                            <TableHead>Disciplina</TableHead>
                            <TableHead>Ano Letivo</TableHead>
                            <TableHead className="w-[100px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : classes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="bg-slate-100 p-3 rounded-full">
                                            <Users className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p>Nenhuma turma cadastrada.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            classes.map((cls) => (
                                <TableRow key={cls.id}>
                                    <TableCell className="font-medium">{cls.name}</TableCell>
                                    <TableCell className="text-slate-600">
                                        {getDisciplineName(cls.disciplineId)}
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {cls.year || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(cls)}
                                                className="h-8 w-8 text-slate-500 hover:text-primary"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(cls.id)}
                                                className="h-8 w-8 text-slate-500 hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
