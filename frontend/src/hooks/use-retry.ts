import { useState, useCallback } from 'react'

export interface RetryConfig {
  maxAttempts: number
  delay: number
  backoffMultiplier: number
}

export function useRetry<T extends any[], R>(
  asyncFunction: (...args: T) => Promise<R>,
  config: Partial<RetryConfig> = {}
): [R | null, (...args: T) => Promise<R | null>, { isLoading: boolean; error: string | null; attempts: number }] {
  const { maxAttempts = 3, delay = 1000, backoffMultiplier = 2 } = config
  
  const [result, setResult] = useState<R | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)

  const execute = useCallback(
    async (...args: T): Promise<R | null> => {
      let currentAttempt = 0
      let currentDelay = delay

      while (currentAttempt < maxAttempts) {
        try {
          setIsLoading(true)
          setError(null)
          setAttempts(currentAttempt + 1)
          
          const response = await asyncFunction(...args)
          setResult(response)
          return response
        } catch (err) {
          currentAttempt++
          const errorMessage = err instanceof Error ? err.message : 'An error occurred'
          setError(errorMessage)
          
          if (currentAttempt >= maxAttempts) {
            break
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, currentDelay))
          currentDelay *= backoffMultiplier
        } finally {
          setIsLoading(false)
        }
      }
      
      return null
    },
    [asyncFunction, maxAttempts, delay, backoffMultiplier]
  )

  return [result, execute, { isLoading, error, attempts }]
} 