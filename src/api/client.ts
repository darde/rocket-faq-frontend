export interface SourceInfo {
  id: string;
  score: number;
  section: string;
  subsection: string;
  question: string;
}

export interface ChatResponse {
  answer: string;
  sources: SourceInfo[];
  query: string;
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

export async function sendMessage(question: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function evaluateWithJudge(question: string): Promise<JudgeResponse> {
  const res = await fetch(`${API_BASE}/eval/judge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function runRetrievalEval(k: number = 5) {
  const res = await fetch(`${API_BASE}/eval/retrieval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ k }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function runFullEval() {
  const res = await fetch(`${API_BASE}/eval/full`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
