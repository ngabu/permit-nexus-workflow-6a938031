import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import pngEmblem from "@/assets/png-emblem.png"

export function SimpleHeader() {
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/'; // Go to index page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    if (profile?.first_name) {
      return profile.first_name
    }
    return profile?.email || 'User'
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
      {/* Left Section - Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 flex items-center justify-center">
          <img src={pngEmblem} alt="PNG Emblem" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground">PNG Conservation Management System</h1>
          <p className="text-xs text-muted-foreground">Environmental Permit Management</p>
        </div>
      </div>

      {/* Right Section - User and Sign Out */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{getUserDisplayName()}</p>
          <p className="text-xs text-muted-foreground">{profile?.email}</p>
        </div>
        <Button 
          onClick={handleSignOut}
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </header>
  )
}