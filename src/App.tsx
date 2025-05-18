import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { registerEventListeners } from '@/services/eventListeners';
import ErrorBoundary from '@/ui/molecules/ErrorBoundary';
import ErrorPanel from '@/ui/organisms/ErrorPanel';
import ProgressPanel from '@/ui/molecules/ProgressPanel';
import { useUiSlice } from '@/state/uiSlice';

// Lazy load components for better performance
const StaticFileProvider = lazy(() => import('@/data/StaticFileProvider'));

/**
 * The root application component.
 * 
 * @purpose Serve as the main entry point and container for the application.
 * @algorithm
 * 1. Initialize event listeners for cross-component communication
 * 2. Provide error boundaries for graceful error handling
 * 3. Render the main application UI with routes
 * 4. Include global utility components like progress and error panels
 */
const App: React.FC = () => {
  const toggleProgressPanel = useUiSlice(state => state.toggleProgressPanel);
  
  useEffect(() => {
    // Register event listeners for communication
    const cleanup = registerEventListeners();
    
    // Open progress panel when registering listeners
    // This ensures it's visible when file uploads start
    toggleProgressPanel();
    
    return cleanup;
  }, [toggleProgressPanel]);
  
  return (
    <ErrorBoundary componentName="Application Root">
      <div className="app-container">
        <h1>IntelliMetric Explorer</h1>
        <p>OTLP Metrics Inspector</p>
        
        <ErrorBoundary componentName="File Provider">
          <Suspense fallback={<div>Loading file provider...</div>}>
            <StaticFileProvider />
          </Suspense>
        </ErrorBoundary>
        
        <ErrorBoundary componentName="Routes">
          <Routes>
            <Route path="/" element={<div>Drop an OTLP file to analyze metrics</div>} />
            <Route path="/metrics/:id" element={<div>Metric detail view (coming soon)</div>} />
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </ErrorBoundary>
        
        {/* Global utility components */}
        <ErrorPanel />
        <ProgressPanel />
      </div>
    </ErrorBoundary>
  );
};

export default App;
