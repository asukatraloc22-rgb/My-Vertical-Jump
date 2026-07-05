/**
 * Vercel Serverless Function pour générer des workouts personnalisés avec l'IA Manus
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { energy, time, needs, format } = req.body;

    const formatLabel = format === 'team' ? 'en équipe' : 'solo';
    const prompt = `Tu es un coach NBA d'élite spécialisé dans la préparation physique et le développement de jeunes talents. Je suis un meneur de 1m78 évoluant à Madagascar.

Paramètres de ma séance :
- Énergie actuelle : ${energy}/10
- Temps disponible : ${time} minutes
- Format : Workout ${formatLabel}
- Mes besoins/blocages : "${needs}"

Conçois ma séance sur-mesure avec :
1. Échauffement (5-10 min) - Mobilité et activation
2. Bloc Principal (${Math.max(15, time - 15)} min) - Exercices spécifiques à mes besoins
3. Finition (5 min) - Étirements et récupération

Utilise un vocabulaire basket professionnel. Format clair et lisible avec des sections bien délimitées. Sois concis mais précis.`;

    const apiBase = process.env.OPENAI_API_BASE || 'https://api.manus.im/api/llm-proxy/v1';
    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un coach NBA d\'élite. Génère des workouts détaillés, pratiques et adaptés aux besoins spécifiques.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      } )
    });

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: 'Pas de réponse de l\'API Manus' });
    }

    let workoutContent = data.choices[0].message?.content;
    workoutContent = workoutContent.replace(/\\*\\*/g, '').replace(/\\*/g, '');

    return res.status(200).json({
      success: true,
      workout: workoutContent
    });

  } catch (error) {
    return res.status(500).json({ error: `Erreur serveur: ${error.message}` });
  }
}
