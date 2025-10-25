import { trpc } from '../../utils/trpc';
import { useAuth } from '../../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const { data, isLoading, error } = trpc.helloWorld.useQuery();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dynamic Data Catalog</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || user?.email}!</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">tRPC Connection Test</h2>
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        {data && (
          <div className="space-y-2">
            <p className="text-green-600">✓ Connected to tRPC server!</p>
            <p><strong>Message:</strong> {data.message}</p>
            <p><strong>Timestamp:</strong> {data.timestamp}</p>
          </div>
        )}
      </div>
    </div>
  );
}
