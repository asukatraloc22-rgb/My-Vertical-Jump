export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { energy, time, needs, format } = req.body;
    const formatLabel = format === 'team' ? 'en équipe' : 'solo';
    const prompt = `Coach NBA d'élite. Workout basket pour un meneur de 1m78. 
    Énergie: ${energy}/10, Temps: ${time}min, Format: ${formatLabel}. 
    Besoins: ${needs}. 
    Structure: Échauffement, Bloc Principal, Finition. Vocabulaire pro.`;

    const apiBase = process.env.OPENAI_API_BASE || 'https://api.manus.im/api/llm-proxy/v1';
    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      } )
    });

    const data = await response.json();

    // Gestion précise de l'erreur si le modèle est refusé ou autre
    if (data.error) {
      return res.status(500).json({ error: `Erreur API Manus: ${data.error.message || data.error}` });
    }

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: 'Réponse vide de Manus' });
    }

    let workoutContent = data.choices[0].message.content;
    workoutContent = workoutContent.replace(/\\*\\*/g, '').replace(/\\*/g, '');

    return res.status(200).json({ success: true, workout: workoutContent });

  } catch (error) {
    return res.status(500).json({ error: `Erreur système: ${error.message}` });
  }
}
