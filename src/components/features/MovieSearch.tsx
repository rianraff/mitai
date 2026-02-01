'use client'

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { MovieSearchResult } from "@/lib/omdb"
import { cn } from "@/lib/utils"
import { addToWatchlist } from "@/app/watchlist/actions"
import { toast } from "sonner"

// Simple debounce hook implementation inline
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value)
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)
        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])
    return debouncedValue
}

export function MovieSearch() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [data, setData] = React.useState<MovieSearchResult[]>([])
    const [loading, setLoading] = React.useState(false)

    const debouncedQuery = useDebounceValue(query, 500)

    React.useEffect(() => {
        const imdbIdMatch = query.match(/tt\d{7,8}/)

        // If it's a direct IMDb ID or URL, we can treat it differently
        if (imdbIdMatch) {
            const fetchById = async () => {
                setLoading(true)
                try {
                    const res = await fetch(`/api/movies/details?id=${imdbIdMatch[0]}`)
                    const movie = await res.json()
                    if (movie && !movie.error) {
                        setData([movie]) // Show only this movie
                    }
                } catch (err) {
                    console.error(err)
                } finally {
                    setLoading(false)
                }
            }
            fetchById()
            return
        }

        if (!debouncedQuery || debouncedQuery.length < 3) {
            setData([])
            return
        }

        async function fetchMovies() {
            setLoading(true)
            try {
                const res = await fetch(`/api/movies/search?q=${encodeURIComponent(debouncedQuery)}`)
                const json = await res.json()
                if (json.results) {
                    setData(json.results)
                } else {
                    setData([])
                }
            } catch (err) {
                console.error(err)
                setData([])
            } finally {
                setLoading(false)
            }
        }

        fetchMovies()
    }, [debouncedQuery, query])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-12 border-2 border-black shadow-neo font-bold text-lg bg-white text-black"
                >
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Search className="h-5 w-5 text-black" />
                        <span className="text-black/60">{query || "Search movies..."}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-2 border-black shadow-neo" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Type movie name..."
                        value={query}
                        onValueChange={setQuery}
                        className="font-bold"
                    />
                    <CommandList>
                        {loading && <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>}
                        {!loading && data.length === 0 && debouncedQuery.length >= 3 && (
                            <CommandEmpty>No movies found.</CommandEmpty>
                        )}

                        <CommandGroup>
                            {data.map((movie) => (
                                <CommandItem
                                    key={movie.imdbID}
                                    value={movie.Title}
                                    onSelect={async () => {
                                        setOpen(false)
                                        const res = await addToWatchlist({
                                            imdbID: movie.imdbID,
                                            Title: movie.Title,
                                            Year: movie.Year,
                                            Poster: movie.Poster
                                        })

                                        if (res.error) {
                                            toast.error(res.error)
                                        } else {
                                            toast.success(`${movie.Title} added to watchlist!`)
                                        }
                                    }}
                                    className="flex items-center gap-3 cursor-pointer aria-selected:bg-primary aria-selected:text-primary-foreground"
                                >
                                    <div className="h-10 w-8 shrink-0 bg-gray-200 border border-black/10 overflow-hidden relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {movie.Poster !== "N/A" && <img src={movie.Poster} alt={movie.Title} className="object-cover h-full w-full" />}
                                    </div>
                                    <div>
                                        <p className="font-bold">{movie.Title}</p>
                                        <p className="text-xs opacity-70">{movie.Year}</p>
                                    </div>
                                    <Plus className="ml-auto h-4 w-4" />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
