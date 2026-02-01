'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type MergeMode } from '@/lib/constants'

export async function createTheatre(name: string, mergeMode: MergeMode = 'intersection') {
    const supabase = await createClient()
    if (!supabase) return { error: "Not configured" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // 1. Create Theatre
    const { data: theatre, error: theatreError } = await supabase
        .from('theatres')
        .insert({
            host_id: user.id,
            name,
            merge_mode: mergeMode
        })
        .select()
        .single()

    if (theatreError) return { error: theatreError.message }

    // 2. Join Theatre (as host)
    const { error: sessionError } = await supabase
        .from('theatre_sessions')
        .insert({
            theatre_id: theatre.id,
            user_id: user.id
        })

    if (sessionError) return { error: sessionError.message }

    revalidatePath('/theatre')
    return { success: true, inviteCode: theatre.invite_code }
}

export async function joinTheatre(inviteCode: string) {
    const supabase = await createClient()
    if (!supabase) return { error: "Not configured" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // 1. Find Theatre
    const { data: theatre, error: theatreError } = await supabase
        .from('theatres')
        .select('id')
        .eq('invite_code', inviteCode)
        .single()

    if (theatreError || !theatre) return { error: "Theatre not found" }

    // 2. Join
    const { error: sessionError } = await supabase
        .from('theatre_sessions')
        .insert({
            theatre_id: theatre.id,
            user_id: user.id
        })

    if (sessionError) {
        if (sessionError.code === '23505') {
            return { success: true, message: "Already joined" }
        }
        return { error: sessionError.message }
    }

    revalidatePath('/theatre')
    return { success: true }
}

export async function updateMergeMode(theatreId: string, mergeMode: MergeMode) {
    const supabase = await createClient()
    if (!supabase) return { error: "Not configured" }

    const { error } = await supabase
        .from('theatres')
        .update({ merge_mode: mergeMode })
        .eq('id', theatreId)

    if (error) return { error: error.message }

    revalidatePath(`/theatre/[inviteCode]`, 'page')
    return { success: true }
}

export async function pickRandomMovie(theatreId: string, imdbIds: string[]) {
    const supabase = await createClient()
    if (!supabase) return { error: "Not configured" }

    if (imdbIds.length === 0) return { error: "No movies to pick from" }

    const randomIndex = Math.floor(Math.random() * imdbIds.length)
    const pickedId = imdbIds[randomIndex]

    const { error } = await supabase
        .from('theatres')
        .update({ last_picked_imdb_id: pickedId })
        .eq('id', theatreId)

    if (error) return { error: error.message }

    revalidatePath(`/theatre/[inviteCode]`, 'page')
    return { success: true, pickedId }
}
