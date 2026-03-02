import { useState } from 'react';
import type { SourceInfo, GuardrailsInfo } from '../api/client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceInfo[];
  requestId?: string;
  guardrails?: GuardrailsInfo;
  feedback?: 'positive' | 'negative' | null;
  onFeedback?: (rating: 'positive' | 'negative') => void;
}

export default function ChatMessage({
  role,
  content,
  sources,
  requestId,
  guardrails,
  feedback,
  onFeedback,
}: ChatMessageProps) {
  const [showSources, setShowSources] = useState(false);
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center gap-2 mb-1">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              isUser ? 'bg-gray-200 text-gray-600' : 'bg-red-100 text-red-700'
            }`}
          >
            {isUser ? 'You' : 'RM'}
          </div>
          <span className="text-xs text-gray-400">
            {isUser ? 'You' : 'Rocket Mortgage Bot'}
          </span>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-red-600 text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>

        {/* Guardrail badges */}
        {!isUser && guardrails && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {guardrails.input_pii_detected && (
              <span className="inline-flex items-center text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
                Personal info detected and redacted
              </span>
            )}
            {guardrails.injection_detected && (
              <span className="inline-flex items-center text-xs text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                Potential prompt injection detected
              </span>
            )}
            {guardrails.low_confidence && (
              <span className="inline-flex items-center text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                Low confidence — verify with Rocket Mortgage
              </span>
            )}
            {guardrails.off_topic && (
              <span className="inline-flex items-center text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                Off-topic question redirected
              </span>
            )}
          </div>
        )}

        {/* Feedback buttons */}
        {!isUser && requestId && onFeedback && (
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => onFeedback('positive')}
              disabled={feedback !== null && feedback !== undefined}
              className={`p-1.5 rounded-lg transition-colors ${
                feedback === 'positive'
                  ? 'text-green-600 bg-green-50'
                  : feedback !== null && feedback !== undefined
                    ? 'text-gray-200 cursor-not-allowed'
                    : 'text-gray-300 hover:text-green-500 hover:bg-green-50'
              }`}
              title="Helpful"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"
                />
              </svg>
            </button>
            <button
              onClick={() => onFeedback('negative')}
              disabled={feedback !== null && feedback !== undefined}
              className={`p-1.5 rounded-lg transition-colors ${
                feedback === 'negative'
                  ? 'text-red-600 bg-red-50'
                  : feedback !== null && feedback !== undefined
                    ? 'text-gray-200 cursor-not-allowed'
                    : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
              }`}
              title="Not helpful"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"
                />
              </svg>
            </button>
            {feedback && (
              <span className="text-xs text-gray-400 ml-1">
                Thanks for your feedback
              </span>
            )}
          </div>
        )}

        {sources && sources.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowSources(!showSources)}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform ${showSources ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {sources.length} source{sources.length !== 1 ? 's' : ''} used
            </button>
            {showSources && (
              <div className="mt-2 space-y-1.5">
                {sources.map((src, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">
                        {src.section}
                        {src.subsection ? ` > ${src.subsection}` : ''}
                      </span>
                      <span className="text-gray-400 tabular-nums">
                        {(src.score * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <p className="text-gray-500 mt-0.5 truncate">{src.question}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
