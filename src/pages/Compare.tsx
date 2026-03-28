import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LayoutTemplate, ArrowLeft, Zap, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Internal helpers (uses same SDK + same model as your gemini.ts) ──────────

async function streamPrompt(
  prompt: string,
  onChunk: (fullText: string) => void
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('No VITE_GEMINI_API_KEY found in .env.local');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContentStream(prompt);
  let full = '';
  for await (const chunk of result.stream) {
    full += chunk.text();
    onChunk(full);
  }
  return full;
}

async function generatePrompt(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('No VITE_GEMINI_API_KEY found in .env.local');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PanelState {
  text: string;
  streaming: boolean;
  done: boolean;
  keywords: string[];
  analogies: string[];
}

interface DeltaInsight {
  vocabulary: string;
  analogyType: string;
  sentenceLength: string;
  depth: string;
  jargon: string;
}

const EMPTY_PANEL: PanelState = { text: '', streaming: false, done: false, keywords: [], analogies: [] };

// ─── Prompts ──────────────────────────────────────────────────────────────────

const buildChildPrompt = (topic: string) =>
  `Explain "${topic}" to a 7-year-old child.
Rules:
- Use ONLY words a child knows (absolutely no jargon)
- Use ONE simple analogy from everyday life (toys, food, games, family)
- Keep every sentence under 10 words
- Max 120 words total. Be warm, fun, encouraging.
- End with one "wow fact" they will tell their friends

Format exactly like this:
**The simple idea:** [1 sentence]
**Think of it like:** [analogy]
**How it works:**
- [point, max 8 words]
- [point, max 8 words]
- [point, max 8 words]
**Wow fact:** [1 fun sentence]`;

const buildExpertPrompt = (topic: string) =>
  `Explain "${topic}" to a domain expert or graduate-level researcher.
Rules:
- Use precise technical terminology freely
- Reference underlying mechanisms, edge cases, and nuances
- Include mathematical or formal relationships where relevant
- Assume deep familiarity with adjacent concepts
- 250-300 words, rigorous and dense

Format exactly like this:
**Core mechanism:** [technical definition and underlying principle]
**Key relationships:** [how it interacts with other concepts]
**Nuances & edge cases:** [what most people oversimplify]
**Current frontiers:** [open questions or active research]
**Formal note:** [equations, notations, or formal definitions if applicable]`;

const buildAnalysisPrompt = (topic: string) =>
  `For the concept "${topic}", return ONLY a valid JSON object. No markdown, no code blocks, nothing else:
{"childAnalogies":["analogy1","analogy2","analogy3"],"expertAnalogies":["technical comparison1","technical comparison2"],"childKeywords":["simple word1","simple word2","simple word3","simple word4","simple word5"],"expertKeywords":["technical term1","technical term2","technical term3","technical term4","technical term5"],"delta":{"vocabulary":"one sentence on how vocabulary shifts","analogyType":"one sentence on how analogy types shift","sentenceLength":"one sentence on sentence structure shift","depth":"one sentence on depth and abstraction shift","jargon":"one sentence on jargon usage shift"}}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function complexityScore(text: string): number {
  if (!text.trim()) return 0;
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3);
  if (!words.length || !sentences.length) return 0;
  const avgWordLen = words.reduce((s, w) => s + w.replace(/[^a-z]/gi, '').length, 0) / words.length;
  const avgSentLen = words.length / sentences.length;
  return Math.max(0, Math.round(Math.min(100, ((avgWordLen - 3) / 5) * 100) * 0.6 + Math.min(100, ((avgSentLen - 5) / 20) * 100) * 0.4));
}

function wordCount(text: string) { return text.split(/\s+/).filter(Boolean).length; }

function readingTime(text: string) {
  const secs = Math.ceil((wordCount(text) / 200) * 60);
  const m = Math.floor(secs / 60), s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function extractLines(text: string) { return text.split('\n').map(l => l.trim()).filter(Boolean); }

// ─── FormattedText ────────────────────────────────────────────────────────────

function FormattedText({ lines, accentColor, streaming }: { lines: string[]; accentColor: string; streaming: boolean }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed text-gray-300">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.includes(':**')) {
          const idx = line.indexOf(':**');
          const head = line.slice(2, idx);
          const rest = line.slice(idx + 3).replace(/\*\*/g, '');
          return (
            <div key={i} className="mt-3 first:mt-0">
              <span className="font-bold" style={{ color: accentColor }}>{head}: </span>
              <span className="text-gray-300">{rest}</span>
            </div>
          );
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <div key={i} className="font-bold mt-4 first:mt-0" style={{ color: accentColor }}>{line.replace(/\*\*/g, '')}</div>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={i} className="flex gap-2 ml-3">
              <span style={{ color: accentColor, flexShrink: 0 }}>◆</span>
              <span>{line.replace(/^[-•]\s*/, '')}</span>
            </div>
          );
        }
        return <p key={i} className={i === lines.length - 1 && streaming ? 'after:content-["▌"] after:animate-pulse' : ''}>{line}</p>;
      })}
    </div>
  );
}

// ─── KeywordHighlighter ───────────────────────────────────────────────────────

function KeywordHighlighter({ text, keywords, accentColor, streaming }: { text: string; keywords: string[]; accentColor: string; streaming: boolean }) {
  if (!keywords.length) return <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">{text}</p>;
  const regex = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <p className={`text-sm leading-relaxed text-gray-300 whitespace-pre-wrap ${streaming ? 'after:content-["▌"] after:animate-pulse' : ''}`}>
      {parts.map((part, i) =>
        keywords.some(kw => kw.toLowerCase() === part.toLowerCase())
          ? <mark key={i} className="rounded px-0.5 font-bold not-italic" style={{ background: accentColor + '33', color: accentColor, borderBottom: `2px solid ${accentColor}` }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </p>
  );
}

// ─── PanelCard ────────────────────────────────────────────────────────────────

function PanelCard({ emoji, label, sublabel, accentColor, state, highlight, onHighlightToggle }: {
  emoji: string; label: string; sublabel: string; accentColor: string;
  state: PanelState; highlight: boolean; onHighlightToggle: () => void;
}) {
  return (
    <div className="glass-panel overflow-hidden flex flex-col" style={{ minHeight: 420 }}>
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between" style={{ background: accentColor + '18' }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <div className="font-bold text-white text-sm">{label}</div>
            <div className="text-xs text-gray-500">{sublabel}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {state.streaming && (
            <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: accentColor }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accentColor }} /> Live
            </span>
          )}
          {state.done && state.keywords.length > 0 && (
            <button onClick={onHighlightToggle}
              className="text-xs font-bold px-3 py-1 rounded-full border transition-all"
              style={{ borderColor: accentColor + '60', color: highlight ? accentColor : '#9ca3af', background: highlight ? accentColor + '22' : 'transparent' }}>
              ✦ {highlight ? 'Highlighting' : 'Highlight'}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 p-5 overflow-y-auto" style={{ maxHeight: 500 }}>
        {!state.text && state.streaming && (
          <div className="flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: accentColor, borderTopColor: 'transparent' }} />
            <span className="text-sm">Generating…</span>
          </div>
        )}
        {state.text && (
          highlight && state.keywords.length > 0
            ? <KeywordHighlighter text={state.text} keywords={state.keywords} accentColor={accentColor} streaming={state.streaming} />
            : <FormattedText lines={extractLines(state.text)} accentColor={accentColor} streaming={state.streaming} />
        )}
      </div>
      {state.done && state.keywords.length > 0 && (
        <div className="px-5 py-3 border-t border-white/10 flex flex-wrap gap-2" style={{ background: accentColor + '08' }}>
          {state.keywords.map(kw => (
            <span key={kw} className="text-xs font-bold px-2.5 py-1 rounded-full border"
              style={{ borderColor: accentColor + '40', background: accentColor + '18', color: accentColor }}>{kw}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── LinguisticStats ─────────────────────────────────────────────────────────

function LinguisticStats({ childText, expertText }: { childText: string; expertText: string }) {
  function s(text: string) {
    const words = text.split(/\s+/).filter(Boolean);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3);
    const avgWordLen = words.length ? +(words.reduce((s, w) => s + w.replace(/[^a-z]/gi, '').length, 0) / words.length).toFixed(1) : 0;
    const unique = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''))).size;
    return { words: words.length, sentences: sentences.length, avgWordLen, avgSentLen: sentences.length ? Math.round(words.length / sentences.length) : 0, uniqueRatio: words.length ? Math.round((unique / words.length) * 100) : 0 };
  }
  const cs = s(childText), es = s(expertText);
  const rows = [
    { icon: '📝', label: 'Word count', c: cs.words, e: es.words, unit: '' },
    { icon: '💬', label: 'Sentences', c: cs.sentences, e: es.sentences, unit: '' },
    { icon: '🔡', label: 'Avg word length', c: cs.avgWordLen, e: es.avgWordLen, unit: ' chars' },
    { icon: '📏', label: 'Avg sentence length', c: cs.avgSentLen, e: es.avgSentLen, unit: ' words' },
    { icon: '🎲', label: 'Vocabulary diversity', c: cs.uniqueRatio, e: es.uniqueRatio, unit: '%' },
  ];
  return (
    <div className="space-y-1">
      {rows.map(row => (
        <div key={row.label} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
          <span className="text-sm w-5 flex-shrink-0">{row.icon}</span>
          <span className="text-sm text-gray-400 flex-1">{row.label}</span>
          <span className="font-bold text-sky-400 text-sm min-w-[64px] text-right">{row.c}{row.unit}</span>
          <span className="text-gray-600 text-xs">vs</span>
          <span className="font-bold text-[#8a2be2] text-sm min-w-[64px]">{row.e}{row.unit}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const Compare: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [child, setChild] = useState<PanelState>(EMPTY_PANEL);
  const [expert, setExpert] = useState<PanelState>(EMPTY_PANEL);
  const [delta, setDelta] = useState<DeltaInsight | null>(null);
  const [childAnalogies, setChildAnalogies] = useState<string[]>([]);
  const [expertAnalogies, setExpertAnalogies] = useState<string[]>([]);
  const [childHighlight, setChildHighlight] = useState(false);
  const [expertHighlight, setExpertHighlight] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setChild(EMPTY_PANEL); setExpert(EMPTY_PANEL);
    setDelta(null); setChildAnalogies([]); setExpertAnalogies([]);
    setChildHighlight(false); setExpertHighlight(false);
    setSubmitted(false); setError('');
  };

  const run = useCallback(async () => {
    const t = topic.trim();
    if (!t) return;
    reset();
    setSubmitted(true);

    const childStream = streamPrompt(buildChildPrompt(t), chunk => setChild(p => ({ ...p, text: chunk, streaming: true })))
      .then(() => setChild(p => ({ ...p, streaming: false, done: true })))
      .catch(err => setError(err.message));

    const expertStream = streamPrompt(buildExpertPrompt(t), chunk => setExpert(p => ({ ...p, text: chunk, streaming: true })))
      .then(() => setExpert(p => ({ ...p, streaming: false, done: true })))
      .catch(err => setError(err.message));

    setAnalysisLoading(true);
    const analysis = generatePrompt(buildAnalysisPrompt(t))
      .then(raw => {
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
        setChild(p => ({ ...p, keywords: parsed.childKeywords || [] }));
        setExpert(p => ({ ...p, keywords: parsed.expertKeywords || [] }));
        setChildAnalogies(parsed.childAnalogies || []);
        setExpertAnalogies(parsed.expertAnalogies || []);
        setDelta(parsed.delta || null);
      })
      .catch(() => {})
      .finally(() => setAnalysisLoading(false));

    await Promise.allSettled([childStream, expertStream, analysis]);
  }, [topic]);

  const bothDone = child.done && expert.done;
  const eitherStreaming = child.streaming || expert.streaming;
  const EXAMPLES = ['Black holes', 'Compound interest', 'Machine learning', 'DNA replication', 'Encryption', 'Quantum computing'];

  return (
    <div className="min-h-screen p-6 md:p-8 flex flex-col mx-auto max-w-[1600px]">

      {/* ── Header — original preserved exactly ── */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <LayoutTemplate className="text-[#8a2be2]" size={32} />
          <h1 className="text-xl font-bold tracking-tight text-white">Compare Modes</h1>
          <span className="ml-4 text-xs font-bold px-3 py-1 bg-[#8a2be2]/20 text-[#8a2be2] rounded-full border border-[#8a2be2]/50 tracking-widest">
            PRO FEATURE
          </span>
        </div>
        {submitted && (
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-sm">
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </header>

      {error && (
        <div className="mb-4 px-5 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-sm">⚠️ {error}</div>
      )}

      {/* ── Input ── */}
      <div className="glass-panel p-6 mb-6">
        <p className="text-gray-400 text-sm mb-4">
          Enter any topic to stream a <span className="text-sky-400 font-bold">Child</span> and{' '}
          <span className="text-[#8a2be2] font-bold">Expert</span> explanation simultaneously — then see the AI break down what changed.
        </p>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text" value={topic} onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !eitherStreaming && run()}
            placeholder="e.g. Quantum entanglement, Compound interest, Photosynthesis…"
            className="flex-1 min-w-64 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#8a2be2]/60 transition-all"
          />
          <button onClick={run} disabled={!topic.trim() || eitherStreaming}
            className="neon-button flex items-center gap-2 px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed">
            <Zap size={16} />
            <span className="relative z-10 text-white font-bold text-sm">{eitherStreaming ? 'Streaming…' : 'Compare Now'}</span>
          </button>
        </div>
        {!submitted && (
          <div className="flex flex-wrap gap-2 mt-4">
            {EXAMPLES.map(ex => (
              <button key={ex} onClick={() => { setTopic(ex); setTimeout(run, 50); }}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-[#8a2be2]/50 hover:bg-[#8a2be2]/10 transition-all">
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

            {/* Complexity meters */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Child complexity', emoji: '🧒', color: '#38bdf8', score: complexityScore(child.text), streaming: child.streaming },
                { label: 'Expert complexity', emoji: '🎓', color: '#8a2be2', score: complexityScore(expert.text), streaming: expert.streaming },
              ].map(m => (
                <div key={m.label} className="glass-panel p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{m.emoji}</span>
                      <span className="text-xs font-bold text-white">{m.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: m.color }}>{m.score}/100</span>
                      {m.streaming && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: m.color }} />}
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: m.color }}
                      initial={{ width: '0%' }} animate={{ width: `${m.score}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Side-by-side panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <PanelCard emoji="🧒" label="Child" sublabel="Simple words · Everyday analogies"
                accentColor="#38bdf8" state={child} highlight={childHighlight} onHighlightToggle={() => setChildHighlight(h => !h)} />
              <PanelCard emoji="🎓" label="Expert" sublabel="Technical precision · Domain jargon"
                accentColor="#8a2be2" state={expert} highlight={expertHighlight} onHighlightToggle={() => setExpertHighlight(h => !h)} />
            </div>

            {/* Reading time */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Child explanation', text: child.text, color: '#38bdf8' },
                { label: 'Expert explanation', text: expert.text, color: '#8a2be2' },
              ].map(r => (
                <div key={r.label} className="glass-panel px-5 py-3 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="text-xs text-gray-500">{r.label}</div>
                    <div className="text-xs font-bold text-gray-300">{wordCount(r.text)} words · {readingTime(r.text)}</div>
                  </div>
                  <div className="flex-1 h-2 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: r.color }}
                      initial={{ width: '0%' }} animate={{ width: `${Math.min(100, (wordCount(r.text) / 350) * 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Linguistic stats */}
            {bothDone && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass-panel mb-4 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2"><span>📊</span><span className="font-bold text-white text-sm">Linguistic Statistics</span></div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-sky-400">Child</span><span className="text-gray-600">vs</span><span className="text-[#8a2be2]">Expert</span>
                  </div>
                </div>
                <div className="p-5"><LinguisticStats childText={child.text} expertText={expert.text} /></div>
              </motion.div>
            )}

            {/* Delta insight */}
            {(delta || analysisLoading) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass-panel mb-4 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span></span>
                    <div>
                      <div className="font-bold text-white text-sm">The Delta — What Changed?</div>
                      <div className="text-xs text-gray-500">AI analysis of how language shifts Child → Expert</div>
                    </div>
                  </div>
                  {analysisLoading && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-3 h-3 border border-[#8a2be2] border-t-transparent rounded-full animate-spin" />
                      Analysing…
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {(childAnalogies.length > 0 || expertAnalogies.length > 0) && (
                    <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-white/10">
                      <div>
                        <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3">Child analogies</div>
                        {childAnalogies.map((a, i) => (
                          <div key={i} className="flex gap-2 mb-2">
                            <span className="text-sky-400 flex-shrink-0 mt-0.5 text-xs">◆</span>
                            <span className="text-sm text-gray-300">{a}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#8a2be2] uppercase tracking-widest mb-3">Expert comparisons</div>
                        {expertAnalogies.map((a, i) => (
                          <div key={i} className="flex gap-2 mb-2">
                            <span className="text-[#8a2be2] flex-shrink-0 mt-0.5 text-xs">◆</span>
                            <span className="text-sm text-gray-300">{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {delta && (
                    <div className="space-y-2">
                      {[
                        { icon: '🔤', label: 'Vocabulary', value: delta.vocabulary },
                        { icon: '🔀', label: 'Analogy type', value: delta.analogyType },
                        { icon: '📏', label: 'Sentence structure', value: delta.sentenceLength },
                        { icon: '📐', label: 'Depth & abstraction', value: delta.depth },
                        { icon: '🧬', label: 'Jargon usage', value: delta.jargon },
                      ].map((row, i) => (
                        <motion.div key={row.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                          className="flex gap-4 p-3 rounded-xl border border-white/5 hover:border-[#8a2be2]/30 hover:bg-[#8a2be2]/5 transition-colors">
                          <span className="text-base flex-shrink-0">{row.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-gray-500 mb-0.5">{row.label}</div>
                            <div className="text-sm text-gray-300">{row.value}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Vocabulary clouds */}
            {bothDone && (child.keywords.length > 0 || expert.keywords.length > 0) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass-panel overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                  <span>🔤</span>
                  <div>
                    <div className="font-bold text-white text-sm">Vocabulary Shift</div>
                    <div className="text-xs text-gray-500">The words that define each level</div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3">Child vocabulary</div>
                    <div className="flex flex-wrap gap-2">
                      {child.keywords.map((kw, i) => (
                        <motion.span key={kw} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08 }}
                          className="font-bold px-3 py-1.5 rounded-full border border-white/10"
                          style={{ background: '#38bdf822', color: '#38bdf8', fontSize: `${12 + (5 - i) * 1.2}px` }}>
                          {kw}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#8a2be2] uppercase tracking-widest mb-3">Expert vocabulary</div>
                    <div className="flex flex-wrap gap-2">
                      {expert.keywords.map((kw, i) => (
                        <motion.span key={kw} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08 }}
                          className="font-bold px-3 py-1.5 rounded-full border border-white/10"
                          style={{ background: '#8a2be222', color: '#8a2be2', fontSize: `${12 + (5 - i) * 1.2}px` }}>
                          {kw}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state — original preserved exactly ── */}
      {!submitted && (
        <div className="flex-1 flex items-center justify-center">
          <div className="glass-panel p-12 text-center max-w-xl">
            <LayoutTemplate size={48} className="mx-auto text-gray-500 mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-white">Side-by-Side Compare Mode</h2>
            <p className="text-gray-400 mb-2">
              Stream a <span className="text-sky-400 font-bold">Child</span> and{' '}
              <span className="text-[#8a2be2] font-bold">Expert</span> explanation simultaneously.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              See the delta in language, complexity, analogies, and vocabulary — with live AI analysis.
            </p>
            <Link to="/" className="inline-block neon-button bg-[#1c1d29] px-6 py-3 border border-[#8a2be2]">
              <span className="relative z-10 text-white">Return to Dashboard</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};
