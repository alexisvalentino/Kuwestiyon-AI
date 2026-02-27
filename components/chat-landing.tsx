"use client"

import { Button } from "@/components/ui/button"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Mic, ArrowUp } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/ui/loader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

import { Roboto } from "next/font/google"

const roboto = Roboto({
  weight: "100",
  subsets: ["latin"],
  display: "swap",
})

interface ChatLandingProps {
  onSubmit: (message: string) => void
  onFileUpload: () => void
  onLinkDialogOpen: () => void
  isListening: boolean
  toggleRecording: () => void
  recognitionText: string
  selectedModel: string
  setSelectedModel: (model: string) => void
}

export function ChatLanding({
  onSubmit,
  onFileUpload,
  onLinkDialogOpen,
  isListening,
  toggleRecording,
  recognitionText,
  selectedModel,
  setSelectedModel,
}: ChatLandingProps) {
  const [input, setInput] = useState("")
  const [isDatabaseDialogOpen, setIsDatabaseDialogOpen] = useState(false)
  const [isFactCheckDialogOpen, setIsFactCheckDialogOpen] = useState(false)
  const [factCheckQuery, setFactCheckQuery] = useState("")
  const [isFactChecking, setIsFactChecking] = useState(false)
  const [simulatedQuery, setSimulatedQuery] = useState({ question: "", sql: "", result: "" })
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isExtraSmall = useMediaQuery("(max-width: 350px)")
  const [isTranslateDialogOpen, setIsTranslateDialogOpen] = useState(false)
  const [textToTranslate, setTextToTranslate] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false)
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null)
  const [isPdfUploading, setIsPdfUploading] = useState(false)
  const [uploadedPdfName, setUploadedPdfName] = useState("")


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !recognitionText.trim()) return
    onSubmit(input.trim() || recognitionText.trim())
    setInput("")
  }

  // Function to handle fact checking
  const handleFactCheck = () => {
    if (!factCheckQuery.trim()) return

    setIsFactChecking(true)
    setIsFactCheckDialogOpen(false)

    // Simulate processing delay and add a user message
    const userMessage = `Please fact check this claim: ${factCheckQuery}`
    onSubmit(userMessage)

    // In a real implementation, this would make an API call to a fact checking service
    setFactCheckQuery("")
    setIsFactChecking(false)
  }

  // Function to handle translation
  const handleTranslate = () => {
    if (!textToTranslate.trim()) return

    setIsTranslating(true)
    setIsTranslateDialogOpen(false)

    // Submit the translation request
    onSubmit(
      `Please translate the following text (auto-detect the source language): "${textToTranslate}"`,
    )

    // Reset state
    setTextToTranslate("")
    setIsTranslating(false)
  }

  // Add auto-resize effect for textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Add a function to handle the PDF upload simulation
  const handlePdfUploadSimulation = () => {
    if (!selectedPdfFile) return

    setIsPdfUploading(true)

    // Simulate upload process
    setTimeout(() => {
      setIsPdfUploading(false)
      setUploadedPdfName(selectedPdfFile.name)
      setSelectedPdfFile(null)
      setIsPdfDialogOpen(false)

      // Show success message
      onSubmit(`I've uploaded the PDF "${selectedPdfFile.name}". What would you like to know about this document?`)
    }, 1500)
  }

  // Add a function to handle file selection
  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedPdfFile(files[0])
    }
  }





  // Reset textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px"
    }
    setInput("")
  }, [])

  return (
    <ScrollArea className="h-screen w-full">
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background py-4 sm:py-8">
        <div className="w-full max-w-[98%] sm:max-w-3xl flex flex-col items-center px-1 sm:px-4 relative">
          {/* Logo */}
          <div className="mb-6 sm:mb-8 md:mb-10 mt-1 sm:mt-2 md:mt-4 flex justify-center">
            <Image
              src="/logo.png"
              alt="Kuwestiyon AI"
              width={160}
              height={40}
              priority
              className="h-auto w-auto max-w-full"
            />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="w-full relative">
            <Card className="w-full overflow-hidden border-none shadow-none bg-transparent">
              <div className="relative flex flex-col gap-1 rounded-3xl glass-surface-soft px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-end">
                <div className="flex items-center px-3 py-2">
                  <Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={toggleRecording}>
                    <Mic className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
                <textarea
                  ref={textareaRef}
                  className="flex-1 text-sm bg-transparent border-0 shadow-none focus:outline-none resize-none text-gray-900 placeholder:text-gray-500 py-3 px-0 h-12 max-h-48"
                  placeholder="Ask anything..."
                  value={input || recognitionText}
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
                      if (input.trim() || recognitionText.trim()) {
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
                    className="rounded-full bg-gray-200 hover:bg-gray-300"
                    disabled={!input.trim() && !recognitionText.trim()}
                  >
                    <ArrowUp className="h-5 w-5 text-gray-700" />
                  </Button>
                </div>
                </div>
                <div className="flex items-center justify-between px-3 pt-1 text-xs text-gray-500">
                  <span className="hidden sm:inline">Use Kuwestiyon AI as a playground for your own LLM APIs.</span>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="h-8 w-40 rounded-full border border-white/40 bg-white/60 text-xs text-gray-700 shadow-sm">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="text-sm">
                      <SelectItem value="kuwestiyon-5.2">Kuwestiyon 5.2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>


            </Card>
          </form>
        </div>
      </div>
      {/* Database Lookup Dialog */}
      <Dialog open={isDatabaseDialogOpen} onOpenChange={setIsDatabaseDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[80vh] overflow-y-auto">
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

      {/* Add Fact Check Dialog */}
      <Dialog open={isFactCheckDialogOpen} onOpenChange={setIsFactCheckDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[80vh] overflow-y-auto">
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

      {/* Add Translation Dialog */}
      <Dialog open={isTranslateDialogOpen} onOpenChange={setIsTranslateDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[80vh] overflow-y-auto">
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
      {/* PDF Upload Dialog */}
      <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[80vh] overflow-y-auto">
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
            <Button type="button" onClick={handlePdfUploadSimulation} disabled={!selectedPdfFile || isPdfUploading}>
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
    </ScrollArea>
  )
}

