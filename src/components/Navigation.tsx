
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardCheck, 
  TrendingUp, 
  Users, 
  Settings,
  Leaf
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/applications', icon: FileText, label: 'Applications' },
    { href: '/permits', icon: ClipboardCheck, label: 'Permits' },
    { href: '/compliance', icon: TrendingUp, label: 'Compliance' },
    { href: '/inspections', icon: Users, label: 'Inspections' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bg-white border-r border-gray-200 w-64 h-screen fixed left-0 top-0 z-10">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Leaf className="h-8 w-8 text-environmental-600" />
          <h1 className="text-xl font-bold text-gray-900">EnviroPermit</h1>
        </div>
        
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-environmental-50 text-environmental-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
