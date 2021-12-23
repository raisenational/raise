import React from "react"
import { AuthState, useAuthState } from "./networking"

const hasGroup = (authState: AuthState, group?: string | string[]) => {
  if (group === undefined) return false
  if (typeof group === "string") return authState.groups.includes(group)
  return group.some((g) => authState.groups.includes(g))
}

export const RequireGroup: React.FC<{ group?: string | string[] }> = ({ group, children = null }) => {
  const [authState] = useAuthState()
  if (!authState || !hasGroup(authState, group)) return null

  return children as React.ReactElement
}
