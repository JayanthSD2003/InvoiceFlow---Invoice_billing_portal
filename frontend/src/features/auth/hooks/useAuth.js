import { useAuthContext } from '../../../app/providers/AuthProvider';

export default function useAuth() {
  return useAuthContext();
}