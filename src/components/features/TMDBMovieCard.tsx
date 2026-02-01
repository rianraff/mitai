'use client'

import * as React from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TMDBMovie, getTMDBPosterUrl } from "@/lib/tmdb"
import { addToWatchlist } from "@/app/watchlist/actions"
import { toast } from "sonner"
import { MovieCard } from "./MovieCard"

import { motion } from "framer-motion"

export function TMDBMovieCard({ movie }: { movie: TMDBMovie }) {
    const [loading, setLoading] = React.useState(false)

    const handleAdd = async () => {
        setLoading(true)
        try {
            // We need to fetch the IMDb ID first since our watchlist uses it
            const res = await fetch(`/api/tmdb/imdb-id?tmdbId=${movie.id}`)
            const data = await res.json()

            if (data.imdbId) {
                const addRes = await addToWatchlist({
                    imdbID: data.imdbId,
                    Title: movie.title,
                    Year: movie.release_date?.split('-')[0] || 'N/A',
                    Poster: getTMDBPosterUrl(movie.poster_path)
                })

                if (addRes.error) {
                    toast.error(addRes.error)
                } else {
                    toast.success(`${movie.title} added to watchlist!`)
                }
            } else {
                toast.error("Could not find IMDb ID for this movie")
            }
        } catch (err) {
            toast.error("Failed to add movie")
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="h-full"
        >
            <MovieCard
                title={movie.title}
                year={movie.release_date?.split('-')[0] || 'N/A'}
                posterUrl={getTMDBPosterUrl(movie.poster_path)}
                className="group h-full"
            >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <Button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleAdd()
                        }}
                        disabled={loading}
                        className="border-2 border-black bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs h-10 shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </>
                        )}
                    </Button>
                </div>
            </MovieCard>
        </motion.div>
    )
}
