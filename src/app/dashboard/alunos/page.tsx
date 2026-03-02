"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Student, Class } from "@/types";
import { getStudents, createStudent, updateStudent, deleteStudent, createStudentsBulk } from "@/services/students";
import { getClasses } from "@/services/classes";
import { Plus, Edit, Trash2, GraduationCap, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Papa from "papaparse";
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

export default function StudentsPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({ name: "", email: "", registrationNumber: "", classId: "" });
    const [importClassId, setImportClassId] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [studentsData, classesData] = await Promise.all([
                getStudents(user!.uid),
                getClasses(user!.uid)
            ]);
            setStudents(studentsData);
            setClasses(classesData);
        } catch (error) {
            toast.error("Erro ao carregar dados");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.classId) {
            toast.warning("Nome do aluno e turma são obrigatórios.");
            return;
        }

        try {
            if (editingId) {
                await updateStudent(editingId, formData);
                toast.success("Aluno atualizado com sucesso!");
            } else {
                await createStudent({
                    ...formData,
                    userId: user!.uid,
                });
                toast.success("Aluno cadastrado com sucesso!");
            }
            handleCloseDialog();
            loadData();
        } catch (error) {
            toast.error("Erro ao salvar aluno.");
            console.error(error);
        }
    };

    const handleEdit = (student: Student) => {
        setFormData({
            name: student.name,
            email: student.email || "",
            registrationNumber: student.registrationNumber || "",
            classId: student.classId
        });
        setEditingId(student.id);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este aluno?")) {
            try {
                await deleteStudent(id);
                toast.success("Aluno excluído com sucesso.");
                loadData();
            } catch (error) {
                toast.error("Erro ao excluir aluno.");
                console.error(error);
            }
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingId(null);
        setFormData({ name: "", email: "", registrationNumber: "", classId: "" });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const parsedStudents = results.data as any[];
                const formattedStudents = parsedStudents.map(s => ({
                    name: s.Nome || s.nome || s.Name || s.name || "",
                    email: s.Email || s.email || "",
                    registrationNumber: s.Matricula || s.matricula || "",
                    classId: importClassId,
                    userId: user!.uid,
                })).filter(s => s.name.trim() !== "");

                if (formattedStudents.length === 0) {
                    toast.error("Nenhum aluno válido encontrado no CSV. Verifique se a coluna 'Nome' existe.");
                    return;
                }

                try {
                    await createStudentsBulk(formattedStudents);
                    toast.success(`${formattedStudents.length} alunos importados com sucesso!`);
                    setIsImportDialogOpen(false);
                    setImportClassId("");
                    loadData();
                } catch (error) {
                    toast.error("Erro ao importar alunos.");
                    console.error(error);
                }
            },
            error: (error) => {
                toast.error("Erro ao ler o arquivo CSV.");
                console.error(error);
            }
        });

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const getClassName = (classId: string) => {
        const cls = classes.find(c => c.id === classId);
        return cls ? cls.name : "Desconhecida";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Alunos</h1>
                    <p className="text-slate-500 mt-1">Gerencie os alunos de suas turmas.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Upload size={16} /> Importar CSV
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Importar Alunos</DialogTitle>
                                <DialogDescription>
                                    Selecione a turma e envie um arquivo CSV com as colunas <strong>Nome</strong>, <strong>Email</strong> (opcional) e <strong>Matricula</strong> (opcional).
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Selecione a Turma de Destino</Label>
                                    <Select value={importClassId} onValueChange={setImportClassId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma turma" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.length === 0 ? (
                                                <SelectItem value="empty" disabled>Nenhuma turma encontrada</SelectItem>
                                            ) : (
                                                classes.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Button
                                        className="w-full gap-2"
                                        disabled={!importClassId}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload size={16} /> Selecionar Arquivo CSV
                                    </Button>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <p className="text-xs text-slate-500 text-center mt-2">
                                        <a href="data:text/csv;charset=utf-8,Nome,Email,Matricula%0AJoão Silva,joao@escola.com,12345%0AMaria Souza,maria@escola.com,67890" download="modelo_alunos.csv" className="underline hover:text-primary flex items-center justify-center gap-1">
                                            <Download size={12} /> Baixar planilha modelo
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        if (!open) handleCloseDialog();
                        else setIsDialogOpen(true);
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus size={16} /> Novo Aluno
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{editingId ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
                                    <DialogDescription>
                                        Insira os dados do aluno.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nome do Aluno</Label>
                                        <Input
                                            id="name"
                                            placeholder="Ex: Ana Souza"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="class">Turma</Label>
                                        <Select
                                            value={formData.classId}
                                            onValueChange={(val) => setFormData({ ...formData, classId: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma turma" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.length === 0 ? (
                                                    <SelectItem value="empty" disabled>Nenhuma turma encontrada</SelectItem>
                                                ) : (
                                                    classes.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">E-mail (Opcional)</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Ex: ana@exemplo.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="registration">Matrícula (Opcional)</Label>
                                        <Input
                                            id="registration"
                                            placeholder="Ex: 2024001"
                                            value={formData.registrationNumber}
                                            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={classes.length === 0}>Salvar</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="bg-white rounded-md border border-slate-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Turma</TableHead>
                            <TableHead>Matrícula</TableHead>
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
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="bg-slate-100 p-3 rounded-full">
                                            <GraduationCap className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p>Nenhum aluno cadastrado.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{student.name}</span>
                                            {student.email && <span className="text-xs text-slate-400">{student.email}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {getClassName(student.classId)}
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {student.registrationNumber || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(student)}
                                                className="h-8 w-8 text-slate-500 hover:text-primary"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(student.id)}
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
