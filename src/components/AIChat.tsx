import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Minimize2, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Mech, your Mechinweb assistant. How can I help you today? 🚀",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-open chatbot for new visitors
  useEffect(() => {
    const hasVisited = localStorage.getItem('mechinweb_visited');
    if (!hasVisited && !hasAutoOpened) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoOpened(true);
        localStorage.setItem('mechinweb_visited', 'true');
        
        // Add welcome message after auto-open
        setTimeout(() => {
          const welcomeMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "👋 Welcome to Mechinweb! I'm here to help you with any questions about our IT services. What can I assist you with today?",
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, welcomeMessage]);
        }, 1000);
      }, 3000); // Auto-open after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [hasAutoOpened]);

  const predefinedResponses = {
    'hello': "Hello! 👋 Welcome to Mechinweb. I'm Mech, and I can help you with information about our IT services, pricing, or connect you with our team. What interests you most?",
    'services': "🛠️ We offer amazing IT services:\n• Email Migration & Setup ($299+)\n• Domain & Email Security ($199+)\n• SSL & HTTPS Setup ($149+)\n• Cloud Management ($399+)\n• Data Migration ($499+)\n• Hosting Support ($149+)\n• Acronis Backup Setup ($199+)\n\nWhich service catches your eye? 😊",
    'pricing': "💰 Our services start from just $149! Here's a quick overview:\n• SSL Setup: $149-$499\n• Email Security: $199-$799\n• Email Migration: $299-$1499\n• Hosting Support: $149-$399\n\nWould you like detailed pricing for any specific service?",
    'email': "📧 Email migration is our specialty! We offer:\n• Basic (10 accounts): $299\n• Standard (50 accounts): $799\n• Enterprise (unlimited): $1499\n\nWe handle Gmail, Outlook, and all major platforms with ZERO downtime! Want to know more?",
    'ssl': "🔒 SSL setup starting at $149! We offer:\n• Single Domain: $149\n• Multi-Domain: $299\n• Wildcard SSL: $499\n\nIncludes installation, configuration, and auto-renewal setup. Need an SSL quote?",
    'cloud': "☁️ Cloud services include:\n• Google Workspace management\n• Microsoft 365 administration\n• Data migration between platforms\n• User training and support\n\nPricing starts at $399. Which cloud platform are you using?",
    'hosting': "🖥️ Hosting support covers:\n• cPanel optimization\n• Plesk troubleshooting\n• Performance tuning\n• Security hardening\n• Emergency support\n\nStarting at $149. Having hosting issues?",
    'contact': "📞 You can reach our team at:\n• Email: contact@mechinweb.com\n• WhatsApp: Quick support\n• Contact form on our website\n\nWould you like me to help you get in touch with our experts?",
    'help': "🤖 I'm Mech, and I can help you with:\n• 💼 Service information and pricing\n• 🔧 Technical requirements\n• 👥 Connecting with our experts\n• 📊 Account assistance\n• 💡 Recommendations for your needs\n\nWhat would you like to explore?",
    'quote': "📋 Ready for a quote? I can help you get started! Our team provides:\n• Free consultations\n• Detailed project estimates\n• Custom solution recommendations\n\nWould you like me to connect you with our contact form?",
    'support': "🆘 Need support? We're here 24/7!\n• Emergency hosting issues\n• Technical troubleshooting\n• Service questions\n• Account assistance\n\nWhat kind of support do you need?",
    'default': "🤔 I understand you're asking about our IT services. For detailed assistance, I'd recommend contacting our team directly at contact@mechinweb.com or through our contact form. Is there anything specific I can help clarify? I'm here to make your experience smooth! ✨"
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi')) return predefinedResponses.hello;
    if (message.includes('service')) return predefinedResponses.services;
    if (message.includes('price') || message.includes('cost')) return predefinedResponses.pricing;
    if (message.includes('email') || message.includes('migration')) return predefinedResponses.email;
    if (message.includes('ssl') || message.includes('certificate')) return predefinedResponses.ssl;
    if (message.includes('cloud') || message.includes('workspace') || message.includes('365')) return predefinedResponses.cloud;
    if (message.includes('hosting') || message.includes('cpanel') || message.includes('plesk')) return predefinedResponses.hosting;
    if (message.includes('contact') || message.includes('phone')) return predefinedResponses.contact;
    if (message.includes('quote') || message.includes('estimate')) return predefinedResponses.quote;
    if (message.includes('support') || message.includes('help')) return predefinedResponses.support;
    if (message.includes('help')) return predefinedResponses.help;
    
    return predefinedResponses.default;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
        aria-label="Open AI Chat"
      >
        <MessageCircle className="w-6 h-6 group-hover:animate-pulse" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-80 h-96'
    }`}>
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Mech - AI Assistant</h3>
              <p className="text-cyan-100 text-xs flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Online • Instant replies
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-xs ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600' 
                        : 'bg-gray-700'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-3 h-3 text-white" />
                      ) : (
                        <Bot className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className={`px-3 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-gray-700 px-3 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700/50">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-2 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIChat;