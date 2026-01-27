import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface OptimisticMutationOptions<_T, R> {
  optimisticUpdate: () => void;
  serverAction: () => Promise<R>;
  rollback: () => void;
  onSuccess?: (result: R) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticMutation<T = unknown, R = unknown>() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (options: OptimisticMutationOptions<T, R>) => {
      const {
        optimisticUpdate,
        serverAction,
        rollback,
        onSuccess,
        onError,
        successMessage,
        errorMessage,
      } = options;

      setIsPending(true);
      setError(null);

      optimisticUpdate();

      try {
        const result = await serverAction();

        if (successMessage) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error_) {
        rollback();

        const error =
          error_ instanceof Error ? error_ : new Error('Unknown error');
        setError(error);

        if (errorMessage) {
          toast.error(errorMessage);
        } else {
          toast.error(error.message || 'Something went wrong');
        }

        if (onError) {
          onError(error);
        }

        throw error;
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return {
    mutate,
    isPending,
    error,
  };
}
