/**
 * useOptimisticMutation Hook
 * 
 * Generic hook for optimistic mutations with automatic rollback
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface OptimisticMutationOptions<T, R> {
    optimisticUpdate: () => void
    serverAction: () => Promise<R>
    rollback: () => void
    onSuccess?: (result: R) => void
    onError?: (error: Error) => void
    successMessage?: string
    errorMessage?: string
}

export function useOptimisticMutation<T = any, R = any>() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutate = useCallback(async (options: OptimisticMutationOptions<T, R>) => {
        const {
            optimisticUpdate,
            serverAction,
            rollback,
            onSuccess,
            onError,
            successMessage,
            errorMessage,
        } = options

        setIsPending(true)
        setError(null)

        // Apply optimistic update immediately
        optimisticUpdate()

        try {
            // Execute server action
            const result = await serverAction()

            // Success
            if (successMessage) {
                toast.success(successMessage)
            }

            if (onSuccess) {
                onSuccess(result)
            }

            return result
        } catch (err) {
            // Rollback on error
            rollback()

            const error = err instanceof Error ? err : new Error('Unknown error')
            setError(error)

            if (errorMessage) {
                toast.error(errorMessage)
            } else {
                toast.error(error.message || 'Something went wrong')
            }

            if (onError) {
                onError(error)
            }

            throw error
        } finally {
            setIsPending(false)
        }
    }, [])

    return {
        mutate,
        isPending,
        error,
    }
}
