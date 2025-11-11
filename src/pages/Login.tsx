import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Loader2, Eye, EyeOff } from 'lucide-react';

function getRedirectPath(profile) {
  if (!profile) return '/';

  const { user_type, staff_unit, staff_position } = profile;

  if (['super_admin', 'admin'].includes(user_type)) return '/admin';
  if (user_type === 'public') return '/dashboard';

  const isManagement = ['manager', 'director', 'managing_director'].includes(staff_position);

  switch (staff_unit) {
    case 'compliance':
      return isManagement ? '/ComplianceDashboard' : '/compliance';
    case 'registry':
      return isManagement ? '/RegistryDashboard' : '/registry';
    case 'revenue':
      return '/revenue';
    case 'finance':
      return '/finance';
    case 'directorate':
      return '/directorate';
    default:
      return '/not-authorized';
  }
}

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false
  });
  const [loading, setLoading] = useState(false);
  const { signIn, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [redirectReady, setRedirectReady] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleShowPassword = () => {
    setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
        setRedirectReady(true);
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (redirectReady && !authLoading && profile) {
      const targetPath = getRedirectPath(profile);
      navigate(targetPath);
    }
  }, [redirectReady, authLoading, profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-forest-50 to-nature-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-forest-200">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-forest-500 to-nature-600 rounded-full">
              <Leaf className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-forest-800">Sign In</CardTitle>
          <CardDescription className="text-forest-600">
            Access your PNG Conservation dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-forest-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                autoFocus
                className="border-forest-200 focus:border-forest-400"
                disabled={loading}
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-forest-700">Password</Label>
              <Input
                id="password"
                name="password"
                type={formData.showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="border-forest-200 focus:border-forest-400 pr-10"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-forest-500 hover:text-forest-700"
                onClick={toggleShowPassword}
                disabled={loading}
              >
                {formData.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <Link
              to="/reset-password"
              className="text-sm text-forest-600 hover:text-forest-800 underline"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-forest-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-forest-800 hover:text-forest-900 font-medium underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}