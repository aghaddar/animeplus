"use client";

import { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import WatchlistButton from "@/components/WatchlistButton";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import Swiper styles
// @ts-expect-error - Swiper CSS imports are not typed in this project setup
import "swiper/css";
// @ts-expect-error - Swiper CSS imports are not typed in this project setup
import "swiper/css/navigation";
// @ts-expect-error - Swiper CSS imports are not typed in this project setup
import "swiper/css/pagination";
interface Anime {
  id: string;
  title: string;
  description?: string;
  type?: string;
  releaseDate?: string;
  image?: string;
}

interface HeroSliderProps {
  featuredAnime: Anime[];
}

export default function HeroSlider({ featuredAnime }: HeroSliderProps) {
  const [swiperReady, setSwiperReady] = useState(false);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.params.navigation.prevEl = prevRef.current;
      swiperRef.current.params.navigation.nextEl = nextRef.current;
      swiperRef.current.navigation.destroy();
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
      setSwiperReady(true);
    }
  }, []);

  if (!featuredAnime || featuredAnime.length === 0) return null;

  return (
    <div className="relative w-full h-[500px] group">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        pagination={{ 
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{ 
          delay: 8000, 
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={featuredAnime.length > 1}
        speed={800}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        className="h-full"
      >
        {featuredAnime.map((anime, index) => (
          <SwiperSlide key={anime.id}>
            <div className="relative w-full h-full">
              <Image
                src={anime.image || "/placeholder.svg"}
                alt={anime.title}
                fill
                className="object-cover"
                priority={index === 0}
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-8 md:p-12 max-w-3xl z-10">
                <div className="animate-fadeInUp">
                  <span className="inline-block bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    {anime.type || "TV Series"}
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight">
                    {anime.title}
                  </h1>
                  <div className="flex items-center gap-3 text-sm sm:text-base text-gray-300 mb-4">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                      {anime.releaseDate || "2023"}
                    </span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                    <span>HD</span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                    <span>Dub • Sub</span>
                  </div>
                  <p className="text-gray-300 mb-6 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base max-w-2xl">
                    {anime.description || "No description available."}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/anime/${anime.id}`}>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base py-2 px-6 h-11 flex items-center gap-2 rounded-full transition-all duration-300 hover:scale-105">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        Play Now
                      </Button>
                    </Link>
                    <WatchlistButton
                      animeId={anime.id}
                      title={anime.title}
                      imageUrl={anime.image}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-sm sm:text-base py-2 px-6 h-11 flex items-center rounded-full transition-all duration-300 hover:scale-105 border border-white/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows with improved visibility */}
      {featuredAnime.length > 1 && (
        <>
          <button
            ref={prevRef}
            className="custom-swiper-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm border border-white/10"
            aria-label="Previous slide"
            type="button"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            ref={nextRef}
            className="custom-swiper-next absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm border border-white/10"
            aria-label="Next slide"
            type="button"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
        <div className="h-full bg-purple-600 transition-all duration-[8000ms] ease-linear">
          {/* This will be animated by Swiper's autoplay progress */}
        </div>
      </div>
    </div>
  );
}