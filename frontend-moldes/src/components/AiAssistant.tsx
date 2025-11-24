import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateB2BResponse } from '../services/geminiService';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Olá! Sou o consultor virtual da Muni Moldes. Posso ajudar com dúvidas sobre atacado, materiais ou coleções?', sender: 'ai' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponseText = await generateB2BResponse(input);
      const aiMsg: Message = { id: Date.now() + 1, text: aiResponseText, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Error", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-munigreen text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-munidark transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-munipink rounded-full border-2 border-white animate-ping"></span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-munilight"
          >
            {/* Header */}
            <div className="bg-munidark p-4 flex items-center gap-3 text-white">
              <div className="bg-munipink p-2 rounded-full">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Muni Assistant</h3>
                <p className="text-xs text-white/60">Tire suas dúvidas 24/7</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-munilight/30 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-munigreen text-white rounded-br-none'
                        : 'bg-white text-munidark border border-gray-100 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-munipink rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-munipink rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-munipink rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Digite sua dúvida..."
                  className="flex-1 bg-munilight/50 border-none rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-munipink focus:outline-none text-munidark placeholder-munidark/40"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-munipink text-white p-3 rounded-full hover:bg-munigreen transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-2">
                IA treinada para suporte B2B. Informações sujeitas a confirmação.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};