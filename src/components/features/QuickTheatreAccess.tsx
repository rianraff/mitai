'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { DoorOpen } from 'lucide-react'
import Link from 'next/link'
import { TheatreCard, type Theatre } from './TheatreCard'

interface QuickTheatreAccessProps {
    theatres: Theatre[]
    currentUserId: string
}

export function QuickTheatreAccess({ theatres, currentUserId }: QuickTheatreAccessProps) {
    if (!theatres || theatres.length === 0) return null

    return (
        <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-8 border-black pb-4 gap-4">
                <div className="flex items-center gap-3">
                    <DoorOpen className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-foreground">Your Theaters</h2>
                </div>
                <Button variant="link" className="font-black uppercase text-lg underline decoration-4 underline-offset-4" asChild>
                    <Link href="/theatre">View All</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {theatres.slice(0, 3).map((theatre) => (
                    <TheatreCard
                        key={theatre.id}
                        theatre={theatre}
                        currentUserId={currentUserId}
                    />
                ))}
            </div>
        </section>
    )
}
