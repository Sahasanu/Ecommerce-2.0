import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/order/orderService.js';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * useOrders Custom Hook powered by TanStack Query
 * Provides instant cache hits, zero flickering, and automatic stale time management.
 */
export default function useOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const uid = user?.user?.uid || user?.uid || null;
  const email = user?.user?.email || user?.email || null;
  const role = user?.user?.role || user?.role || null;

  const {
    data: orders = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders', 'user', uid, email, role],
    queryFn: () => orderService.getOrders(uid, email, role),
    enabled: Boolean(uid),
    staleTime: 10 * 1000, // 10 seconds stale time
    gcTime: 10 * 60 * 1000, // 10 minutes cache retention
    refetchOnMount: 'always', // Always fetch fresh updates when navigating to orders
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  return {
    orders: orders || [],
    loading: isLoading,
    isFetching,
    isError,
    error,
    refetch,
    invalidate
  };
}
