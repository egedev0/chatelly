import { useState, useCallback } from 'react'

export interface LoadingState {
  isLoading: boolean
  error: string | null
  retry: () => void
}

export function useLoading<T extends any[], R>(
  asyncFunction: (...args: T) => Promise<R>
): [LoadingState, (...args: T) => Promise<R | null>] {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: T): Promise<R | null> => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await asyncFunction(...args)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [asyncFunction]
  )

  const retry = useCallback(() => {
    setError(null)
  }, [])

  return [{ isLoading, error, retry }, execute]
} 