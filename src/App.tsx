import React from 'react';
import { Routes, Route } from 'react-router-dom';

/**
 * The root application component.
 * This acts as the main container for all views within the application.
 */
const App: React.FC = () => {
  return (
    <div className="app-container">
      <h1>IntelliMetric Explorer</h1>
      <p>OTLP Metrics Inspector</p>
      
      <Routes>
        <Route path="/" element={<div>Drop an OTLP file to analyze metrics</div>} />
        <Route path="/metrics/:id" element={<div>Metric detail view (coming soon)</div>} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </div>
  );
};

export default App;
