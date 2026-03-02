import { useState, useEffect } from 'react';
import {
  getStats,
  getGovernanceSummary,
  getAgentReports,
  getAgentReport,
  runAgent,
} from '../api/client';

interface StatsData {
  usage: {
    daily: {
      total_tokens: number;
      estimated_cost_usd: number;
      request_count: number;
      budget_limit: number;
    };
    monthly: {
      total_tokens: number;
      estimated_cost_usd: number;
      request_count: number;
    };
  };
  cache: {
    rag_cache_entries: number;
    rag_cache_max: number;
    embedding_cache_entries: number;
    embedding_cache_max: number;
  };
}

interface GovernanceData {
  total_queries: number;
  flagged_queries: {
    pii_detected: number;
    injection_detected: number;
    off_topic: number;
    blocked: number;
  };
  low_confidence_count: number;
  disclaimers_count: Record<string, number>;
  feedback_summary: { positive: number; negative: number; total: number };
  avg_source_score: number | null;
}

interface ReportEntry {
  filename: string;
  size_bytes: number;
}

interface AgentReport {
  agent_name: string;
  summary: string;
  findings: {
    category: string;
    severity: string;
    file_path: string;
    description: string;
    suggestion: string;
  }[];
  recommendations: string[];
}

type AgentType = 'review' | 'document' | 'tech-debt' | 'full';

