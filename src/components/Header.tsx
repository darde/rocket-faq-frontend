interface HeaderProps {
  activeTab: 'chat' | 'eval' | 'dashboard';
  onTabChange: (tab: 'chat' | 'eval' | 'dashboard') => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="/"
            aria-label="Go to homepage"
            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center"
          >
            <svg
              className="w-6 h-6 text-red-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </a>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Rocket Mortgage</h1>
            <p className="text-red-200 text-xs">FAQ Assistant</p>
          </div>
        </div>

        <nav className="flex gap-1 bg-red-800/40 rounded-lg p-1">
          <button
            onClick={() => onTabChange('chat')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-white text-red-700'
                : 'text-red-100 hover:bg-red-800/40'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => onTabChange('eval')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'eval'
                ? 'bg-white text-red-700'
                : 'text-red-100 hover:bg-red-800/40'
            }`}
          >
            Evaluation
          </button>
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-white text-red-700'
                : 'text-red-100 hover:bg-red-800/40'
            }`}
          >
            Dashboard
          </button>
        </nav>
      </div>
    </header>
  );
}
