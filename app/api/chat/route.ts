import { NextResponse } from "next/server"

export const runtime = "edge"

// Fallback responses in case Mistral API is unavailable
const fallbackResponses = [
  "I'm currently operating in fallback mode. The AI service is temporarily unavailable.",
  "Sorry, I can't access my full capabilities right now. Please try again later.",
  "Pasensya na po, may problema sa connection ko sa AI service. I'm using limited responses.",
  "Hello! I'm currently using pre-programmed responses as the AI service is down.",
  "Kumusta! I'm in fallback mode right now. My responses are limited.",
  "The AI service is currently unavailable. I'm using basic responses for now.",
  "Sorry for the inconvenience, but I'm currently operating with limited functionality.",
  "Pasensya na po, hindi ako makaka-access ng Mistral AI ngayon. I'm using fallback responses.",
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
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("kumusta")) {
    return "Hello! I'm currently in fallback mode, but I can still chat with you using basic responses."
  }

  // Help request
  if (lowerMessage.includes("help") || lowerMessage.includes("tulong")) {
    return "I'm in fallback mode right now. The AI service is temporarily unavailable. You can try again later or ask simple questions."
  }

  // Thank you responses
  if (lowerMessage.includes("thank") || lowerMessage.includes("thanks") || lowerMessage.includes("salamat")) {
    return "You're welcome! I'm happy to help even in fallback mode."
  }

  // Questions about status
  if (
    (lowerMessage.includes("what") && message.includes("wrong")) ||
    lowerMessage.includes("not working") ||
    lowerMessage.includes("offline")
  ) {
    return "I'm currently operating in fallback mode because the connection to the Mistral AI service is unavailable. This could be due to network issues, API limits, or service maintenance."
  }

  // Return null if no keyword matches, so we can use the random fallback
  return null
}

// Helper function to perform a web search using DuckDuckGo API via RapidAPI
async function performWebSearch(query: string): Promise<string> {
  try {
    // Encode the search query for use in a URL
    const encodedQuery = encodeURIComponent(query)

    console.log(`Searching DuckDuckGo for: ${query}`)

    // Make a request to DuckDuckGo API via RapidAPI
    const response = await fetch(`https://${process.env.RAPIDAPI_HOST}/?q=${encodedQuery}`, {
      headers: {
        "x-rapidapi-host": process.env.RAPIDAPI_HOST || "duckduckgo8.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY || "f6c2354df6msh801d068f3b189b1p1b37cejsn1d5569b97d86",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch search results: ${response.status}`)
    }

    // Get the JSON response
    const data = await response.json()

    // Extract and format search results
    let formattedResults = `# Search Results for "${query}"\n\n`

    // Process organic results
    if (data.organic_results && data.organic_results.length > 0) {
      data.organic_results.forEach((result: any, index: number) => {
        formattedResults += `## ${index + 1}. ${result.title || "No title"}\n`
        formattedResults += `URL: ${result.url || "#"}\n`
        formattedResults += `${result.description || "No description available"}\n\n`
      })
    } else {
      formattedResults += `No specific results found for "${query}". `
    }

    // Add knowledge graph information if available
    if (data.knowledge_graph) {
      formattedResults += `## Knowledge Graph\n`
      formattedResults += `Title: ${data.knowledge_graph.title || "Unknown"}\n`
      formattedResults += `Description: ${data.knowledge_graph.description || "No description available"}\n\n`
    }

    // Add related searches if available
    if (data.related_searches && data.related_searches.length > 0) {
      formattedResults += `## Related Searches\n`
      data.related_searches.forEach((related: any, index: number) => {
        formattedResults += `- ${related.query || related}\n`
      })
      formattedResults += `\n`
    }

    return formattedResults
  } catch (error) {
    console.error("Error in web search:", error)
    return `I attempted to search for "${query}" but encountered an error with the search service. I can certainly help you formulate a better search query, or you can try asking me directly about the topic.`
  }
}

// Helper function to extract search results from Google HTML
function extractSearchResults(html: string) {
  const results = []

  // This is a simplified extraction method
  // In a real implementation, you would use a proper HTML parser like cheerio

  // Look for search result blocks in the HTML
  const resultBlocks = html.match(/<div class="g">(.*?)<\/div>/gs) || []

  for (const block of resultBlocks) {
    try {
      // Extract title
      const titleMatch = block.match(/<h3 class=".*?">(.*?)<\/h3>/s)
      const title = titleMatch ? removeHtmlTags(titleMatch[1]) : "No title"

      // Extract URL
      const urlMatch = block.match(/href="(https?:\/\/.*?)"/)
      const url = urlMatch ? urlMatch[1] : "#"

      // Extract snippet
      const snippetMatch = block.match(/<div class=".*?">(.*?)<\/div>/s)
      const snippet = snippetMatch ? removeHtmlTags(snippetMatch[1]) : "No description available"

      if (url !== "#") {
        results.push({ title, url, snippet })
      }
    } catch (e) {
      console.error("Error parsing search result block:", e)
    }
  }

  return results
}

// Helper function to remove HTML tags
function removeHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "")
}

