import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Users, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllSessions, getAllProfiles, getSessionMessages } from '../services/chatHistory';

interface Profile {
  id: string;
  email: string;
  role: string;
  createdAt: any;
}

interface Session {
  id: string;
  userId: string;
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

export const Admin: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'users'>('sessions');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loadingMsgs, setLoadingMsgs] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState('all');

  useEffect(() => {
    Promise.all([getAllSessions(), getAllProfiles()])
      .then(([s, p]) => {
        setSessions(s as Session[]);
        setProfiles(p as Profile[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSession = async (sessionId: string) => {
    if (expandedId === sessionId) { setExpandedId(null); return; }
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

  const getEmail = (userId: string) => profiles.find(p => p.id === userId)?.email || userId;

  const filteredSessions = filterUser === 'all'
    ? sessions
    : sessions.filter(s => s.userId === filterUser);

  const stats = [
    { label: 'Total Users', value: profiles.length, icon: Users },
    { label: 'Total Sessions', value: sessions.length, icon: MessageSquare },
    { label: 'Admins', value: profiles.filter(p => p.role === 'admin').length, icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8 mx-auto max-w-[1200px]">
      {/* Header */}
      <header className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
        <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-400" />
        </Link>
        <ShieldCheck className="text-[#8a2be2]" size={28} />
        <div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-xs text-gray-500">Full visibility across all users</p>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
          <span className="w-5 h-5 border-2 border-[#8a2be2] border-t-transparent rounded-full animate-spin" />
          Loading data…
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map(s => (
              <div key={s.label} className="glass-panel p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#8a2be2]/20 border border-[#8a2be2]/30 flex items-center justify-center">
                  <s.icon size={18} className="text-[#8a2be2]" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6 w-fit">
            {(['sessions', 'users'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-6 py-2.5 text-sm font-bold capitalize transition-all"
                style={{ background: activeTab === tab ? '#8a2be2' : 'transparent', color: activeTab === tab ? 'white' : '#9ca3af' }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Sessions tab */}
          {activeTab === 'sessions' && (
            <>
              {/* Filter by user */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Filter by user:</span>
                <select
                  value={filterUser}
                  onChange={e => setFilterUser(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2 outline-none"
                >
                  <option value="all">All users</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.email}</option>
                  ))}
                </select>
                <span className="text-xs text-gray-600">{filteredSessions.length} sessions</span>
              </div>

              <div className="space-y-3">
                {filteredSessions.map(session => (
                  <div key={session.id} className="glass-panel overflow-hidden">
                    <button onClick={() => toggleSession(session.id)}
                      className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm truncate">{session.topic}</div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#8a2be2]/20 text-[#8a2be2] border border-[#8a2be2]/30 font-bold">
                            {session.level}
                          </span>
                          <span className="text-xs text-gray-500">{session.interest}</span>
                          <span className="text-xs text-sky-400/70">{getEmail(session.userId)}</span>
                          <span className="text-xs text-gray-600">{formatDate(session.createdAt)}</span>
                        </div>
                      </div>
                      {expandedId === session.id
                        ? <ChevronUp size={16} className="text-gray-400" />
                        : <ChevronDown size={16} className="text-gray-400" />}
                    </button>

                    {expandedId === session.id && (
                      <div className="border-t border-white/10 px-6 py-4 space-y-3 max-h-80 overflow-y-auto">
                        {loadingMsgs === session.id && (
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span className="w-4 h-4 border-2 border-[#8a2be2] border-t-transparent rounded-full animate-spin" />
                            Loading…
                          </div>
                        )}
                        {(messages[session.id] || []).map((msg, i) => (
                          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[80%] px-4 py-2.5 rounded-xl text-sm leading-relaxed"
                              style={{
                                background: msg.role === 'user' ? '#8a2be2' : 'rgba(255,255,255,0.05)',
                                color: msg.role === 'user' ? 'white' : '#d1d5db',
                              }}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Users tab */}
          {activeTab === 'users' && (
            <div className="glass-panel overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Sessions</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(profile => (
                    <tr key={profile.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3 text-white font-medium">{profile.email}</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          profile.role === 'admin'
                            ? 'bg-[#8a2be2]/20 text-[#8a2be2] border-[#8a2be2]/30'
                            : 'bg-white/5 text-gray-400 border-white/10'
                        }`}>
                          {profile.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-400">
                        {sessions.filter(s => s.userId === profile.id).length}
                      </td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(profile.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
