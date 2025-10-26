// // 'use client'

// // import { useState, FormEvent } from 'react'

// // // Helper function to extract video ID from YouTube URL
// // const extractVideoId = (url: string): string | null => {
// //   // Handle full URLs
// //   if (url.includes('youtube.com') || url.includes('youtu.be')) {
// //     // Regex for various YouTube URL formats
// //     const regex =
// //       /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
// //     const match = url.match(regex)
// //     return match ? match[1] : null
// //   }
// //   // Handle just the ID
// //   if (url.length === 11) {
// //     return url
// //   }
// //   return null
// // }

// // export default function Use() {
// //   const [url, setUrl] = useState('')
// //   const [query, setQuery] = useState('')
// //   const [answer, setAnswer] = useState('')
// //   const [isLoading, setIsLoading] = useState(false)
// //   const [error, setError] = useState<string | null>(null)

// //   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
// //     e.preventDefault()
// //     setIsLoading(true)
// //     setAnswer('')
// //     setError(null)

// //     const videoId = extractVideoId(url)

// //     if (!videoId) {
// //       setError('Invalid YouTube URL or Video ID.')
// //       setIsLoading(false)
// //       return
// //     }

// //     try {
// //       const response = await fetch('http://localhost:8000/api/chat', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({
// //           video_id: videoId,
// //           query: query,
// //         }),
// //       })

// //       if (!response.ok) {
// //         const errData = await response.json()
// //         throw new Error(errData.detail || 'Failed to get answer from backend.')
// //       }

// //       const data = await response.json()
// //       setAnswer(data.answer)
// //     } catch (err: any) {
// //       setError(err.message)
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }

// //   return (
// //     <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
// //       <div className="w-full max-w-2xl">
// //         <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
// //           YouTube RAG Chatbot
// //         </h1>

// //         <form onSubmit={handleSubmit} className="space-y-4">
// //           <div>
// //             <label htmlFor="url" className="block text-sm font-medium text-gray-700">
// //               YouTube URL or Video ID
// //             </label>
// //             <input
// //               type="text"
// //               id="url"
// //               value={url}
// //               onChange={(e) => setUrl(e.target.value)}
// //               placeholder="e.g., y122nhdFMkI"
// //               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label htmlFor="query" className="block text-sm font-medium text-gray-700">
// //               Your Question
// //             </label>
// //             <textarea
// //               id="query"
// //               value={query}
// //               onChange={(e) => setQuery(e.target.value)}
// //               placeholder="e.g., What is the main summary of this video?"
// //               rows={3}
// //               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
// //               required
// //             />
// //           </div>
// //           <button
// //             type="submit"
// //             disabled={isLoading}
// //             className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
// //           >
// //             {isLoading ? 'Thinking...' : 'Ask'}
// //           </button>
// //         </form>

// //         {error && (
// //           <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
// //             <p className="font-bold">Error</p>
// //             <p>{error}</p>
// //           </div>
// //         )}

// //         {answer && !isLoading && (
// //           <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
// //             <h2 className="text-xl font-semibold text-gray-900 mb-3">Answer</h2>
// //             <p className="text-gray-700 whitespace-pre-line">{answer}</p>
// //           </div>
// //         )}
// //       </div>
// //     </main>
// //   )
// // }













// // app/page.tsx
// 'use client'

// import { useState, FormEvent, useMemo, useRef, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   Youtube,
//   Send,
//   User,
//   Brain,
//   AlertTriangle,
//   Link,
//   MessageCircleQuestion,
// } from 'lucide-react'

// // --- Helper function (from your code) ---
// const extractVideoId = (url: string): string | null => {
//   if (url.includes('youtube.com') || url.includes('youtu.be')) {
//     const regex =
//       /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
//     const match = url.match(regex)
//     return match ? match[1] : null
//   }
//   if (url.length === 11) {
//     return url
//   }
//   return null
// }

// // --- Types ---
// type Message = {
//   id: number
//   role: 'user' | 'bot'
//   content: string
//   isError?: boolean
// }

// // --- Main Page Component ---
// export default function ChatPage() {
//   const [url, setUrl] = useState('')
//   const [query, setQuery] = useState('')
//   const [messages, setMessages] = useState<Message[]>([])
//   const [isLoading, setIsLoading] = useState(false)

//   // Automatically update the video preview
//   const videoId = useMemo(() => extractVideoId(url), [url])

//   const messagesEndRef = useRef<HTMLDivElement>(null)

