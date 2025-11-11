import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Loader2, Eye, EyeOff } from 'lucide-react';

function getRedirectPath(profile: any) {
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
      return '/unauthorized';
  }
}

export default function Auth() {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    showPassword: false
  });

  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    showPassword: false,
    showConfirmPassword: false
  });

  const [loading, setLoading] = useState(false);
  const { signIn, signUp, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [redirectReady, setRedirectReady] = useState(false);
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const toggleLoginPassword = () => {
    setLoginData(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const toggleSignupPassword = () => {
    setSignupData(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const toggleSignupConfirmPassword = () => {
    setSignupData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(loginData.email, loginData.password);

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const fullName = `${signupData.firstName} ${signupData.lastName}`.trim();
      const { error } = await signUp(signupData.email, signupData.password, fullName);

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
        // Reset form
        setSignupData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          showPassword: false,
          showConfirmPassword: false
        });
      }
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && profile && (redirectReady || true)) {
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
          <CardTitle className="text-2xl font-bold text-forest-800">PNG Conservation</CardTitle>
          <CardDescription className="text-forest-600">
            Access your conservation management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-forest-700">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="Enter your email"
                    required
                    autoFocus
                    className="border-forest-200 focus:border-forest-400"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="login-password" className="text-forest-700">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type={loginData.showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    required
                    className="border-forest-200 focus:border-forest-400 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-forest-500 hover:text-forest-700"
                    onClick={toggleLoginPassword}
                    disabled={loading}
                  >
                    {loginData.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              <div className="text-center">
                <Link
                  to="/reset-password"
                  className="text-sm text-forest-600 hover:text-forest-800 underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-forest-700">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={signupData.firstName}
                      onChange={handleSignupChange}
                      placeholder="First name"
                      required
                      className="border-forest-200 focus:border-forest-400"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-forest-700">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={signupData.lastName}
                      onChange={handleSignupChange}
                      placeholder="Last name"
                      required
                      className="border-forest-200 focus:border-forest-400"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-forest-700">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    placeholder="Enter your email"
                    required
                    className="border-forest-200 focus:border-forest-400"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="signup-password" className="text-forest-700">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type={signupData.showPassword ? "text" : "password"}
                    value={signupData.password}
                    onChange={handleSignupChange}
                    placeholder="Create a password"
                    required
                    className="border-forest-200 focus:border-forest-400 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-forest-500 hover:text-forest-700"
                    onClick={toggleSignupPassword}
                    disabled={loading}
                  >
                    {signupData.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="confirmPassword" className="text-forest-700">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={signupData.showConfirmPassword ? "text" : "password"}
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    placeholder="Confirm your password"
                    required
                    className="border-forest-200 focus:border-forest-400 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-forest-500 hover:text-forest-700"
                    onClick={toggleSignupConfirmPassword}
                    disabled={loading}
                  >
                    {signupData.showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                      Creating account...
                    </>
                  ) : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}