export default function DashboardPanel() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [governance, setGovernance] = useState<GovernanceData | null>(null);
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentLoading, setAgentLoading] = useState<Record<AgentType, boolean>>({
    review: false,
    document: false,
    'tech-debt': false,
    full: false,
  });
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [reportDetail, setReportDetail] = useState<AgentReport | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, g, r] = await Promise.all([
        getStats(),
        getGovernanceSummary(),
        getAgentReports(),
      ]);
      setStats(s);
      setGovernance(g);
      setReports(r.reports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleRunAgent = async (type: AgentType) => {
    setAgentLoading((prev) => ({ ...prev, [type]: true }));
    try {
      await runAgent(type);
      const r = await getAgentReports();
      setReports(r.reports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Agent ${type} failed`);
    } finally {
      setAgentLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleExpandReport = async (filename: string) => {
    if (expandedReport === filename) {
      setExpandedReport(null);
      setReportDetail(null);
      return;
    }
    setExpandedReport(filename);
    setReportDetail(null);
    try {
      const detail = await getAgentReport(filename);
      setReportDetail(detail);
    } catch {
      setReportDetail(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 mt-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Refresh button */}
      <div className="flex justify-end">
        <button
          onClick={fetchAll}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Section 1: System Stats */}
      {stats && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">System Stats</h2>
          <p className="text-sm text-gray-500 mb-4">
            Token usage, costs, and cache status
          </p>

          <h3 className="text-sm font-semibold text-gray-700 mb-3">Token Usage</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <MetricBox label="Daily Tokens" value={stats.usage.daily.total_tokens.toLocaleString()} />
            <MetricBox label="Monthly Tokens" value={stats.usage.monthly.total_tokens.toLocaleString()} />
            <MetricBox
              label="Daily Cost"
              value={`$${stats.usage.daily.estimated_cost_usd.toFixed(4)}`}
            />
            <MetricBox label="Requests Today" value={stats.usage.daily.request_count.toString()} />
          </div>

          <h3 className="text-sm font-semibold text-gray-700 mb-3">Cache</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <MetricBox
              label="RAG Cache"
              value={`${stats.cache.rag_cache_entries} / ${stats.cache.rag_cache_max}`}
            />
            <MetricBox
              label="Embedding Cache"
              value={`${stats.cache.embedding_cache_entries} / ${stats.cache.embedding_cache_max}`}
            />
          </div>

          {stats.usage.daily.budget_limit > 0 && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Token Budget</h3>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (stats.usage.daily.total_tokens / stats.usage.daily.budget_limit) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.usage.daily.total_tokens.toLocaleString()} /{' '}
                {stats.usage.daily.budget_limit.toLocaleString()} tokens
              </p>
            </>
          )}
        </div>
      )}

      {/* Section 2: Governance */}
      {governance && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Governance</h2>
          <p className="text-sm text-gray-500 mb-4">
            Guardrail flags, feedback, and content safety
          </p>

          <h3 className="text-sm font-semibold text-gray-700 mb-3">Flagged Queries</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <MetricBox label="PII Detected" value={governance.flagged_queries.pii_detected.toString()} />
            <MetricBox label="Injection Detected" value={governance.flagged_queries.injection_detected.toString()} />
            <MetricBox label="Off-Topic" value={governance.flagged_queries.off_topic.toString()} />
            <MetricBox label="Blocked" value={governance.flagged_queries.blocked.toString()} />
          </div>

          <h3 className="text-sm font-semibold text-gray-700 mb-3">Feedback</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <MetricBox label="Positive" value={governance.feedback_summary.positive.toString()} />
            <MetricBox label="Negative" value={governance.feedback_summary.negative.toString()} />
            <MetricBox label="Total" value={governance.feedback_summary.total.toString()} />
            <MetricBox
              label="Avg Source Score"
              value={governance.avg_source_score != null ? governance.avg_source_score.toFixed(2) : 'N/A'}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricBox label="Low Confidence" value={governance.low_confidence_count.toString()} />
            {Object.entries(governance.disclaimers_count).map(([key, val]) => (
              <MetricBox key={key} label={`Disclaimer: ${key}`} value={val.toString()} />
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Agents */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Agents</h2>
        <p className="text-sm text-gray-500 mb-4">
          Run automated analysis agents and view saved reports
        </p>

        <div className="flex flex-wrap gap-3 mb-6">
          {([
            ['review', 'Code Review'],
            ['document', 'Documentation'],
            ['tech-debt', 'Tech Debt'],
            ['full', 'Full Analysis'],
          ] as [AgentType, string][]).map(([type, label]) => (
            <button
              key={type}
              onClick={() => handleRunAgent(type)}
              disabled={agentLoading[type]}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 disabled:opacity-40 transition-colors"
            >
              {agentLoading[type] ? `Running ${label}...` : `Run ${label}`}
            </button>
          ))}
        </div>

        {reports.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Saved Reports</h3>
            <div className="space-y-2">
              {reports.map((r) => (
                <div key={r.filename} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleExpandReport(r.filename)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-700 font-medium">{r.filename}</span>
                    <span className="text-xs text-gray-500">
                      {(r.size_bytes / 1024).toFixed(1)} KB
                    </span>
                  </button>
                  {expandedReport === r.filename && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs space-y-2">
                      {reportDetail ? (
                        <>
                          <p className="text-gray-700">
                            <span className="font-medium">Agent:</span>{' '}
                            {reportDetail.agent_name}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Summary:</span>{' '}
                            {reportDetail.summary}
                          </p>
                          {reportDetail.findings.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Findings ({reportDetail.findings.length}):
                              </span>
                              <ul className="mt-1 space-y-1">
                                {reportDetail.findings.slice(0, 5).map((f, i) => (
                                  <li key={i} className="text-gray-600">
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium mr-1 ${
                                        f.severity === 'critical' || f.severity === 'high'
                                          ? 'bg-red-100 text-red-700'
                                          : f.severity === 'medium'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-gray-100 text-gray-600'
                                      }`}
                                    >
                                      {f.severity}
                                    </span>
                                    {f.description}
                                  </li>
                                ))}
                                {reportDetail.findings.length > 5 && (
                                  <li className="text-gray-400">
                                    ...and {reportDetail.findings.length - 5} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                          {reportDetail.recommendations.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Recommendations:</span>
                              <ul className="mt-1 list-disc list-inside text-gray-600">
                                {reportDetail.recommendations.map((rec, i) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-400">Loading report...</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {reports.length === 0 && (
          <p className="text-sm text-gray-400">No reports yet. Run an agent to generate one.</p>
        )}
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
}
