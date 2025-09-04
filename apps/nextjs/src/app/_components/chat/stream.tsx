"use client";
import { useChat } from "@ai-sdk/react";
import Markdown from "react-markdown";
import { Button } from "~/components/ui/button";
export default function Stream() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const hasMessages = messages.length > 0;
  return (
    <>
      <div
        className="flex flex-1 flex-col justify-end overflow-y-auto px-4 py-8"
        style={{ minHeight: 0 }}
      >
        {!hasMessages && (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center text-center">
            <h2 className="mb-2 text-2xl font-bold">
              Hi, I&#39;m Remi, your recipe assistant!
            </h2>
            <p className="mb-2">
              Ask anything about your recipes, ingredients, or cooking tips.
            </p>
            <p className="text-muted-foreground text-sm">
              Start a conversation below.
            </p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`prose max-w-[80%] rounded-lg px-4 py-2 whitespace-pre-wrap shadow-md ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground self-end"
                  : "bg-card text-card-foreground border-border self-start border"
              }`}
            >
              {message.role === "user" ? (
                <span>
                  {message.parts.map(
                    (part, i) =>
                      part.type === "text" && <span key={i}>{part.text}</span>,
                  )}
                </span>
              ) : (
                message.parts.map((part, i) =>
                  part.type === "text" ? (
                    <Markdown key={i}>{part.text}</Markdown>
                  ) : null,
                )
              )}
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-background sticky right-0 bottom-0 left-0 z-10 flex items-center gap-2 border-t p-4"
      >
        <input
          className="focus:border-primary flex-1 rounded border border-zinc-300 p-2 shadow-xl focus:ring focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 shadow transition"
        >
          Send
        </Button>
      </form>
    </>
  );
}
