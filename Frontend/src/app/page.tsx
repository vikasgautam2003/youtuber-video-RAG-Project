'use client'

import { useState, FormEvent } from 'react'

// Helper function to extract video ID from YouTube URL
const extractVideoId = (url: string): string | null => {
  // Handle full URLs
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    // Regex for various YouTube URL formats
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }
  // Handle just the ID
  if (url.length === 11) {
    return url
  }
  return null
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setAnswer('')
    setError(null)

    const videoId = extractVideoId(url)

    if (!videoId) {
      setError('Invalid YouTube URL or Video ID.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
          query: query,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Failed to get answer from backend.')
      }

      const data = await response.json()
      setAnswer(data.answer)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          YouTube RAG Chatbot
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              YouTube URL or Video ID
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., y122nhdFMkI"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700">
              Your Question
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What is the main summary of this video?"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Thinking...' : 'Ask'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {answer && !isLoading && (
          <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Answer</h2>
            <p className="text-gray-700 whitespace-pre-line">{answer}</p>
          </div>
        )}
      </div>
    </main>
  )
}