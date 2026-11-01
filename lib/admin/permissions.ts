export type Role = 
  | 'super_admin'
  | 'product_admin'
  | 'support_lead'
  | 'content_admin'
  | 'moderator'
  | 'finance_admin'
  | 'analyst'
  | 'marketing_admin'
  | 'tech_admin'
  | 'auditor';

export type Permission = 
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'users:export'
  | 'couples:read'
  | 'couples:write'
  | 'experiences:read'
  | 'experiences:create'
  | 'experiences:write'
  | 'experiences:publish'
  | 'experiences:delete'
  | 'payments:read'
  | 'payments:write'
  | 'payments:refund'
  | 'support:read'
  | 'support:write'
  | 'moderation:read'
  | 'moderation:write'
  | 'analytics:read'
  | 'analytics:export'
  | 'audit:read'
  | 'audit:export'
  | 'settings:read'
  | 'settings:write'
  | 'flags:read'
  | 'flags:write'
  | 'reports:export';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    'users:read', 'users:write', 'users:delete', 'users:export',
    'couples:read', 'couples:write',
    'experiences:read', 'experiences:create', 'experiences:write', 'experiences:publish', 'experiences:delete',
    'payments:read', 'payments:write', 'payments:refund',
    'support:read', 'support:write',
    'moderation:read', 'moderation:write',
    'analytics:read', 'analytics:export',
    'audit:read', 'audit:export',
    'settings:read', 'settings:write',
    'flags:read', 'flags:write',
    'reports:export'
  ],
  product_admin: [
    'experiences:read', 'experiences:create', 'experiences:write', 'experiences:publish',
    'analytics:read',
    'couples:read'
  ],
  support_lead: [
    'users:read', 'users:write',
    'couples:read',
    'support:read', 'support:write',
    'analytics:read'
  ],
  content_admin: [
    'experiences:read', 'experiences:create', 'experiences:write',
    'analytics:read'
  ],
  moderator: [
    'moderation:read', 'moderation:write',
    'users:read'
  ],
  finance_admin: [
    'payments:read', 'payments:write', 'payments:refund',
    'reports:export',
    'analytics:read'
  ],
  analyst: [
    'analytics:read', 'analytics:export',
    'audit:read',
    'reports:export'
  ],
  marketing_admin: [
    'analytics:read',
    'analytics:export',
    'reports:export'
  ],
  tech_admin: [
    'users:read',
    'analytics:read',
    'audit:read',
    'flags:read', 'flags:write'
  ],
  auditor: [
    'audit:read',
    'users:read',
    'experiences:read',
    'payments:read'
  ]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}
