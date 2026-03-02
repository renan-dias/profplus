import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
});

export const generateQuestions = async (
    theme: string,
    difficulty: string,
    quantity: number
): Promise<string> => {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("Chave de API do Gemini não configurada.");
    }

    const prompt = `Você é um assistente educacional especializado na criação de atividades para alunos.
Aja como um professor experiente elaborando questões de prova.
Crie ${quantity} questão(ões) sobre o tema "${theme}" focadas no nível de dificuldade: ${difficulty}.

Formate a resposta em HTML limpo. Cada questão deve estar envolvida em uma tag <div> e numerada. Se for múltipla escolha, use listas (<ul> e <li>). Não adicione formatação markdown na resposta, retorne apenas o código HTML.

Exemplo de formato esperado:
<div>
  <p><strong>Questão 1:</strong> Qual é a capital do Brasil?</p>
  <ul style="list-style-type: none; padding-left: 0;">
    <li>a) São Paulo</li>
    <li>b) Rio de Janeiro</li>
    <li>c) Brasília</li>
    <li>d) Salvador</li>
  </ul>
</div>
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        // Remove qualquer formatação markdown se a API retornar (ex: ```html)
        let htmlContent = response.text || "";
        htmlContent = htmlContent.replace(/```html/gi, "").replace(/```/g, "").trim();

        return htmlContent;
    } catch (error) {
        console.error("Erro ao gerar conteúdo com Gemini:", error);
        throw error;
    }
};

export const generateVariation = async (selectedText: string): Promise<string> => {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("Chave de API do Gemini não configurada.");
    }

    const prompt = `Você é um professor criando uma avaliação.
Eu tenho a seguinte questão/texto:
"${selectedText}"

Por favor, crie uma **variação** desta questão. Ela deve cobrar o mesmo conceito/habilidade, mas com um contexto, valores ou formulação diferente.
Formate a resposta em HTML limpo, usando as mesmas tags e estilos da original (por exemplo, listas de múltipla escolha se a original tiver). Retorne APENAS o código HTML da nova questão.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        let htmlContent = response.text || "";
        htmlContent = htmlContent.replace(/```html/gi, "").replace(/```/g, "").trim();

        return htmlContent;
    } catch (error) {
        console.error("Erro ao gerar variação com Gemini:", error);
        throw error;
    }
};

export const analyzeGabarito = async (base64Image: string, expectedAnswersLength: number): Promise<string[]> => {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("Chave de API do Gemini não configurada.");
    }

    const prompt = `Atue como um sistema de reconhecimento ótico para correção de provas. 
Eu estou te enviando a foto de um gabarito preenchido por um aluno.
Existem ${expectedAnswersLength} questões. Analise a imagem e identifique a alternativa marcada em cada questão.
As alternativas geralmente são A, B, C, D ou E.

Retorne SOMENTE um array JSON simples com as alternativas marcadas, em ordem, da questão 1 à ${expectedAnswersLength}.
Exemplo exato do que você deve retornar (nada mais e nada menos):
["A", "C", "D", "E", "B"]

Se não conseguir ler uma das questões, coloque "Nulo" no lugar.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [
                {
                    inlineData: {
                        data: base64Image.split(',')[1],
                        mimeType: "image/jpeg"
                    }
                },
                prompt
            ],
        });

        let result = response.text || "";
        result = result.replace(/```json/gi, "").replace(/```/g, "").trim();

        try {
            return JSON.parse(result);
        } catch (e) {
            console.error("Falha ao fazer parse do JSON do Gemini", result);
            throw new Error("Formato de resposta inválido retornado pela IA.");
        }
    } catch (error) {
        console.error("Erro ao analisar gabarito com Gemini:", error);
        throw error;
    }
};
