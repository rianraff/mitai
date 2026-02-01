'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { login, signup, signInWithGoogle } from "../auth/actions"
import { createClient } from "@/lib/supabase/client"
import { useState, Suspense } from "react"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

function LoginForm() {
    const searchParams = useSearchParams()
    const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login'
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleGoogleInit() {
        setIsLoading(true)
        const supabase = createClient()
        if (!supabase) {
            setError("Supabase not configured")
            setIsLoading(false)
            return
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
            setIsLoading(false)
        }
    }

    async function handleSubmit(formData: FormData, mode: 'login' | 'signup') {
        setIsLoading(true)
        setError(null)

        let res;
        if (mode === 'login') {
            res = await login(formData)
        } else {
            res = await signup(formData)
        }

        if (res?.error) {
            setError(res.error)
            setIsLoading(false)
        }
        // If success, redirect happens in action
    }

    return (
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-14 bg-transparent gap-2 p-0 mb-4">
                <TabsTrigger
                    value="login"
                    className="h-full border-2 border-black shadow-neo data-[state=active]:shadow-none data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black text-lg transition-all"
                >
                    Login
                </TabsTrigger>
                <TabsTrigger
                    value="signup"
                    className="h-full border-2 border-black shadow-neo data-[state=active]:shadow-none data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px] data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground font-black text-lg transition-all"
                >
                    Sign Up
                </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
                <Card className="border-2 border-black shadow-neo bg-card rounded-xl transition-all hover:shadow-neo-xl hover:-translate-x-1 hover:-translate-y-1">
                    <div style={{ padding: '40px' }}>
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-2xl font-black">Access your Watchlist</CardTitle>
                            <CardDescription className="text-foreground/80 font-medium">Enter your credentials to continue.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 space-y-6">
                            <form className="space-y-4" action={(fd) => handleSubmit(fd, 'login')}>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="m@example.com" required className="border-2 border-black shadow-neo-sm focus-visible:shadow-none focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] transition-all bg-white text-black font-bold h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" name="password" type="password" required className="border-2 border-black shadow-neo-sm focus-visible:shadow-none focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] transition-all bg-white text-black font-bold h-12" />
                                </div>
                                {error && <p className="text-sm font-bold text-red-500 bg-red-100 p-2 border-2 border-red-500">{error}</p>}
                                <Button type="submit" disabled={isLoading} className="w-full h-12 border-2 border-black shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all text-lg font-black bg-primary text-primary-foreground">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Login
                                </Button>
                            </form>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t-2 border-black" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-foreground font-bold">Or continue with</span>
                                </div>
                            </div>

                            <Button variant="outline" type="button" disabled={isLoading} onClick={handleGoogleInit} className="w-full h-12 border-2 border-black shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all font-bold hover:bg-muted">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                                }
                                Google
                            </Button>
                        </CardContent>
                    </div>
                </Card>
            </TabsContent>

            <TabsContent value="signup">
                <Card className="border-2 border-black shadow-neo bg-card rounded-xl transition-all hover:shadow-neo-xl hover:-translate-x-1 hover:-translate-y-1">
                    <div style={{ padding: '40px' }}>
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-2xl font-black">Create an Account</CardTitle>
                            <CardDescription className="text-foreground/80 font-medium">Join Mitai to start curating.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 space-y-6">
                            <form className="space-y-4" action={(fd) => handleSubmit(fd, 'signup')}>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" name="username" placeholder="Cinephile99" required className="border-2 border-black shadow-neo-sm focus-visible:shadow-none focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] transition-all bg-white text-black font-bold h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="s-email">Email</Label>
                                    <Input id="s-email" name="email" type="email" placeholder="m@example.com" required className="border-2 border-black shadow-neo-sm focus-visible:shadow-none focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] transition-all bg-white text-black font-bold h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="s-password">Password</Label>
                                    <Input id="s-password" name="password" type="password" required className="border-2 border-black shadow-neo-sm focus-visible:shadow-none focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] transition-all bg-white text-black font-bold h-12" />
                                </div>
                                {error && <p className="text-sm font-bold text-red-500 bg-red-100 p-2 border-2 border-red-500">{error}</p>}
                                <Button type="submit" disabled={isLoading} className="w-full h-12 border-2 border-black shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all text-lg font-black bg-secondary text-secondary-foreground">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </form>
                        </CardContent>
                    </div>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <Suspense fallback={<div>Loading...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </main>
    )
}
