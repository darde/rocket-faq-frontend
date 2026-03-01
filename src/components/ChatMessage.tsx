import { useState } from 'react';
import type { SourceInfo } from '../api/client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceInfo[];
}

export default function ChatMessage({ role, content, sources }: ChatMessageProps) {
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