//   // Auto-scroll to the bottom when new messages appear
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages, isLoading])

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     if (!videoId) {
//       setMessages([
//         ...messages,
//         {
//           id: Date.now(),
//           role: 'bot',
//           content: 'Please enter a valid YouTube URL or Video ID first.',
//           isError: true,
//         },
//       ])
//       return
//     }

//     setIsLoading(true)
//     const userMessageContent = query
    
//     // Add user message to chat
//     setMessages((prev) => [
//       ...prev,
//       { id: Date.now(), role: 'user', content: userMessageContent },
//     ])
    
//     // Clear the query input
//     setQuery('')

//     try {
//       const response = await fetch('http://localhost:8000/api/chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           video_id: videoId,
//           query: userMessageContent,
//         }),
//       })

//       if (!response.ok) {
//         const errData = await response.json()
//         throw new Error(errData.detail || 'Failed to get answer from backend.')
//       }

//       const data = await response.json()
      
//       // Add bot response to chat
//       setMessages((prev) => [
//         ...prev,
//         { id: Date.now() + 1, role: 'bot', content: data.answer },
//       ])

//     } catch (err: any) {
//       // Add error message to chat
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now() + 1,
//           role: 'bot',
//           content: err.message,
//           isError: true,
//         },
//       ])
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       {/* 1. Navbar (Consistent Branding) */}
//       <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
//         <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex-shrink-0 flex items-center">
//               <Youtube className="h-8 w-8 text-red-600" />
//               <span className="ml-2 text-2xl font-bold text-gray-900">
//                 Vid
//                 <span className="text-red-600">Query</span>
//               </span>
//             </div>
//             <a
//               href="/use"
//               className="font-medium text-gray-600 hover:text-gray-900"
//             >
//               New Chat
//             </a>
//           </div>
//         </div>
//       </nav>

//       {/* 2. Main Chat & Video Area */}
//       <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
//         {/* Chat History */}
//         <div className="flex-1 flex flex-col overflow-hidden">
//           {/* Message List */}
//           <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
//             <AnimatePresence>
//               {messages.map((msg) => (
//                 <ChatMessage key={msg.id} message={msg} />
//               ))}
//             </AnimatePresence>
//             <AnimatePresence>
//               {isLoading && <TypingIndicator />}
//             </AnimatePresence>
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Sticky Chat Input Form */}
//           <div className="p-4 md:p-6 bg-white/95 backdrop-blur-sm border-t border-gray-200">
//             <form onSubmit={handleSubmit} className="space-y-3">
//               <div className="flex items-center space-x-2">
//                 <Link className="h-5 w-5 text-gray-400" />
//                 <input
//                   type="text"
//                   value={url}
//                   onChange={(e) => setUrl(e.target.value)}
//                   placeholder="Paste YouTube URL or Video ID here..."
//                   className="flex-1 block w-full rounded-full border-gray-300 shadow-sm p-3 focus:border-red-500 focus:ring-red-500"
//                   required
//                 />
//               </div>
//               <div className="flex items-center space-x-2">
//                 <MessageCircleQuestion className="h-5 w-5 text-gray-400" />
//                 <input
//                   type="text"
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="Ask your question..."
//                   className="flex-1 block w-full rounded-full border-gray-300 shadow-sm p-3 focus:border-red-500 focus:ring-red-500"
//                   required
//                 />
//                 <motion.button
//                   type="submit"
//                   disabled={isLoading}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   className="p-3 bg-red-600 text-white rounded-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
//                 >
//                   <Send className="h-5 w-5" />
//                 </motion.button>
//               </div>
//             </form>
//           </div>
//         </div>

//         {/* Video Preview Area */}
//         <div className="w-full md:w-2/5 lg:w-1/3 p-4 md:p-6 bg-white border-l border-gray-200 overflow-y-auto">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Video Preview
//           </h2>
//           <VideoPreview videoId={videoId} />
//         </div>
//       </main>
//     </div>
//   )
// }

// // --- Child Components ---

// function ChatMessage({ message }: { message: Message }) {
//   const isBot = message.role === 'bot'
//   const isError = message.isError

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3, ease: 'easeOut' }}
//       className={`flex items-start space-x-3 ${!isBot ? 'justify-end' : ''}`}
//     >
//       {/* Icon */}
//       <div
//         className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
//           isBot ? (isError ? 'bg-red-100' : 'bg-gray-800') : 'bg-gray-300'
//         }`}
//       >
//         {isBot ? (
//           isError ? (
//             <AlertTriangle className="w-5 h-5 text-red-600" />
//           ) : (
//             <Brain className="w-5 h-5 text-red-500" />
//           )
//         ) : (
//           <User className="w-5 h-5 text-gray-600" />
//         )}
//       </div>

//       {/* Bubble */}
//       <div
//         className={`p-3 rounded-lg max-w-lg ${
//           isBot
//             ? `bg-white shadow border border-gray-100 ${
//                 isError ? 'text-red-700' : 'text-gray-800'
//               }`
//             : 'bg-red-600 text-white shadow'
//         }`}
//       >
//         <p className="whitespace-pre-wrap">{message.content}</p>
//       </div>
//     </motion.div>
//   )
// }

