'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { joinTheatre } from "@/app/theatre/actions"
import { toast } from "sonner"

export function JoinHandler({ code }: { code?: string }) {
    const router = useRouter()

    useEffect(() => {
        if (!code) return

        async function performJoin() {
            if (!code) return
            try {
                const res = await joinTheatre(code)
                if (res.success) {
                    toast.success("Joined via invite link!")
                    router.push(`/theatre/${code}`)
                } else {
                    toast.error(res.error || "Failed to join")
                }
            } catch (err) {
                console.error(err)
            }
        }

        performJoin()
    }, [code, router])

    return null
}
