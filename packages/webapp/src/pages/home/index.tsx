import { useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data, isLoading, error } = trpc.helloWorld.useQuery();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Dynamic Data Catalog</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || user?.email}!</p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
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
