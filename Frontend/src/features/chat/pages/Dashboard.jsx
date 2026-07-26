import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useSelector, useDispatch } from 'react-redux';
import { useChat } from '../hooks/useChat';
import { setError } from '../chat.slice';
import { useAuth } from '../../auth/hook/useAuth';
import remarkGfm from 'remark-gfm';

const Dashboard = () => {
  const dispatch = useDispatch();
  const chat = useChat();
  const auth = useAuth();
  const [chatInput, setChatInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [searchFocus, setSearchFocus] = useState('web');
  const [selectedModel, setSelectedModel] = useState('grok');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const chats = useSelector((state) => state.chat.chats) || {};
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const error = useSelector((state) => state.chat.error);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    chat.handleGetChats();
  }, []);

  const handleSubmitMessage = (event, customText) => {
    if (event) event.preventDefault();

    const text = (customText || chatInput).trim();
    if (!text) return;

    chat.handleSendMessage({ message: text, chatId: currentChatId, model: selectedModel });
    setChatInput('');
  };

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats);
    setIsMobileMenuOpen(false);
  };

  const handleCopy = (text, idx) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const focusModes = [
    { id: 'web', label: '🌐 Web Search', desc: 'Real-time internet search' },
    { id: 'quick', label: '⚡ Quick Answer', desc: 'Fast, concise answers' },
    { id: 'academic', label: '🎓 Academic', desc: 'Deep research focus' },
    { id: 'code', label: '💻 Code', desc: 'Programming & debug helper' },
  ];

  const models = [
    { id: 'grok', name: 'Grok (Groq)', icon: '🚀' },
    { id: 'mistral', name: 'Mistral Medium', icon: '🤖' },
    { id: 'gemini', name: 'Google Gemini', icon: '✨' },
  ];

  const quickPrompts = [
    "What is the latest news in AI technology?",
    "Explain quantum computing in simple terms",
    "How to set up a Node.js REST API with Express",
    "Compare Python vs JavaScript for web backends"
  ];

  const activeChat = currentChatId ? chats[currentChatId] : null;
  const currentMessages = (activeChat && Array.isArray(activeChat.messages)) ? activeChat.messages : [];
  const showHeroView = !currentChatId || currentMessages.length === 0;

  const renderSearchBox = () => (
    <div className='w-full rounded-3xl border border-white/15 bg-[#0b0f19] p-3 md:p-4 shadow-2xl backdrop-blur-xl'>
      {/* Focus Pills */}
      <div className='flex items-center gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar text-xs'>
        <span className='text-white/40 font-semibold uppercase text-[10px] tracking-wider pr-1'>Focus:</span>
        {focusModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSearchFocus(mode.id)}
            type='button'
            title={mode.desc}
            className={`cursor-pointer rounded-xl px-3 py-1.5 font-medium transition whitespace-nowrap ${
              searchFocus === mode.id
                ? 'border border-cyan-400/60 bg-cyan-500/20 text-cyan-300 shadow-sm'
                : 'border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmitMessage} className='flex flex-col gap-3 md:flex-row items-center'>
        <input
          type='text'
          value={chatInput}
          onChange={(event) => setChatInput(event.target.value)}
          placeholder='Ask anything...'
          className='w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base md:text-lg text-white outline-none transition placeholder:text-white/40 focus:border-cyan-400/70 focus:bg-black/30'
        />
        {isLoading ? (
          <button
            type='button'
            onClick={() => chat.abortMessage()}
            className='w-full md:w-auto rounded-2xl border border-red-400/50 bg-gradient-to-r from-red-600 to-pink-600 px-6 py-3 text-base font-semibold text-white transition hover:from-red-500 hover:to-pink-500 shadow-lg shadow-red-500/10 whitespace-nowrap flex items-center justify-center gap-2'
          >
            <span className="animate-pulse">🛑</span> Stop
          </button>
        ) : (
          <button
            type='submit'
            disabled={!chatInput.trim() || isLoading}
            className='w-full md:w-auto rounded-2xl border border-cyan-400/50 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:from-cyan-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-40 shadow-lg shadow-cyan-500/10 whitespace-nowrap'
          >
            Ask ➜
          </button>
        )}
      </form>
    </div>
  );

  return (
    <main className='min-h-screen w-full bg-[#07090f] p-2 text-white md:p-5 font-sans'>
      <section className='mx-auto flex h-[calc(100vh-1rem)] w-full gap-4 rounded-3xl md:h-[calc(100vh-2.5rem)] md:gap-6 border-none'>
        
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
            <span>⚠️</span>
            <span className="font-semibold text-sm">{error}</span>
            <button onClick={() => dispatch(setError(null))} className="ml-2 bg-black/20 hover:bg-black/40 rounded-full p-1 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Sidebar */}
        <aside className={`${isMobileMenuOpen ? 'flex fixed inset-y-0 left-0 z-50 w-[80%] max-w-sm rounded-r-3xl' : 'hidden'} h-full md:w-80 shrink-0 md:rounded-3xl border border-white/10 bg-[#0b0f19] p-4 md:flex md:flex-col justify-between shadow-2xl transition-transform`}>
          <div className='flex flex-col h-full overflow-hidden'>
            <div className='flex items-center justify-between mb-4 px-1'>
              <div className='flex items-center gap-2'>
                <div className='h-8 w-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center font-bold text-cyan-400'>
                  P
                </div>
                <h1 className='text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent'>
                  Perplexity
                </h1>
              </div>
            </div>

            {/* New Thread Button */}
            <button
              onClick={() => {
                chat.handleStartNewChat();
                setIsMobileMenuOpen(false);
              }}
              type='button'
              className='mb-4 w-full cursor-pointer flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 hover:border-cyan-400/70 shadow-lg shadow-cyan-500/5'
            >
              <span className='text-lg'>+</span> New Thread
            </button>

            {/* Chat List */}
            <div className='flex-1 space-y-1.5 overflow-y-auto pr-1 custom-scrollbar'>
              <div className='text-xs font-semibold uppercase tracking-wider text-white/40 mb-2 px-2'>
                Recent Threads
              </div>
              {Object.values(chats).length === 0 ? (
                <div className='text-sm text-white/40 px-3 py-4 text-center border border-dashed border-white/10 rounded-2xl'>
                  No threads yet. Start a search!
                </div>
              ) : (
                Object.values(chats).map((item) => {
                  const isActive = currentChatId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition border ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/10 text-white font-medium shadow-md'
                          : 'border-transparent text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <button
                        onClick={() => openChat(item.id)}
                        type='button'
                        className='w-full text-left truncate text-sm cursor-pointer pr-2'
                      >
                        {item.title || "Untitled Search"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          chat.handleDeleteChat(item.id);
                        }}
                        type='button'
                        title='Delete Thread'
                        className='opacity-0 group-hover:opacity-100 cursor-pointer p-1 text-white/40 hover:text-red-400 transition'
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className='pt-4 border-t border-white/10 flex flex-col gap-3'>
            {user && (
              <div className='flex items-center gap-3 px-2 py-1'>
                <div className='h-8 w-8 rounded-full bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center font-bold text-cyan-300 text-xs uppercase'>
                  {(user.username || user.email || 'U')[0]}
                </div>
                <div className='flex-1 truncate'>
                  <div className='text-sm font-semibold text-white truncate'>{user.username || 'User'}</div>
                  <div className='text-xs text-white/50 truncate'>{user.email}</div>
                </div>
              </div>
            )}
            <button
              onClick={() => auth.handleLogout()}
              type='button'
              className='w-full cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-center text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white'
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className='relative w-full flex h-full min-w-0 flex-1 flex-col bg-[#080b12] rounded-3xl border border-white/10 shadow-2xl overflow-hidden'>
          
          {/* Top Bar with Model Selector */}
          <div className='flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6'>
            <div className='flex items-center gap-2'>
              <button 
                className='md:hidden p-1.5 -ml-2 text-white/70 hover:text-white cursor-pointer'
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <span className='text-xs font-semibold uppercase tracking-wider text-white/40 hidden md:inline'>AI Model:</span>
              <div className='flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl overflow-x-auto max-w-[200px] md:max-w-none no-scrollbar'>
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    type='button'
                    className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                      selectedModel === m.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Actions (Hidden since we have sidebar now) */}
            <div className='flex items-center gap-2 md:hidden'>
              <button
                onClick={() => chat.handleStartNewChat()}
                type='button'
                className='rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300'
              >
                + New
              </button>
            </div>
          </div>

          {/* Hero Welcome View (When no chat active or no messages) */}
          {showHeroView ? (
            <div className='flex-1 flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl mx-auto py-10'>
              <div className='h-16 w-16 rounded-3xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-3xl font-extrabold text-cyan-400 shadow-2xl shadow-cyan-500/20 animate-pulse'>
                P
              </div>
              <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-6 mb-4'>
                Where knowledge begins
              </h2>
              <p className='text-white/60 text-sm md:text-base leading-relaxed mb-8'>
                Ask any question, explore complex topics, or generate ideas powered by AI web search.
              </p>

              {/* Quick Prompts */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 w-full mb-8'>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubmitMessage(null, prompt)}
                    type='button'
                    className='text-left cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs md:text-sm text-white/80 transition hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-200'
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>

              {/* Search Footer Box INLINE for Hero */}
              <div className='w-full'>
                {renderSearchBox()}
              </div>
            </div>
          ) : (
            /* Chat Messages Container */
            <div className='flex flex-col flex-1 min-h-0 relative'>
              <div className='messages flex-1 space-y-4 overflow-y-auto px-4 md:px-6 pt-4 pb-48 custom-scrollbar w-full max-w-4xl mx-auto'>
              {currentMessages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1.5 ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className='text-xs font-medium text-white/40 px-1'>
                    {message.role === 'user'
                      ? 'You'
                      : `Perplexity (${
                          selectedModel === 'grok'
                            ? 'Grok'
                            : selectedModel === 'gemini'
                            ? 'Gemini'
                            : 'Mistral'
                        })`}
                  </div>

                  <div
                    className={`group relative max-w-[88%] md:max-w-[82%] rounded-2xl px-5 py-3.5 text-sm md:text-base leading-relaxed shadow-lg ${
                      message.role === 'user'
                        ? 'rounded-br-none bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium'
                        : 'rounded-bl-none border border-white/10 bg-[#0e1320] text-white/90'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p>{message.content}</p>
                    ) : (
                      <>
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
                            ul: ({ children }) => <ul className='mb-2 list-disc pl-5 space-y-1'>{children}</ul>,
                            ol: ({ children }) => <ol className='mb-2 list-decimal pl-5 space-y-1'>{children}</ol>,
                            code: ({ children }) => <code className='rounded bg-black/40 px-1.5 py-0.5 text-cyan-300 font-mono text-xs'>{children}</code>,
                            pre: ({ children }) => <pre className='mb-2 overflow-x-auto rounded-xl bg-black/50 border border-white/10 p-3 text-xs font-mono'>{children}</pre>
                          }}
                          remarkPlugins={[remarkGfm]}
                        >
                          {message.content || ''}
                        </ReactMarkdown>

                        {/* Copy Answer Action Button */}
                        <div className='mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/40'>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() => handleCopy(message.content, idx)}
                              type='button'
                              className='cursor-pointer flex items-center gap-1 text-white/50 hover:text-cyan-300 transition'
                            >
                              📋 {copiedIndex === idx ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <span className='text-[10px] text-white/30'>AI Generated ({selectedModel})</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className='relative flex items-center gap-3 text-sm text-cyan-300 p-3 border border-cyan-500/40 bg-cyan-500/10 rounded-2xl w-fit shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)]'>
                  {/* Glowing backdrop layer */}
                  <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-xl animate-pulse" />
                  
                  {/* Spinner */}
                  <div className='relative h-4 w-4 rounded-full border-2 border-cyan-300 border-t-transparent animate-spin shadow-[0_0_10px_rgba(34,211,238,0.8)]' />
                  
                  <span className='relative font-medium tracking-wide animate-pulse'>
                    Perplexity ({selectedModel}) is thinking & searching...
                  </span>
                </div>
              )}
            </div>

            {/* Search Footer Box FIXED for Active Chat */}
            <footer className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#080b12] via-[#080b12] to-transparent pt-10 pb-4 px-4 md:px-6 w-full max-w-4xl mx-auto'>
              {renderSearchBox()}
            </footer>
          </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default Dashboard;