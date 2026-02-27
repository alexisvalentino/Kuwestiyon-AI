import { NextResponse } from "next/server"

export const runtime = "edge"

type ChatMessage = {
  role: "user" | "assistant" | "system"
  content: string
}

// Fallback responses in case the LLM is unavailable
const fallbackResponses = [
  "I'm currently operating in fallback mode. The AI service is temporarily unavailable.",
  "Sorry, I can't access my full capabilities right now. Please try again later.",
  "Hello! I'm currently using pre-programmed responses as the AI service is down.",
  "The AI service is currently unavailable. I'm using basic responses for now.",
  "Sorry for the inconvenience, but I'm currently operating with limited functionality.",
  "I'm currently in offline mode. My responses are pre-programmed.",
  "The connection to my AI brain is temporarily down. I'll be back to full capacity soon!",
]

// Get a random fallback response
function getFallbackResponse(): string {
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length)
  return fallbackResponses[randomIndex]
}

// Simple keyword-based response system for fallback mode
function getKeywordResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase()

  // Basic greeting patterns
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! I'm currently in fallback mode, but I can still chat with you using basic responses."
  }

  // Help request
  if (lowerMessage.includes("help")) {
    return "I'm in fallback mode right now. The AI service is temporarily unavailable. You can try again later or ask simple questions."
  }

  // Thank you responses
  if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
    return "You're welcome! I'm happy to help even in fallback mode."
  }

  // Questions about status
  if (
    (lowerMessage.includes("what") && message.includes("wrong")) ||
    lowerMessage.includes("not working") ||
    lowerMessage.includes("offline")
  ) {
    return "I'm currently operating in fallback mode because the connection to the AI service is unavailable. This could be due to network issues, API limits, or service maintenance."
  }

  // Return null if no keyword matches, so we can use the random fallback
  return null
}

function toChatMessages(messages: any[]): ChatMessage[] {
  if (!Array.isArray(messages)) return []
  return messages
    .filter((m) => m && typeof m === "object")
    .map((m) => ({
      role: m.role,
      content: m.content,
    }))
    .filter(
      (m): m is ChatMessage =>
        (m.role === "user" || m.role === "assistant" || m.role === "system") && typeof m.content === "string",
    )
}

async function callExternalChatCompletions(messages: ChatMessage[], temperature: number) {
  const apiUrl = process.env.KUWESTIYON_LLM_API_URL
  const apiKey = process.env.KUWESTIYON_LLM_API_KEY
  const providerModel = process.env.KUWESTIYON_LLM_MODEL

  if (!apiUrl || !apiKey || !providerModel) {
    throw new Error("LLM is not configured")
  }

  const maxTokensRaw = process.env.KUWESTIYON_LLM_MAX_TOKENS
  const maxTokens = maxTokensRaw ? Number.parseInt(maxTokensRaw, 10) : 16384
  const safeMaxTokens = Number.isFinite(maxTokens) ? maxTokens : 16384

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: providerModel,
      messages,
      max_tokens: safeMaxTokens,
      temperature,
      top_p: 1.0,
      stream: false,
      chat_template_kwargs: { thinking: true },
    }),
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Upstream error: ${response.status} ${text}`)
  }

  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error("Invalid upstream response")
  }

  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    data?.output_text ??
    data?.output?.[0]?.content?.[0]?.text ??
    ""

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Empty response")
  }

  return {
    id: typeof data?.id === "string" ? data.id : `response-${Date.now()}`,
    content,
  }
}

export async function POST(req: Request) {
  try {
    const { messages, pdfText, fileName, temperature } = await req.json()
    const parsedMessages = toChatMessages(messages)
    const userMessage = parsedMessages[parsedMessages.length - 1]?.content || ""

    // Use the temperature from the request or default to 0.7
    const selectedTemperature = temperature !== undefined ? temperature : 0.7
    const temp = typeof selectedTemperature === "number" ? selectedTemperature : Number(selectedTemperature)
    const safeTemp = Number.isFinite(temp) ? temp : 0.7

    const augmentedMessages: ChatMessage[] =
      typeof pdfText === "string" && pdfText.trim()
        ? [
          {
            role: "user",
            content: `PDF${fileName ? ` (${fileName})` : ""} extracted text:\n\n${pdfText}`,
          },
          ...parsedMessages,
        ]
        : parsedMessages

    try {
      const data = await callExternalChatCompletions(augmentedMessages, safeTemp)
      return NextResponse.json({
        id: data.id,
        role: "assistant",
        content: data.content,
      })
    } catch (error) {
      const keywordResponse = getKeywordResponse(userMessage) || getFallbackResponse()

      return NextResponse.json({
        id: `fallback-${Date.now()}`,
        role: "assistant",
        content: keywordResponse + " ",
      })
    }
  } catch (error: any) {
    // Request parsing error - use fallback
    return NextResponse.json({
      id: `fallback-${Date.now()}`,
      role: "assistant",
      content: getFallbackResponse() + " ",
    })
  }
}

