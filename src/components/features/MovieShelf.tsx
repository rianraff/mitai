'use client'

import * as React from "react"
import { ChevronLeft, ChevronRight, TrendingUp, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TMDBMovie } from "@/lib/tmdb"
import { TMDBMovieCard } from "./TMDBMovieCard"

interface MovieShelfProps {
    title: string
    movies: TMDBMovie[]
    iconType: 'trending' | 'top-rated'
    iconColor: string
}

export function MovieShelf({ title, movies, iconType, iconColor }: MovieShelfProps) {
    const Icon = iconType === 'trending' ? TrendingUp : Star

    const [startIndex, setStartIndex] = React.useState(0)
    const itemsPerPage = 5

    const next = () => {
        if (startIndex + itemsPerPage < movies.length) {
            setStartIndex(startIndex + itemsPerPage)
        }
    }

    const prev = () => {
        if (startIndex - itemsPerPage >= 0) {
            setStartIndex(startIndex - itemsPerPage)
        }
    }

    const visibleMovies = movies.slice(startIndex, startIndex + itemsPerPage)

    return (
        <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-8 border-black pb-4 gap-4">
                <div className="flex items-center gap-3">
                    <Icon className={`w-8 h-8 ${iconColor}`} />
                    <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">{title}</h2>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={prev}
                        disabled={startIndex === 0}
                        className="border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-30"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={next}
                        disabled={startIndex + itemsPerPage >= movies.length}
                        className="border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-30"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {visibleMovies.map((movie) => (
                    <TMDBMovieCard key={movie.id} movie={movie} />
                ))}
            </div>

            <div className="flex justify-center gap-1 mt-4">
                {Array.from({ length: Math.ceil(movies.length / itemsPerPage) }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 transition-all border border-black ${i === startIndex / itemsPerPage ? 'w-8 bg-black' : 'w-2 bg-black/20'}`}
                    />
                ))}
            </div>
        </section>
    )
}
