"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import Logo from "./assets/health-logo2.png";
import "./global.css";
import Bubble from "./components/Bubble";
import PrompSuggestionRow from "./components/PrompSuggestionRow";
import LoadingBubble from "./components/LoadingBubble";
import { nanoid } from "nanoid";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const noMessages = messages.length === 0;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePromptClick = (prompt: string) => {
    setMessages((prev) => [
      ...prev,
      { id: nanoid(), content: prompt, role: "user" },
    ]);
    handleSendMessage(prompt);
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    setIsLoading(true);
    const userMessage = {
      id: nanoid(),
      role: "user" as const,
      content: messageContent,
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }), // Include the new user message
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const assistantMessage = {
        id: nanoid(),
        role: "assistant" as const,
        content: data.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: nanoid(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSendMessage(input);
    setInput("");
  };

  return (
    <Box className="Main">
      <Box className="logo-nav">
        <Box
          className="logo-img"
          component="img"
          src={Logo.src}
          alt="Health Logo"
        />
        <Typography
          variant="h5"
          sx={{
            alignSelf: "center",
            fontWeight: "bold",
            color: "#5ca9bb",
          }}
        >
          MediBot
        </Typography>
      </Box>

      <Box className="chat-container">
        <Box
          component="section"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: noMessages ? "center" : "flex-start",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
            overflowY: "auto",
            marginBottom: "80px",
          }}
        >
          {noMessages ? (
            <>
              <Typography
                variant="h4"
                align="center"
                sx={{ fontWeight: "bold", color: "#3174ad" }}
              >
                Welcome to Health Assistant
              </Typography>
              <Typography
                variant="body1"
                align="center"
                sx={{ color: "#789DBC" }}
              >
                Ask me anything about your health, and I'll help you out!
              </Typography>

              <Box sx={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <PrompSuggestionRow onPromptClick={handlePromptClick} />
              </Box>
            </>
          ) : (
            <>
              {messages.map((message) => (
                <Bubble key={message.id} message={message} />
              ))}
              {isLoading && <LoadingBubble />}
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          padding: "1rem",
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: "800px",
          width: "100%",
          backgroundColor: "#FAFAFA",
          justifyContent: "center",
          boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: "8px",
          }}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: "#3A86FF",
            "&:hover": {
              backgroundColor: "#2D6BE6",
            },
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: "#FFBE0B" }} />
          ) : (
            "Send"
          )}
        </Button>
      </Box>
    </Box>
  );
}
