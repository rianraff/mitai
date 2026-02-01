'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DoorOpen, Loader2 } from "lucide-react"
import { joinTheatre } from "@/app/theatre/actions"
import { toast } from "sonner"

export function JoinTheatreDialog() {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [code, setCode] = React.useState("")
    const router = useRouter()

    async function onSubmit() {
        if (!code) return
        setLoading(true)
        try {
            const res = await joinTheatre(code)
            if (res.success) {
                toast.success(res.message || "Joined theatre!")
                setOpen(false)
                router.push(`/theatre/${code}`)
            } else {
                toast.error(res.error || "Failed to join theatre")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                    <DoorOpen className="mr-2 h-6 w-6" /> Join Room
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-4 border-black shadow-neo rounded-none bg-white p-8">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Join Room</DialogTitle>
                    <DialogDescription className="text-black font-bold opacity-70">
                        Enter the invite code provided by your friend.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6 font-bold">
                    <div className="grid gap-2">
                        <Label htmlFor="code" className="text-lg">Invite Code</Label>
                        <Input
                            id="code"
                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                            className="h-12 border-2 border-black font-bold shadow-neo-sm focus-visible:ring-offset-0 focus-visible:ring-0 rounded-none bg-background"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={onSubmit}
                        disabled={loading || !code}
                        variant="secondary"
                        size="lg"
                        className="w-full"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "JOIN NOW"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
