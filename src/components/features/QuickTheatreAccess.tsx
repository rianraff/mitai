'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ArrowRight, DoorOpen } from 'lucide-react'
import Link from 'next/link'
import { MERGE_MODE_DETAILS } from '@/lib/constants'

interface Theatre {
    id: string
    name: string
    invite_code: string
    merge_mode: string
    progress?: number
    totalMovies?: number
    watchedMovies?: number
}

interface QuickTheatreAccessProps {
    theatres: Theatre[]
}

export function QuickTheatreAccess({ theatres }: QuickTheatreAccessProps) {
    if (!theatres || theatres.length === 0) return null

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between border-b-8 border-black pb-4">
                <div className="flex items-center gap-3">
                    <DoorOpen className="w-8 h-8 text-primary" />
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground">Your Theatres</h2>
                </div>
                <Button variant="link" className="font-black uppercase text-lg underline decoration-4 underline-offset-4" asChild>
                    <Link href="/theatre">View All</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {theatres.slice(0, 3).map((theatre) => (
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
                                    <span className="text-xl font-black">{theatre.progress || 0}%</span>
                                </div>
                                <div className="h-4 w-full bg-black/10 border-2 border-black overflow-hidden shadow-neo-sm">
                                    <div
                                        className="h-full bg-secondary border-r-2 border-black transition-all duration-1000"
                                        style={{ width: `${theatre.progress || 0}%` }}
                                    />
                                </div>
                                <p className="text-[10px] font-bold italic opacity-60">
                                    {theatre.watchedMovies || 0} of {theatre.totalMovies || 0} missions accomplished
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
        </section>
    )
}
