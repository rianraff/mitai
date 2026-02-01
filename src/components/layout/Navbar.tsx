import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOutButton } from "./LogOutButton"

export default async function Navbar() {
    const supabase = await createClient()

    // If Supabase is not configured yet, treat as logged out
    const user = supabase ? (await supabase.auth.getUser()).data.user : null

    // Get username from metadata if available, else email
    const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'

    return (
        <header className="w-full border-b-2 border-black bg-primary sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-2xl font-black uppercase tracking-tighter text-primary-foreground select-none">
                    Mitai
                </Link>

                <nav className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link href="/watchlist" className="hidden md:block font-bold text-primary-foreground hover:underline underline-offset-4 decoration-2">
                                Watchlist
                            </Link>
                            <Link href="/theatre" className="hidden md:block font-bold text-primary-foreground hover:underline underline-offset-4 decoration-2">
                                Theater
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="p-0 overflow-hidden rounded-none border-2 border-black h-10 w-10">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={user.user_metadata?.avatar_url} />
                                            <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                                                {username[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 border-2 border-black shadow-neo rounded-none mt-2 bg-background" align="end">
                                    <DropdownMenuLabel className="font-black">My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-black" />
                                    <DropdownMenuItem className="font-bold focus:bg-primary focus:text-primary-foreground cursor-pointer">
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="font-bold focus:bg-primary focus:text-primary-foreground cursor-pointer">
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-black md:hidden" />
                                    <DropdownMenuItem className="font-bold md:hidden focus:bg-primary focus:text-primary-foreground cursor-pointer" asChild>
                                        <Link href="/watchlist">Watchlist</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="font-bold md:hidden focus:bg-primary focus:text-primary-foreground cursor-pointer" asChild>
                                        <Link href="/theatre">Theatre</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-black" />
                                    <LogOutButton />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Button asChild variant="ghost">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild variant="secondary">
                                <Link href="/login?tab=signup">Get Started</Link>
                            </Button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}
