import { NextResponse } from "next/server"
import { MOCK_POPULAR_ANIME } from "@/lib/mock-data"
import type { AnimeResult } from "@/lib/api"

export async function GET(request: Request, { params }: { params: { query: string } }) {
  try {
    const query = params.query
    console.log(`API route: /api/anime/animepahe/${query} called`)

    // Filter mock data based on query
    const results = MOCK_POPULAR_ANIME.filter((anime: AnimeResult) =>
      anime.title.toLowerCase().includes(query.toLowerCase()),
    )

    console.log(`Returning ${results.length} search results for query: ${query}`)

    // Process images to ensure they're valid
    const processedResults = results.map((anime: AnimeResult) => {
      // If the image URL is invalid, use a placeholder
      const validImage =
        anime.image && anime.image !== "undefined" && anime.image !== "null" && anime.image.trim() !== ""

      // Determine the base image URL
      const baseImageUrl = validImage
        ? anime.image!
        : `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(anime.title)}`

      // If it's an external URL, proxy it through our API to avoid CORS issues
      const finalImageUrl =
        baseImageUrl.startsWith("http") && !baseImageUrl.startsWith("/")
          ? `/api/proxy-image?url=${encodeURIComponent(baseImageUrl)}`
          : baseImageUrl

      return {
        ...anime,
        image: finalImageUrl,
      }
    })

    return NextResponse.json({
      currentPage: 1,
      hasNextPage: false,
      results: processedResults,
    })
  } catch (error) {
    console.error("Error in animepahe search API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
