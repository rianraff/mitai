'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { TMDBMovie, getTMDBPosterUrl } from '@/lib/tmdb'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { addToWatchlist } from '@/app/watchlist/actions'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

interface MovieBillboardProps {
    movies: TMDBMovie[]
    initialWatchlistIds?: string[]
}

export function MovieBillboard({ movies, initialWatchlistIds = [] }: MovieBillboardProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const [loading, setLoading] = useState(false)
    const [addedImdbIds, setAddedImdbIds] = useState<Set<string>>(new Set(initialWatchlistIds))
    const [currentMovieImdbId, setCurrentMovieImdbId] = useState<string | null>(null)
    const [isChecking, setIsChecking] = useState(false)

    const movie = movies[currentIndex]

    const next = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length)
    }, [movies.length])

    const prev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
    }, [movies.length])

    // Update current IMDb ID whenever the movie changes to check if it's already in the watchlist
    useEffect(() => {
        let isCancelled = false
        const checkStatus = async () => {
            setIsChecking(true)
            setCurrentMovieImdbId(null)
            try {
                const res = await fetch(`/api/tmdb/imdb-id?tmdbId=${movie.id}`)
                const data = await res.json()
                if (!isCancelled && data.imdbId) {
                    setCurrentMovieImdbId(data.imdbId)
                }
            } catch (err) {
                console.error("Failed to fetch IMDb ID", err)
            } finally {
                if (!isCancelled) setIsChecking(false)
            }
        }
        checkStatus()
        return () => { isCancelled = true }
    }, [movie.id])

    const isAdded = currentMovieImdbId ? addedImdbIds.has(currentMovieImdbId) : false

    const handleAdd = async () => {
        if (isAdded) return
        setLoading(true)
        try {
            // Use cached ID if available
            const imdbId = currentMovieImdbId || (await (await fetch(`/api/tmdb/imdb-id?tmdbId=${movie.id}`)).json()).imdbId

            if (imdbId) {
                const addRes = await addToWatchlist({
                    imdbID: imdbId,
                    Title: movie.title,
                    Year: movie.release_date?.split('-')[0] || 'N/A',
                    Poster: getTMDBPosterUrl(movie.poster_path)
                })

                if (addRes.error) {
                    toast.error(addRes.error)
                    // If it's already there but we didn't know, update local state
                    if (addRes.error.toLowerCase().includes("already")) {
                        setAddedImdbIds(prev => new Set(prev).add(imdbId))
                    }
                } else {
                    toast.success(`${movie.title} added to watchlist!`)
                    setAddedImdbIds(prev => new Set(prev).add(imdbId))
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

    useEffect(() => {
        if (!isAutoPlaying) return
        const interval = setInterval(next, 8000) // Slide every 8 seconds
        return () => clearInterval(interval)
    }, [isAutoPlaying, next])

    if (!movies || movies.length === 0) return null

    return (
        <div
            className="relative w-full h-[60vh] min-h-[400px] border-4 border-black overflow-hidden shadow-neo-xl group bg-black"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={movie.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${getTMDBPosterUrl(movie.backdrop_path, 'original')})`
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-2/3 space-y-6 flex flex-col items-start translate-z-0 z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <span className="bg-primary text-black font-black uppercase tracking-widest text-sm px-3 py-1 border-2 border-black inline-block mb-4">
                                Trending Now
                            </span>
                            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
                                {movie.title}
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-wrap gap-4"
                        >
                            <Button
                                size="lg"
                                onClick={handleAdd}
                                disabled={loading || isAdded || isChecking}
                                className={isAdded ? 'bg-secondary text-secondary-foreground cursor-default shadow-none translate-y-[4px] hover:translate-y-[4px]' : ''}
                            >
                                {loading || isChecking ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : isAdded ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                    <Plus className="w-6 h-6" />
                                )}
                                {isAdded ? 'ADDED TO WATCHLIST' : 'ADD TO WATCHLIST'}
                            </Button>
                        </motion.div>
                    </div>

                    {/* Neo-brutalism Accents */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                        animate={{ opacity: 1, scale: 1, rotate: -3 }}
                        transition={{ type: "spring", delay: 0.5 }}
                        className="absolute top-8 right-8 hidden flex-col gap-2 md:flex z-10"
                    >
                        <div className="bg-secondary text-black font-black p-4 border-4 border-black shadow-neo text-2xl">
                            ★ {movie.vote_average.toFixed(1)}
                        </div>
                        <div className="bg-white text-black font-black p-2 border-4 border-black shadow-neo rotate-5 text-center uppercase">
                            {movie.release_date.split('-')[0]}
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Pagination Controls */}
            <div className="absolute right-8 top-8 md:top-auto md:bottom-8 flex gap-2 z-20">
                <Button
                    onClick={prev}
                    size="icon"
                    className="w-12 h-12 border-4 border-black bg-white text-black hover:bg-primary hover:text-white shadow-neo-sm transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                    onClick={next}
                    size="icon"
                    className="w-12 h-12 border-4 border-black bg-white text-black hover:bg-primary hover:text-white shadow-neo-sm transition-all"
                >
                    <ChevronRight className="w-6 h-6" />
                </Button>
            </div>

            {/* Progress Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {movies.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-4 border-2 border-black transition-all ${i === currentIndex ? 'w-12 bg-primary shadow-neo-sm' : 'w-4 bg-white/50 hover:bg-white'}`}
                    />
                ))}
            </div>
        </div>
    )
}
