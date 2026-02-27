# Kuwestiyon AI 🤖

**Kuwestiyon AI** is an educational LLM testing interface designed to help developers, students, and educators validate their own model or API integrations.

> [!IMPORTANT]
> **Kuwestiyon 5.2** (a project previously presented to the **DOST iTanong team**) has been evolved and repurposed strictly for **educational purposes**. It provides a robust starting point for anyone looking to understand how LLM-powered applications work under the hood.

---

## 🎓 Educational Mission: "Train Your Dragon" 🐉

This project is built for learners who want to:
- **Build their own ChatGPT**: Use this repository as a high-quality frontend to create your own personalized AI assistant.
- **Connect Your Own API**: Instead of relying on pre-built services, you can plug in your own API endpoints—whether it's a fine-tuned model, a local LLM, or a custom-built service.
- **"Train Your Dragon"**: We encourage you to train or fine-tune your own models and see them come to life in a real-world chat interface.

---

## 🏫 For Educators & Teachers

Kuwestiyon AI is an excellent tool for classroom activities and student assessments:
- **API Integration Labs**: Challenge students to connect their own backends to this frontend.
- **Assessment Tool**: Use the interface to test and assess student-submitted LLM APIs.
- **Real-World Teaching**: Teach the principles of JSON structures, HTTP requests, and the Chat Completions API format in a hands-on environment.
- **Standardized Testing**: Provides a consistent UI for all students, allowing you to focus on evaluating their backend/model performance.

---

## 🌟 Features
- **Clean Chat UI**: A premium, responsive interface for testing and validating model outputs.
- **Learning Reference**: A practical, well-structured codebase for building modern AI applications.
- **Total Flexibility**: Connect any model that supports a chat-completions style API.

---

## 🔌 How to Connect an LLM API

To get your own "ChatGPT-inspired" project running, follow these steps to connect your API:

### 1. The Environment Setup
Create a `.env` (or `.env.local`) file in the root directory. This tells the application where to "talk" to your model:

```env
KUWESTIYON_LLM_API_URL=https://api.yourprovider.com/v1/chat/completions
KUWESTIYON_LLM_API_KEY=sk-your-secret-key-here
KUWESTIYON_LLM_MODEL=gpt-4o-mini # or your custom-model-id
KUWESTIYON_LLM_MAX_TOKENS=16384
```

### 2. API Format Requirements
Your API endpoint must accept a `POST` request with a JSON body and return a response in the standard chat-completions format:

**Sample Request Body:**
```json
{
  "model": "your-model-id",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "max_tokens": 16384
}
```

**Required Response Structure:**
Kuwestiyon AI expects the response to contain the text results in this path: `choices[0].message.content`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- pnpm (recommended) or npm
- Git

### Installation
1. Clone the repository:
```bash
git clone https://github.com/alexisvalentino/Kuwestiyon-AI.git
cd Kuwestiyon-AI
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up your `.env` file as described in the [API Connection](#how-to-connect-an-llm-api) section.

4. Start the development server:
```bash
pnpm dev
```

The application will be available at http://localhost:3000.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **AI Heritage**: Kuwestiyon 5.2

---

## 🐉 Advanced: Custom API Example (Node.js)

If you are teaching students how to build their own backend, here is a simple Express.js template they can use to interface with Kuwestiyon AI:

```ts
import express from "express"

const app = express()
app.use(express.json())

app.post("/v1/chat/completions", async (req, res) => {
  const { messages } = req.body
  
  // Logic to process 'messages' and generate a response...
  const aiResponse = "This is a custom response from my own 'dragon'!"

  res.json({
    choices: [
      {
        message: {
          role: "assistant",
          content: aiResponse,
        },
      },
    ],
  })
})

app.listen(8080, () => console.log("Educational API running on port 8080"))
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
This project is licensed under the MIT License.

## 🙏 Acknowledgments
- Originally presented as **Kuwestiyon 5.2** to the **DOST iTanong team**.
- Built with Next.js, Radix UI, and ❤️ for learners.

## 📞 Contact
For any questions or concerns, please open an issue in the GitHub repository.

