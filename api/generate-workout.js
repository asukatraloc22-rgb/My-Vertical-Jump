/**
 * Vercel Serverless Function pour générer des workouts personnalisés avec l'IA Manus
 * Cette fonction s'exécute sur les serveurs de Vercel, pas sur votre ordinateur
 */

export default async function handler(req, res) {
  // Autoriser les requêtes CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Gérer les requêtes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Vérifier que c'est une requête POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { energy, time, needs, format } = req.body;

    // Validation des paramètres
    if (!needs || !needs.trim()) {
      return res.status(400).json({ error: 'Les besoins ne peuvent pas être vides' });
    }

    if (energy < 1 || energy > 10) {
      return res.status(400).json({ error: 'L\'énergie doit être entre 1 et 10' });
    }

    if (time < 15 || time > 180) {
      return res.status(400).json({ error: 'Le temps doit être entre 15 et 180 minutes' });
    }

    // Construire le prompt
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

    // Appeler l'API LLM Manus via fetch
    const apiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('OPENAI_API_KEY non configurée');
      return res.status(500).json({ error: 'Clé API non configurée sur le serveur' });
    }

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
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
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur API LLM:', errorData);
      return res.status(response.status).json({ error: `Erreur API: ${errorData.error?.message || 'Erreur inconnue'}` });
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: 'Pas de réponse de l\'API' });
    }

    let workoutContent = data.choices[0].message?.content;

    if (!workoutContent) {
      return res.status(500).json({ error: 'La réponse de l\'API est vide' });
    }

    // Nettoyer les marqueurs de formatage
    workoutContent = workoutContent.replace(/\*\*/g, '').replace(/\*/g, '');

    return res.status(200).json({
      success: true,
      workout: workoutContent,
      metadata: {
        energy,
        time,
        format,
        model: 'gpt-5-mini'
      }
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ 
      error: `Erreur lors de la génération: ${error.message}` 
    });
  }
}
