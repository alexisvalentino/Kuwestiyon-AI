import { NextResponse } from "next/server"

export const runtime = "edge"

type ChatMessage = {
  role: "user" | "assistant" | "system"
  content: string
}

// Fallback responses in case the LLM is unavailable
const fallbackResponses = [
  "Kuwestiyon AI is currently operating in fallback mode due to temporary system constraints. To access the complete version, please visit the project repository at https://github.com/alexisvalentino/Kuwestiyon-AI, where you may clone and deploy your own fine-tuned model.",
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
    return "Hello. Kuwestiyon AI is currently in fallback mode due to system constraints. For full access, please visit: https://github.com/alexisvalentino/Kuwestiyon-AI"
  }

  // Help request
  if (lowerMessage.includes("help")) {
    return "Kuwestiyon AI is currently operating in fallback mode. To deploy your own fine-tuned model, please visit the repository at https://github.com/alexisvalentino/Kuwestiyon-AI"
  }

  // Thank you responses
  if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
    return "You are welcome. Please note that Kuwestiyon AI is currently in fallback mode. Visit https://github.com/alexisvalentino/Kuwestiyon-AI for the complete version."
  }

  // Questions about status
  if (
    (lowerMessage.includes("what") && message.includes("wrong")) ||
    lowerMessage.includes("not working") ||
    lowerMessage.includes("offline")
  ) {
    return "Kuwestiyon AI is in fallback mode due to temporary system constraints. You can clone the project to deploy your own model here: https://github.com/alexisvalentino/Kuwestiyon-AI"
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

