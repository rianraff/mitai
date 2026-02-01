'use client'

import React, { useTransition } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ArrowRight,
    MoreVertical,
    LogOut,
    Trash2,
    Loader2
} from 'lucide-react'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { leaveTheatre, deleteTheatre } from '@/app/theatre/actions'
import { toast } from 'sonner'

export interface Theatre {
    id: string
    name: string
    invite_code: string
    merge_mode: string
    progress?: number
    totalMovies?: number
    watchedMovies?: number
    host_id: string
}

interface TheatreCardProps {
    theatre: Theatre
    currentUserId: string
}

export function TheatreCard({ theatre, currentUserId }: TheatreCardProps) {
    const [isPending, startTransition] = useTransition()
    const isHost = theatre.host_id === currentUserId

    const handleLeave = (theatreId: string) => {
        startTransition(async () => {
            try {
                await leaveTheatre(theatreId)
                toast.success("Left theatre successfully")
            } catch (error: any) {
                toast.error(error.message)
            }
        })
    }

    const handleDelete = (theatreId: string) => {
        if (!confirm("Are you sure you want to delete this theatre? This action cannot be undone.")) return

        startTransition(async () => {
            try {
                await deleteTheatre(theatreId)
                toast.success("Theatre deleted successfully")
            } catch (error: any) {
                toast.error(error.message)
            }
        })
    }

    return (
        <Card className="border-4 border-black shadow-neo hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-xl transition-all flex flex-col bg-card rounded-none group relative">
            <div className="absolute top-4 right-4 z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/5 hover:text-black">
                            <MoreVertical className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 border-2 border-black shadow-neo rounded-none">
                        {isHost ? (
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 font-bold cursor-pointer"
                                onClick={() => handleDelete(theatre.id)}
                                disabled={isPending}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Theatre
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 font-bold cursor-pointer"
                                onClick={() => handleLeave(theatre.id)}
                                disabled={isPending}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Leave Theatre
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <CardHeader className="p-6 pb-0 pr-12">
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

                <Button asChild size="lg" className="w-full" disabled={isPending}>
                    <Link href={`/theatre/${theatre.invite_code}`}>
                        {isPending ? (
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        ) : (
                            <>ENTER ROOM <ArrowRight className="ml-2 w-6 h-6" /></>
                        )}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
