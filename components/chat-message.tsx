import { Card } from "@/components/ui/card"
import Image from "next/image"

interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "system" | "error"
  timestamp: Date
}

export function ChatMessage({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4 w-full`}>
      <Card
        className={`p-3 sm:p-4 ${
          message.role === "user"
            ? "bg-blue-100 max-w-[85%] sm:max-w-[75%] md:max-w-[65%]"
            : message.role === "error"
              ? "bg-red-100 text-red-800 max-w-[90%] sm:max-w-[80%] md:max-w-[70%]"
              : "bg-gray-100 max-w-[90%] sm:max-w-[80%] md:max-w-[70%]"
        } break-words overflow-hidden`}
      >
        <div className={`flex gap-3 sm:gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
          <div
            className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              message.role === "user"
                ? "bg-blue-500 text-white"
                : message.role === "error"
                  ? "bg-red-500 text-white"
                  : "overflow-hidden border-2 border-green-500"
            }`}
          >
            {message.role === "assistant" ? (
              <Image
                src="/icon.png"
                alt="Assistant"
                width={32}
                height={32}
                priority
                className="h-full w-full object-cover"
              />
            ) : message.role === "user" ? (
              "U"
            ) : message.role === "error" ? (
              "!"
            ) : (
              "A"
            )}
          </div>
          <div className="flex-1 overflow-auto">
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

