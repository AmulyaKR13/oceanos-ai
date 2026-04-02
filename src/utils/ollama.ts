interface OllamaGenerateResponse {
  response?: string;
}

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'deepseek-r1:1.5b';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function intentPrompt(userPrompt: string): string {
  return [
    'You are an intent parser for a Karnataka pollution dashboard.',
    'Infer the user intent for querying local AQI and lake datasets.',
    'Return concise plain text with: category (aqi/lake/all), city, district, ranking intent, top N.',
    `User query: ${userPrompt}`,
  ].join('\n');
}

async function generateIntentWithGroq(userPrompt: string, apiKey: string, model: string): Promise<string> {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: 'You parse user intent for data dashboards and return compact plain text.',
        },
        {
          role: 'user',
          content: intentPrompt(userPrompt),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed (${response.status})`);
  }

  const data = (await response.json()) as GroqChatCompletionResponse;
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

async function generateIntentWithLocalOllama(userPrompt: string): Promise<string> {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: intentPrompt(userPrompt),
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed (${response.status})`);
  }

  const data = (await response.json()) as OllamaGenerateResponse;
  return data.response?.trim() ?? '';
}

export async function generateIntentWithOllama(userPrompt: string): Promise<string> {
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
  const groqModel = import.meta.env.VITE_GROQ_MODEL?.trim() || 'llama-3.1-8b-instant';

  if (groqApiKey) {
    try {
      return await generateIntentWithGroq(userPrompt, groqApiKey, groqModel);
    } catch {
      // Fallback to local model if Groq is unavailable.
      return generateIntentWithLocalOllama(userPrompt);
    }
  }

  return generateIntentWithLocalOllama(userPrompt);
}
