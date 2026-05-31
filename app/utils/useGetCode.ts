'use client'
import { useCallback, useState } from "react";
import { Message } from "./spec";
import { stripCodeFences } from "./helpers";

// API ROUTE CALLER, initializes state vars and the cached function that gets LLM
// code. Lives in its own client module so the server-safe utils in helpers.ts can
// be imported by route handlers without dragging React client hooks into them.
export function useGetCode() {

  // Message history, including assistant messages
  const [messages, setMessages] = useState<Message[]>([]);
  // Called in API calling function, sets -> stream updates code -> sets again
  const [generatedCode, setGeneratedCode] = useState<string>("");
  // Informs components on if API is streaming resulting code
  const [isGenerating, setIsGenerating] = useState(false);

  // Gets called when user sends prompt, function is cached with useCallback
  const handleSend = useCallback(async (prompt: string, fresh: boolean = false) => {
    // Create new user message from prompt
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
    };
    // fresh = full regenerate from the spec (no prior history); else multi-turn
    setMessages((prev) => (fresh ? [userMessage] : [...prev, userMessage]));

    setIsGenerating(true); // Sets isStreaming
    setGeneratedCode(""); // Resets the generated code

    try {
      // Calls API Route (in route.ts)
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Sends in the latest prompt along with message history
        body: JSON.stringify({
          prompt,
          // Full regenerate sends no history; otherwise use the message state
          history: fresh ? [] : messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullCode = "";

      // Gradual setting of code -> changes generatedCode
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullCode += chunk;
          setGeneratedCode(stripCodeFences(fullCode)); // Connects LLM output
        }
      }

      // Add assistant message (static response message)
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Component generated successfully!",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, there was an error generating the component. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);

    } finally {
      setIsGenerating(false); // Shuts off isStreaming
    }
  }, [messages]);

  // Return the setter function and the state vars
  return { handleSend, messages, generatedCode, isGenerating};
}
