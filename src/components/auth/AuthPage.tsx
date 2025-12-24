import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Shield, Loader2 } from 'lucide-react';

export function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [adminUserId, setAdminUserId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await adminLogin(adminUserId, adminPassword);
      if (error) {
        toast({
          title: 'Admin Login Failed',
          description: 'Invalid admin credentials',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome Admin',
          description: 'You have full access to the system.',
        });
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 fintech-grid">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      
      <Card className="w-full max-w-md glass animate-scale-in relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <span className="text-3xl font-bold text-primary">₹</span>
          </div>
          <CardTitle className="text-2xl font-bold">COE – FINTECH</CardTitle>
          <CardDescription>Attendance Management System</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Admin Login</span>
          </div>
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminUserId">User ID</Label>
              <Input
                id="adminUserId"
                type="text"
                placeholder="Admin User ID"
                value={adminUserId}
                onChange={(e) => setAdminUserId(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password</Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Admin Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
