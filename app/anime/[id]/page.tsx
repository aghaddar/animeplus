import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getAnimeInfo } from "@/lib/anilist"
import AnimePageClient from "@/components/AnimePageClient"

interface AnimePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: AnimePageProps): Promise<Metadata> {
  const { id } = await params
  const animeInfo = await getAnimeInfo(id)

  if (!animeInfo) {
    return { title: "Anime Not Found - AnimePlus" }
  }

  return {
    title: `${animeInfo.title} - AnimePlus`,
    description: animeInfo.description?.slice(0, 160),
  }
}

export default async function AnimePage({ params }: AnimePageProps) {
  const { id } = await params
  const animeInfo = await getAnimeInfo(id)

  if (!animeInfo) {
    notFound()
  }

  return <AnimePageClient animeInfo={animeInfo} />
}