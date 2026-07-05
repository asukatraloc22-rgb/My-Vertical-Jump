#!/usr/bin/env python3
"""
Serveur proxy FastAPI pour l'intégration de l'API LLM Manus
Permet à l'application web vanilla d'accéder à l'API LLM interne
"""

import os
import json
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PG Flight AI Workout Generator")

# Configuration CORS pour permettre les requêtes depuis l'application web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialiser le client OpenAI (utilise les variables d'environnement pré-configurées)
logger.info("Initialisation du client OpenAI...")
try:
    client = OpenAI()
    logger.info("✅ Client OpenAI initialisé avec succès")
except Exception as e:
    logger.error(f"❌ Erreur lors de l'initialisation du client OpenAI: {e}")
    # Fallback pour les versions incompatibles
    try:
        import httpx
        client = OpenAI(http_client=httpx.Client())
        logger.info("✅ Client OpenAI initialisé avec fallback httpx")
    except Exception as fallback_error:
        logger.error(f"❌ Erreur fallback: {fallback_error}")
        client = None

class WorkoutRequest(BaseModel):
    """Modèle pour les requêtes de génération de workout"""
    energy: int
    time: int
    needs: str
    format: str = "solo"  # solo ou team

@app.get("/health")
async def health_check():
    """Endpoint de vérification de santé du serveur"""
    return {"status": "ok", "message": "API Workout Generator is running"}

@app.post("/generate-workout")
async def generate_workout(request: WorkoutRequest):
    """
    Génère un workout personnalisé basé sur les paramètres fournis
    """
    try:
        logger.info(f"Requête reçue: energy={request.energy}, time={request.time}, format={request.format}")
        
        # Validation des paramètres
        if not request.needs or not request.needs.strip():
            raise HTTPException(status_code=400, detail="Les besoins ne peuvent pas être vides")
        
        if request.energy < 1 or request.energy > 10:
            raise HTTPException(status_code=400, detail="L'énergie doit être entre 1 et 10")
        
        if request.time < 15 or request.time > 180:
            raise HTTPException(status_code=400, detail="Le temps doit être entre 15 et 180 minutes")
        
        if not client:
            raise Exception("Client OpenAI non initialisé")
        
        # Construire le prompt
        format_label = "en équipe" if request.format == "team" else "solo"
        prompt = f"""Tu es un coach NBA d'élite spécialisé dans la préparation physique et le développement de jeunes talents. Je suis un meneur de 1m78 évoluant à Madagascar.

Paramètres de ma séance :
- Énergie actuelle : {request.energy}/10
- Temps disponible : {request.time} minutes
- Format : Workout {format_label}
- Mes besoins/blocages : "{request.needs}"

Conçois ma séance sur-mesure avec :
1. Échauffement (5-10 min) - Mobilité et activation
2. Bloc Principal ({max(15, request.time - 15)} min) - Exercices spécifiques à mes besoins
3. Finition (5 min) - Étirements et récupération

Utilise un vocabulaire basket professionnel. Format clair et lisible avec des sections bien délimitées. Sois concis mais précis."""

        logger.info("Appel à l'API LLM...")
        
        # Appeler l'API LLM
        response = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un coach NBA d'élite. Génère des workouts détaillés, pratiques et adaptés aux besoins spécifiques."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7
        )

        logger.info(f"Réponse reçue: {response}")
        
        # Extraire le contenu de la réponse
        if not response:
            raise Exception("Réponse API vide")
        
        if not hasattr(response, 'choices') or not response.choices:
            raise Exception(f"Réponse API invalide: pas de choices. Réponse: {response}")
        
        first_choice = response.choices[0]
        if not hasattr(first_choice, 'message') or not first_choice.message:
            raise Exception(f"Réponse API invalide: pas de message. Choice: {first_choice}")
        
        workout_content = first_choice.message.content
        
        if not workout_content:
            raise Exception("Le contenu du message est vide")
        
        logger.info(f"Contenu du workout: {workout_content[:100]}...")
        
        # Nettoyer les marqueurs de formatage
        if isinstance(workout_content, str):
            workout_content = workout_content.replace("**", "").replace("*", "")
        else:
            workout_content = str(workout_content)
        
        logger.info("✅ Workout généré avec succès")
        
        return {
            "success": True,
            "workout": workout_content,
            "metadata": {
                "energy": request.energy,
                "time": request.time,
                "format": request.format,
                "model": "gpt-5-mini"
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur lors de la génération: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération : {str(e)}")

@app.get("/models")
async def list_models():
    """Liste les modèles LLM disponibles"""
    try:
        if not client:
            raise Exception("Client OpenAI non initialisé")
        
        models = client.models.list()
        return {
            "models": [{"id": m.id, "owned_by": m.owned_by} for m in models.data]
        }
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des modèles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des modèles : {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Démarrage du serveur sur le port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