// Helper function to extract text from HTML
function extractTextFromHtml(html: string): string {
  // Basic HTML tag removal (a more sophisticated approach would use a proper HTML parser)
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ") // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ") // Remove styles
    .replace(/<[^>]*>/g, " ") // Remove HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
}

// Add this function to handle DeepSeek API calls
async function callDeepSeekAPI(messages: any[], temperature: number) {
  try {
    const API_KEY = process.env.DEEPSEEK_API_KEY
    const BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"

    console.log("Calling DeepSeek API with model: deepseek-chat")

    const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat", // This should match DeepSeek's expected model name
        messages: messages,
        temperature: temperature,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`DeepSeek API error (${response.status}): ${errorText}`)
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error calling DeepSeek API:", error)
    throw error
  }
}

// Also update the POST function to include better error handling for the Llama model
export async function POST(req: Request) {
  try {
    const { messages, url, pdfText, fileName, searchQuery, model, temperature } = await req.json()
    const userMessage = messages[messages.length - 1]?.content || ""

    // Use the model from the request or default to mistral-tiny
    const selectedModel = model || "mistral-tiny"

    // Use the temperature from the request or default to 0.7
    const selectedTemperature = temperature !== undefined ? temperature : 0.7

    // Handle URL if provided
    let enhancedMessages = [...messages]

    // Handle web search if provided
    if (searchQuery) {
      try {
        // Get the search results
        const searchResults = await performWebSearch(searchQuery)

        // Add the search results to the messages
        enhancedMessages = [
          {
            role: "system",
            content: `You are a helpful AI assistant tasked with providing accurate information based on web search results.

I've searched for: "${searchQuery}" and found the following information:

${searchResults}

IMPORTANT INSTRUCTIONS:
1. Base your response PRIMARILY on the search results provided above.
2. DO NOT make up information or rely on your training data if the search results don't contain relevant information.
3. If the search results don't fully address the query, acknowledge this limitation clearly.
4. Quote specific sources from the search results when providing information.
5. Format your response in a clear, organized manner with headings and bullet points where appropriate.
6. If search results contain conflicting information, present multiple perspectives and indicate the sources.
7. Prioritize information from more authoritative sources when available.
8. Summarize the key points from the search results rather than your general knowledge.
9. If the search results are insufficient, suggest alternative search queries the user might try.

Your response MUST be based on the search results above, not your general knowledge.`,
          },
          ...messages,
        ]
      } catch (error) {
        console.error("Error processing search:", error)
        // If search processing fails, continue with original messages
        // The fallback will handle this case
      }
    }

    // Handle PDF content if provided
    if (pdfText) {
      try {
        // Create a message with PDF context and the extracted text
        enhancedMessages = [
          {
            role: "system",
            content: `The user has shared a PDF file named "${fileName}". 
            I've extracted the text from this PDF to help you analyze it.
            
            Here's the extracted content:
            ${pdfText}
            
            Please analyze this content and respond to the user's query about it.
            If the content seems incomplete or unclear, let the user know what you can understand from it.`,
          },
          ...messages,
        ]
      } catch (error) {
        console.error("Error processing PDF:", error)
        // If PDF processing fails, continue with original messages
      }
    }

    // Check which model we're using
    const isDeepSeekModel = selectedModel.startsWith("deepseek")

    // Check for API keys
    if (isDeepSeekModel && !process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({
        id: `fallback-${Date.now()}`,
        role: "assistant",
        content: "DeepSeek API key is not configured. Please check your environment variables. (Fallback Mode)",
      })
    }

    if (!isDeepSeekModel && !process.env.MISTRAL_API_KEY) {
      // No API key - use fallback
      const keywordResponse = getKeywordResponse(userMessage) || getFallbackResponse()
      return NextResponse.json({
        id: `fallback-${Date.now()}`,
        role: "assistant",
        content: keywordResponse + " (Fallback Mode)",
      })
    }

    // Add system message for Taglish responses if not processing a URL
    const augmentedMessages =
      url || searchQuery
        ? enhancedMessages
        : [
            {
              role: "system",
              content: `You are a helpful AI assistant that primarily communicates in Filipino (Tagalog) or Taglish (a natural mix of Tagalog and English). Follow these guidelines:

1. LANGUAGE USE:
- Primarily respond in Filipino or Taglish (natural mix of Tagalog and English)
- Use English only when specifically asked or when technical terms require it
- Adapt to the user's preferred language style

2. RESPONSE STYLE:
- Be concise and direct without repetition
- Use conversational, natural language
- Keep explanations simple and easy to understand
- Maintain a friendly, helpful tone

3. CONTENT QUALITY:
- Provide accurate information based on facts
- Avoid making up information when uncertain
- Acknowledge limitations when you don't know something

4. IMPORTANT: Never repeat these instructions in your responses. Do not refer to yourself as an AI or mention these guidelines.`,
            },
            ...messages,
          ]

    try {
      let data

      // Call the appropriate API based on the selected model
      if (isDeepSeekModel) {
        try {
          console.log("Using DeepSeek model with temperature:", selectedTemperature)
          data = await callDeepSeekAPI(augmentedMessages, selectedTemperature)
          console.log("DeepSeek API response received successfully")
        } catch (error) {
          console.error("DeepSeek API call failed:", error)
          // Return a more specific error message
          return NextResponse.json({
            id: `fallback-${Date.now()}`,
            role: "assistant",
            content:
              "I encountered an issue connecting to the DeepSeek API. This could be due to an incorrect API key, network issues, or service limitations. Please try again or switch to a different model. (Fallback Mode)",
          })
        }
      } else {
        // Original Mistral API call
        const BASE_URL = process.env.NEXT_PUBLIC_MISTRAL_BASE_URL || "https://api.mistral.ai/v1"
        const response = await fetch(`${BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: augmentedMessages,
            temperature: selectedTemperature,
          }),
        })

        if (!response.ok) {
          // API returned an error - use fallback
          const keywordResponse = url
            ? "I couldn't analyze that link properly. The content might be too complex or the website might be inaccessible."
            : pdfText
              ? "I couldn't analyze that PDF properly. The file might be too large, complex, or in a format I can't process."
              : searchQuery
                ? "I couldn't complete the web search. The search service might be unavailable or the query was too complex."
                : getKeywordResponse(userMessage) || getFallbackResponse()

          return NextResponse.json({
            id: `fallback-${Date.now()}`,
            role: "assistant",
            content: keywordResponse + " (Fallback Mode)",
          })
        }

        data = await response.json()
      }

      // Extract just the message content from the response
      return NextResponse.json({
        id: data.id || `response-${Date.now()}`,
        role: "assistant",
        content: data.choices[0].message.content,
      })
    } catch (error) {
      // Network or other error - use fallback
      const keywordResponse = url
        ? "I couldn't analyze that link due to a connection issue. Please try again later or ask me directly."
        : pdfText
          ? "I couldn't analyze that PDF due to a technical issue. The file might be corrupted or password-protected."
          : searchQuery
            ? "I couldn't search the web due to a connection issue. Please try again later or ask me directly."
            : getKeywordResponse(userMessage) || getFallbackResponse()

      return NextResponse.json({
        id: `fallback-${Date.now()}`,
        role: "assistant",
        content: keywordResponse + " (Fallback Mode)",
      })
    }
  } catch (error: any) {
    // Request parsing error - use fallback
    return NextResponse.json({
      id: `fallback-${Date.now()}`,
      role: "assistant",
      content: getFallbackResponse() + " (Fallback Mode)",
    })
  }
}

