"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { Wand2, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { generateQuestions } from "@/services/ai";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function ActivitiesBuilderPage() {
    const { user } = useAuth();
    const [content, setContent] = useState(`
    <div style="text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem;">
      <h1>ProfPlus Educacional</h1>
      <p><strong>Disciplina:</strong> Matemática</p>
      <p><strong>Turma:</strong> ___________ <strong>Data:</strong> ___/___/20__</p>
      <p><strong>Aluno(a):</strong> __________________________________________</p>
    </div>
    <p>Leia atentamente as questões abaixo e responda com clareza.</p>
    <br/>
  `);

    // States AI Panel
    const [theme, setTheme] = useState("");
    const [difficulty, setDifficulty] = useState("Médio");
    const [quantity, setQuantity] = useState("3");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!theme.trim()) {
            toast.warning("Por favor, insira o tema da atividade.");
            return;
        }

        try {
            setIsGenerating(true);
            toast.info("A IA está elaborando as questões, aguarde...");

            const aiContent = await generateQuestions(theme, difficulty, parseInt(quantity));

            // Concatena no editor
            setContent((prev) => prev + "<br/>" + aiContent);

            toast.success("Questões geradas e inseridas no editor!");
        } catch (error: any) {
            toast.error(error.message || "Erro ao conectar com a IA.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        // Aqui conectaria com o Firestore para salvar o documento
        toast.success("Documento salvo com sucesso!");
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gerador de Atividades</h1>
                    <p className="text-slate-500 mt-1">Crie avaliações e exercícios com a ajuda do Gemini AI.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()} title="Imprimir">
                        Imprimir
                    </Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save size={16} /> Salvar Modelo
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Editor A4 Area (Esquerda/Centro) */}
                <div className="flex-1 bg-white border border-slate-200 rounded-md overflow-hidden relative shadow-sm">
                    <TipTapEditor
                        content={content}
                        onChange={setContent}
                        className="h-full border-0 rounded-none"
                    />
                </div>

                {/* AI Motor Panel (Direita) */}
                <div className="w-[350px] bg-white border border-slate-200 rounded-md flex flex-col shadow-sm shrink-0">
                    <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h2 className="font-semibold text-primary">Motor de IA</h2>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="theme">Tema da Atividade</Label>
                                <Input
                                    id="theme"
                                    placeholder="Ex: Frações e Decimais"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Nível de Dificuldade</Label>
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o nível" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Fácil">Fácil (Conceitual)</SelectItem>
                                        <SelectItem value="Médio">Médio (Aplicação)</SelectItem>
                                        <SelectItem value="Difícil">Difícil (Análise/Síntese)</SelectItem>
                                        <SelectItem value="ENEM">Padrão ENEM</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantidade de Questões</Label>
                                <Select value={quantity} onValueChange={setQuantity}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Qtd" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 questão</SelectItem>
                                        <SelectItem value="3">3 questões</SelectItem>
                                        <SelectItem value="5">5 questões</SelectItem>
                                        <SelectItem value="10">10 questões</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Gerando...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="h-4 w-4" /> Gerar Questões
                                    </>
                                )}
                            </Button>

                            <Separator />

                            <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                                <h3 className="text-xs font-semibold uppercase text-slate-500 mb-2">Dicas de Uso</h3>
                                <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                                    <li>Seja específico no tema para obter melhores resultados.</li>
                                    <li>Você pode gerar blocos de questões e elas aparecerão automaticamente no editor ao lado.</li>
                                    <li>Selecione um texto no editor e use as ferramentas do topo para formatar e gerar variações.</li>
                                </ul>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-3">Modelos de Cabeçalho</h3>
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                        onClick={() => setContent(`
                                            <div style="text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem;">
                                                <h2>ESCOLA MUNICIPAL PROFESSOR PLUS</h2>
                                                <p><strong>Disciplina:</strong> Matemática</p>
                                                <p><strong>Turma:</strong> ___________ <strong>Data:</strong> ___/___/20__</p>
                                                <p><strong>Aluno(a):</strong> __________________________________________</p>
                                                <p><strong>Valor:</strong> 10,0 pontos | <strong>Nota:</strong> _______</p>
                                            </div>
                                            <p>Leia atentamente as questões abaixo e responda com clareza.</p>
                                            <br/>
                                        ` + content)}
                                    >
                                        1. Padrão Oficial (Escola + Valor)
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                        onClick={() => setContent(`
                                            <div style="margin-bottom: 2rem; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 4px;">
                                                <h2 style="margin-top: 0;">Avaliação de Recuperação</h2>
                                                <p style="margin-bottom: 0;"><strong>Nome:</strong> ________________________________________ <strong>Data:</strong> ___/___/____</p>
                                            </div>
                                            <br/>
                                        ` + content)}
                                    >
                                        2. Simples (Caixa de Dados)
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
