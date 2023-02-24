import React from 'react';
import { AuthState, useAuthState } from './networking';

const hasGroup = (authState?: AuthState, group?: string | string[]) => {
  if (group === undefined) return false;
  if (authState === undefined) return false;
  if (typeof group === 'string') return authState.groups.includes(group);
  return group.some((g) => authState.groups.includes(g));
};

export const RequireGroup: React.FC<{ group?: string | string[], children?: React.ReactNode, otherwise?: React.ReactNode }> = ({ group, children = null, otherwise = null }) => {
  const [authState] = useAuthState();
  if (!hasGroup(authState, group)) return otherwise as React.ReactElement;

  return children as React.ReactElement;
};
