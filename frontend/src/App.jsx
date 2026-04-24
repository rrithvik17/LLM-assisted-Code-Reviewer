import React, { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code, Bug, CheckCircle, AlertCircle, RefreshCw, 
  Trash2, ChevronRight, Copy, Check, Sparkles
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const API_URL = 'http://localhost:8000/review'

const SUCCESS_MESSAGES = [
  "🧠 Sherlock-level logic. No bugs found.",
  "🔥 Clean code. Even Tony Stark would ship this.",
  "🚀 This is production-ready. No fixes needed.",
  "💯 Solid work. Nothing to refactor.",
  "✨ Flawless execution. Your logic is airtight."
]

const ISSUE_MESSAGES = [
  "🐞 Bugs detected. Time to squash them.",
  "⚠️ Not quite there yet — let’s fix this.",
  "🛠️ Needs a little tuning before launch.",
  "😅 Close… but not deployment-ready.",
  "🔍 Logic gaps identified. Let's refine this."
]

const App = () => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [dynamicMessage, setDynamicMessage] = useState('')

  const handleReview = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const response = await axios.post(API_URL, { code })
      const data = response.data
      setResult(data)
      
      const pool = data.correct ? SUCCESS_MESSAGES : ISSUE_MESSAGES
      setDynamicMessage(pool[Math.floor(Math.random() * pool.length)])
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Review service unavailable')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setCode('')
    setResult(null)
    setError(null)
  }

  const handleCopy = () => {
    if (result?.improved_code) {
      navigator.clipboard.writeText(result.improved_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#040508] text-slate-300 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <header className="border-b border-[#1f2937] bg-[#040508]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h1 className="text-sm font-bold tracking-[0.1em] text-white uppercase">AI Review Engine</h1>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-[calc(100vh-200px)]">
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between opacity-50 px-1">
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase">Source Code</h2>
              <button onClick={handleClear} className="hover:text-white transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="relative flex-1 bg-[#0b0e14] border border-[#1f2937] rounded-2xl overflow-hidden shadow-2xl focus-within:border-blue-500/40 transition-colors">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste logic here..."
                className="w-full h-full bg-transparent p-10 font-mono text-[13px] leading-relaxed resize-none focus:outline-none placeholder:text-slate-700"
              />
              
              <div className="absolute bottom-10 right-10">
                <button
                  onClick={handleReview}
                  disabled={loading || !code.trim()}
                  className={cn(
                    "px-8 py-3 rounded-xl font-bold text-[11px] tracking-widest uppercase flex items-center gap-3 transition-all",
                    loading || !code.trim() 
                      ? "bg-slate-900 text-slate-600 cursor-not-allowed" 
                      : "bg-white text-black hover:scale-105 active:scale-95 shadow-white/10 shadow-lg"
                  )}
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  {loading ? 'Analyzing' : 'Review'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="opacity-50 px-1">
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase">Analysis Output</h2>
            </div>

            <div className="flex-1 bg-[#0b0e14] border border-[#1f2937] rounded-2xl overflow-hidden flex flex-col relative shadow-2xl">
              <AnimatePresence mode="wait">
                {!result && !error && !loading && (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-slate-600 p-12 text-center"
                  >
                    <Code className="w-8 h-8 mb-4 opacity-10" />
                    <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">Ready for scan</p>
                  </motion.div>
                )}

                {loading && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-10 h-10 border-2 border-slate-900 border-t-white rounded-full animate-spin mb-6" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Processing logic</p>
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <AlertCircle className="w-6 h-6 text-red-500/50 mb-4" />
                    <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-[0.2em]">{error}</p>
                  </motion.div>
                )}

                {result && !loading && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 overflow-y-auto p-12 space-y-12"
                  >
                    {/* 1. Status Section */}
                    <div className="space-y-4">
                      <div className={cn(
                        "flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em]",
                        result.correct ? "text-green-500" : "text-amber-500"
                      )}>
                        {result.correct ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {dynamicMessage}
                      </div>
                      
                      {/* 2. Explanation Section */}
                      <p className="text-[15px] leading-[1.6] text-slate-400 font-medium tracking-tight">
                        {result.explanation}
                      </p>
                    </div>

                    {/* 3. Issues Section (only if exist) */}
                    {!result.correct && result.issues?.length > 0 && (
                      <div className="space-y-5">
                        <div className="h-px bg-[#1f2937]/50" />
                        <div className="space-y-3">
                          <h4 className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Logic Flaws</h4>
                          {result.issues.map((issue, idx) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-xl bg-red-500/[0.02] border border-red-500/[0.05] text-[13px] text-slate-400">
                              <span className="text-red-500 opacity-50 shrink-0">•</span>
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Improved Code Section (only if needed) */}
                    {!result.correct && result.improved_code && (
                      <div className="space-y-5">
                        <div className="h-px bg-[#1f2937]/50" />
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Refined Implementation</span>
                            <button 
                              onClick={handleCopy}
                              className="text-[10px] font-bold text-blue-500 hover:text-white transition-colors flex items-center gap-2"
                            >
                              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3.5 h-3.5" />}
                              {copied ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <div className="relative group/code">
                            <pre className="bg-black/40 p-8 rounded-2xl font-mono text-[13px] text-blue-100/80 leading-relaxed overflow-x-auto border border-[#1f2937]">
                              <code>{result.improved_code}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-[1400px] mx-auto px-8 py-16 flex items-center justify-between text-[9px] font-bold tracking-[0.4em] text-slate-800 uppercase">
        <span>V 2.5 // CORE</span>
        <span>Neural Analysis Engine</span>
      </footer>
    </div>
  )
}

export default App
