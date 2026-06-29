// app/search/page.tsx
import { Suspense } from "react"
import { searchAnime } from "@/lib/anilist"
import AnimeCard from "@/components/AnimeCard"
import Link from "next/link"

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query = "", page: pageParam = "1" } = await searchParams
  const page = parseInt(pageParam, 10)

  const { media: results, pageInfo } = query
    ? await searchAnime(query, page)
    : { media: [], pageInfo: null }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-20">
      <div className="container mx-auto px-4 py-8">

        <div className="mb-8">
          {query ? (
            <div>
              <p className="text-gray-500 text-sm mb-1">
                {pageInfo?.total ?? 0} results for
              </p>
              <h1 className="text-2xl font-bold">"{query}"</h1>
            </div>
          ) : (
            <h1 className="text-2xl font-bold">Search Anime</h1>
          )}
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 
                          lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        }>
          {query && results.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-gray-400 mb-2">No results for "{query}"</p>
              <p className="text-gray-600 text-sm">
                Try a different spelling or browse below
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <Link href="/browse/trending"
                  className="text-purple-400 hover:text-purple-300 text-sm underline">
                  Trending
                </Link>
                <Link href="/browse/popular"
                  className="text-purple-400 hover:text-purple-300 text-sm underline">
                  Popular
                </Link>
              </div>
            </div>
          ) : query ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 
                              lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((anime) => (
                  <AnimeCard
                    key={anime.id}
                    id={anime.id}
                    title={anime.title}
                    image={anime.image}
                    type={anime.type}
                    releaseDate={anime.releaseDate ?? undefined}
                    rating={anime.rating ?? undefined}
                    genres={anime.genres}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pageInfo && (pageInfo.currentPage > 1 || pageInfo.hasNextPage) && (
                <div className="flex items-center justify-center gap-4 mt-10">
                  {pageInfo.currentPage > 1 && (
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                      className="px-4 py-2 bg-gray-800 rounded-full hover:bg-purple-600 
                                transition-colors text-sm">
                      ← Previous
                    </Link>
                  )}
                  <span className="text-gray-500 text-sm">
                    Page {pageInfo.currentPage} of {pageInfo.lastPage}
                  </span>
                  {pageInfo.hasNextPage && (
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                      className="px-4 py-2 bg-gray-800 rounded-full hover:bg-purple-600 
                                 transition-colors text-sm">
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24">
              <p className="text-gray-600 text-sm">
                Use the search bar above to find anime
              </p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}