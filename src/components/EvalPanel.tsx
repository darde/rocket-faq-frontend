import { useState } from 'react';
import { runRetrievalEval, runFullEval } from '../api/client';

export default function EvalPanel() {
  const [loading, setLoading] = useState(false);
  const [evalType, setEvalType] = useState<'retrieval' | 'full'>('retrieval');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data =
        evalType === 'retrieval' ? await runRetrievalEval(5) : await runFullEval();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">RAG Evaluation</h2>
        <p className="text-sm text-gray-500 mb-6">
          Run evaluation metrics against the test dataset to measure retrieval and
          generation quality.
        </p>

        <div className="flex gap-3 mb-6">
          <select
            value={evalType}
            onChange={(e) => setEvalType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="retrieval">Retrieval Metrics (Precision, Recall, MRR)</option>
            <option value="full">Full Evaluation (Retrieval + LLM-as-Judge)</option>
          </select>
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Running...' : 'Run Evaluation'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500 mt-3">
              {evalType === 'full'
                ? 'Running full evaluation (this may take a minute)...'
                : 'Running retrieval evaluation...'}
            </p>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-6">
            {results.aggregate && <AggregateMetrics data={results.aggregate} />}
            {results.retrieval_metrics && (
              <AggregateMetrics data={results.retrieval_metrics} />
            )}
            {results.overall_summary && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">Overall Summary</h3>
                <p className="text-sm text-green-700">
                  Average Judge Score:{' '}
                  <span className="font-bold">
                    {results.overall_summary.avg_judge_score}/5
                  </span>
                </p>
              </div>
            )}
            {results.results && <DetailedResults data={results.results} />}
            {results.judge_evaluations && (
              <JudgeResults data={results.judge_evaluations} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AggregateMetrics({ data }: { data: Record<string, any> }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Aggregate Metrics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{key}</p>
            <p className="text-lg font-bold text-gray-800">
              {typeof value === 'number' ? value.toFixed(4) : value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailedResults({ data }: { data: any[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Per-Query Results</h3>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700 font-medium">{item.query}</span>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {Object.entries(item.metrics).map(([k, v]) => (
                  <span key={k}>
                    {k}: <strong>{(v as number).toFixed(2)}</strong>
                  </span>
                ))}
              </div>
            </button>
            {expanded === i && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs space-y-2">
                <div>
                  <span className="font-medium text-gray-600">Retrieved: </span>
                  <span className="text-gray-500">
                    {item.retrieved_questions?.join(' | ')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Expected: </span>
                  <span className="text-gray-500">
                    {item.relevant_questions?.join(' | ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function JudgeResults({ data }: { data: any[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        LLM-as-Judge Evaluations
      </h3>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700 font-medium">{item.query}</span>
              {item.evaluation?.overall_score && (
                <span
                  className={`text-sm font-bold ${
                    item.evaluation.overall_score >= 4
                      ? 'text-green-600'
                      : item.evaluation.overall_score >= 3
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {item.evaluation.overall_score}/5
                </span>
              )}
            </button>
            {expanded === i && item.evaluation && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs space-y-2">
                {['relevance', 'correctness', 'completeness', 'faithfulness'].map(
                  (dim) =>
                    item.evaluation[dim] && (
                      <div key={dim} className="flex justify-between">
                        <span className="font-medium text-gray-600 capitalize">
                          {dim}: {item.evaluation[dim].score}/5
                        </span>
                        <span className="text-gray-500 max-w-[60%] text-right">
                          {item.evaluation[dim].reasoning}
                        </span>
                      </div>
                    ),
                )}
                {item.evaluation.summary && (
                  <p className="text-gray-600 pt-2 border-t border-gray-200">
                    {item.evaluation.summary}
                  </p>
                )}
                {item.answer && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-600">Answer: </span>
                    <span className="text-gray-500">{item.answer}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
