"use client";

import { useState, useRef } from "react";
import { Upload, FileCheck2, Camera, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeGabarito } from "@/services/ai";

export default function CorrectionPage() {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [correctionResult, setCorrectionResult] = useState<{ question: number, marked: string, correct: string, status: string }[] | null>(null);
    const [score, setScore] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock de gabarito correto (na vida real viria da prova gerada)
    const OFFICIAL_KEY = ["A", "C", "C", "D", "E"];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Imagem muito grande. Limite de 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setCorrectionResult(null);
                setScore(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePrintTemplate = () => {
        // Apenas imprime a seção do gabarito que está invisível, ou abre nova janela
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        let bubblesHtml = '';
        for (let i = 1; i <= 20; i++) {
            bubblesHtml += `
            <div style="display: flex; gap: 10px; margin-bottom: 8px; align-items: center;">
                <span style="font-weight: bold; width: 30px;">${i}.</span>
                <div style="border: 1px solid #000; border-radius: 50%; width: 20px; height: 20px; text-align: center; font-size: 12px; line-height: 20px;">A</div>
                <div style="border: 1px solid #000; border-radius: 50%; width: 20px; height: 20px; text-align: center; font-size: 12px; line-height: 20px;">B</div>
                <div style="border: 1px solid #000; border-radius: 50%; width: 20px; height: 20px; text-align: center; font-size: 12px; line-height: 20px;">C</div>
                <div style="border: 1px solid #000; border-radius: 50%; width: 20px; height: 20px; text-align: center; font-size: 12px; line-height: 20px;">D</div>
                <div style="border: 1px solid #000; border-radius: 50%; width: 20px; height: 20px; text-align: center; font-size: 12px; line-height: 20px;">E</div>
            </div>
        `;
        }

        printWindow.document.write(`
      <html>
        <head><title>Folha de Gabarito - ProfPlus</title></head>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>Folha de Respostas (Gabarito)</h2>
          <div style="text-align: left; margin: 30px 0;">
            <p><strong>Nome:</strong> __________________________________________</p>
            <p><strong>Data:</strong> ___/___/____ &nbsp;&nbsp;&nbsp; <strong>Turma:</strong> _______</p>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-start; margin-left: auto; margin-right: auto; max-width: 300px;">
            ${bubblesHtml}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    const handleAnalyze = async () => {
        if (!imagePreview) return;

        setIsAnalyzing(true);
        toast.info("A IA está analisando a imagem...");

        try {
            // Chama nosso serviço do Gemini Vision
            const markedAnswers = await analyzeGabarito(imagePreview, OFFICIAL_KEY.length);

            let hits = 0;
            const result = OFFICIAL_KEY.map((correctVal, index) => {
                const studentVal = markedAnswers[index] || "Nulo";
                const isCorrect = studentVal.toUpperCase() === correctVal.toUpperCase();
                if (isCorrect) hits++;

                return {
                    question: index + 1,
                    marked: studentVal,
                    correct: correctVal,
                    status: isCorrect ? "Correta" : "Incorreta"
                }
            });

            setCorrectionResult(result);
            setScore((hits / OFFICIAL_KEY.length) * 10);
            toast.success("Correção finalizada!");

        } catch (error) {
            toast.error("Erro ao analisar a imagem. Tente novamente.");
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Correção Instantânea</h1>
                    <p className="text-slate-500 mt-1">Imprima o gabarito e corrija provas com IA de Visão.</p>
                </div>
            </div>

            <Tabs defaultValue="correcao" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="correcao">Correção de Fotos</TabsTrigger>
                    <TabsTrigger value="gerador">Gerador de Folhas</TabsTrigger>
                </TabsList>

                <TabsContent value="correcao">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Enviar Imagem</CardTitle>
                                <CardDescription>
                                    Faça upload da foto do gabarito do aluno impresso para correção.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div
                                    className="border-2 border-dashed border-slate-300 rounded-lg p-10 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="max-h-[300px] object-contain rounded-md" />
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                                            <p className="text-sm font-medium text-slate-600">Clique para selecionar uma imagem</p>
                                            <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG até 5MB</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 gap-2"
                                        onClick={handleAnalyze}
                                        disabled={!imagePreview || isAnalyzing}
                                    >
                                        {isAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Analisando IA...</> : <><Play className="h-4 w-4" /> Iniciar Correção</>}
                                    </Button>
                                    <Button variant="outline" className="gap-2" disabled={true} title="Em breve">
                                        <Camera className="h-4 w-4" /> Tirar Foto (Webcam)
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Resultado da Análise</CardTitle>
                                <CardDescription>Nota e validação das questões processadas pela IA.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!correctionResult ? (
                                    <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
                                        Envie e analise uma imagem para ver os resultados.
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center">
                                            <h3 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-2">Nota Final Calculada</h3>
                                            <div className="text-5xl font-extrabold text-blue-600">
                                                {score?.toFixed(1)} <span className="text-2xl text-slate-400">/ 10.0</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-3">Detalhamento das Questões</h4>
                                            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                                                {correctionResult.map((res) => (
                                                    <div key={res.question} className={`flex justify-between items-center p-3 rounded-md border ${res.status === 'Correta' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold w-6">{res.question}.</span>
                                                            <span>Marcou: <strong>{res.marked}</strong></span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm">
                                                            <span className="text-slate-500">Gabarito: {res.correct}</span>
                                                            {res.status === 'Correta' ? (
                                                                <span className="text-green-600 font-medium">✓ Certo</span>
                                                            ) : (
                                                                <span className="text-red-600 font-medium">✗ Errado</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button className="w-full mt-4 gap-2" variant="default">
                                                <FileCheck2 className="h-4 w-4" />
                                                Salvar Nota do Aluno (Integração Turma)
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="gerador">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template de Folha de Respostas</CardTitle>
                            <CardDescription>
                                Imprima a folha padrão com "bolinhas" A-E para seus alunos preencherem. Nosso modelo foi desenhado para facilitar a leitura da Inteligência Artificial.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
                                <p className="text-sm text-slate-600 mb-2"><strong>Instruções de preenchimento para o aluno:</strong></p>
                                <ul className="text-sm text-slate-500 list-disc pl-5 space-y-1">
                                    <li>Preencha completamente a bolinha da alternativa correta.</li>
                                    <li>Use caneta esferográfica preta ou azul.</li>
                                    <li>Evite rasuras, pois podem confundir o leitor ótico da IA.</li>
                                </ul>
                            </div>
                            <Button onClick={handlePrintTemplate} className="gap-2">
                                <FileCheck2 className="h-4 w-4" /> Gerar PDF para Impressão
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
