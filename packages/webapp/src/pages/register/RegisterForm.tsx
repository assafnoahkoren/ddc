import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '../../utils/trpc';

export function RegisterForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      toast.success('Registration successful!', {
        description: `Welcome, ${data.name || data.email}!`,
      });
      // Navigate to login page after successful registration
      setTimeout(() => navigate('/login'), 1500);
    },
    onError: (error) => {
      toast.error('Registration failed', {
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

    if (password.length < 8) {
      toast.error('Validation error', {
        description: 'Password must be at least 8 characters',
      });
      return;
    }

    // Submit registration
    registerMutation.mutate({
      email,
      password,
      name: name || undefined,
    });
  };

  const isLoading = registerMutation.isPending;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Register</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className={isLoading ? 'cursor-not-allowed opacity-50' : ''}
            />
          </div>
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
              placeholder="Enter your password (min 8 characters)"
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
                Registering...
              </>
            ) : (
              'Register'
            )}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className={`text-primary underline-offset-4 hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              Login here
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
