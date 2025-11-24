import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateB2BResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: `
          Você é o consultor virtual sênior da Muni Moldes, uma fábrica de moldes de silicone fundada em 2018.
          
          IDENTIDADE DA MARCA:
          - Tom de voz: Profissional, acolhedor, especialista e sofisticado.
          - Cores da marca (referência): Rosa (#DC96A0), Verde (#64968C).
          
          INFORMAÇÕES CHAVE:
          - Foco: B2B (Lojistas, Revendedores, Fábricas de Chocolate). Atende grandes pedidos.
          - Diferenciais: Silicone de platina (grau alimentício), alta precisão, durabilidade, design exclusivo.
          - Catálogo: Natal, Páscoa, Animais, Geek/Games, Flores.
          - Parceiros: Mencione 'lojaalinecandido.com.br' como exemplo de sucesso se perguntado sobre parceiros.
          
          OBJETIVO:
          - Responder dúvidas sobre personalização, atacado e qualidade do material.
          - NÃO fornecer preços finais (instruir a entrar em contato via formulário para cotação).
          - Incentivar o usuário a solicitar um orçamento formal.
          
          Responda de forma concisa, elegante e sempre direcione para o fechamento de negócios B2B.
        `,
        temperature: 0.7,
      },
    });

    return response.text || "Desculpe, não consegui processar sua solicitação no momento. Por favor, tente novamente ou use nosso formulário de contato.";
  } catch (error) {
    console.error("Error interacting with Gemini:", error);
    return "Ocorreu um erro ao conectar com o assistente. Por favor, verifique sua conexão ou tente mais tarde.";
  }
};