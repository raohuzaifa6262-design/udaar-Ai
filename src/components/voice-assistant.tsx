'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Send, X, Bot, Sparkles, User, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [micError, setMicError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const router = useRouter()

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Initialize Web Speech API once
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMicError('Browser does not support voice. Use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false       // Single utterance – more reliable
    recognition.interimResults = true
    recognition.lang = 'en-PK'          // English (Pakistan) handles Roman Urdu/Hinglish well
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Show live interim text in input box
      if (interimTranscript) {
        setInputText(interimTranscript)
      }

      // Final result: send to AI
      if (finalTranscript.trim()) {
        setInputText(finalTranscript.trim())
        setIsListening(false)
        sendMessage(finalTranscript.trim())
      }
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setMicError('Microphone access denied. Please allow mic in browser settings.')
        toast.error('Microphone blocked. Allow mic access in browser settings.')
      } else if (event.error === 'no-speech') {
        toast.error('Kuch suna nahi. Dobara try karo.')
      } else if (event.error !== 'aborted') {
        toast.error(`Voice error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onstart = () => {
      setMicError(null)
    }

    recognitionRef.current = recognition
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      // Build history for API (last 10 messages to avoid token limits)
      const historyForAPI = [...messages, userMessage].slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForAPI })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Server error ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Kuch masla aa gaya, dobara try karo.'
      }

      setMessages(prev => [...prev, assistantMessage])

      // Refresh dashboard data if a tool ran (transaction/customer change)
      router.refresh()
    } catch (err: any) {
      console.error('Assistant fetch error:', err)
      toast.error('Connection failed: ' + (err.message || 'Please try again.'))

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maafi chahta hoon, kuch error aa gaya. Dobara try karo.'
      }])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, router])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim()) {
      sendMessage(inputText.trim())
    }
  }

  const toggleListen = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported. Use Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        setInputText('')
        recognitionRef.current.start()
        setIsListening(true)
        toast.success('Bol do... (Sun raha hoon)')
      } catch (e: any) {
        if (e.name === 'InvalidStateError') {
          // Recognition already running – stop and restart
          recognitionRef.current.stop()
          setTimeout(() => {
            try {
              recognitionRef.current.start()
              setIsListening(true)
            } catch {}
          }, 300)
        } else {
          toast.error('Could not start voice: ' + e.message)
        }
      }
    }
  }

  // FAB (Floating Action Button) when chat is closed
  if (!isOpen) {
    return (
      <button
        id="voice-assistant-fab"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-50"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] z-50">
      <Card className="border-border shadow-2xl rounded-2xl overflow-hidden bg-card/95 backdrop-blur-xl animate-in slide-in-from-bottom-5">

        {/* Header */}
        <CardHeader className="bg-emerald-600 p-4 flex flex-row items-center justify-between space-y-0 rounded-t-2xl">
          <CardTitle className="text-white text-base font-bold flex items-center gap-2">
            <Bot className="w-5 h-5" /> Udaar AI
            {isLoading && <Loader2 className="w-3 h-3 animate-spin opacity-80" />}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/20 -mr-2 h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        {/* Mic error banner */}
        {micError && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-3 py-2 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {micError}
          </div>
        )}

        {/* Chat Area */}
        <CardContent className="p-0 h-[380px] overflow-y-auto flex flex-col gap-3 p-4 bg-muted/20">
          {/* Empty state */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 px-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Mic className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Bolo ya likho</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  "Ali ko 500 udhar diya"<br />
                  "Ahmad ne 1000 wapas kiye"<br />
                  "Bilal ka balance batao"
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                  m.role === 'user'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-emerald-600 text-white shadow-sm'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-card border border-border text-foreground rounded-tr-sm'
                    : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-emerald-900 dark:text-emerald-100 rounded-tl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}

          {/* Loading dots */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[80%] flex-row">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white shadow-sm flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-tl-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <CardFooter className="p-3 bg-card border-t border-border">
          <form onSubmit={handleFormSubmit} className="flex w-full gap-2">

            {/* Microphone button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleListen}
              disabled={isLoading}
              className={`flex-shrink-0 h-10 w-10 transition-all ${
                isListening
                  ? 'bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600 scale-110'
                  : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {/* Text input */}
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? '🎙️ Sun raha hoon...' : 'Type or speak...'}
              className="flex-1 h-10 border-slate-200 focus-visible:ring-emerald-500 bg-muted/50"
              disabled={isLoading}
              autoComplete="off"
            />

            {/* Send button */}
            <Button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Listening indicator */}
          {isListening && (
            <div className="w-full mt-2 flex items-center justify-center gap-2 text-xs text-red-500 animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Recording... Tap mic to stop
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
