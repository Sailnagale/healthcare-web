// src/app/chatbot/page.tsx
"use client";

import React, { useState, useRef, useEffect, FormEvent } from "react";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import "./page.css";

// --- API Initialization (Secure Reference) ---
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true })
  : null;

// --- Type Definition ---
type Message = {
  role: "user" | "bot";
  content: string;
};

const initialMessages: Message[] = [
  {
    role: "bot",
    content:
      "Hello! I'm a dual-API chatbot. Select an engine and ask me anything!",
  },
];

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState<string>("");
  const [engine, setEngine] = useState<"gemini" | "openai">("gemini");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getGeminiResponse = async (userMessage: string): Promise<string> => {
    if (!ai)
      return "❌ Gemini API not initialized. Check NEXT_PUBLIC_GEMINI_API_KEY.";
    try {
      const chat = ai.chats.create({ model: "gemini-2.5-flash" });
      const response = await chat.sendMessage({ message: userMessage });
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "❌ Sorry, I couldn't connect to Gemini. Check limits.";
    }
  };

  const getOpenAIResponse = async (userMessage: string): Promise<string> => {
    if (!openai)
      return "❌ OpenAI API not initialized. Check NEXT_PUBLIC_OPENAI_API_KEY.";
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
      });
      return (
        response.choices[0]?.message.content ||
        "No response received from OpenAI."
      );
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return "❌ Sorry, I couldn't connect to OpenAI. Check quota/limits.";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const newUserMessage: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    let botResponse;
    if (engine === "gemini") {
      botResponse = await getGeminiResponse(userMessage);
    } else {
      botResponse = await getOpenAIResponse(userMessage);
    }

    const newBotMessage: Message = { role: "bot", content: botResponse };
    setMessages((prev) => [...prev, newBotMessage]);
    setIsLoading(false);
  };

  return (
    <div className="appointment-page">
      <div className="appointment-card">
        <h1>💬 Dual-Engine Chatbot</h1>
        <p>
          Ask a question and select whether to get a response from **Gemini** or
          **OpenAI**.
        </p>

        <div className="chat-container">
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div key={index} className="message-item">
                <div className={`message ${msg.role}`}>{msg.content}</div>
              </div>
            ))}

            {isLoading && (
              <div className="message-item">
                <div className="message-loader">
                  <div className="dot-typing"></div>
                  <small>Bot is typing...</small>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSubmit}>
            <select
              value={engine}
              onChange={(e) => setEngine(e.target.value as "gemini" | "openai")}
              disabled={isLoading}
            >
              <option value="gemini">🤖 Gemini</option>
              <option value="openai">💻 OpenAI</option>
            </select>

            <input
              type="text"
              placeholder={`Chat with ${
                engine === "gemini" ? "Gemini" : "OpenAI"
              }...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />

            <button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
