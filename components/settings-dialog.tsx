"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recognitionLanguage: string
  setRecognitionLanguage: (language: string) => void
  speechRate: number
  setSpeechRate: (rate: number) => void
  autoSend: boolean
  setAutoSend: (autoSend: boolean) => void
  continuousListening: boolean
  setContinuousListening: (continuousListening: boolean) => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  temperature: number
  setTemperature: (temperature: number) => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  recognitionLanguage,
  setRecognitionLanguage,
  speechRate,
  setSpeechRate,
  autoSend,
  setAutoSend,
  continuousListening,
  setContinuousListening,
  selectedModel,
  setSelectedModel,
  temperature,
  setTemperature,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] block glass-surface">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4 overflow-y-auto rounded-md" style={{ scrollbarWidth: "thin" }}>
          <div className="grid gap-4 py-4">
            {/* Add a subtle indicator that content is scrollable */}
            <div className="w-full flex justify-center mb-1 text-muted-foreground">
              <span className="text-xs animate-bounce">↓ Scroll for more settings ↓</span>
            </div>
            <div className="grid gap-2">
              <Label className="text-base font-medium">Select Model</Label>
              <RadioGroup value={selectedModel} onValueChange={setSelectedModel} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kuwestiyon-5.2" id="kuwestiyon-5.2" />
                  <Label htmlFor="kuwestiyon-5.2">Kuwestiyon 5.2</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label>Temperature: {temperature.toFixed(1)}</Label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
              />
            </div>

            <div className="border-t pt-4 mt-2">
              <h3 className="font-medium mb-2">Voice Settings</h3>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="language">Recognition Language</Label>
                    <p className="text-xs text-muted-foreground mt-1">Select the language for voice recognition</p>
                  </div>
                  <Select value={recognitionLanguage} onValueChange={setRecognitionLanguage}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-PH">English (Philippines)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: Language recognition quality depends on your browser support. Chrome is recommended.
                </p>

                <div className="flex items-center justify-between">
                  <Label htmlFor="speech-rate">Speech Rate</Label>
                  <div className="flex items-center gap-2 w-[140px]">
                    <Slider
                      id="speech-rate"
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={[speechRate]}
                      onValueChange={(value) => setSpeechRate(value[0])}
                    />
                    <span className="text-sm w-8 text-right">{speechRate}x</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-send">Auto-send voice input</Label>
                  <Switch id="auto-send" checked={autoSend} onCheckedChange={setAutoSend} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="continuous">Continuous listening</Label>
                  <Switch id="continuous" checked={continuousListening} onCheckedChange={setContinuousListening} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  When enabled, the microphone will automatically restart after processing your speech, allowing for
                  hands-free conversation. Works best with auto-send enabled.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

