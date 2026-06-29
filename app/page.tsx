// app/page.tsx
import { Suspense } from "react"
import HeroSlider from "@/components/HeroSlider"
import HeroSliderSkeleton from "@/components/HeroSliderSkeleton"
import AnimeList from "@/components/AnimeList"
import AnimeListSkeleton from "@/components/AnimeListSkeleton"
import { getHomePageData } from "@/lib/anilist"

export const revalidate = 600 // revalidate every 10 minutes at the page level

export default async function Home() {
  const { trending, popular, topRated, seasonal, featured } = await getHomePageData()

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Hero Slider */}
      <Suspense fallback={<HeroSliderSkeleton />}>
        <HeroSlider featuredAnime={featured} />
      </Suspense>

      {/* Trending Now */}
      <Suspense fallback={<AnimeListSkeleton title="Trending Now" />}>
        <AnimeList
          title="Trending Now"
          animeList={trending}
          viewAllLink="/browse/trending"
        />
      </Suspense>

      {/* This Season */}
      <Suspense fallback={<AnimeListSkeleton title="This Season" />}>
        <AnimeList
          title="This Season"
          animeList={seasonal}
          viewAllLink="/browse/seasonal"
        />
      </Suspense>

      {/* Most Popular */}
      <Suspense fallback={<AnimeListSkeleton title="Most Popular" />}>
        <AnimeList
          title="Most Popular"
          animeList={popular}
          viewAllLink="/browse/popular"
        />
      </Suspense>

      {/* Top Rated */}
      <Suspense fallback={<AnimeListSkeleton title="Top Rated" />}>
        <AnimeList
          title="Top Rated"
          animeList={topRated}
          viewAllLink="/browse/top-rated"
        />
      </Suspense>

    </div>
  )
}