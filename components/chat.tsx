"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Trash, Copy, Volume2, ArrowUp } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ChatLanding } from "./chat-landing"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMediaQuery } from "@/hooks/use-media-query"
import { extractTextFromPdf } from "@/utils/pdf-extractor"
import { Loader } from "@/components/ui/loader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "system" | "error"
  timestamp: Date
}

export function Chat() {
  // Add a new state variable to track whether to show the landing page
  const [showLanding, setShowLanding] = useState(true)

  // Modify the initial messages state to be empty when showing the landing page
  const [messages, setMessages] = useState<Message[]>([])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [copySuccess, setCopySuccess] = useState("")
  const [isProcessingLink, setIsProcessingLink] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [isFactCheckDialogOpen, setIsFactCheckDialogOpen] = useState(false)
  const [factCheckQuery, setFactCheckQuery] = useState("")
  const [isFactChecking, setIsFactChecking] = useState(false)
  const [isTranslateDialogOpen, setIsTranslateDialogOpen] = useState(false)
  const [textToTranslate, setTextToTranslate] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false)
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null)
  const [isPdfUploading, setIsPdfUploading] = useState(false)
  const [uploadedPdfName, setUploadedPdfName] = useState("")
  const [isDatabaseDialogOpen, setIsDatabaseDialogOpen] = useState(false)
  const [simulatedQuery, setSimulatedQuery] = useState({ question: "", sql: "", result: "" })
  // Add state for clear chat confirmation dialog
  const [isClearChatDialogOpen, setIsClearChatDialogOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Speech recognition states
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognitionText, setRecognitionText] = useState("")
  const [recognitionLanguage, setRecognitionLanguage] = useState("en-PH")
  const [autoSend, setAutoSend] = useState(false)
  const [continuousListening, setContinuousListening] = useState(false)
  const [speechRate, setSpeechRate] = useState(1)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Add temperature state
  const [selectedModel, setSelectedModel] = useState("kuwestiyon-5.2")
  const [temperature, setTemperature] = useState(0.7)

  // Media query for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  const modelOptions = [
    { id: "kuwestiyon-5.2", label: "Kuwestiyon 5.2" },
  ]

  // Initialize speech recognition
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when not recording
  useEffect(() => {
    if (!isListening && !isProcessing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isListening, isProcessing])

  // Speech recognition setup
  useEffect(() => {
    if (!isMounted) return

    let recognition: any = null

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        return
      }

      recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      recognition.continuous = continuousListening
      recognition.interimResults = true
      recognition.lang = recognitionLanguage

      recognition.onstart = () => {
        setIsListening(true)
        setRecognitionText("")
      }

      recognition.onresult = (event: any) => {
        if (!event.results?.[0]) return

        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("")

        setRecognitionText(transcript)
        setInput(transcript)

        // If this is a final result and autoSend is enabled
        if (event.results[0].is_final && autoSend && transcript.trim()) {
          setTimeout(() => {
            handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>)
          }, 500)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        setIsListening(false)
        setIsProcessing(false)
      }

      recognition.onend = () => {
        setIsListening(false)
        setIsProcessing(true)

        setTimeout(() => {
          setIsProcessing(false)

          if (continuousListening && !autoSend && recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch (error) {
              console.error("Could not restart continuous listening", error)
            }
          }
        }, 500)
      }

      // Clean up function
      return () => {
        if (recognition) {
          try {
            recognition.abort()
          } catch (error) {
            console.error("Error cleaning up speech recognition:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error initializing speech recognition:", error)
    }
  }, [isMounted, continuousListening, recognitionLanguage, autoSend])

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition()
          recognition.continuous = continuousListening
          recognition.interimResults = true
          recognition.lang = recognitionLanguage
          recognitionRef.current = recognition

          recognition.onstart = () => {
            setIsListening(true)
            setRecognitionText("")
          }

          recognition.onresult = (event: any) => {
            if (!event.results?.[0]) return

            const transcript = Array.from(event.results)
              .map((result: any) => result[0])
              .map((result: any) => result.transcript)
              .join("")

            setRecognitionText(transcript)
            setInput(transcript)

            if (event.results[0].is_final && autoSend && transcript.trim()) {
              setTimeout(() => {
                handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>)
              }, 500)
            }
          }

          recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error)
            setIsListening(false)
            setIsProcessing(false)
          }
          recognition.onend = () => {
            setIsListening(false)
            setIsProcessing(true)

            setTimeout(() => {
              setIsProcessing(false)

              if (continuousListening && !autoSend && recognitionRef.current) {
                try {
                  recognitionRef.current.start()
                } catch (error) {
                  console.error("Could not restart continuous listening", error)
                }
              }
            }, 500)
          }
        } else {
          console.error("Speech Recognition API not supported in this browser")
          alert("Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.")
          return
        }
      } catch (error) {
        console.error("Error initializing speech recognition:", error)
        return
      }
    }

    try {
      if (isListening) {
        recognitionRef.current.abort()
        setIsListening(false)
      } else {
        recognitionRef.current.start()
      }
    } catch (error) {
      console.error("Speech recognition error:", error)
      setIsListening(false)
      setIsProcessing(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      console.log("Selected image:", files[0])
    }
  }

  // Add a function to handle file input click
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Add a function to handle file selection
  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedPdfFile(files[0])
    }
  }

  // Add a function to handle the PDF upload
  const handlePdfUpload = () => {
    if (!selectedPdfFile) return

    setIsPdfUploading(true)

    // Create a synthetic event to pass to the existing handleFileUpload function
    const syntheticEvent = {
      target: {
        files: [selectedPdfFile],
      },
    } as React.ChangeEvent<HTMLInputElement>

    // Use the existing handleFileUpload function
    handleFileUpload(syntheticEvent).finally(() => {
      setIsPdfUploading(false)
      setIsPdfDialogOpen(false)
      setSelectedPdfFile(null)
    })
  }

  // Add this function with the other handler functions
  const handleDatabaseLookup = () => {
    // Sample database schema for simulation
    // - government_employees (id, name, department, position, city, salary, hire_date)
    // - government_projects (id, name, department, budget, start_date, end_date, status)
    // - city_offices (id, city, address, department, employee_count, budget)
    // - budget_allocations (id, department, fiscal_year, amount, category)
    // - public_services (id, name, department, city, beneficiaries, annual_cost)

    // Get a random question to simulate user input
    const questions = [
      "How many government employees are there in Manila?",
      "How many government employees are there in Quezon City?",
      "What is the total budget for the infrastructure projects?",
      "How much budget was allocated to the Department of Education this year?",
      "Which city has the most government employees?",
      "How many infrastructure projects are currently ongoing?",
      "What is the average salary of government employees in Manila?",
      "How many employees work in the Department of Health?",
      "Which department has the highest budget allocation?",
      "How many public services are available in Quezon City?",
      "What is the total cost of public services in Manila?",
      "How many government employees were hired in the last fiscal year?",
      "What is the gender distribution of government employees?",
    ]

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]

    // Simulate SQL queries and results
    const sqlQueries = {
      "How many government employees are there in Manila?": {
        sql: "SELECT COUNT(*) FROM government_employees WHERE city = 'Manila'",
        result: "Result: 12,458 government employees in Manila",
      },
      "How many government employees are there in Quezon City?": {
        sql: "SELECT COUNT(*) FROM government_employees WHERE city = 'Quezon City'",
        result: "Result: 15,723 government employees in Quezon City",
      },
      "What is the total budget for the infrastructure projects?": {
        sql: "SELECT SUM(budget) FROM government_projects WHERE department = 'Department of Public Works and Highways' AND category = 'Infrastructure'",
        result: "Result: ₱24.7 billion total budget for infrastructure projects",
      },
      "How much budget was allocated to the Department of Education this year?": {
        sql: "SELECT SUM(amount) FROM budget_allocations WHERE department = 'Department of Education' AND fiscal_year = YEAR(CURDATE())",
        result: "Result: ₱782.6 million allocated to Department of Education this year",
      },
      "Which city has the most government employees?": {
        sql: "SELECT city, COUNT(*) as employee_count FROM government_employees GROUP BY city ORDER BY employee_count DESC LIMIT 1",
        result: "Result: Quezon City has the most government employees (15,723)",
      },
      "How many infrastructure projects are currently ongoing?": {
        sql: "SELECT COUNT(*) FROM government_projects WHERE status = 'Ongoing' AND category = 'Infrastructure'",
        result: "Result: 37 ongoing infrastructure projects",
      },
      "What is the average salary of government employees in Manila?": {
        sql: "SELECT AVG(salary) FROM government_employees WHERE city = 'Manila'",
        result: "Result: Average salary is ₱32,450.75 for government employees in Manila",
      },
      "How many employees work in the Department of Health?": {
        sql: "SELECT COUNT(*) FROM government_employees WHERE department = 'Department of Health'",
        result: "Result: 8,542 employees work in the Department of Health",
      },
      "Which department has the highest budget allocation?": {
        sql: "SELECT department, SUM(amount) as total_budget FROM budget_allocations WHERE fiscal_year = YEAR(CURDATE()) GROUP BY department ORDER BY total_budget DESC LIMIT 1",
        result: "Result: Department of Public Works and Highways has the highest budget allocation (₱1.2 billion)",
      },
      "How many public services are available in Quezon City?": {
        sql: "SELECT COUNT(*) FROM public_services WHERE city = 'Quezon City'",
        result: "Result: 78 public services available in Quezon City",
      },
      "What is the total cost of public services in Manila?": {
        sql: "SELECT SUM(annual_cost) FROM public_services WHERE city = 'Manila'",
        result: "Result: ₱567.3 million annual cost for public services in Manila",
      },
      "How many government employees were hired in the last fiscal year?": {
        sql: "SELECT COUNT(*) FROM government_employees WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)",
        result: "Result: 2,345 government employees were hired in the last fiscal year",
      },
      "What is the gender distribution of government employees?": {
        sql: "SELECT gender, COUNT(*) as count, ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM government_employees), 2) as percentage FROM government_employees GROUP BY gender",
        result: "Result: Male: 23,456 (48.7%), Female: 24,678 (51.2%), Non-binary: 45 (0.1%)",
      },
    }

    // Set the simulated query and open the dialog
    const queryResult = sqlQueries[randomQuestion]
    setSimulatedQuery({
      question: randomQuestion,
      sql: queryResult.sql,
      result: queryResult.result,
    })
    setIsDatabaseDialogOpen(true)
    setShowFeatureMenu(false)
  }

  // Update the handleFileUpload function to include the selected model
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Check if it's a PDF
    if (file.type !== "application/pdf") {
      setApiError("Only PDF files are supported for analysis.")
      return
    }

    setIsProcessingFile(true)

    // Add user message about the PDF
    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Please analyze this PDF: ${file.name}`,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setApiError(null)

    try {
      // Extract text from the PDF using our utility function
      const extractedText = await extractTextFromPdf(file)

      // If the extracted text is too long, truncate it
      const maxLength = 15000 // Adjust based on your needs and model limitations
      const truncatedText =
        extractedText.length > maxLength
          ? extractedText.substring(0, maxLength) + "... [Text truncated due to length]"
          : extractedText

      // Send to API with the extracted text
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage.content }],
          pdfText: truncatedText,
          fileName: file.name,
          model: selectedModel,
          temperature: temperature,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process PDF")
      }

      const data = await response.json()

      // Add AI response
      const aiMessage: Message = {
        id: data.id || Date.now().toString() + "-ai",
        content: data.content,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error: any) {
      console.error("Error processing PDF:", error)
      setApiError(error.message || "Failed to process the PDF. Please try again later.")

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          content: "I couldn't analyze that PDF file. The file might be too large, corrupted, or password-protected.",
          role: "error",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsProcessingFile(false)
      // Clear the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    setShowLanding(false) // Hide the landing page when uploading a file
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Update the handleSubmit function to include temperature
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    // Reset textarea height after submission
    if (inputRef.current) {
      inputRef.current.style.height = "48px"
    }
    setApiError(null)
    setIsLoading(true)
    setShowLanding(false) // Hide the landing page

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage.content }],
          model: selectedModel,
          temperature: temperature, // Pass temperature to the API
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response from AI")
      }

      const data = await response.json()

      // Add AI response
      const aiMessage: Message = {
        id: data.id || Date.now().toString() + "-ai",
        content: data.content,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error: any) {
      console.error("Error sending message:", error)
      setApiError(error.message || "The AI service isn't available at the moment. Please try again later.")

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          content: "The AI service isn't available at the moment. Please try again later.",
          role: "error",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Add a function to handle message submission from the landing page
  const handleLandingSubmit = (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setApiError(null)
    setIsLoading(true)
    setShowLanding(false)

    // Call the API
    fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: message }],
        model: selectedModel,
        temperature: temperature,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to get response from AI")
        }
        return response.json()
      })
      .then((data) => {
        // Add AI response
        const aiMessage: Message = {
          id: data.id || Date.now().toString() + "-ai",
          content: data.content,
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
      })
      .catch((error) => {
        console.error("Error sending message:", error)
        setApiError(error.message || "The AI service isn't available at the moment. Please try again later.")

        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-error",
            content: "The AI service isn't available at the moment. Please try again later.",
            role: "error",
            timestamp: new Date(),
          },
        ])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // Update the handleLinkInsert function to include the selected model
  const handleLinkInsert = async () => {
    if (!linkUrl) return

    // Option 1: Insert link into input field (original behavior)
    if (!linkUrl.startsWith("http")) {
      const newText = input + ` [link](${linkUrl})`
      setInput(newText)
      setLinkUrl("")
      setIsLinkDialogOpen(false)
      return
    }

    // Option 2: Process link and get AI response
    setIsProcessingLink(true)
    setIsLinkDialogOpen(false)

    // Add user message with the link
    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Please analyze this link: ${linkUrl}`,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLinkUrl("")
    setApiError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage.content }],
          url: linkUrl,
          model: selectedModel,
          temperature: temperature, // Pass temperature to the API
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process link")
      }

      const data = await response.json()

      // Add AI response
      const aiMessage: Message = {
        id: data.id || Date.now().toString() + "-ai",
        content: data.content,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error: any) {
      console.error("Error processing link:", error)
      setApiError(error.message || "Failed to process the link. Please try again later.")

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          content: "I couldn't process that link. Please try a different link or ask a question directly.",
          role: "error",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsProcessingLink(false)
    }

    setShowLanding(false) // Hide the landing page when inserting a link
  }

  // Modified to use in-app dialog instead of browser confirm
  const openClearChatDialog = () => {
    if (messages.length === 0) {
      return // No need to clear if no messages
    }
    setIsClearChatDialogOpen(true)
  }

  // Function to actually clear the chat when confirmed
  const clearChat = () => {
    // Reset our messages
    setMessages([])
    setShowLanding(true) // Show the landing page again
    setIsClearChatDialogOpen(false) // Close the dialog

    // Clear input and recognition text
    setInput("")
    setRecognitionText("")

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "48px"
    }

    // Clear any errors
    setApiError(null)

    // Stop any ongoing speech or recognition
    if (isListening && recognitionRef.current) {
      recognitionRef.current.abort()
      setIsListening(false)
    }

    if (isSpeaking) {
      stopSpeaking()
    }

    // Show a brief toast or notification
    const notification = document.createElement("div")
    notification.className =
      "fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded shadow-lg transition-opacity duration-500"
    notification.textContent = "Chat cleared"
    document.body.appendChild(notification)

    // Remove notification after 2 seconds
    setTimeout(() => {
      notification.style.opacity = "0"
      setTimeout(() => document.body.removeChild(notification), 500)
    }, 2000)
  }

  const copyConversation = () => {
    const conversationText = messages
      .map((msg) => `${msg.role === "user" ? "You" : msg.role === "assistant" ? "AI" : "System"}: ${msg.content}`)
      .join("\n\n")

    navigator.clipboard
      .writeText(conversationText)
      .then(() => {
        setCopySuccess("Copied!")
        setTimeout(() => setCopySuccess(""), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy conversation:", err)
        setCopySuccess("Failed to copy")
      })
  }

  const copyMessage = (text: string) => {
    // Ensure we're only copying the specific message text
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Message copied successfully")
        setCopySuccess("Copied!")
        setTimeout(() => setCopySuccess(""), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy message:", err)
        setCopySuccess("Failed to copy")
      })
  }

  const speakMessage = (text: string) => {
    if (!("speechSynthesis" in window)) {
      console.error("Speech synthesis not supported")
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = speechRate
    utterance.lang = recognitionLanguage

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const submitVoiceInput = () => {
    if (recognitionText.trim()) {
      // Stop listening if active
      if (isListening && recognitionRef.current) {
        recognitionRef.current.abort()
        setIsListening(false)
      }

      // Submit the recognized text
      handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>)
    }
  }

  // Function to handle fact checking
  const handleFactCheck = () => {
    if (!factCheckQuery.trim()) return

    setIsFactChecking(true)
    setIsFactCheckDialogOpen(false)

    // Add user message with the fact check query
    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Please fact check this claim: ${factCheckQuery}`,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setFactCheckQuery("")
    setApiError(null)
    setShowLanding(false)

    // In a real implementation, this would make an API call to a fact checking service
    // For now, we'll simulate a response after a delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now().toString() + "-ai",
        content: `I've checked the claim: "${factCheckQuery}"\n\nBased on information from Tsek.ph and other fact-checking sources, this claim appears to be partially accurate but lacks important context. Multiple credible sources have addressed similar claims with additional nuance.\n\nWould you like me to provide more detailed information about this topic?`,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsFactChecking(false)
    }, 2000)
  }

  const handleTranslate = () => {
    if (!textToTranslate.trim()) return

    setIsTranslating(true)
    setIsTranslateDialogOpen(false)

    // Add user message with the translation request
    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Please translate the following text (auto-detect the source language): "${textToTranslate}"`,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setTextToTranslate("")
    setApiError(null)
    setShowLanding(false)

    // Call the API
    fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: userMessage.content,
          },
        ],
        model: selectedModel,
        temperature: temperature,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to get translation from AI")
        }
        return response.json()
      })
      .then((data) => {
        // Add AI response
        const aiMessage: Message = {
          id: data.id || Date.now().toString() + "-ai",
          content: data.content,
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
      })
      .catch((error) => {
        console.error("Error translating text:", error)
        setApiError(error.message || "The translation service isn't available at the moment. Please try again later.")

        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-error",
            content: "I couldn't complete the translation. Please try again later.",
            role: "error",
            timestamp: new Date(),
          },
        ])
      })
      .finally(() => {
        setIsTranslating(false)
      })
  }







  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {showLanding ? (
        <ChatLanding
          onSubmit={handleLandingSubmit}
          onFileUpload={handleFileInputClick}
          onLinkDialogOpen={() => setIsLinkDialogOpen(true)}
          isListening={isListening}
          toggleRecording={toggleRecording}
          recognitionText={recognitionText}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
      ) : (
        /* Main chat interface */
        <div className="flex-1 flex flex-col w-full max-w-full">
          <div className="flex-1 flex justify-center items-stretch px-2 sm:px-4 py-4">
            <div className="flex w-full max-w-4xl rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex flex-col flex-1">
                {/* Header inside card */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/logo.png"
                      alt="Kuwestiyon AI"
                      width={120}
                      height={30}
                      className="h-6 w-auto"
                      priority
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={openClearChatDialog}
                      aria-label="Clear chat history"
                      className="glass-icon h-9 w-9 rounded-full"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {apiError && (
                  <div className="px-4 pt-3">
                    <Alert variant="destructive" className="glass-surface">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{apiError}</AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Messages */}
                <ScrollArea className="flex-1 px-2 sm:px-4 pt-3 pb-2">
                  <div className="flex flex-col gap-6 w-full">
              {messages.map((message) => (
                <div key={message.id} className="group w-full">
                  <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-2 w-full`}>
                    <div
                      className={`p-4 rounded-lg ${
                        message.role === "user"
                          ? "glass-surface text-gray-900 max-w-[85%] sm:max-w-[75%] md:max-w-[65%]"
                          : message.role === "error"
                            ? "bg-red-500/10 text-red-900 border border-red-500/20 backdrop-blur-xl max-w-[90%] sm:max-w-[80%] md:max-w-[70%]"
                            : "glass-surface-soft text-gray-900 max-w-[90%] sm:max-w-[80%] md:max-w-[70%]"
                      } break-words overflow-hidden`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                  {/* Replace the message action buttons section with: */}
                  {message.role === "assistant" && (
                    <div className="mt-1 flex items-center gap-2 justify-start">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="glass-icon h-8 w-8 rounded-full relative"
                        onClick={() => {
                          copyMessage(message.content)
                          // Show a temporary "Copied!" tooltip directly on this button
                          const button = document.createElement("div")
                          button.className =
                            "absolute -top-9 left-1/2 -translate-x-1/2 glass-surface text-gray-900 text-xs px-2 py-1 rounded-md"
                          button.textContent = "Copied!"
                          button.style.zIndex = "50"
                          button.style.whiteSpace = "nowrap"

                          // Add to DOM
                          const currentButton = document.activeElement as HTMLElement
                          currentButton?.appendChild(button)

                          // Remove after 2 seconds
                          setTimeout(() => {
                            if (currentButton?.contains(button)) {
                              currentButton.removeChild(button)
                            }
                          }, 2000)
                        }}
                        aria-label="Copy message"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="glass-icon h-8 w-8 rounded-full"
                        onClick={() => speakMessage(message.content)}
                        aria-label="Read aloud"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {(isLoading || isProcessingLink || isProcessingFile || isFactChecking) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                      ●
                    </span>
                    <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                      ●
                    </span>
                  </div>
                  <span className="text-sm sm:text-base">
                    Kuwestiyon AI is{" "}
                    {isProcessingLink
                      ? "analyzing the link"
                      : isProcessingFile
                        ? "analyzing the PDF"
                          : isFactChecking
                            ? "checking the facts"
                            : isTranslating
                              ? "translating the text"
                              : "thinking"}
                    ...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Composer */}
                <div className="px-2 sm:px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50/60">
            {(isListening || isProcessing) && (
              <div className="mb-2 px-3 py-2 rounded-md glass-surface text-xs sm:text-sm flex items-center">
                {isListening && (
                  <div className="flex items-center gap-2 text-red-500">
                    <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-red-500"></span>
                    </span>
                    <span>Listening...</span>
                  </div>
                )}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-amber-500">
                    <span className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                        ●
                      </span>
                      <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                        ●
                      </span>
                    </span>
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            )}
            <div className="relative mt-1">
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <div className="relative flex items-end rounded-xl glass-surface focus-within:ring-2 focus-within:ring-ring/40">
                  <div className="flex items-center px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="glass-icon rounded-full"
                      onClick={toggleRecording}
                    >
                      <Mic className="h-5 w-5 text-gray-500" />
                    </Button>
                  </div>
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    className="flex-1 text-sm bg-transparent border-0 shadow-none focus:outline-none resize-none text-gray-900 placeholder:text-gray-500 py-3 px-0 h-12 max-h-48"
                    placeholder="Ask anything"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      // Auto-resize the textarea
                      e.target.style.height = "48px" // Reset height first
                      const newHeight = e.target.value.trim() ? Math.min(e.target.scrollHeight, 192) : 48
                      e.target.style.height = `${newHeight}px`
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        if (input.trim()) {
                          handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>)
                        }
                      }
                    }}
                    rows={1}
                  />
                  <div className="flex items-center px-3 py-2">
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="glass-icon rounded-full"
                      disabled={!input.trim() || isLoading}
                    >
                      <ArrowUp className="h-5 w-5 text-gray-700" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1 pt-1 text-xs text-gray-500">
                  <span className="hidden sm:inline">Connected to your configured LLM API.</span>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="h-8 w-40 rounded-full border border-white/40 bg-white/60 text-xs text-gray-700 shadow-sm">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="text-sm">
                      {modelOptions.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between px-1 pt-1 text-xs text-gray-500">
                  <span className="hidden sm:inline">Kuwestiyon AI is an educational interface for your own LLM APIs.</span>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="h-8 w-40 rounded-full border border-white/40 bg-white/80 text-xs text-gray-700 shadow-sm">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="text-sm">
                      {modelOptions.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </div>
          </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Keep the hidden inputs and dialogs outside the conditional rendering */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf" />
      <input type="file" ref={imageInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />

      {/* Clear Chat Confirmation Dialog */}
      <Dialog open={isClearChatDialogOpen} onOpenChange={setIsClearChatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear Chat History</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear the entire chat history? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsClearChatDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={clearChat}>
              Clear Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link Options</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="Please enter the URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a URL starting with http:// or https:// to have the AI analyze the content. Otherwise, it will be
                inserted as a markdown link in your message.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleLinkInsert} disabled={!linkUrl.trim() || isProcessingLink}>
              {isProcessingLink ? (
                <>
                  <Loader size="md" className="mr-2" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Fact Check Dialog */}
      <Dialog open={isFactCheckDialogOpen} onOpenChange={setIsFactCheckDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fact Check with Tsek.ph</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fact-check">Claim to verify</Label>
              <Input
                id="fact-check"
                placeholder="Enter a claim to fact check"
                value={factCheckQuery}
                onChange={(e) => setFactCheckQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleFactCheck()
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                I'll check this claim against Tsek.ph's database of verified facts to help combat misinformation.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsFactCheckDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleFactCheck} disabled={!factCheckQuery.trim() || isFactChecking}>
              {isFactChecking ? (
                <>
                  <Loader size="md" className="mr-2" />
                  Checking...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Translation Dialog */}
      <Dialog open={isTranslateDialogOpen} onOpenChange={setIsTranslateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Translation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="translate-text">Text to translate</Label>
              <Input
                id="translate-text"
                placeholder="Enter text to translate"
                value={textToTranslate}
                onChange={(e) => setTextToTranslate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleTranslate()
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                I'll automatically detect the language and translate it.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsTranslateDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleTranslate} disabled={!textToTranslate.trim() || isTranslating}>
              {isTranslating ? (
                <>
                  <Loader size="md" className="mr-2" />
                  Translating...
                </>
              ) : (
                "Translate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add the PDF Upload Dialog at the end of the component, with the other dialogs */}
      <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>PDF Document Upload</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="pdf-file">Select PDF Document</Label>
              <Input
                id="pdf-file"
                type="file"
                accept=".pdf"
                onChange={handlePdfFileSelect}
                className="cursor-pointer"
              />
              {selectedPdfFile && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {selectedPdfFile.name} ({(selectedPdfFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Upload a PDF document first, then you can ask me to analyze specific aspects of it.
              </p>
              {uploadedPdfName && (
                <div className="bg-blue-50 p-2 rounded-md mt-2">
                  <p className="text-sm font-medium">Currently loaded: {uploadedPdfName}</p>
                  <p className="text-xs text-muted-foreground">You can upload a new PDF to replace it</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsPdfDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handlePdfUpload} disabled={!selectedPdfFile || isPdfUploading}>
              {isPdfUploading ? (
                <>
                  <Loader size="md" className="mr-2" />
                  Uploading...
                </>
              ) : (
                "Upload PDF"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Database Lookup Dialog */}
      <Dialog open={isDatabaseDialogOpen} onOpenChange={setIsDatabaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Database Lookup</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Natural Language Query</Label>
              <div className="bg-muted p-3 rounded-md text-sm">{simulatedQuery.question}</div>
            </div>
            <div className="grid gap-2">
              <Label>Translated SQL</Label>
              <div className="bg-muted p-3 rounded-md text-sm font-mono">{simulatedQuery.sql}</div>
            </div>
            <div className="grid gap-2">
              <Label>Query Result</Label>
              <div className="bg-muted p-3 rounded-md text-sm">{simulatedQuery.result}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Connects to actual databases (like government agencies) to fetch and return real data based on your
              questions. This is a simulation of the Database Lookup functionality. Actual database integration coming
              soon.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsDatabaseDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isSpeaking && (
        <div className="fixed bottom-16 sm:bottom-24 right-2 sm:right-4 bg-primary text-primary-foreground px-2 py-1 sm:px-3 sm:py-2 rounded-full shadow-lg flex items-center gap-2 text-xs sm:text-sm">
          <div className="flex gap-1">
            <span className="animate-pulse">●</span>
            <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>
              ●
            </span>
            <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>
              ●
            </span>
          </div>
          <span>Speaking</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            onClick={stopSpeaking}
          >
            <span className="sr-only">Stop speaking</span>
            <span>×</span>
          </Button>
        </div>
      )}
    </div>
  )
}

