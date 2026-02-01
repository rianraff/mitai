import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus, DoorOpen, ArrowRight } from "lucide-react"
import Link from "next/link"
import { CreateTheatreDialog } from "@/components/features/CreateTheatreDialog"
import { JoinTheatreDialog } from "@/components/features/JoinTheatreDialog"
import { JoinHandler } from "@/components/features/JoinHandler"
import { MERGE_MODE_DETAILS } from '@/lib/constants'

export default async function TheatrePage({ searchParams }: { searchParams: Promise<{ join?: string }> }) {
    const { join } = await searchParams
    const supabase = await createClient()
    const user = supabase ? (await supabase.auth.getUser()).data.user : null

    if (!user) {
        redirect(`/login?redirect=/theatre?join=${join || ''}`)
    }

    const joinCode = join

    if (!supabase) redirect('/login')

    // Fetch theatres user is part of
    const { data: sessions, error } = await supabase
        .from('theatre_sessions')
        .select(`
            theatre:theatres (
                id,
                name,
                invite_code,
                merge_mode,
                host_id
            )
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })

    const theatreList = sessions?.map(s => s.theatre) || []

    // Fetch stats for each theatre
    const theatresWithStats = await Promise.all(theatreList.map(async (theatre: any) => {
        // Get participant count
        const { count: participantCount } = await supabase
            .from('theatre_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('theatre_id', theatre.id);

        // Fetch users in this theatre to get their watchlists
        const { data: memberSessions } = await supabase
            .from('theatre_sessions')
            .select('user_id')
            .eq('theatre_id', theatre.id);

        const memberIds = memberSessions?.map(m => m.user_id) || [];

        // Fetch merged watchlist stats
        // Note: For simplicity and performance, we'll get unique movies and their watched status
        const { data: watchlists } = await supabase
            .from('watchlists')
            .select('imdb_id, watched')
            .in('user_id', memberIds);

        // Merge logic (Union by default for stats display)
        const movieMap = new Map<string, boolean>();
        watchlists?.forEach(w => {
            // If any instance is unwatched, we consider the merged movie unwatched? 
            // Or just use the status of the first one found.
            if (!movieMap.has(w.imdb_id)) {
                movieMap.set(w.imdb_id, w.watched);
            } else if (!w.watched) {
                movieMap.set(w.imdb_id, false); // Prioritize unwatched status
            }
        });

        const totalMovies = movieMap.size;
        const watchedMovies = Array.from(movieMap.values()).filter(v => v).length;
        const progress = totalMovies > 0 ? Math.round((watchedMovies / totalMovies) * 100) : 0;

        return {
            ...theatre,
            participantCount: participantCount || 0,
            totalMovies,
            watchedMovies,
            progress
        };
    }));

    return (
        <main className="container mx-auto p-4 md:p-8">
            <JoinHandler code={joinCode} />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Theatre</h1>
                    <p className="text-xl font-bold opacity-70">Watch together with friends.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <JoinTheatreDialog className="flex-1 md:flex-none w-full md:w-auto" />
                    <CreateTheatreDialog className="flex-1 md:flex-none w-full md:w-auto" />
                </div>
            </div>

            {theatresWithStats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {theatresWithStats.map((theatre: any) => (
                        <Card key={theatre.id} className="border-4 border-black shadow-neo hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-xl transition-all flex flex-col bg-card rounded-none group">
                            <CardHeader className="p-6 pb-0">
                                <CardTitle className="text-5xl font-black uppercase tracking-tighter text-black leading-none break-words mb-4 group-hover:text-primary transition-colors">
                                    {theatre.name}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-6 space-y-6 flex-grow">

                                {/* Progress Section */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Completion</span>
                                        <span className="text-xl font-black">{theatre.progress}%</span>
                                    </div>
                                    <div className="h-4 w-full bg-black/10 border-2 border-black overflow-hidden shadow-neo-sm">
                                        <div
                                            className="h-full bg-secondary border-r-2 border-black transition-all duration-1000"
                                            style={{ width: `${theatre.progress}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold italic opacity-60">
                                        {theatre.watchedMovies} of {theatre.totalMovies} missions accomplished
                                    </p>
                                </div>

                                <Button asChild size="lg" className="w-full">
                                    <Link href={`/theatre/${theatre.invite_code}`}>
                                        ENTER ROOM <ArrowRight className="ml-2 w-6 h-6" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-16 border-4 border-black border-dashed bg-[#3f4e51]/5 rounded-none mt-12">
                    <DoorOpen className="w-24 h-24 text-black mb-6" />
                    <h3 className="text-3xl font-black uppercase mb-4">No active rooms</h3>
                    <p className="text-xl font-bold text-black/70 mb-10 max-w-md text-center">
                        Create a room to invite friends or join an existing one using a code.
                    </p>
                    <div className="flex gap-4">
                        <CreateTheatreDialog trigger={<Button size="lg" className="h-16 px-10 border-4 border-black shadow-neo font-black text-xl bg-secondary">Create Theatre</Button>} />
                    </div>
                </div>
            )}
        </main>
    )
}
