import { useState } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import EvalPanel from './components/EvalPanel';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'eval'>('chat');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'chat' ? <ChatWindow /> : <EvalPanel />}
    </div>
  );
}

export default App;
