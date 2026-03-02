import { useState } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import EvalPanel from './components/EvalPanel';
import DashboardPanel from './components/DashboardPanel';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'eval' | 'dashboard'>('chat');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'chat' && <ChatWindow />}
      {activeTab === 'eval' && <EvalPanel />}
      {activeTab === 'dashboard' && <DashboardPanel />}
    </div>
  );
}

export default App;
