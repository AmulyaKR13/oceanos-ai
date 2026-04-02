interface OllamaGenerateResponse {
  response?: string;
}

interface OllamaStreamChunk {
  response?: string;
  done?: boolean;
}

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface GroqStreamChunk {
  choices?: Array<{
    delta?: {
      content?: string;
    };
    finish_reason?: string | null;
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

function parseJsonLines(
  chunkText: string,
  carry: string,
  onLine: (line: string) => void,
): string {
  const combined = carry + chunkText;
  const lines = combined.split('\n');
  const remainder = lines.pop() ?? '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length > 0) {
      onLine(line);
    }
  }

  return remainder;
}

async function readGroqStream(response: Response, onChunk?: (chunk: string) => void): Promise<string> {
  if (!response.body) {
    throw new Error('Groq stream body is not available');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let output = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const eventText of events) {
      const lines = eventText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('data:'));

      for (const line of lines) {
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') {
          continue;
        }

        const parsed = JSON.parse(payload) as GroqStreamChunk;
        const delta = parsed.choices?.[0]?.delta?.content ?? '';
        if (!delta) {
          continue;
        }

        output += delta;
        onChunk?.(delta);
      }
    }
  }

  return output.trim();
}

async function readOllamaStream(response: Response, onChunk?: (chunk: string) => void): Promise<string> {
  if (!response.body) {
    throw new Error('Ollama stream body is not available');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let carry = '';
  let output = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    const chunkText = decoder.decode(value, { stream: true });
    carry = parseJsonLines(chunkText, carry, (line) => {
      const parsed = JSON.parse(line) as OllamaStreamChunk;
      const delta = parsed.response ?? '';
      if (!delta) {
        return;
      }

      output += delta;
      onChunk?.(delta);
    });
  }

  if (carry.trim()) {
    const parsed = JSON.parse(carry.trim()) as OllamaStreamChunk;
    const delta = parsed.response ?? '';
    if (delta) {
      output += delta;
      onChunk?.(delta);
    }
  }

  return output.trim();
}

async function generateIntentWithGroq(
  userPrompt: string,
  apiKey: string,
  model: string,
  onChunk?: (chunk: string) => void,
): Promise<string> {
  const useStream = typeof onChunk === 'function';
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      stream: useStream,
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

  if (useStream) {
    return readGroqStream(response, onChunk);
  }

  const data = (await response.json()) as GroqChatCompletionResponse;
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

async function generateIntentWithLocalOllama(userPrompt: string, onChunk?: (chunk: string) => void): Promise<string> {
  const useStream = typeof onChunk === 'function';
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: intentPrompt(userPrompt),
      stream: useStream,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed (${response.status})`);
  }

  if (useStream) {
    return readOllamaStream(response, onChunk);
  }

  const data = (await response.json()) as OllamaGenerateResponse;
  return data.response?.trim() ?? '';
}

export async function generateIntentWithOllama(userPrompt: string, onChunk?: (chunk: string) => void): Promise<string> {
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
  const groqModel = import.meta.env.VITE_GROQ_MODEL?.trim() || 'llama-3.1-8b-instant';

  if (groqApiKey) {
    try {
      return await generateIntentWithGroq(userPrompt, groqApiKey, groqModel, onChunk);
    } catch {
      // Fallback to local model if Groq is unavailable.
      return generateIntentWithLocalOllama(userPrompt, onChunk);
    }
  }

  return generateIntentWithLocalOllama(userPrompt, onChunk);
}
