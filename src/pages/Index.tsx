import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, CheckCircle2, CreditCard, TrendingUp, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import pngEmblem from '@/assets/png-emblem.png';

const Index = () => {
  const { profile, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsSigningIn(true);
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message || 'Failed to sign in');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSigningIn(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    
    if (profile) {
      // Redirect authenticated users to their dashboard
      const { user_type, staff_unit, staff_position } = profile;
      
      if (['super_admin', 'admin'].includes(user_type)) {
        navigate('/admin', { replace: true });
      } else if (user_type === 'public') {
        navigate('/dashboard', { replace: true });
      } else if (user_type === 'staff' && staff_unit) {
        const isManagement = staff_position && ['manager', 'director', 'managing_director'].includes(staff_position);
        
        switch (staff_unit) {
          case 'compliance':
            navigate(isManagement ? '/ComplianceDashboard' : '/compliance', { replace: true });
            break;
          case 'registry':
            navigate(isManagement ? '/RegistryDashboard' : '/registry', { replace: true });
            break;
          case 'revenue':
            navigate(isManagement ? '/RevenueDashboard' : '/revenue', { replace: true });
            break;
          case 'finance':
            navigate(isManagement ? '/FinanceDashboard' : '/finance', { replace: true });
            break;
          case 'directorate':
            navigate('/directorate', { replace: true });
            break;
          default:
            navigate('/unauthorized', { replace: true });
        }
      } else {
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border py-4">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-3">
              <img src={pngEmblem} alt="PNG Emblem" className="h-16 w-16 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Independent State of Papua New Guinea</h1>
                <p className="text-sm text-muted-foreground">Conservation and Environment Protection Authority</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-start max-w-7xl mx-auto">
            {/* Left Column - Features */}
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl font-bold text-foreground mb-4">
                  CEPA
                </h2>
                <p className="text-lg text-muted-foreground">
                  Streamline permit applications, manage compliance, and protect Papua New Guinea's natural resources with our comprehensive digital platform.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Digital Permit Applications</h3>
                    <p className="text-sm text-muted-foreground">
                      Submit and manage Environmental Permit applications and compliance reports digitally.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Automated Assessment Workflows</h3>
                    <p className="text-sm text-muted-foreground">
                      Track submissions through technical review, compliance verification, and final approval.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Fee Management Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Automated fee calculation and payment tracking with revenue reconciliation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Analytics & Reporting</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate compliance reports and statutory deadline tracking with comprehensive analytics.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Secure & Compliant</h3>
                    <p className="text-sm text-muted-foreground">
                      Full compliance with PNG's Environment Act with encrypted data storage and audit trails.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Login Card */}
            <div className="lg:pt-8">
              <Card className="shadow-card">
                <CardHeader className="space-y-1 pb-6">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Lock className="w-5 h-5" />
                    <h3 className="text-xl font-bold">User Login</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Access the permit management system with your user credentials
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@cepa.gov.pg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSigningIn}
                        required
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
                        disabled={isSigningIn}
                        required
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSigningIn}
                    >
                      {isSigningIn ? 'Signing In...' : 'Sign In'}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/auth?tab=signup')}
                        className="text-sm text-primary hover:underline"
                        disabled={isSigningIn}
                      >
                        Need an account? Sign up
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-6 bg-card">
          <div className="container mx-auto px-6">
            <p className="text-center text-sm text-muted-foreground">
              © 2025 Independent State of Papua New Guinea - Conservation & Environment Protection Authority. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return null;
};

export default Index;
