/**
 * Auth Components Export
 */

export { default as LoginForm } from './LoginForm';
export { default as RegisterForm } from './RegisterForm';
export { default as ProtectedRoute, useProtectedRoute } from './ProtectedRoute';
export {
  default as RoleGuard,
  useRoleCheck,
  ShowForRole,
  AdminOnly,
  TeacherOnly,
  StudentOnly,
} from './RoleGuard';
