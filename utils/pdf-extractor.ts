// We'll use the window object to access PDF.js loaded from a CDN
declare global {
  interface Window {
    pdfjsLib: any
  }
}

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // Check if PDF.js is loaded
    if (!window.pdfjsLib) {
      // Load PDF.js from CDN if not already loaded
      await loadPdfJs()
    }

    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Load the PDF document using the global pdfjsLib
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ""

    // Get total number of pages
    const numPages = pdf.numPages

    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(" ")

      fullText += pageText + "\n\n"
    }

    return fullText
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

// Helper function to load PDF.js from CDN
async function loadPdfJs(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create script element for PDF.js
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"
    script.onload = () => {
      // Set worker source after library is loaded
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js"
      resolve()
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

