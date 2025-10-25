import { trpc } from './utils/trpc';

function App() {
  const { data, isLoading, error } = trpc.helloWorld.useQuery();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dynamic Data Catalog</h1>

      <div style={{ marginTop: '2rem' }}>
        <h2>tRPC Connection Test</h2>
        {isLoading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
        {data && (
          <div>
            <p style={{ color: 'green' }}>✓ Connected to tRPC server!</p>
            <p><strong>Message:</strong> {data.message}</p>
            <p><strong>Timestamp:</strong> {data.timestamp}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
