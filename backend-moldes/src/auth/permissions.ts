// Áreas do painel que podem ser liberadas para cada usuário.
// Manter igual a frontend-moldes/src/config/permissions.ts.
export const PERMISSIONS = [
  'products',
  'collections',
  'news',
  'settings',
  'users',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

// O que o JwtStrategy coloca em req.user.
export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  permissions: Permission[];
}
