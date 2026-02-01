import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Film } from "lucide-react"
import { MovieSearch } from "@/components/features/MovieSearch"
import { WatchlistGrid } from "@/components/features/WatchlistGrid"

export default async function WatchlistPage() {
    const supabase = await createClient()
    const user = supabase ? (await supabase.auth.getUser()).data.user : null

    if (!user) {
        redirect('/login')
    }

    const { data: movies, error = null } = supabase && user
        ? await supabase.from('watchlists')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        : { data: [] }

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
                <h1 className="text-4xl font-black uppercase tracking-tighter">My Watchlist</h1>
                <div className="w-full max-w-sm">
                    <MovieSearch />
                </div>
            </div>

            {movies && movies.length > 0 ? (
                <WatchlistGrid movies={movies} />
            ) : (
                <div className="flex flex-col items-center justify-center p-12 border-4 border-black border-dashed bg-black/5 rounded-none mt-12">
                    <div className="w-20 h-20 bg-muted text-muted-foreground flex items-center justify-center border-2 border-black mb-6 rotate-3">
                        <Film className="w-10 h-10 text-black" />
                    </div>
                    <h3 className="text-2xl font-black uppercase mb-2">Your list is empty</h3>
                    <p className="text-foreground/70 mb-8 max-w-sm text-center font-medium">
                        Search for a movie above to start building your personal cinema library.
                    </p>
                </div>
            )}
        </main>
    )
}
