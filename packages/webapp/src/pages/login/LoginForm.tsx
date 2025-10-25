import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '../../utils/trpc';

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success('Login successful!', {
        description: `Welcome back, ${data.name || data.email}!`,
      });
      // Store user data in localStorage or context
      localStorage.setItem('user', JSON.stringify(data));
      // Navigate to home page after successful login
      setTimeout(() => navigate('/'), 1500);
    },
    onError: (error) => {
      toast.error('Login failed', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!email || !password) {
      toast.error('Validation error', {
        description: 'Email and password are required',
      });
      return;
    }

    // Submit login
    loginMutation.mutate({
      email,
      password,
    });
  };

  const isLoading = loginMutation.isPending;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className={isLoading ? 'cursor-not-allowed opacity-50' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className={isLoading ? 'cursor-not-allowed opacity-50' : ''}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className={`text-primary underline-offset-4 hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              Register here
            </Link>
          </div>
          <div className="text-center text-sm">
            <Link
              to="/"
              className={`text-muted-foreground underline-offset-4 hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              Go to Home
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
