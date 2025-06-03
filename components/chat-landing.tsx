"use client"

import { Button } from "@/components/ui/button"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Mic, FileText, Link, Search, Atom, CheckCircle, Languages, ArrowUp, Plus, Settings } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/ui/loader"

import { Roboto } from "next/font/google"

const roboto = Roboto({
  weight: "100",
  subsets: ["latin"],
  display: "swap",
})

interface ChatLandingProps {
  onSubmit: (message: string) => void
  onSettingsOpen: () => void
  onFileUpload: () => void
  onLinkDialogOpen: () => void
  onSearchDialogOpen: () => void
  isListening: boolean
  toggleRecording: () => void
  recognitionText: string
  selectedModel: string
  setSelectedModel: (model: string) => void
}

export function ChatLanding({
  onSubmit,
  onSettingsOpen,
  onFileUpload,
  onLinkDialogOpen,
  onSearchDialogOpen,
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
  const [showFeatureMenu, setShowFeatureMenu] = useState(false)

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
      `Please translate the following text between Filipino and English (detect the language automatically): "${textToTranslate}"`,
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const menu = document.getElementById("feature-menu")
      const button = document.querySelector("[data-feature-button]")

      if (menu && !menu.contains(event.target as Node) && button && !button.contains(event.target as Node)) {
        setShowFeatureMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Add touch event handlers for better mobile experience
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const menu = document.getElementById("feature-menu")
      const button = document.querySelector("[data-feature-button]")

      if (menu && !menu.contains(e.target as Node) && button && !button.contains(e.target as Node)) {
        setShowFeatureMenu(false)
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
    }
  }, [])

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
          {/* Settings button in top-right corner */}

          {/* Logo */}
          <div className="mb-2 sm:mb-4 md:mb-8 mt-1 sm:mt-2 md:mt-4 flex justify-center">
            <h1
              className={`text-4xl sm:text-5xl md:text-6xl tracking-wide text-gray-500 ${roboto.className} font-thin uppercase letter-spacing-wider`}
            >
              kuwestiyon ai
            </h1>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="w-full relative">
            <Card className="w-full overflow-hidden border shadow-sm">
              <div className="relative flex items-end rounded-lg bg-gray-100 border border-gray-200 focus-within:border-gray-300">
                <div className="flex items-center px-3 py-2">
                  <Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={toggleRecording}>
                    <Mic className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setShowFeatureMenu(!showFeatureMenu)}
                    data-feature-button
                  >
                    <Plus className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={onSettingsOpen}
                    aria-label="Settings"
                  >
                    <Settings className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
                <textarea
                  ref={textareaRef}
                  className="flex-1 text-sm bg-transparent border-0 shadow-none focus:outline-none resize-none text-gray-900 placeholder:text-gray-500 py-3 px-0 h-12 max-h-48"
                  placeholder={isExtraSmall ? "Ask anything..." : "Ask anything in Filipino or English..."}
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

              {/* Feature menu dropdown */}
              {showFeatureMenu && (
                <div
                  id="feature-menu"
                  className="absolute bottom-full left-0 sm:left-12 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-1.5 sm:p-2 z-50 w-[200px] sm:w-[250px] max-w-[95vw] animate-in fade-in-50 slide-in-from-bottom-5 duration-200"
                >
                  <div className="grid grid-cols-1 gap-0.5 sm:gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-xs sm:text-sm h-8 hover:bg-gray-100"
                      onClick={() => {
                        onSearchDialogOpen()
                        setShowFeatureMenu(false)
                      }}
                    >
                      <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />
                      <span>Web Search</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-xs sm:text-sm h-8 hover:bg-gray-100"
                      onClick={() => {
                        setIsFactCheckDialogOpen(true)
                        setShowFeatureMenu(false)
                      }}
                    >
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />
                      <span>Fact Check</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-xs sm:text-sm h-8 hover:bg-gray-100"
                      onClick={() => {
                        setIsPdfDialogOpen(true)
                        setShowFeatureMenu(false)
                      }}
                    >
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />
                      <span>PDF Analysis</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-xs sm:text-sm h-8 hover:bg-gray-100"
                      onClick={() => {
                        setIsTranslateDialogOpen(true)
                        setShowFeatureMenu(false)
                      }}
                    >
                      <Languages className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />
                      <span>Translate</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-xs sm:text-sm h-8 hover:bg-gray-100"
                      onClick={() => {
                        onLinkDialogOpen()
                        setShowFeatureMenu(false)
                      }}
                    >
                      <Link className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />
                      <span>Link Scan</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-xs sm:text-sm h-8 hover:bg-gray-100"
                      onClick={() => {
                        // SIMULATION CODE - Replace this with actual database integration later
                        // This is a temporary simulation of the Database Lookup functionality

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
                            result:
                              "Result: Department of Public Works and Highways has the highest budget allocation (₱1.2 billion)",
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
                      }}
                    >
                      <Atom className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />
                      <span>Database Lookup</span>
                    </Button>
                  </div>
                </div>
              )}
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
            <DialogTitle>Filipino-English Translation</DialogTitle>
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
                I'll automatically detect if the text is Filipino or English and translate it to the other language.
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

