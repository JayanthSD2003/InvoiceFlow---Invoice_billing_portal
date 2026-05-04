import { useAppContext } from '../../app/providers/AppProvider';

export default function useAppState() {
  return useAppContext();
}