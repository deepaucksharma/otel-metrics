/**
 * Hook for handling errors in functional components within an ErrorBoundary.
 * 
 * @purpose Allow functional components to trigger error boundary fallbacks.
 * @algorithm
 * 1. Maintain a state to check if an error is currently being thrown
 * 2. Provide a function to throw errors that will be caught by parent ErrorBoundary
 * 3. Reset the error state when the component re-renders
 * 
 * This hook is meant to be used in conjunction with an ErrorBoundary component.
 * It allows functional components to programmatically trigger the ErrorBoundary's
 * fallback UI without actually throwing an error during render (which would be
 * a React anti-pattern).
 */
import { useState, useCallback, useEffect } from 'react';

/**
 * Hook that provides a function to throw errors that will be caught by parent ErrorBoundary.
 * 
 * @returns A function that can be called with an Error object to trigger the ErrorBoundary.
 * 
 * @example
 * ```tsx
 * const handleError = useErrorHandler();
 * 
 * const fetchData = async () => {
 *   try {
 *     const response = await fetch('/api/data');
 *     if (!response.ok) {
 *       throw new Error('Failed to fetch data');
 *     }
 *     const data = await response.json();
 *     return data;
 *   } catch (err) {
 *     handleError(err instanceof Error ? err : new Error(String(err)));
 *     return null;
 *   }
 * };
 * ```
 */
export function useErrorHandler(): (error: Error) => void {
  const [error, setError] = useState<Error | null>(null);
  
  // If an error was set, throw it on the next render
  if (error) {
    const e = error;
    setError(null); // Reset for future errors
    throw e;
  }
  
  // Return a function that will set the error state
  return useCallback((e: Error) => {
    setError(e);
  }, []);
}

export default useErrorHandler;