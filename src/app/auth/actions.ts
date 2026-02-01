'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    if (!supabase) {
        return { error: "Supabase is not configured. Please check your .env.local file." }
    }

    // Basic validation (can be enhanced with Zod)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    if (!supabase) {
        return { error: "Supabase is not configured. Please check your .env.local file." }
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string

    // 1. Sign up
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username
            }
        }
    })

    if (error) {
        return { error: error.message }
    }

    // 2. Profile creation is handled by the SQL Trigger defined in schema.sql
    //    So we don't need to manually insert into 'profiles' here if the trigger is set up.

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signInWithGoogle() {
    const supabase = await createClient()

    if (!supabase) {
        return { error: "Supabase is not configured. Please check your .env.local file." }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }
}
