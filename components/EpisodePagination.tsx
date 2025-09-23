"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Episode } from "@/lib/api"

interface EpisodePaginationProps {
  episodes: Episode[]
  currentEpisodeId: string
  onEpisodeClick: (episodeId: string) => void
  episodesPerPage?: number
}

const EpisodePagination = ({
  episodes,
  currentEpisodeId,
  onEpisodeClick,
  episodesPerPage = 100,
}: EpisodePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(0)

  // Calculate total pages
  const totalPages = Math.ceil(episodes.length / episodesPerPage)

  // Get current page episodes
  const currentEpisodes = episodes.slice(currentPage * episodesPerPage, (currentPage + 1) * episodesPerPage)

  // Navigate to previous page
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Navigate to next page
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Handle episode click with proper navigation
  const handleEpisodeClick = (episodeId: string) => {
    console.log(`Clicked on episode: ${episodeId}`)
    onEpisodeClick(episodeId)
  }

  return (
    <div>
      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              currentPage === 0 
                ? "text-gray-500 cursor-not-allowed bg-gray-800/50" 
                : "text-gray-300 hover:bg-gray-800 hover:text-white bg-gray-800/70"
            }`}
          >
            <ChevronLeft size={16} className="mr-2" />
            Previous
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-full">
              Page {currentPage + 1} of {totalPages}
            </span>
            {totalPages > 1 && (
              <div className="text-xs text-gray-500 mt-1">
                Episodes {currentPage * episodesPerPage + 1}-{Math.min((currentPage + 1) * episodesPerPage, episodes.length)} of {episodes.length}
              </div>
            )}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              currentPage >= totalPages - 1 
                ? "text-gray-500 cursor-not-allowed bg-gray-800/50" 
                : "text-gray-300 hover:bg-gray-800 hover:text-white bg-gray-800/70"
            }`}
          >
            Next
            <ChevronRight size={16} className="ml-2" />
          </button>
        </div>
      )}

      {/* Episode grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
        {currentEpisodes.map((episode) => (
          <button
            key={episode.id}
            onClick={() => handleEpisodeClick(episode.id)}
            className={`p-3 text-sm font-medium rounded-full text-center transition-all duration-200 border ${
              episode.id === currentEpisodeId 
                ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500 shadow-lg shadow-purple-500/25" 
                : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border-gray-700 hover:border-gray-600"
            }`}
          >
            <div className="text-xs text-gray-400 mb-1">EP</div>
            <div>{episode.number}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default EpisodePagination
