export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  const { script } = req.body;

  if (!script || script.trim().length < 10) {
    return res.status(400).json({ error: "Texto do vídeo é muito curto ou inválido." });
  }

  try {
    const prompt = `
Você é um assistente de IA especializado em YouTube SEO. Baseado no texto a seguir, gere os seguintes elementos otimizados para vídeos em português no YouTube:

1. Um título impactante de até 80 caracteres.
2. Uma descrição envolvente e informativa com cerca de 600 caracteres. Inclua CTAs e links sugeridos (fictícios) no final.
3. Uma lista com 30 tags relevantes, separadas por vírgulas, que ajudem o vídeo a ser encontrado por quem busca pelo tema.

Texto-base do vídeo:
${script}

Retorne no seguinte formato JSON:
{
  "title": "...",
  "description": "...",
  "tags": "tag1, tag2, tag3, ..."
}
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${process.env.OPENAI_API_KEY}\`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: "Erro ao gerar conteúdo." });
    }

    const json = JSON.parse(content);
    res.status(200).json(json);

  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar conteúdo." });
  }
}