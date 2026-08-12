export const ROLE_RANK = {
  viewer:      0,
  support:     1,
  moderator:   2,
  admin:       3,
  super_admin: 4,
} as const;

export type AdminRole = keyof typeof ROLE_RANK;

export function canAct(userRole: string | null | undefined, requiredRole: AdminRole): boolean {
  if (!userRole) return false;
  return (ROLE_RANK[userRole as AdminRole] ?? -1) >= ROLE_RANK[requiredRole];
}

export const ROLE_LABEL: Record<AdminRole, string> = {
  viewer:      'Viewer',
  support:     'Support',
  moderator:   'Moderator',
  admin:       'Admin',
  super_admin: 'Super Admin',
};
