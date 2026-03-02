export interface SourceInfo {
  id: string;
  score: number;
  section: string;
  subsection: string;
  question: string;
}

export interface GuardrailsInfo {
  input_pii_detected: boolean;
  injection_detected: boolean;
  off_topic: boolean;
  low_confidence: boolean;
  disclaimers_added: string[];
  blocked: boolean;
}

export interface ChatResponse {
  answer: string;
  sources: SourceInfo[];
  query: string;
  guardrails: GuardrailsInfo;
  request_id: string;
}

export interface JudgeEvaluation {
  relevance: { score: number; reasoning: string };
  correctness: { score: number; reasoning: string };
  completeness: { score: number; reasoning: string };
  faithfulness: { score: number; reasoning: string };
  overall_score: number;
  summary: string;
}

export interface JudgeResponse {
  question: string;
  answer: string;
  evaluation: JudgeEvaluation;
  sources: SourceInfo[];
}

function normalizeApiBase(rawBase: string): string {
  const trimmedBase = rawBase.trim().replace(/\/+$/, '');

  if (!trimmedBase) return '/api';
  if (trimmedBase === '/api' || trimmedBase.endsWith('/api')) return trimmedBase;

  return `${trimmedBase}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL || '/api');
const API_KEY = import.meta.env.VITE_API_KEY || '';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  return headers;
}

function checkResponseStatus(res: Response): void {
  if (res.status === 429) {
    throw new Error(
      'You are sending too many requests. Please wait a moment and try again.'
    );
  }
  if (res.status === 503) {
    throw new Error(
      'The service is temporarily unavailable due to usage limits. Please try again later.'
    );
  }
}

export async function sendMessage(question: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ question }),
  });
  checkResponseStatus(res);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function submitFeedback(
  requestId: string,
  rating: 'positive' | 'negative',
  comment?: string
): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/chat/feedback`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ request_id: requestId, rating, comment }),
  });
  checkResponseStatus(res);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function evaluateWithJudge(question: string): Promise<JudgeResponse> {
  const res = await fetch(`${API_BASE}/eval/judge`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ question }),
  });
  checkResponseStatus(res);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function runRetrievalEval(k: number = 5) {
  const res = await fetch(`${API_BASE}/eval/retrieval`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ k }),
  });
  checkResponseStatus(res);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function runFullEval() {
  const res = await fetch(`${API_BASE}/eval/full`, {
    method: 'POST',
    headers: getHeaders(),
  });
  checkResponseStatus(res);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
