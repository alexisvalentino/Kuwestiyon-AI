"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown, ArrowUp, Bot, Copy, CornerUpRight, Pencil, Plus, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Role = "user" | "assistant" | "error"

interface Message {
  id: string
  content: string
  role: Role
}

const MODEL_OPTIONS = [{ id: "kuwestiyon-5.2", label: "Kuwestiyon 5.2" }]

export function MinimalChat() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>(MODEL_OPTIONS[0]?.id ?? "kuwestiyon-5.2")
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const [showScrollDown, setShowScrollDown] = useState(false)

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error("Failed to copy message", error)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: trimmed,
      role: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    if (inputRef.current) {
      inputRef.current.style.height = "2.75rem"
    }
    setIsLoading(true)
    // Simulate a "thinking" delay for a more realistic AI feel
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const fallbackTemplates = [
      "Kumusta! I'm in fallback mode right now. Pasensya na if limited muna responses ko, naka-leave yata 'yung logic modules ko. 🏖️",
      "Sorry for the inconvenience, but naka-battery saver mode ako today. I'm basically the calculator version of an AI for now. 🔋✨",
      "Uy! Naka-break muna ang main components ko. Parallel thinking is hard, kaya basics muna tayo today. Chill lang! 🧠💤",
      "Naka-'Chill Mode' muna ako. May nakalimot kasing i-plug 'yung logic module ko. My bad! Bawi ako next time. 😅🎮",
      "Beep boop! I'm doing my best pero naka-fallback mode pa ako. Consider me as the 'Lite' version muna today. 🍦📦",
    ]

    const randomTemplate = fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)]

    const fallbackMessage: Message = {
      id: `assistant-fallback-${Date.now()}`,
      role: "assistant",
      content: randomTemplate,
    }

    setMessages((prev) => [...prev, fallbackMessage])
    setIsLoading(false)
  }

  const handleClearChat = () => {
    setMessages([])
    setInput("")
    if (inputRef.current) {
      inputRef.current.style.height = "2.75rem"
    }
  }

  const hasMessages = messages.length > 0

  // Always scroll the message container to bottom when a new message is appended
  useEffect(() => {
    if (!hasMessages) return
    const el = messagesContainerRef.current
    if (el) {
      setTimeout(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
      }, 100)
    }
  }, [messages.length, hasMessages])

  // Show/hide "scroll to bottom" button based on scroll position within the container
  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const isScrollable = scrollHeight > clientHeight + 20
      const atBottom = scrollTop + clientHeight >= scrollHeight - 20
      setShowScrollDown(isScrollable && !atBottom)
    }

    el.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => el.removeEventListener("scroll", handleScroll)
  }, [hasMessages, messages.length])

  const scrollToBottom = () => {
    const el = messagesContainerRef.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    }
  }

  return (
    <div
      className={`w-full bg-background ${hasMessages ? "h-screen flex flex-col" : "min-h-screen flex flex-col items-center justify-center"
        }`}
    >
      {hasMessages && (
        <div className="fixed top-0 left-0 right-0 z-20 bg-background px-6 pt-6 pb-3 flex items-center justify-between">
          <div className="text-base text-gray-600">Conversation</div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-gray-100 text-gray-400 hover:text-white hover:bg-red-500 transition-all duration-200 shadow-sm"
            onClick={handleClearChat}
            aria-label="Clear chat"
          >
            ✕
          </Button>
        </div>
      )}

      {hasMessages ? (
        <div className="w-full flex-1 relative overflow-hidden">
          <div
            ref={messagesContainerRef}
            className="absolute inset-0 overflow-y-auto smooth-scrollbar"
          >
            <div className="w-full flex flex-col items-center pt-20 px-4">
              <div className="w-full max-w-4xl flex flex-col relative space-y-6 pb-40">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    {message.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-3xl px-4 py-3 text-sm sm:text-base break-words whitespace-pre-wrap bg-gray-100 text-gray-900">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 px-1">
                        <div className="flex items-center gap-2 px-1">
                          <div className="h-6 w-6 rounded-full bg-gray-900 overflow-hidden flex items-center justify-center shrink-0">
                            <img src="/icon.png" alt="Kuwestiyon AI" className="h-full w-full object-cover" />
                          </div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kuwestiyon AI</span>
                        </div>
                        <div
                          className={`w-full text-sm sm:text-base break-words whitespace-pre-wrap ${message.role === "assistant"
                            ? "text-gray-900 leading-relaxed px-1"
                            : "rounded-3xl bg-red-50 text-red-900 border border-red-200 px-4 py-3"
                            }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    )}

                    {message.role === "user" && (
                      <div className="flex justify-end gap-3 pr-3 pt-1 text-gray-400">
                        <button type="button" className="p-1 hover:text-gray-700" aria-label="Edit message">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(message.content)}
                          className="p-1 hover:text-gray-700"
                          aria-label="Copy message"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button type="button" className="p-1 hover:text-gray-700" aria-label="Share message">
                          <CornerUpRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {message.role === "assistant" && (
                      <div className="flex gap-3 pt-1 text-gray-400">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(message.content)}
                          className="p-1 hover:text-gray-700"
                          aria-label="Copy response"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button type="button" className="p-1 hover:text-gray-700" aria-label="Regenerate response">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button type="button" className="p-1 hover:text-gray-700" aria-label="Share response">
                          <CornerUpRight className="h-4 w-4" />
                        </button>
                        <button type="button" className="p-1 hover:text-gray-700" aria-label="Thumbs up">
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button type="button" className="p-1 hover:text-gray-700" aria-label="Thumbs down">
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex flex-col gap-2 px-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 px-1">
                      <div className="h-6 w-6 rounded-full bg-gray-900 overflow-hidden flex items-center justify-center shrink-0">
                        <img src="/icon.png" alt="Kuwestiyon AI" className="h-full w-full object-cover" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kuwestiyon AI</span>
                    </div>
                    <div className="w-full text-sm sm:text-base px-2 text-gray-400 italic animate-pulse">
                      thinking...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scroll-down button positioned within the centered chat column */}
          <div className="absolute inset-x-0 bottom-6 pointer-events-none">
            <div className="max-w-4xl mx-auto relative h-10 px-4">
              <div
                className={`absolute right-4 bottom-0 transition-all duration-300 pointer-events-auto ${showScrollDown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                  }`}
              >
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100 hover:bg-gray-50 active:scale-95 transition-transform"
                  aria-label="Scroll to latest message"
                >
                  <ArrowDown className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-4xl px-4 mx-auto ${hasMessages ? "pb-6" : ""}`}
      >
        <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_2px_15px_rgba(0,0,0,0.05)] px-4 pt-3 pb-3 flex flex-col">
          <textarea
            ref={inputRef}
            className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-gray-900 placeholder:text-gray-400 resize-none leading-relaxed min-h-[2.5rem] max-h-36 overflow-y-auto no-scrollbar"
            placeholder="Throw me a hard one. I’m ready."
            value={input}
            rows={1}
            onChange={(event) => {
              setInput(event.target.value)
              const el = event.target
              el.style.height = "2.75rem"
              const maxHeight = hasMessages ? 96 : 144
              const newHeight = Math.min(el.scrollHeight, maxHeight)
              el.style.height = `${newHeight}px`
            }}
          />

          <div className="mt-3 flex items-center">
            <div className="flex-1 flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
              </Button>

              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="inline-flex h-8 items-center gap-1 border-0 bg-transparent shadow-none px-0 text-xs text-gray-700 focus:ring-0 focus:outline-none hover:bg-transparent w-auto min-w-0">
                  <SelectValue placeholder="Kuwestiyon 5.2" />
                </SelectTrigger>
                <SelectContent className="text-sm">
                  {MODEL_OPTIONS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 rounded-full bg-gray-700 text-white hover:bg-gray-800 p-0 flex items-center justify-center"
              disabled={!input.trim() || isLoading}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
