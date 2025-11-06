import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-forest-50 to-nature-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-amber-200">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-amber-100 rounded-full">
              <MapPin className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-amber-800">Page Not Found</CardTitle>
          <CardDescription className="text-amber-600">
            The page you're looking for doesn't exist
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 font-medium">404 Error</p>
            <p className="text-sm text-amber-600 mt-2">
              The page you requested could not be found. It may have been moved, 
              deleted, or you may have entered an incorrect URL.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline" className="border-forest-200 text-forest-700">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