// function TypingIndicator() {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, transition: { duration: 0.1 } }}
//       transition={{ duration: 0.3, ease: 'easeOut' }}
//       className="flex items-start space-x-3"
//     >
//       <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-800">
//         <Brain className="w-5 h-5 text-red-500" />
//       </div>
//       <div className="p-3 rounded-lg bg-white shadow border border-gray-100">
//         <motion.div
//           className="flex space-x-1"
//           transition={{
//             staggerChildren: 0.2,
//             repeat: Infinity,
//           }}
//         >
//           {[1, 2, 3].map((i) => (
//             <motion.div
//               key={i}
//               className="w-2 h-2 bg-gray-400 rounded-full"
//               animate={{ y: [0, -3, 0] }}
//               transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
//             />
//           ))}
//         </motion.div>
//       </div>
//     </motion.div>
//   )
// }

// function VideoPreview({ videoId }: { videoId: string | null }) {
//   if (!videoId) {
//     return (
//       <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
//         <div className="text-center text-gray-500">
//           <Youtube className="h-12 w-12 mx-auto" />
//           <p className="mt-2 text-sm">
//             Video preview will appear here
//           </p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="aspect-video w-full rounded-lg overflow-hidden shadow-md">
//       <iframe
//         width="100%"
//         height="100%"
//         src={`https://www.youtube.com/embed/${videoId}`}
//         title="YouTube video player"
//         frameBorder="0"
//         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//         allowFullScreen
//       ></iframe>
//     </div>
//   )
// }





'use client'

import { useState, FormEvent, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Youtube, Send, User, Brain, AlertTriangle, Link, MessageCircleQuestion } from 'lucide-react'

const extractVideoId = (url: string): string | null => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }
  if (url.length === 11) return url
  return null
}

type Message = {
  role: 'user' | 'bot'
  content: string
  isError?: boolean
}

export default function ChatPage() {
  const [url, setUrl] = useState('')
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const videoId = useMemo(() => extractVideoId(url), [url])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!videoId) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Please enter a valid YouTube URL or Video ID first.', isError: true }])
      return
    }

    setIsLoading(true)
    const userMessageContent = query
    setMessages(prev => [...prev, { role: 'user', content: userMessageContent }])
    setQuery('')

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: videoId, query: userMessageContent }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Failed to get answer from backend.')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'bot', content: data.answer }])
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'bot', content: err.message, isError: true }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Youtube className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">
                Vid<span className="text-red-600">Query</span>
              </span>
            </div>
            <a href="/use" className="font-medium text-gray-600 hover:text-gray-900">
              New Chat
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} />
              ))}
            </AnimatePresence>
            <AnimatePresence>{isLoading && <TypingIndicator />}</AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 md:p-6 bg-white/95 backdrop-blur-sm border-t border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center space-x-2">
                <Link className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="Paste YouTube URL or Video ID here..."
                  className="flex-1 block w-full rounded-full border-gray-300 shadow-sm p-3 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircleQuestion className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ask your question..."
                  className="flex-1 block w-full rounded-full border-gray-300 shadow-sm p-3 focus:border-red-500 focus:ring-red-500"
                  required
                />
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-red-600 text-white rounded-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </form>
          </div>
        </div>

        <div className="w-full md:w-2/5 lg:w-1/3 p-4 md:p-6 bg-white border-l border-gray-200 overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Preview</h2>
          <VideoPreview videoId={videoId} />
        </div>
      </main>
    </div>
  )
}

function ChatMessage({ message }: { message: Message }) {
  const isBot = message.role === 'bot'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-start space-x-3 ${!isBot ? 'justify-end' : ''}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBot ? (message.isError ? 'bg-red-100' : 'bg-gray-800') : 'bg-gray-300'
        }`}
      >
        {isBot ? (message.isError ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <Brain className="w-5 h-5 text-red-500" />) : <User className="w-5 h-5 text-gray-600" />}
      </div>
      <div
        className={`p-3 rounded-lg max-w-lg ${
          isBot
            ? `bg-white shadow border border-gray-100 ${message.isError ? 'text-red-700' : 'text-gray-800'}`
            : 'bg-red-600 text-white shadow'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex items-start space-x-3"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-800">
        <Brain className="w-5 h-5 text-red-500" />
      </div>
      <div className="p-3 rounded-lg bg-white shadow border border-gray-100">
        <motion.div
          className="flex space-x-1"
          transition={{ staggerChildren: 0.2, repeat: Infinity }}
        >
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

function VideoPreview({ videoId }: { videoId: string | null }) {
  if (!videoId) {
    return (
      <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <Youtube className="h-12 w-12 mx-auto" />
          <p className="mt-2 text-sm">Video preview will appear here</p>
        </div>
      </div>
    )
  }
  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden shadow-md">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  )
}
