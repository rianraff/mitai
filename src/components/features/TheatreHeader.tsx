'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Share2, Shuffle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { pickRandomMovie, updateMergeMode } from "@/app/theatre/actions"
import { MERGE_MODE_DETAILS, type MergeMode } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function TheatreHeader({
    theatre,
    participantsCount,
    movieCount,
    isHost,
    mergedList
}: {
    theatre: any;
    participantsCount: number;
    movieCount: number;
    isHost: boolean;
    mergedList: any[];
}) {
    const [loading, setLoading] = React.useState(false)

    const copyInvite = () => {
        const url = `${window.location.origin}/theatre?join=${theatre.invite_code}`
        navigator.clipboard.writeText(url)
        toast.success("Invite link copied!")
    }

    const handleShuffle = async () => {
        // Filter out watched movies locally first to avoid unnecessary requests if all are watched (though server also handles it)
        const unwatchedMovies = mergedList.filter(m => !m.watched)
        if (unwatchedMovies.length === 0) {
            toast.error("No unwatched movies to shuffle!")
            return
        }
        setLoading(true)
        try {
            const imdbIds = unwatchedMovies.map(m => m.imdb_id)
            const res = await pickRandomMovie(theatre.id, imdbIds)
            if (res.success) {
                toast.success("Shuffle complete!")
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error("Failed to shuffle")
        } finally {
            setLoading(false)
        }
    }

    const handleModeChange = async (newMode: MergeMode) => {
        if (!isHost || newMode === theatre.merge_mode) return
        const res = await updateMergeMode(theatre.id, newMode)
        if (res.success) {
            toast.success(`Mode changed to ${newMode}`)
        }
    }

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-8 border-black pb-8">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">{theatre.name}</h1>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={copyInvite}
                    >
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xl font-bold">
                    <div className="flex items-center gap-2 bg-black text-white px-3 py-1 -rotate-1 italic shadow-neo-sm">
                        <span>{participantsCount} Participants</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        <span>{movieCount} Movies</span>
                    </div>

                    {isHost && (
                        <div className="flex border-4 border-black shadow-neo-sm overflow-hidden rounded-none">
                            {(['intersection', 'union', 'xor'] as MergeMode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => handleModeChange(m)}
                                    title={MERGE_MODE_DETAILS[m].description}
                                    className={cn(
                                        "px-4 py-2 font-black uppercase text-xs tracking-widest border-r-4 border-black last:border-r-0 transition-all",
                                        theatre.merge_mode === m ? "bg-black text-white" : "bg-white hover:bg-black/5"
                                    )}
                                >
                                    {MERGE_MODE_DETAILS[m].label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Button
                onClick={handleShuffle}
                disabled={loading || mergedList.length === 0}
                size="xl"
                className="fixed bottom-6 right-6 z-50 rounded-none h-16 w-16 md:static md:w-auto md:h-auto md:rounded-none md:border-4 md:border-black md:shadow-neo lg:px-8 border-4 border-black shadow-neo active:translate-y-1 active:shadow-none"
            >
                {loading ? <Loader2 className="animate-spin w-8 h-8 md:w-10 md:h-10" /> : (
                    <>
                        <Shuffle className="w-8 h-8 md:mr-4" />
                        <span className="hidden md:inline">Shuffle</span>
                    </>
                )}
            </Button>
        </div>
    )
}
