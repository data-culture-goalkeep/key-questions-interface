"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UserContext } from "@/lib/auth"

export function ProfileButton({
  userContext,
}: {
  userContext: NonNullable<UserContext>
}) {
  const initial = (userContext.fullName ?? userContext.email)
    .charAt(0)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
          aria-label="Account menu"
        >
          <Avatar size="sm">
            {userContext.avatarUrl && (
              <AvatarImage
                src={userContext.avatarUrl}
                alt={userContext.fullName ?? userContext.email}
              />
            )}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1 font-normal">
          <span className="truncate text-sm font-medium text-foreground">
            {userContext.fullName ?? userContext.email}
          </span>
          <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            {userContext.email}
            <Badge variant="outline" className="text-[10px]">
              {userContext.role}
            </Badge>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action="/sign-out" method="post" className="px-1 py-1">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            Sign out
          </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
