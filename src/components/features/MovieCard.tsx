'use client'

import { Card } from "@/components/ui/card"
import { Film, MoreVertical, Trash2, CheckCircle, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import * as React from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface MovieCardProps {
    title: string
    year: string
    posterUrl?: string | null
    children?: React.ReactNode // For hover overlay actions
    footer?: React.ReactNode // Extra info in footer (like attribution)
    className?: string
    imageContainerClassName?: string
    isPicked?: boolean
    onRemove?: () => void
    onToggleWatched?: () => void
    isWatched?: boolean
}

export function MovieCard({
    title,
    year,
    posterUrl,
    children,
    footer,
    className,
    imageContainerClassName,
    isPicked = false,
    onRemove,
    onToggleWatched,
    isWatched = false
}: MovieCardProps) {
    return (
        <Card className={cn(
            "bg-card border-4 border-black shadow-neo overflow-hidden flex flex-col rounded-none transition-all hover:shadow-neo-xl hover:-translate-x-1 hover:-translate-y-1 p-0 gap-0",
            isPicked ? "border-primary bg-primary text-primary-foreground shadow-neo-lg ring-4 ring-primary/20" : "",
            isWatched ? "grayscale opacity-40 border-dashed border-black/30 shadow-none hover:translate-x-0 hover:translate-y-0 hover:shadow-none" : "",
            className
        )}>
            <div className={cn(
                "aspect-[163/245] relative bg-muted overflow-hidden",
                imageContainerClassName
            )}>
                {posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={posterUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <Film className="w-12 h-12 opacity-20" />
                    </div>
                )}

                {/* Watched Sash */}
                {isWatched && (
                    <div className="absolute top-4 left-[-35px] z-20 bg-black text-white px-10 py-1 font-black text-[10px] uppercase tracking-[0.2em] rotate-[-45deg] shadow-neo-sm border-b-2 border-white/20">
                        WATCHED
                    </div>
                )}

                {/* More Options Button */}
                {(onRemove || onToggleWatched) && (
                    <div className="absolute top-2 right-2 z-20">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="w-8 h-8 rounded-none border-2 border-black bg-white/90 shadow-neo-sm hover:scale-110 active:scale-95 transition-transform"
                                >
                                    <MoreVertical className="w-4 h-4 text-black" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-2 border-black shadow-neo font-bold">
                                {onToggleWatched && (
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            onToggleWatched();
                                        }}
                                        className="flex gap-2 cursor-pointer"
                                    >
                                        {isWatched ? <Circle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        {isWatched ? "Mark Unwatched" : "Mark Watched"}
                                    </DropdownMenuItem>
                                )}
                                {onRemove && (
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            onRemove();
                                        }}
                                        className="flex gap-2 text-primary cursor-pointer focus:text-primary focus:bg-primary/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {/* Gradient Overlay for bottom content visibility */}
                {children && <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-[5]" />}

                {/* Children Slot (Always Visible) */}
                {children}
            </div>

            <div className={cn(
                "p-3 bg-white text-black border-t-4 border-black flex flex-col justify-center",
                isPicked ? "bg-primary text-primary-foreground border-primary h-[88px]" : "h-[88px]"
            )}>
                <h3 className="font-black truncate uppercase text-sm">
                    {title}
                </h3>
                <p className={cn(
                    "text-xs font-bold",
                    isPicked ? "opacity-90" : "opacity-60"
                )}>{year}</p>
                {footer}
            </div>
        </Card>
    )
}
