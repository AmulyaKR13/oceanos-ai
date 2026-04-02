import { useMemo, useState } from 'react';

import type { PollutionRecord } from '../types/pollution';
import { generateIntentWithOllama } from '../utils/ollama';
import { extractIntent, filterRecordsByIntent, summarizeMetric } from '../utils/parser';

interface ChatbotProps {
  records: PollutionRecord[];
  onHighlightRecords: (recordIds: string[]) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  results?: PollutionRecord[];
  datasetSnapshot?: string;
}

const SUGGESTED_PROMPTS = [
  'Show AQI data for Bengaluru',
  'Which lakes are most polluted in Karnataka?',
  'Top 5 polluted locations in Mysuru',
];

export function Chatbot({ records, onHighlightRecords }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const hasRecords = records.length > 0;

  const placeholder = useMemo(
    () => (hasRecords ? 'Ask about AQI, lakes, districts, or cities...' : 'Load data first to chat with datasets...'),
    [hasRecords],
  );

  async function handleSend(rawPrompt: string) {
    const prompt = rawPrompt.trim();
    if (!prompt || loading || !hasRecords) {
      return;
    }

    setLoading(true);
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: prompt }]);

    try {
      const modelResponse = await generateIntentWithOllama(prompt);
      const intent = extractIntent(prompt, modelResponse, records);
      const matchedRecords = filterRecordsByIntent(records, intent);

      onHighlightRecords(matchedRecords.map((record) => record.id));

      const summary = matchedRecords.length === 0
        ? 'I parsed your request but found no matching records in the loaded dataset.'
        : `Found ${matchedRecords.length} matching records from your dataset. Highlighted these locations on the map.`;

      const assistantText = [
        summary,
        modelResponse ? `Intent notes: ${modelResponse}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const snapshotRows = matchedRecords
        .slice(0, 12)
        .map((record) => {
          const measurement = summarizeMetric(record);
          return `${record.name} | ${record.city} | ${record.district} | ${record.date} | ${measurement}`;
        });

      const datasetSnapshot = snapshotRows.length > 0
        ? ['Name | City | District | Date | Metric', ...snapshotRows].join('\n')
        : '';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: assistantText,
          results: matchedRecords.slice(0, 10),
          datasetSnapshot,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Could not process the request. If using Groq, verify VITE_GROQ_API_KEY. Otherwise ensure Ollama is running on http://localhost:11434 with deepseek-r1:1.5b.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel chatbot-panel">
      <div className="chatbot-header-row">
        <h2>Dataset Chatbot</h2>
        <button
          type="button"
          onClick={() => {
            onHighlightRecords([]);
            setMessages([]);
          }}
        >
          Clear
        </button>
      </div>

      <div className="chatbot-suggestions">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button key={prompt} type="button" onClick={() => void handleSend(prompt)} disabled={loading || !hasRecords}>
            {prompt}
          </button>
        ))}
      </div>

      <div className="chatbot-history">
        {messages.length === 0 ? (
          <p className="chatbot-empty">Ask a question and I will parse intent using DeepSeek, then query your local datasets.</p>
        ) : (
          messages.map((message, index) => (
            <article key={`${message.role}-${index}`} className={`chat-msg chat-msg-${message.role}`}>
              <p>{message.text}</p>
              {message.role === 'assistant' && message.results && message.results.length > 0 ? (
                <ul>
                  {message.results.map((record) => (
                    <li key={`${record.id}-chat`}>
                      <strong>{record.name}</strong> ({record.city}, {record.district}) - {summarizeMetric(record)} - {record.date}
                    </li>
                  ))}
                </ul>
              ) : null}
              {message.role === 'assistant' && message.datasetSnapshot ? (
                <pre className="chat-dataset-snapshot">{message.datasetSnapshot}</pre>
              ) : null}
            </article>
          ))
        )}
      </div>

      <form
        className="chatbot-form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend(input);
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={placeholder}
          disabled={loading || !hasRecords}
        />
        <button type="submit" disabled={loading || !hasRecords || input.trim().length === 0}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </section>
  );
}
