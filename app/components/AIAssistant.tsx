'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  Bot,
  User,
  ChevronDown,
  BookOpen,
  Shield,
  Globe,
  FileText,
  Lightbulb
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface QuickAction {
  id: string;
  label: string;
  labelZh: string;
  icon: React.ElementType;
  prompt: string;
}

export default function AIAssistant() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isZh, setIsZh] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Safe SSR check for locale
  useEffect(() => {
    setIsZh(window.location.pathname.startsWith('/zh'));
  }, []);

  const isLoggedIn = !!session?.user;
  const isVip = session?.user?.role === 'vip';

  // 快速操作选项 - 市场准入相关
  const quickActions: QuickAction[] = [
    {
      id: 'fda',
      label: 'FDA 510(k)',
      labelZh: 'FDA 510(k)流程',
      icon: Shield,
      prompt: isZh
        ? '请详细解释FDA 510(k)注册流程，包括所需文件、时间线和费用'
        : 'Please explain the FDA 510(k) registration process in detail, including required documents, timeline, and fees'
    },
    {
      id: 'eu',
      label: 'EU MDR',
      labelZh: '欧盟MDR合规',
      icon: Globe,
      prompt: isZh
        ? '欧盟MDR对二类医疗器械有哪些主要要求？'
        : 'What are the main requirements of EU MDR for Class II medical devices?'
    },
    {
      id: 'china',
      label: 'NMPA',
      labelZh: 'NMPA注册',
      icon: FileText,
      prompt: isZh
        ? '进口医疗器械在中国NMPA注册需要哪些步骤？'
        : 'What are the steps for imported medical device registration with China NMPA?'
    },
    {
      id: 'market',
      label: 'Market Selection',
      labelZh: '市场选择建议',
      icon: Lightbulb,
      prompt: isZh
        ? '我的口罩产品应该优先进入哪个市场？请分析美国、欧盟、新加坡和中国的优劣势'
        : 'Which market should I prioritize for my mask product? Please analyze the pros and cons of USA, EU, Singapore and China'
    },
    {
      id: 'compare',
      label: 'Compare Markets',
      labelZh: '市场对比',
      icon: BookOpen,
      prompt: isZh
        ? '请对比新加坡、马来西亚和泰国对口罩的市场准入要求，包括费用、周期和所需文件'
        : 'Please compare the market access requirements for masks in Singapore, Malaysia and Thailand, including costs, timeline and required documents'
    },
    {
      id: 'competitor',
      label: 'Competitor Research',
      labelZh: '竞品调研',
      icon: Globe,
      prompt: isZh
        ? '如何调研竞争对手在全球市场的合规布局？'
        : 'How can I research competitor compliance layout across global markets?'
    }
  ];

  // 欢迎消息
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: isZh
          ? `您好！我是MDLooker AI助手，专注于医疗器械合规领域。\n\n我可以帮您：\n• 解答FDA、NMPA、EU MDR等法规问题\n• 提供市场准入策略建议\n• 解释注册流程和所需文件\n• 分析合规风险和解决方案\n\n${!isLoggedIn ? '💡 登录后可获得更个性化的建议' : ''}`
          : `Hello! I'm MDLooker AI Assistant, specializing in medical device compliance.\n\nI can help you with:\n• FDA, NMPA, EU MDR regulatory questions\n• Market access strategy advice\n• Registration process and documentation\n• Compliance risk analysis and solutions\n\n${!isLoggedIn ? '💡 Sign in for more personalized recommendations' : ''}`,
        timestamp: new Date(),
        suggestions: quickActions.map(a => isZh ? a.labelZh : a.label)
      };
      setMessages([welcomeMessage]);
    }
  }, [isZh, isLoggedIn]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowWelcome(false);

    try {
      // 调用API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          locale: isZh ? 'zh' : 'en',
          userTier: isVip ? 'vip' : isLoggedIn ? 'registered' : 'guest',
          history: messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          suggestions: data.suggestions
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isZh
          ? '抱歉，我暂时无法回答这个问题。请稍后再试，或联系我们的支持团队。'
          : 'Sorry, I cannot answer this question right now. Please try again later or contact our support team.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  const clearChat = () => {
    setMessages([]);
    setShowWelcome(true);
  };

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full
          bg-gradient-to-r from-[#339999] to-[#2a7a7a]
          text-white
          shadow-lg shadow-[#339999]/30
          flex items-center justify-center
          transition-all duration-300
          hover:scale-110 hover:shadow-xl
          ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
        `}
        aria-label={isZh ? '打开AI助手' : 'Open AI Assistant'}
      >
        <div className="relative">
          <Bot className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
        </div>
      </button>

      {/* 对话框 */}
      <div
        className={`
          fixed bottom-6 right-6 z-50
          w-[380px] max-w-[calc(100vw-48px)]
          bg-white rounded-2xl
          shadow-2xl shadow-black/20
          border border-slate-200
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}
        `}
        style={{ height: '520px', maxHeight: 'calc(100vh - 100px)' }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-[#339999]/5 to-transparent rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#339999] to-[#2a7a7a] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {isZh ? 'MDLooker AI助手' : 'MDLooker AI Assistant'}
              </h3>
              <p className="text-xs text-slate-500">
                {isZh ? '医疗器械合规专家' : 'Medical Device Compliance Expert'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title={isZh ? '清空对话' : 'Clear chat'}
            >
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label={isZh ? '关闭' : 'Close'}
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${message.role === 'assistant' 
                    ? 'bg-gradient-to-r from-[#339999] to-[#2a7a7a]' 
                    : 'bg-slate-200'
                  }
                `}
              >
                {message.role === 'assistant' ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`
                    inline-block max-w-[85%] px-4 py-2.5 rounded-2xl text-sm
                    ${message.role === 'assistant'
                      ? 'bg-slate-100 text-slate-800 text-left'
                      : 'bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white text-left'
                    }
                  `}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                
                {/* 建议按钮 */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 justify-start">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(suggestion)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-[#339999] hover:text-[#339999] transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className={`text-xs text-slate-400 mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#339999] to-[#2a7a7a] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 text-[#339999] animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 快速操作 */}
        {showWelcome && messages.length === 1 && (
          <div className="px-4 py-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2">
              {isZh ? '快速提问:' : 'Quick questions:'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600 hover:bg-[#339999]/10 hover:text-[#339999] transition-colors text-left"
                >
                  <action.icon className="w-3.5 h-3.5" />
                  <span className="truncate">{isZh ? action.labelZh : action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <form onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isZh ? '输入您的问题...' : 'Type your question...'}
              className="flex-1 px-4 py-2.5 bg-slate-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#339999]/50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {isZh 
              ? 'AI助手仅供参考，具体合规决策请咨询专业人士'
              : 'AI responses are for reference only. Consult professionals for compliance decisions.'}
          </p>
        </form>
      </div>
    </>
  );
}
