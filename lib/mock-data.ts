import type { WatchlistItem } from "./watchlist-api"
import type { AnimeResult, Episode } from "./api"

// Mock data for when API is unavailable
export const MOCK_POPULAR_ANIME: AnimeResult[] = [
  {
    id: "one-piece",
    title: "One Piece",
    image: "/Straw-Hat-Crew-Adventure.png",
    type: "TV",
    releaseDate: "1999",
    rating: 8.7,
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer",
    image: "/swords-against-shadows.png",
    type: "TV",
    releaseDate: "2019",
    rating: 8.5,
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    image: "/cursed-energy-clash.png",
    type: "TV",
    releaseDate: "2020",
    rating: 8.6,
  },
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    image: "/colossal-silhouette.png",
    type: "TV",
    releaseDate: "2013",
    rating: 9.0,
  },
  {
    id: "my-hero-academia",
    title: "My Hero Academia",
    image: "/hero-academy-gathering.png",
    type: "TV",
    releaseDate: "2016",
    rating: 8.2,
  },
  {
    id: "black-clover",
    title: "Black Clover",
    image: "/black-clover-inspired-team.png",
    type: "TV",
    releaseDate: "2017",
    rating: 8.1,
  },
  {
    id: "overlord",
    title: "Overlord",
    image: "/overlord-anime.png", // Make sure this image exists in public folder
    type: "TV",
    releaseDate: "2015",
    rating: 8.3,
    description:
      "The final hour of the popular virtual reality game Yggdrasil has come. However, Momonga, a powerful wizard and master of the dark guild Ainz Ooal Gown, decides to spend his last few moments in the game as the servers begin to shut down. To his surprise, despite the clock having struck midnight, Momonga is still fully conscious as his character and, moreover, the non-player characters appear to have developed personalities of their own! Confronted with this abnormal situation, Momonga commands his loyal servants to help him investigate and take control of this new world, with the hopes of figuring out what has caused this development and if there may be others in the same predicament.",
    status: "Completed",
    totalEpisodes: 13,
    genres: ["Action", "Adventure", "Fantasy"],
  },
]
