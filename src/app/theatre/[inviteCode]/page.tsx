import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { TheatreGrid } from "@/components/features/TheatreGrid"
import { Film, Users, Share2, Shuffle, AlertCircle } from "lucide-react"
import { TheatreHeader } from "@/components/features/TheatreHeader"
import Link from 'next/link'
import { MERGE_MODE_DETAILS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default async function TheatreRoomPage({ params }: { params: Promise<{ inviteCode: string }> }) {
    const { inviteCode } = await params
    const supabase = await createClient()
    const user = supabase ? (await supabase.auth.getUser()).data.user : null

    if (!user || !supabase) redirect('/login')

    // 1. Get Theatre
    const { data: theatre, error: theatreError } = await supabase
        .from('theatres')
        .select('*')
        .eq('invite_code', inviteCode)
        .single()

    if (theatreError || !theatre) notFound()

    // 2. Get Participants
    const { data: sessions } = await supabase
        .from('theatre_sessions')
        .select('user_id, profiles(username, email, avatar_url)')
        .eq('theatre_id', theatre.id)

    const participants = sessions?.map(s => ({
        id: s.user_id,
        username: (s.profiles as any)?.username || (s.profiles as any)?.email?.split('@')[0] || 'User',
        avatar_url: (s.profiles as any)?.avatar_url
    })) || []

    const isParticipant = participants.some(p => p.id === user.id)
    if (!isParticipant) {
        // Automatically join if they have the link? (PRD says Join via link)
        // For simplicity in SSR, let's just show a "Join" UI or redirect
        return (
            <main className="container mx-auto p-16 text-center">
                <h1 className="text-4xl font-black mb-8">You haven't joined this Theatre yet.</h1>
                <Button asChild size="lg">
                    <Link href={`/theatre?join=${inviteCode}`}>Join Theatre</Link>
                </Button>
            </main>
        )
    }

    // 3. Get Watchlists for all participants
    const participantIds = participants.map(p => p.id)
    const { data: allWatchlistItems } = await supabase
        .from('watchlists')
        .select('*')
        .in('user_id', participantIds)

    // 4. Merge Logic
    let mergedList: any[] = []
    const movieMap = new Map<string, any>()
    allWatchlistItems?.forEach(item => {
        if (!movieMap.has(item.imdb_id)) {
            movieMap.set(item.imdb_id, {
                ...item,
                added_by_ids: []
            })
        } else {
            // Keep the most recent created_at for sorting "latest added"
            const currentItem = movieMap.get(item.imdb_id)
            if (new Date(item.created_at) > new Date(currentItem.created_at)) {
                movieMap.set(item.imdb_id, {
                    ...item,
                    added_by_ids: currentItem.added_by_ids
                })
            }
        }
        movieMap.get(item.imdb_id).added_by_ids.push(item.user_id)
    })

    if (theatre.merge_mode === 'union') {
        mergedList = Array.from(movieMap.values())
    } else if (theatre.merge_mode === 'intersection') {
        mergedList = Array.from(movieMap.values()).filter(m =>
            participantIds.every(pid => m.added_by_ids.includes(pid))
        )
    } else if (theatre.merge_mode === 'xor') {
        // Appears in exactly one list
        mergedList = Array.from(movieMap.values()).filter(m =>
            m.added_by_ids.length === 1
        )
    }

    // Sort Logic:
    // 1. Tonight's Pick (Top Priority)
    // 2. Unwatched movies
    // 3. Watched movies
    const sortedList = [...mergedList].sort((a, b) => {
        // Tonight's pick always first
        if (a.imdb_id === theatre.last_picked_imdb_id) return -1
        if (b.imdb_id === theatre.last_picked_imdb_id) return 1

        // Then by latest added (created_at descending)
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        if (dateA !== dateB) return dateB - dateA

        // Then unwatched before watched
        if (!a.watched && b.watched) return -1
        if (a.watched && !b.watched) return 1

        return 0
    })

    const lastPicked = sortedList.find(m => m.imdb_id === theatre.last_picked_imdb_id)

    return (
        <main className="container mx-auto p-4 md:p-8">
            <TheatreHeader
                theatre={theatre}
                participantsCount={participants.length}
                movieCount={sortedList.length}
                isHost={theatre.host_id === user.id}
                mergedList={sortedList}
            />

            <div className="mt-8 space-y-8">
                {/* Participants - Compact horizontal */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-black uppercase text-xs mr-2 opacity-50 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Participants:
                    </span>
                    {participants.map(p => (
                        <div key={p.id} className="flex items-center gap-2 font-bold bg-white border-2 border-black px-2 py-0.5 text-xs shadow-neo-sm">
                            <div className="w-4 h-4 bg-black text-white flex items-center justify-center text-[8px] overflow-hidden rounded-none border border-black">
                                {p.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                                ) : (
                                    p.username[0].toUpperCase()
                                )}
                            </div>
                            <span>{p.username}</span>
                            {p.id === theatre.host_id && <span className="text-[10px] text-primary font-black ml-1">★</span>}
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div>
                    {sortedList.length > 0 ? (
                        <TheatreGrid
                            movies={sortedList}
                            theatre={theatre}
                            participants={participants}
                            currentUserId={user?.id}
                        />
                    ) : (
                        <div className="p-12 border-4 border-black border-dashed bg-black/5 text-center">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="font-bold text-xl opacity-60 uppercase">
                                {MERGE_MODE_DETAILS[theatre.merge_mode as keyof typeof MERGE_MODE_DETAILS].description}
                            </p>
                            {theatre.merge_mode === 'intersection' && (
                                <p className="text-sm font-medium mt-2">Try switching to BUFFET mode or add more common movies.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main >
    )
}

// Simple helper component to client-side actions
