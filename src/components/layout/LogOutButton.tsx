'use client'

import { signOut } from "@/app/auth/signout"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"

export function LogOutButton() {
    const [isPending, startTransition] = useTransition()

    return (
        <DropdownMenuItem
            onSelect={(e) => {
                e.preventDefault()
                startTransition(async () => {
                    await signOut()
                })
            }}
            className="font-bold text-red-600 focus:bg-red-600 focus:text-white cursor-pointer w-full"
            disabled={isPending}
        >
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging out...
                </>
            ) : (
                "Log out"
            )}
        </DropdownMenuItem>
    )
}
