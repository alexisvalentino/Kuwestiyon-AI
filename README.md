# Kuwestiyon AI 🤖

![Kuwestiyon AI Banner](file:///c:/Users/alexi/vscode/Kuwestiyon-AI/public/banner.png)

**Kuwestiyon AI** is a Filipino-language model built on the Mistral architecture, developed to support real-time, natural conversations in Filipino. Originally evolved from the heritage of the **iTANONG Project**, this platform has been **completely redesigned and repurposed** as a premium template for students, developers, and educators to build and test their own LLM applications.

> [!IMPORTANT]
> **Kuwestiyon 5.2** (a project previously presented to the **DOST iTANONG team**) now serves as a high-fidelity starting point. It provides a robust, professional-grade interface for anyone looking to understand how LLM-powered applications work under the hood.

---

## 📱 Interface Showcase
The interface has been totally redesigned for a premium, modern experience.

<div align="center">
  <img src="file:///c:/Users/alexi/vscode/Kuwestiyon-AI/public/kuwestiyon1.png" width="23%" />
  <img src="file:///c:/Users/alexi/vscode/Kuwestiyon-AI/public/kuwestiyon2.png" width="23%" />
  <img src="file:///c:/Users/alexi/vscode/Kuwestiyon-AI/public/kuwestiyon3.png" width="23%" />
  <img src="file:///c:/Users/alexi/vscode/Kuwestiyon-AI/public/kuwestiyon4.png" width="23%" />
</div>

> [!NOTE]
> Please note that no further screenshots or internal details will be shared due to NDA (Non-Disclosure Agreement) purposes.

---

## 🏛️ Heritage: The iTANONG Project
The value proposition of Kuwestiyon AI is deeply rooted in the objectives of the **iTANONG project** (Department of Science and Technology - Advanced Science and Technology Institute). 

### What is iTANONG?
iTANONG is a Natural Language Interface to Databases (NLIDB) for Filipinos. It allows users to access information stored in databases and generate insights just by typing requests in **Filipino, English, or Taglish**.

### The Value Proposition
Imagine a government or organization database where you can simply ask:
- *"Ilan ang kabuuang empleyado natin?"* (How many total employees are there?)
- *"Ano ang budget ng departamento para sa taong ito?"* (What's the department's budget for this year?)

Kuwestiyon AI brings this vision to life through **SagotDB**, enabling NLP-driven SQL queries that make critical data transparent and accessible to everyone, regardless of their technical expertise.

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| **🌐 Web Search** | Real-time web search capabilities to provide up-to-date information beyond static training data. |
| **✅ Fact Checker** | Built-in verification tool to combat biased media and misinformation. |
| **📄 PDF Analysis** | Upload and scan PDF documents for quick summarization and data extraction. |
| **🗄️ SagotDB** | The core ICP (Ideal Customer Profile) of the iTANONG project—converts natural language into SQL for effortless database lookup. |
| **🔗 Link Scan** | Security-focused analysis of external links to ensure safe browsing. |
| **🗣️ Natural Translate** | Advanced translation that respects the nuances of the Filipino language and its dialects. |

---

## 🎓 Educational Template: "Train Your Dragon" 🐉

This project is now a refined **student template** built for learners who want to:
- **Build their own "Filipino ChatGPT"**: Use this repository as a high-quality frontend for your own AI assistant.
- **Connect Your Own API**: Plug in your own fine-tuned models, local LLMs, or custom-built services.
- **Master Modern UI**: Explore a completely redesigned interface built with Next.js 15, Tailwind CSS, and Radix UI.
- **"Train Your Dragon"**: We encourage you to fine-tune your own models and see them come to life in a premium, real-world chat interface.

---

## 🔌 Technical Setup

To get your own version of Kuwestiyon AI running, configure your `.env` file:

```env
KUWESTIYON_LLM_API_URL=https://api.yourprovider.com/v1/chat/completions
KUWESTIYON_LLM_API_KEY=sk-your-secret-key-here
KUWESTIYON_LLM_MODEL=mistral-medium # optimized for Filipino
KUWESTIYON_LLM_MAX_TOKENS=16384
```

### 🚀 Getting Started

1. **Clone the Repo**: `git clone https://github.com/alexisvalentino/Kuwestiyon-AI.git`
2. **Install Deps**: `pnpm install`
3. **Run Dev**: `pnpm dev`

---

## 🛠️ Tech Stack
- **Framework**: Next.js 15
- **Style**: Tailwind CSS & Radix UI
- **Architecture**: Mistral-based LLM Interface
- **Heritage**: DOST-ASTI iTANONG Project

---

## 🤝 Acknowledgments
- **Elmer C. Peramo** & the **iTANONG Project Team** at DOST-ASTI.
- Built with ❤️ for the Filipino developer community.

## 📝 License
This project is licensed under the MIT License.

