"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Discipline } from "@/types";
import { getDisciplines, createDiscipline, updateDiscipline, deleteDiscipline } from "@/services/disciplines";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
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

export default function DisciplinesPage() {
    const { user } = useAuth();
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({ name: "", description: "" });

    useEffect(() => {
        if (user) {
            loadDisciplines();
        }
    }, [user]);

    const loadDisciplines = async () => {
        try {
            setLoading(true);
            const data = await getDisciplines(user!.uid);
            setDisciplines(data);
        } catch (error) {
            toast.error("Erro ao carregar disciplinas");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.warning("O nome da disciplina é obrigatório.");
            return;
        }

        try {
            if (editingId) {
                await updateDiscipline(editingId, formData);
                toast.success("Disciplina atualizada com sucesso!");
            } else {
                await createDiscipline({
                    ...formData,
                    userId: user!.uid,
                });
                toast.success("Disciplina cadastrada com sucesso!");
            }
            handleCloseDialog();
            loadDisciplines();
        } catch (error) {
            toast.error("Erro ao salvar disciplina.");
            console.error(error);
        }
    };

    const handleEdit = (discipline: Discipline) => {
        setFormData({ name: discipline.name, description: discipline.description });
        setEditingId(discipline.id);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta disciplina?")) {
            try {
                await deleteDiscipline(id);
                toast.success("Disciplina excluída com sucesso.");
                loadDisciplines();
            } catch (error) {
                toast.error("Erro ao excluir disciplina.");
                console.error(error);
            }
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingId(null);
        setFormData({ name: "", description: "" });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Disciplinas</h1>
                    <p className="text-slate-500 mt-1">Gerencie as matérias que você leciona.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    if (!open) handleCloseDialog();
                    else setIsDialogOpen(true);
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus size={16} /> Nova Disciplina
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingId ? "Editar Disciplina" : "Nova Disciplina"}</DialogTitle>
                                <DialogDescription>
                                    Preencha os dados abaixo para {editingId ? "atualizar" : "cadastrar"} a disciplina.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome da Disciplina</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: Matemática"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descrição (Opcional)</Label>
                                    <Input
                                        id="description"
                                        placeholder="Ex: 1º Ano do Ensino Médio"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                    Cancelar
                                </Button>
                                <Button type="submit">Salvar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-md border border-slate-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="w-[100px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : disciplines.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-32 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="bg-slate-100 p-3 rounded-full">
                                            <BookOpen className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p>Nenhuma disciplina cadastrada.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            disciplines.map((discipline) => (
                                <TableRow key={discipline.id}>
                                    <TableCell className="font-medium">{discipline.name}</TableCell>
                                    <TableCell className="text-slate-500">
                                        {discipline.description || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(discipline)}
                                                className="h-8 w-8 text-slate-500 hover:text-primary"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(discipline.id)}
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
