"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getAnimeInfo, type AnimeResult, proxyHlsUrl } from "@/lib/api"
import VideoPlayerVidstack from "@/components/VideoPlayerVidstack"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import EpisodePagination from "@/components/EpisodePagination"
import SocialShareMenu from "@/components/SocialShareMenu"

// Define types for the API response
interface VideoSource {
  url: string
  quality: string
  isM3U8: boolean
}

interface Subtitle {
  url: string
  lang: string
}

interface VideoData {
  sources: VideoSource[]
  subtitles: Subtitle[]
}

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const animeId = params.animeId as string
  const episodeId = Array.isArray(params.episodeId) ? params.episodeId.join("/") : (params.episodeId as string)

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState<string>("")
  const [animeInfo, setAnimeInfo] = useState<AnimeResult | null>(null)
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number | null>(null)
  const [availableSources, setAvailableSources] = useState<VideoSource[]>([])

  // Use the new external CORS proxy
  const CORS_PROXY_URL = "https://hls.ciphertv.dev/proxy?url="

  // Custom stream URL as fallback - now using the new external CORS proxy
  const fallbackStreamUrl =
    CORS_PROXY_URL +
    encodeURIComponent(
      "https://ef.netmagcdn.com:2228/hls-playback/2f219e7a538f6b41763b2d81888f622d7d999109e4aabe2bf5ebc28de54bf1dd958dfbf6e445f1c6c88acf7779775503c4b0719ce97cec2e5731318a6003ea8a022f782127e4287da2f3917712e14a3b19dd5fcf47922975af8fd214e5d48ce11d1ed7c8611c8abf5324e5c767234b0c542b5d0ad5860297029d86704a4c106d082f5eb8864f1701f63fb4746e94d8a4/master.m3u8",
    )

  // Backend URL for API requests - use the same base URL as in lib/api.ts
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-consumet-nu.vercel.app").replace(/\/$/, "")

  useEffect(() => {
    async function loadEpisode() {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch anime info to get episodes for pagination
        const info = await getAnimeInfo(animeId)
        setAnimeInfo(info)

        // Find current episode number - Zoro might use a different episode ID format
        if (info?.episodes && Array.isArray(info.episodes)) {
          // Try to find the episode by exact ID first
          let episode = info.episodes.find((ep) => ep.id === episodeId)

          // If not found, try to extract the episode number from the ID
          if (!episode && episodeId) {
            const episodeNumberMatch = episodeId.match(/(\d+)(?!.*\d)/)
            if (episodeNumberMatch) {
              const episodeNumber = Number.parseInt(episodeNumberMatch[0], 10)
              episode = info.episodes.find((ep) => ep.number === episodeNumber)
            }
          }

          if (episode) {
            setCurrentEpisodeNumber(episode.number)
          }
        }

        // Set the title regardless of source availability
        setTitle(`${info?.title || "Anime"} - Episode ${currentEpisodeNumber || ""}`)

        // Set fallback stream immediately to ensure we have something to play
        setVideoUrl(fallbackStreamUrl)

        // Fetch video sources using our custom proxy API
        try {
          // Use the same base URL format as in lib/api.ts
          // For Zoro, we need to use the meta/anilist endpoint
          const targetUrl = `${API_BASE_URL}/meta/anilist/watch/${episodeId}?provider=zoro`
          console.log(`Fetching video sources from: ${targetUrl}`)

          // Use direct fetch since we're using localhost
          const response = await fetch(targetUrl)

          if (!response.ok) {
            throw new Error(`API returned ${response.status}`)
          }

          const data = await response.json()

          if (data?.sources?.length > 0) {
            // Process sources and proxy all HLS URLs through the CORS proxy
            const processedSources = data.sources.map((source: VideoSource) => ({
              ...source,
              url: proxyHlsUrl(source.url),
            }))

            // Sort sources by quality (highest first)
            const sortedSources = [...processedSources].sort((a, b) => {
              const qualityA = Number.parseInt(a.quality.replace("p", "")) || 0
              const qualityB = Number.parseInt(b.quality.replace("p", "")) || 0
              return qualityB - qualityA
            })

            setAvailableSources(sortedSources)
            console.log(
              "Available sources:",
              sortedSources.map((s) => `${s.quality}: ${s.url.substring(0, 50)}...`),
            )

            // Use the highest quality source
            setVideoUrl(sortedSources[0].url)
            console.log(`Using source: ${sortedSources[0].url.substring(0, 50)}...`)
          } else {
            console.log("No sources found in API response, using fallback")
          }

          // Handle subtitles
          if (data?.subtitles?.length > 0) {
            console.log(`Found ${data.subtitles.length} subtitles`)
            const engSubtitle = data.subtitles.find((s: Subtitle) => s.lang.toLowerCase().includes("english"))
            if (engSubtitle) {
              console.log(`Using English subtitle: ${engSubtitle.url}`)
              setSubtitleUrl(engSubtitle.url)
            }
          }
        } catch (sourceError) {
          console.error("Error fetching episode sources:", sourceError)
          console.log("Continuing with fallback stream")
          // We're already using fallback stream, so just log the error
        }
      } catch (err) {
        console.log("Error loading episode info:", err)
        setError("Failed to load episode data.")
        setVideoUrl(fallbackStreamUrl)
      } finally {
        setIsLoading(false)
      }
    }

    loadEpisode()
  }, [animeId, episodeId, currentEpisodeNumber, API_BASE_URL, fallbackStreamUrl, CORS_PROXY_URL])

  const handleBack = () => {
    router.push(`/anime/${animeId}`)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: title,
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
        })
    } else {
      toast({
        title: "Link copied to clipboard",
        description: "Share this link with your friends",
      })
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleVideoError = (error: Error) => {
    console.error("Video player error:", error)
    toast({
      variant: "destructive",
      title: "Playback Error",
      description: "There was an error playing this video. Using fallback stream.",
    })
    setVideoUrl(fallbackStreamUrl)
  }

  const handleQualityChange = (quality: string) => {
    const source = availableSources.find((s) => s.quality === quality)
    if (source) {
      setVideoUrl(source.url) // URL is already proxied
      toast({
        title: "Quality Changed",
        description: `Switched to ${quality} quality`,
      })
    }
  }

  // Ensure episodes is an array before passing to EpisodePagination
  const episodes = animeInfo?.episodes && Array.isArray(animeInfo.episodes) ? animeInfo.episodes : []

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack} 
                className="hover:bg-gray-800 text-gray-300 hover:text-white rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-white truncate max-w-md">{title}</h1>
                {animeInfo?.title && (
                  <p className="text-sm text-gray-400 truncate max-w-md">{animeInfo.title}</p>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleShare} 
              className="hover:bg-gray-800 text-gray-300 hover:text-white rounded-full"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Video Player Section */}
        <div className="relative">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-gray-300">Loading episode...</p>
                </div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center p-6 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                    <ArrowLeft className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white mb-2">{error}</p>
                    <p className="text-gray-400 text-sm">There was an issue loading this episode</p>
                  </div>
                  <Button onClick={handleBack} className="bg-purple-600 hover:bg-purple-700 rounded-full">
                    Go Back to Anime
                  </Button>
                </div>
              </div>
            ) : (
              <VideoPlayerVidstack
                src={videoUrl || undefined}
                subtitleUrl={subtitleUrl || undefined}
                fallbackStreamUrl={fallbackStreamUrl}
                title={title}
                autoPlay={true}
                onError={handleVideoError}
                debug={true}
              />
            )}
          </div>
        </div>

        {/* Episode Info Section */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="space-y-4">
            {/* Title - Visible on mobile */}
            <div className="sm:hidden">
              <h1 className="text-xl font-bold text-white">{title}</h1>
              {animeInfo?.title && (
                <p className="text-gray-400 mt-1">{animeInfo.title}</p>
              )}
            </div>

            {/* Quality Selector */}
            {availableSources.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Video Quality</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSources.map((source) => (
                    <Button
                      key={`quality-${source.quality}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQualityChange(source.quality)}
                      className="border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-purple-500 text-xs px-3 py-1 rounded-full"
                    >
                      {source.quality}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Episode Stats */}
            {animeInfo && (
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                {animeInfo.type && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    {animeInfo.type}
                  </span>
                )}
                {animeInfo.status && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {animeInfo.status}
                  </span>
                )}
                {currentEpisodeNumber && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Episode {currentEpisodeNumber}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Episode Navigation */}
        {episodes.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Episodes</h3>
            <EpisodePagination
              episodes={episodes}
              currentEpisodeId={episodeId}
              onEpisodeClick={(epId) => router.push(`/watch/${animeId}/${epId}`)}
            />
          </div>
        )}

        {/* Social Share */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Share</h3>
          <SocialShareMenu 
            title={title} 
            description={`Watch ${title} on Anime Stream`} 
            image={animeInfo?.image} 
          />
        </div>
      </div>
    </div>
  )
}
