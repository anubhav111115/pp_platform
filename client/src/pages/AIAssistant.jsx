import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Send, 
  Bot, 
  User, 
  Menu,
  Trash2,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

function AIAssistant() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // default closed on mobile

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const suggestedPrompts = [
    "Help me prepare for a Google interview",
    "Review my resume and suggest improvements",
    "Give me 5 common behavioral interview questions",
    "Explain the difference between REST and GraphQL",
    "How do I negotiate my salary?"
  ];

  useEffect(() => {
    fetchChatHistory();
    // Default open on larger screens
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streaming]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setChatHistory(data.chats || []);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInput('');
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!input.trim() || loading || streaming) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setStreaming(true);

    try {
      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          chatId: currentChatId
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = { role: 'assistant', content: '' };

      setMessages(prev => [...prev, aiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                aiMessage.content += parsed.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...aiMessage };
                  return newMessages;
                });
              }
              if (parsed.chatId) {
                setCurrentChatId(parsed.chatId);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      await fetchChatHistory();
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleDeleteChat = async (chatId) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setChatHistory(prev => prev.filter(chat => chat._id !== chatId));
        if (currentChatId === chatId) {
          handleNewChat();
        }
        toast.success('Chat deleted');
      }
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  };

  const handleLoadChat = async (chatId) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setCurrentChatId(chatId);
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        }
      }
    } catch (error) {
      toast.error('Failed to load chat');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0f] text-gray-900 dark:text-slate-100 transition-colors duration-200 overflow-hidden relative">
      {/* Sidebar Overlay Backdrop on Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity"
        />
      )}

      {/* Left Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 lg:relative lg:translate-x-0 lg:flex flex-col h-full bg-[#0d0d1a] border-r border-gray-200 dark:border-[#1e1e2e] transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:w-0'
        } overflow-hidden`}
      >
        <div className="p-4 border-b border-[#1e1e2e] flex items-center justify-between">
          <button
            onClick={handleNewChat}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg ml-2 hover:bg-[#1e1e2e]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Chats</h3>
            <div className="space-y-1">
              {chatHistory.map((chat) => (
                <div
                  key={chat._id}
                  className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition cursor-pointer ${
                    currentChatId === chat._id ? 'bg-[#1e1e2e] text-white' : 'text-gray-400 hover:bg-[#1e1e2e] hover:text-slate-200'
                  }`}
                >
                  <button
                    onClick={() => handleLoadChat(chat._id)}
                    className="flex-1 text-left text-sm truncate font-medium"
                  >
                    {chat.title || 'New Chat'}
                  </button>
                  <button
                    onClick={() => handleDeleteChat(chat._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {chatHistory.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">No recent chats</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 dark:border-[#1e1e2e] bg-white dark:bg-[#0d0d1a] flex items-center px-4 sm:px-6 justify-between shrink-0 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#1e1e2e] rounded-lg transition-colors text-gray-600 dark:text-slate-300"
              title="Toggle history"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <h1 className="font-semibold text-gray-900 dark:text-slate-100 truncate text-base sm:text-lg">AI Assistant</h1>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#1e1e2e] text-gray-600 dark:text-slate-300 rounded-lg lg:hidden"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-[#0a0a0f] transition-colors">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto py-8 sm:py-12">
              <div className="text-center mb-8 sm:mb-12">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2 sm:mb-3">How can I help you today?</h2>
                <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto">Ask me anything about interview prep, resume reviews, or career advice</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 px-2 sm:px-0">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="p-4 bg-white dark:bg-[#13131f] border border-gray-200 dark:border-[#1e1e2e] dark:shadow-[0_0_15px_rgba(99,102,241,0.05)] rounded-xl hover:border-indigo-300 dark:hover:bg-[#1e1e2e] hover:shadow-md transition text-left"
                  >
                    <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 sm:gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm text-sm sm:text-base transition-colors ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900 dark:bg-[#13131f] dark:border-[#1e1e2e] dark:text-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-100 dark:bg-[#1a1a2e] border border-indigo-200 dark:border-[#2d2d4e] rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}
                </div>
              ))}

              {streaming && (
                <div className="flex gap-3 sm:gap-4 justify-start">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 dark:bg-[#13131f] dark:border-[#1e1e2e] rounded-2xl px-4 py-3 sm:px-5 sm:py-4">
                    <div className="flex gap-1.5 py-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-[#1e1e2e] bg-white dark:bg-[#0d0d1a] p-4 sm:p-6 shrink-0 transition-colors">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-white dark:bg-[#1a1a2e] border border-gray-300 dark:border-[#2d2d4e] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-slate-100 dark:placeholder-slate-500 resize-none transition"
                style={{ minHeight: '48px', maxHeight: '160px' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || streaming}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 mt-2 text-center">
              AI Assistant can make mistakes. Consider checking important information.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
