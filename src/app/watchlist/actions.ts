'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addToWatchlist(movie: {
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
}) {
    const supabase = await createClient()

    if (!supabase) {
        return { error: "Supabase not configured" }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "You must be logged in to add to watchlist" }
    }

    const { error } = await supabase
        .from('watchlists')
        .insert({
            user_id: user.id,
            imdb_id: movie.imdbID,
            title: movie.Title,
            year: movie.Year,
            poster_url: movie.Poster === "N/A" ? null : movie.Poster
        })

    if (error) {
        // Handle unique constraint error
        if (error.code === '23505') {
            return { error: "Movie already in your watchlist" }
        }
        return { error: error.message }
    }

    revalidatePath('/watchlist')
    return { success: true }
}

export async function removeFromWatchlist(imdbID: string) {
    const supabase = await createClient()
    if (!supabase) return { error: "Supabase not configured" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not logged in" }

    const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('user_id', user.id)
        .eq('imdb_id', imdbID)

    if (error) return { error: error.message }

    revalidatePath('/watchlist')
    return { success: true }
}

export async function toggleWatchedStatus(imdbID: string, currentStatus: boolean) {
    const supabase = await createClient()
    if (!supabase) return { error: "Supabase not configured" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not logged in" }

    const { error } = await supabase
        .from('watchlists')
        .update({ watched: !currentStatus })
        .eq('user_id', user.id)
        .eq('imdb_id', imdbID)

    if (error) return { error: error.message }

    revalidatePath('/watchlist')
    return { success: true }
}
