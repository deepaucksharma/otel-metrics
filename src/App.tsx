import React, { useState } from 'react';
import { DataPointInspectorDrawer } from './components/DataPointInspectorDrawer';

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Sample data for demonstration
  const sampleMetric = {
    name: 'http.server.duration',
    unit: 'ms',
    instrument: 'histogram',
    temporality: 'delta',
    monotonic: false,
    latestN: [45, 52, 48, 60, 55, 52, 49]
  };
  
  const samplePoint = {
    type: 'histogram',
    buckets: [
      { bound: 0, count: 0 },
      { bound: 10, count: 5 },
      { bound: 50, count: 45 },
      { bound: 100, count: 30 },
      { bound: 200, count: 15 },
      { bound: 500, count: 5 },
      { bound: 1000, count: 2 }
    ],
    count: 102,
    sum: 7850,
    timestamp: new Date().toISOString()
  };
  
  const sampleResourceAttrs = {
    'service.name': 'api-gateway',
    'service.version': '1.4.2',
    'deployment.environment': 'production',
    'host.name': 'ip-10-1-2-103',
    'cloud.provider': 'aws',
    'cloud.region': 'us-west-2'
  };
  
  const sampleMetricAttrs = {
    'http.method': 'GET',
    'http.route': '/api/v1/users/:id',
    'http.status_code': 200,
    'endpoint.name': 'getUserProfile',
    'component': 'controller',
    'team': 'identity'
  };
  
  const sampleCardinality = {
    seriesCount: 1250,
    attrUniq: {
      'http.method': 4,
      'http.route': 25,
      'http.status_code': 5,
      'endpoint.name': 12,
      'component': 8,
      'team': 5,
      'service.name': 3,
      'service.version': 6,
      'deployment.environment': 3,
      'host.name': 50,
      'cloud.provider': 1,
      'cloud.region': 4
    },
    attrRank: [
      'host.name', 
      'http.route', 
      'endpoint.name', 
      'component', 
      'service.version', 
      'http.status_code',
      'team',
      'http.method',
      'cloud.region',
      'service.name',
      'deployment.environment',
      'cloud.provider'
    ],
    attrOfPoint: [
      'http.method',
      'http.route',
      'http.status_code',
      'endpoint.name',
      'component',
      'team',
      'service.name',
      'service.version',
      'deployment.environment',
      'host.name',
      'cloud.provider',
      'cloud.region'
    ],
    thresholdHigh: 2000
  };
  
  const sampleExemplars = [
    {
      traceId: '1a2b3c4d5e6f7g8h',
      value: 42,
      timestamp: new Date(Date.now() - 5000).toISOString(),
      attributes: {
        'user.id': 'user-123',
        'request.id': 'req-456'
      }
    },
    {
      traceId: '8h7g6f5e4d3c2b1a',
      value: 78,
      timestamp: new Date(Date.now() - 2500).toISOString(),
      attributes: {
        'user.id': 'user-789',
        'request.id': 'req-012'
      }
    },
    {
      traceId: '9i8u7y6t5r4e3w2q',
      value: 105,
      timestamp: new Date().toISOString(),
      attributes: {
        'user.id': 'user-345',
        'request.id': 'req-678'
      }
    }
  ];
  
  // Callback handlers
  const handleAddGlobalFilter = (key, value) => {
    console.log(`Adding global filter: ${key}=${value}`);
    // This would typically update a filter state in the parent app
  };
  
  const handleSimulateDrop = (key, drop) => {
    console.log(`Simulating ${drop ? 'dropping' : 'keeping'} attribute: ${key}`);
    // This would typically trigger a cardinality recalculation
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Data Point Inspector Drawer Demo</h1>
        <button onClick={() => setIsDrawerOpen(true)}>
          Open Inspector Drawer
        </button>
      </header>
      
      {isDrawerOpen && (
        <DataPointInspectorDrawer
          metric={sampleMetric}
          seriesKey="http.server.duration|component=controller,endpoint.name=getUserProfile,http.method=GET,http.route=/api/v1/users/:id,http.status_code=200,team=identity"
          point={samplePoint}
          resourceAttrs={sampleResourceAttrs}
          metricAttrs={sampleMetricAttrs}
          cardinality={sampleCardinality}
          exemplars={sampleExemplars}
          onClose={() => setIsDrawerOpen(false)}
          onAddGlobalFilter={handleAddGlobalFilter}
          onSimulateDrop={handleSimulateDrop}
        />
      )}
    </div>
  );
}

export default App;
