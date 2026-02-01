'use client'

import * as React from "react"
import { MovieCard } from "./MovieCard"
import { removeFromWatchlist, toggleWatchedStatus } from "@/app/watchlist/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type OptimisticMovie = any & { isPending?: boolean, isRemoved?: boolean }

export function WatchlistGrid({ movies }: { movies: any[] }) {
    const router = useRouter()

    // Optimistic state for the movies list
    const [optimisticMovies, addOptimisticMovie] = React.useOptimistic(
        movies.map(m => ({ ...m, isRemoved: false })),
        (state, action: { type: 'toggle' | 'remove', imdb_id: string }) => {
            if (action.type === 'toggle') {
                return state.map(m =>
                    m.imdb_id === action.imdb_id
                        ? { ...m, watched: !m.watched }
                        : m
                )
            }
            if (action.type === 'remove') {
                return state.map(m =>
                    m.imdb_id === action.imdb_id
                        ? { ...m, isRemoved: true }
                        : m
                )
            }
            return state
        }
    )

    const handleRemove = async (movie: any) => {
        // Start transition for optimistic update
        React.startTransition(async () => {
            addOptimisticMovie({ type: 'remove', imdb_id: movie.imdb_id })

            const res = await removeFromWatchlist(movie.imdb_id)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(`Removed ${movie.title}`)
                router.refresh()
            }
        })
    }

    const handleToggle = async (movie: any) => {
        React.startTransition(async () => {
            addOptimisticMovie({ type: 'toggle', imdb_id: movie.imdb_id })

            const res = await toggleWatchedStatus(movie.imdb_id, movie.watched || false)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(movie.watched ? `Marked ${movie.title} as unwatched` : `Marked ${movie.title} as watched`)
                router.refresh()
            }
        })
    }

    // Filter out movies that are optimistically removed
    const visibleMovies = optimisticMovies.filter(m => !m.isRemoved)

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {visibleMovies.map((movie) => (
                <MovieCard
                    key={movie.id}
                    title={movie.title}
                    year={movie.year}
                    posterUrl={movie.poster_url}
                    isWatched={movie.watched}
                    onRemove={() => handleRemove(movie)}
                    onToggleWatched={() => handleToggle(movie)}
                />
            ))}
        </div>
    )
}
