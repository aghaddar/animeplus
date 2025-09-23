"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import { useToast } from "@/hooks/use-toast"
import { proxyHlsUrl } from "@/lib/api"

interface VideoPlayerProps {
  src?: string
  subtitleUrl?: string
  fallbackStreamUrl?: string
  title?: string
  autoPlay?: boolean
  onError?: (error: Error) => void
  debug?: boolean
}

export default function VideoPlayerVidstack({
  src,
  subtitleUrl,
  fallbackStreamUrl,
  title = "Video",
  autoPlay = true,
  onError,
  debug = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const hlsRef = useRef<Hls | null>(null)

  // Log for debugging
  const logDebug = (message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[VideoPlayer] ${message}`, ...args)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Function to initialize HLS
    const initializeHls = (streamUrl: string) => {
      logDebug(`Initializing HLS with URL: ${streamUrl}`)

      // Destroy existing HLS instance if it exists
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }

      // Check if HLS is supported
      if (Hls.isSupported()) {
        const hls = new Hls({
          // Configure HLS.js to handle all URLs through our proxy
          xhrSetup: (xhr, url) => {
            // If the URL doesn't already use our proxy, proxy it
            if (!url.includes("hls.ciphertv.dev/proxy") && !url.startsWith("/api/")) {
              const proxiedUrl = proxyHlsUrl(url)
              logDebug(`Proxying URL: ${url} -> ${proxiedUrl}`)
              xhr.open("GET", proxiedUrl, true)
              // Don't return anything (void)
            }
            // Don't return anything (void)
          },
          // Other HLS.js options
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1000 * 1000, // 60MB
          maxBufferHole: 0.5,
          lowLatencyMode: false,
        })

        hlsRef.current = hls

        // Bind HLS to video element
        hls.attachMedia(video)
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          logDebug("HLS media attached")
          hls.loadSource(streamUrl)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            logDebug("HLS manifest parsed")
            if (autoPlay) {
              video.play().catch((e) => {
                logDebug("Autoplay prevented:", e)
                toast({
                  title: "Autoplay Blocked",
                  description: "Please click play to start the video",
                })
              })
            }
          })
        })

        // Error handling
        hls.on(Hls.Events.ERROR, (_, data) => {
          logDebug("HLS error:", data)

          if (data.fatal) {
            logDebug("Fatal HLS error:", data)
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                logDebug("Network error, trying to recover...")
                hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                logDebug("Media error, trying to recover...")
                hls.recoverMediaError()
                break
              default:
                logDebug("Fatal error, cannot recover")
                // Try fallback URL if available
                if (fallbackStreamUrl && streamUrl !== fallbackStreamUrl) {
                  logDebug("Switching to fallback stream")
                  // Make sure fallback is also proxied
                  const proxiedFallback = proxyHlsUrl(fallbackStreamUrl)
                  initializeHls(proxiedFallback)
                } else {
                  setError("Failed to load video. Please try again later.")
                  if (onError) {
                    onError(new Error(`HLS fatal error: ${data.type}`))
                  }
                }
                break
            }
          } else {
            // For non-fatal errors, just log them
            logDebug("Non-fatal HLS error:", data)
          }
        })
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari, which has native HLS support
        logDebug("Using native HLS support")
        video.src = streamUrl
        video.addEventListener("loadedmetadata", () => {
          if (autoPlay) {
            video.play().catch((e) => {
              logDebug("Autoplay prevented:", e)
            })
          }
        })
      } else {
        logDebug("HLS not supported by this browser")
        setError("Your browser does not support HLS playback.")
        if (onError) {
          onError(new Error("HLS not supported"))
        }
      }
    }

    // Add subtitle track if provided
    if (subtitleUrl) {
      logDebug(`Adding subtitle track: ${subtitleUrl}`)
      const track = document.createElement("track")
      track.kind = "subtitles"
      track.label = "English"
      track.srclang = "en"
      track.src = subtitleUrl
      track.default = true

      // Remove any existing tracks
      while (video.firstChild) {
        video.removeChild(video.firstChild)
      }

      video.appendChild(track)
    }

    // Initialize with src or fallback
    if (src) {
      logDebug(`Using provided source: ${src}`)
      // Make sure to proxy the source URL
      const proxiedSrc = proxyHlsUrl(src)
      initializeHls(proxiedSrc)
    } else if (fallbackStreamUrl) {
      logDebug(`Using fallback source: ${fallbackStreamUrl}`)
      // Make sure to proxy the fallback URL
      const proxiedFallback = proxyHlsUrl(fallbackStreamUrl)
      initializeHls(proxiedFallback)
    } else {
      logDebug("No video source provided")
      setError("No video source provided.")
    }

    // Event listeners
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const onDurationChange = () => {
      setDuration(video.duration)
    }

    const onPlay = () => {
      setIsPlaying(true)
    }

    const onPause = () => {
      setIsPlaying(false)
    }

    const onVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const onVideoError = () => {
      logDebug("Video error:", video.error)
      setError("Error playing video. Please try again later.")
      if (onError && video.error) {
        onError(new Error(`Video error: ${video.error.message}`))
      }
    }

    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("durationchange", onDurationChange)
    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("volumechange", onVolumeChange)
    video.addEventListener("error", onVideoError)
    document.addEventListener("fullscreenchange", onFullscreenChange)

    return () => {
      // Clean up
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("durationchange", onDurationChange)
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("volumechange", onVolumeChange)
      video.removeEventListener("error", onVideoError)
      document.removeEventListener("fullscreenchange", onFullscreenChange)

      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src, fallbackStreamUrl, subtitleUrl, autoPlay, onError, toast, debug])

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle play/pause
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch((e) => {
        logDebug("Play prevented:", e)
      })
    }
  }

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = Number.parseFloat(e.target.value)
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = Number.parseFloat(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    if (newVolume === 0) {
      video.muted = true
      setIsMuted(true)
    } else if (isMuted) {
      video.muted = false
      setIsMuted(false)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!document.fullscreenElement) {
      video.requestFullscreen().catch((e) => {
        logDebug("Fullscreen request failed:", e)
      })
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <div className="relative w-full h-full bg-black group">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900">
          <div className="text-center p-6 space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold mb-2 text-white">{error}</p>
              <p className="text-gray-400 text-sm">There was an issue playing this video</p>
            </div>
            <button
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Reload Player
            </button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            onClick={togglePlay}
            crossOrigin="anonymous"
            id="video-player"
          />

          {/* Custom controls - shown on hover or when paused */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-all duration-300 opacity-0 group-hover:opacity-100 flex flex-col gap-3">
            {/* Title */}
            <div className="text-white font-medium truncate text-sm">{title}</div>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <span className="text-white text-xs font-mono min-w-[40px]">{formatTime(currentTime)}</span>
              <div className="flex-grow relative">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                  id="seek-slider"
                  name="seek-slider"
                />
                <style jsx>{`
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #8b5cf6;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                  }
                  .slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #8b5cf6;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                  }
                  .slider::-webkit-slider-track {
                    background: rgba(255, 255, 255, 0.2);
                    height: 4px;
                    border-radius: 2px;
                  }
                  .slider::-moz-range-track {
                    background: rgba(255, 255, 255, 0.2);
                    height: 4px;
                    border-radius: 2px;
                  }
                `}</style>
              </div>
              <span className="text-white text-xs font-mono min-w-[40px]">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Play/Pause button */}
                <button 
                  onClick={togglePlay} 
                  className="text-white hover:text-purple-400 transition-colors p-1"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                {/* Volume control */}
                <div className="flex items-center gap-2 group/volume">
                  <button 
                    onClick={toggleMute} 
                    className="text-white hover:text-purple-400 transition-colors p-1"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    )}
                  </button>
                  <div className="w-20 opacity-0 group-hover/volume:opacity-100 transition-opacity">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer volume-slider"
                      id="volume-slider"
                      name="volume-slider"
                    />
                    <style jsx>{`
                      .volume-slider::-webkit-slider-thumb {
                        appearance: none;
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background: #8b5cf6;
                        cursor: pointer;
                        border: 1px solid white;
                      }
                      .volume-slider::-moz-range-thumb {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background: #8b5cf6;
                        cursor: pointer;
                        border: 1px solid white;
                      }
                    `}</style>
                  </div>
                </div>

                {/* Current time display */}
                <div className="text-white text-xs font-mono bg-black/40 px-2 py-1 rounded">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                {/* Fullscreen button */}
                <button 
                  onClick={toggleFullscreen} 
                  className="text-white hover:text-purple-400 transition-colors p-1"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M15 9H19.5M15 9V4.5M15 15v4.5M15 15h4.5M9 15H4.5M9 15v4.5"/>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Center play button overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="bg-black/60 hover:bg-black/80 text-white rounded-full p-4 transition-all duration-200 hover:scale-110"
                aria-label="Play video"
              >
                <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
