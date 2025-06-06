// /api/generate.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { script } = req.body;

  if (!script || script.trim().length < 10) {
    return res.status(400).json({ error: "Texto do vídeo é muito curto ou inválido." });
  }

  try {
    const prompt = `Você é um especialista em SEO para YouTube em língua portuguesa. Com base no seguinte conteúdo de vídeo:
"""
${script}
"""
Crie:
1. Um título otimizado, direto, com até 80 caracteres, usando palavras-chave e estilo chamativo.
2. Uma descrição com cerca de 600 caracteres, incluindo um resumo do vídeo, sugestões de links ou CTAs, e repita palavras-chave estrategicamente.
3. Uma lista com 30 tags relevantes e altamente pesquisadas, separadas por vírgulas, relacionadas ao conteúdo.

Formato da resposta em JSON com as chaves: title, description, tags.`;

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Você é um assistente de marketing especializado em vídeos para YouTube." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      })
    });

    const data = await completion.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) throw new Error("Resposta da IA vazia.");

    // Tenta extrair o JSON da resposta (pode estar em formato de texto)
    const result = JSON.parse(text.trim().replace(/^```json|```$/g, ""));

    res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao gerar conteúdo:", err);
    res.status(500).json({ error: "Erro ao gerar conteúdo." });
  }
}
