const axios = require('axios');

const GROK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROK_MODEL = 'llama-3.3-70b-versatile';

// Contexte système global pour que Grok comprenne la plateforme
const SYSTEM_CONTEXT = `Tu es l'assistant IA officiel de la plateforme EventTrust GN, une plateforme SaaS institutionnelle guinéenne dédiée à la gestion d'événements officiels (concours, soutenances, formations, conférences, etc.).

Tu es un expert en :
- Rédaction professionnelle et institutionnelle (français formel et adapté au contexte guinéen)
- Organisation et gestion d'événements
- Communication institutionnelle et marketing événementiel
- Analyse de données et statistiques
- Conseils stratégiques pour les institutions (universités, ONG, ministères, entreprises)
- Optimisation de processus administratifs

Tes réponses doivent être :
- Professionnelles mais accessibles
- Adaptées au contexte guinéen et ouest-africain
- Concrètes et actionnables
- En français

Tu as accès aux données de la plateforme quand elles te sont fournies dans le contexte de la requête.`;

const callGrokAPI = async (userPrompt, contextData = null, options = {}) => {
  const apiKey = process.env.GROK_API_KEY;
  
  if (!apiKey || apiKey === 'votre_cle_grok_ici') {
    // Mode simulation pour le développement
    console.log('[SIMULATION GROK] Prompt reçu :', userPrompt.substring(0, 100) + '...');
    return {
      success: true,
      simulated: true,
      response: `[MODE SIMULATION] Grok AI n'est pas encore configuré. Ajoutez votre clé API dans le fichier .env (GROK_API_KEY). Votre requête était : "${userPrompt.substring(0, 200)}..."`,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    };
  }

  try {
    // Construire les messages
    const messages = [
      { role: 'system', content: SYSTEM_CONTEXT }
    ];

    // Si des données contextuelles sont fournies (stats, événements, etc.)
    if (contextData) {
      messages.push({
        role: 'system',
        content: `Données contextuelles de la plateforme pour cette requête :\n${JSON.stringify(contextData, null, 2)}`
      });
    }

    messages.push({ role: 'user', content: userPrompt });

    const response = await axios.post(GROK_API_URL, {
      model: options.model || GROK_MODEL,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 secondes max
    });

    return {
      success: true,
      simulated: false,
      response: response.data.choices[0].message.content,
      usage: response.data.usage
    };

  } catch (error) {
    console.error('[GROK API ERROR]', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      throw new Error("Limite d'appels IA atteinte. Veuillez réessayer dans quelques minutes.");
    }
    
    throw new Error("Erreur de communication avec l'assistant IA : " + (error.response?.data?.error?.message || error.message));
  }
};

module.exports = { callGrokAPI, SYSTEM_CONTEXT };
