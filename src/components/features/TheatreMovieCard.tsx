'use client'

import * as React from "react"
import { MovieCard } from "./MovieCard"
import { removeFromWatchlist, toggleWatchedStatus } from "@/app/watchlist/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function TheatreMovieCard({
    movie,
    isPicked,
    participants,
    currentUserId,
    onOptimisticAction
}: {
    movie: any,
    isPicked: boolean,
    participants: any[],
    currentUserId: string | undefined,
    onOptimisticAction?: (action: { type: 'toggle' | 'remove', imdb_id: string }) => void
}) {
    const router = useRouter()

    const handleRemove = async () => {
        React.startTransition(async () => {
            onOptimisticAction?.({ type: 'remove', imdb_id: movie.imdb_id })
            const res = await removeFromWatchlist(movie.imdb_id)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(`Removed ${movie.title} from your watchlist`)
                router.refresh()
            }
        })
    }

    const handleToggle = async () => {
        React.startTransition(async () => {
            onOptimisticAction?.({ type: 'toggle', imdb_id: movie.imdb_id })
            const res = await toggleWatchedStatus(movie.imdb_id, movie.watched || false)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(movie.watched ? `Marked ${movie.title} as unwatched` : `Marked ${movie.title} as watched`)
                router.refresh()
            }
        })
    }

    // Only show remove if the current user added this movie
    const canRemove = movie.added_by_ids?.includes(currentUserId)

    return (
        <div className="relative group col-span-2">
            <MovieCard
                title={movie.title}
                year={movie.year}
                posterUrl={movie.poster_url}
                isPicked={isPicked}
                isWatched={movie.watched}
                onRemove={canRemove ? handleRemove : undefined}
                onToggleWatched={canRemove ? handleToggle : undefined}
            >
                {/* Winner Badge */}
                {isPicked && (
                    <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground font-black text-xs px-2 py-1 border-2 border-black rotate-[-2deg] shadow-neo-sm">
                        TONIGHT'S PICK
                    </div>
                )}

                {/* User attribution */}
                <div className="absolute bottom-2 left-2 flex -space-x-2 pointer-events-none">
                    {movie.added_by_ids?.map((userId: string, idx: number) => {
                        const p = participants.find(part => part.id === userId)
                        if (!p) return null
                        return (
                            <div
                                key={userId}
                                title={p.username}
                                className="w-6 h-6 rounded-none border border-black bg-white flex items-center justify-center text-[10px] font-black shadow-neo-sm transition-transform hover:-translate-y-1 hover:z-10 text-black overflow-hidden pointer-events-auto"
                                style={{ zIndex: 10 - idx }}
                            >
                                {p.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                                ) : (
                                    p.username[0].toUpperCase()
                                )}
                            </div>
                        )
                    })}
                </div>
            </MovieCard>
        </div>
    )
}
