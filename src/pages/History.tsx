import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, History as HistoryIcon, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getUserSessions, getSessionMessages } from '../services/chatHistory';

interface Session {
  id: string;
  topic: string;
  level: string;
  interest: string;
  createdAt: any;
}

interface Message {
  id: string;
  role: string;
  content: string;
}

export const History: React.FC = () => {
  const { currentUser } = useStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loadingMsgs, setLoadingMsgs] = useState<string | null>(null);

  useEffect(() => {
    console.log("DEBUG currentUser on history page:", currentUser);
    if (!currentUser) return;
    getUserSessions(currentUser.uid)
      .then(data => setSessions(data as Session[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentUser]);

  const toggleSession = async (sessionId: string) => {
    if (expandedId === sessionId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(sessionId);
    if (!messages[sessionId]) {
      setLoadingMsgs(sessionId);
      const msgs = await getSessionMessages(sessionId);
      setMessages(prev => ({ ...prev, [sessionId]: msgs as Message[] }));
      setLoadingMsgs(null);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen p-6 md:p-8 mx-auto max-w-[900px]">
      {/* Header */}
      <header className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
        <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-400" />
        </Link>
        <HistoryIcon className="text-[#8a2be2]" size={28} />
        <div>
          <h1 className="text-xl font-bold text-white">My History</h1>
          <p className="text-xs text-gray-500">{currentUser?.email}</p>
        </div>
        <span className="ml-auto text-xs text-gray-500">{sessions.length} sessions</span>
      </header>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
          <span className="w-5 h-5 border-2 border-[#8a2be2] border-t-transparent rounded-full animate-spin" />
          Loading your history…
        </div>
      )}

      {/* Empty */}
      {!loading && sessions.length === 0 && (
        <div className="glass-panel p-12 text-center">
          <HistoryIcon size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No history yet</h2>
          <p className="text-gray-500 mb-6">Start explaining topics on the dashboard and they'll appear here.</p>
          <Link to="/" className="inline-block neon-button px-6 py-3 border border-[#8a2be2]">
            <span className="relative z-10 text-white">Go to Dashboard</span>
          </Link>
        </div>
      )}

      {/* Sessions list */}
      <div className="space-y-3">
        {sessions.map(session => (
          <div key={session.id} className="glass-panel overflow-hidden">
            {/* Session header */}
            <button
              onClick={() => toggleSession(session.id)}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm truncate">{session.topic}</div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#8a2be2]/20 text-[#8a2be2] border border-[#8a2be2]/30 font-bold">
                    {session.level}
                  </span>
                  <span className="text-xs text-gray-500">{session.interest}</span>
                  <span className="text-xs text-gray-600">{formatDate(session.createdAt)}</span>
                </div>
              </div>
              {expandedId === session.id
                ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
            </button>

            {/* Messages */}
            {expandedId === session.id && (
              <div className="border-t border-white/10 px-6 py-4 space-y-3 max-h-96 overflow-y-auto">
                {loadingMsgs === session.id && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
                    <span className="w-4 h-4 border-2 border-[#8a2be2] border-t-transparent rounded-full animate-spin" />
                    Loading messages…
                  </div>
                )}
                {(messages[session.id] || []).length === 0 && loadingMsgs !== session.id && (
                  <p className="text-gray-600 text-sm py-4">No messages saved for this session.</p>
                )}
                {(messages[session.id] || []).map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                      <div className="w-6 h-6 rounded-full bg-[#8a2be2]/30 border border-[#8a2be2]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MessageSquare size={10} className="text-[#8a2be2]" />
                      </div>
                    )}
                    <div
                      className="max-w-[80%] px-4 py-2.5 rounded-xl text-sm leading-relaxed"
                      style={{
                        background: msg.role === 'user' ? '#8a2be2' : 'rgba(255,255,255,0.05)',
                        color: msg.role === 'user' ? 'white' : '#d1d5db',
                        borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
