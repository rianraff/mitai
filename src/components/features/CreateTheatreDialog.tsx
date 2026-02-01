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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Loader2 } from "lucide-react"
import { createTheatre } from "@/app/theatre/actions"
import { toast } from "sonner"

export function CreateTheatreDialog({ trigger, className }: { trigger?: React.ReactNode, className?: string }) {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [name, setName] = React.useState("")
    const [mode, setMode] = React.useState<'union' | 'intersection' | 'xor'>('intersection')
    const router = useRouter()

    async function onSubmit() {
        if (!name) return
        setLoading(true)
        try {
            const res = await createTheatre(name, mode as 'union' | 'intersection')
            if (res.success) {
                toast.success("Theatre created!")
                setOpen(false)
                router.push(`/theatre/${res.inviteCode}`)
            } else {
                toast.error(res.error || "Failed to create theatre")
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
                {trigger || (
                    <Button variant="secondary" size="lg" className={className}>
                        <Plus className="mr-2 h-6 w-6" /> Create Theatre
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-4 border-black shadow-neo rounded-none bg-white p-8">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Create Room</DialogTitle>
                    <DialogDescription className="text-black font-bold opacity-70">
                        Give your room a name and choose how watchlists are merged.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6 font-bold">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-lg">Room Name</Label>
                        <Input
                            id="name"
                            placeholder="Movie Night with Friends"
                            className="h-12 border-2 border-black font-bold shadow-neo-sm focus-visible:ring-offset-0 focus-visible:ring-0 rounded-none bg-background"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={onSubmit}
                        disabled={loading || !name}
                        size="lg"
                        className="w-full"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "CREATE ROOM"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
