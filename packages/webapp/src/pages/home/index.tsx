import { Link } from 'react-router-dom';
import { trpc } from '../utils/trpc';

export default function HomePage() {
  const { data, isLoading, error } = trpc.helloWorld.useQuery();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dynamic Data Catalog</h1>
      <p>Welcome to the home page!</p>

      <div style={{ marginTop: '2rem' }}>
        <h2>Navigation</h2>
        <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </div>

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
