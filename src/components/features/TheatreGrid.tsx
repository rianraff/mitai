'use client'

import * as React from "react"
import { TheatreMovieCard } from "./TheatreMovieCard"

export function TheatreGrid({
    movies,
    theatre,
    participants,
    currentUserId
}: {
    movies: any[],
    theatre: any,
    participants: any[],
    currentUserId: string | undefined
}) {
    // Current sort logic: Tonight's pick, Unwatched, Watched
    const getSortedVisible = (list: any[]) => {
        return [...list]
            .filter(m => !m.isRemoved)
            .sort((a, b) => {
                // Tonight's pick always first
                if (a.imdb_id === theatre.last_picked_imdb_id) return -1
                if (b.imdb_id === theatre.last_picked_imdb_id) return 1

                // Latest added first
                const dateA = new Date(a.created_at || 0).getTime()
                const dateB = new Date(b.created_at || 0).getTime()
                if (dateA !== dateB) return dateB - dateA

                // Unwatched before watched
                if (!a.watched && b.watched) return -1
                if (a.watched && !b.watched) return 1

                return 0
            })
    }

    const [optimisticMovies, addOptimisticAction] = React.useOptimistic(
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

    const visibleSorted = getSortedVisible(optimisticMovies)

    return (
        <div className="grid grid-cols-2 lg:grid-cols-8 xl:grid-cols-10 gap-4 md:gap-6">
            {visibleSorted.map((movie) => (
                <TheatreMovieCard
                    key={movie.id}
                    movie={movie}
                    isPicked={movie.imdb_id === theatre.last_picked_imdb_id}
                    participants={participants}
                    currentUserId={currentUserId}
                    onOptimisticAction={addOptimisticAction}
                />
            ))}
        </div>
    )
}
