import { Search, Bell, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"

export function DashboardHeader() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/'; // Go to index page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  const handleProfileSettings = () => {
    navigate('/profile')
  }

  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    if (profile?.first_name) {
      return profile.first_name[0].toUpperCase()
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    if (profile?.first_name) {
      return profile.first_name
    }
    return profile?.email || 'User'
  }

  const getUserRole = () => {
    const userType = profile?.user_type
    const staffPosition = profile?.staff_position

    if (staffPosition) {
      return staffPosition.charAt(0).toUpperCase() + staffPosition.slice(1).toLowerCase().replace('_', ' ')
    }

    if (userType) {
      return userType.charAt(0).toUpperCase() + userType.slice(1).toLowerCase()
    }

    return 'User'
  }


  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <SidebarTrigger className="hover:bg-sidebar-accent" />

        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-foreground font-medium">Operations Overview</span>
        </nav>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search permits, reports, analytics..."
            className="pl-10 bg-background/60 border-border/60 focus:bg-background focus:border-primary/40"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 hover:bg-sidebar-accent">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{getUserRole()}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-card">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileSettings}>Profile Settings</DropdownMenuItem>
            {profile?.user_type !== 'public' && (
              <>
                <DropdownMenuItem>Team Management</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}