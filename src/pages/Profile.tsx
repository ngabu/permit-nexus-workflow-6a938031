
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, FileText, Award } from "lucide-react";

const Profile = () => {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setOrganization(profile.organization || "");
      setLoading(false);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: fullName.split(' ')[0] || '',
          last_name: fullName.split(' ').slice(1).join(' ') || '',
          phone: phone,
          address: address,
          organization: organization,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user || !confirm('Are you sure you want to delete your profile? This action cannot be undone.')) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Profile Deleted",
        description: "Your profile has been successfully deleted.",
      });
    } catch (error) {
      console.error('Profile deletion error:', error);
      toast({
        title: "Error",
        description: "Failed to delete profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Profile not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your personal information and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="w-24 h-24 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl">{`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user?.email?.split('@')[0] || 'User'}</CardTitle>
              <CardDescription className="capitalize text-sm">
                {profile.user_type.replace('_', ' ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="truncate">{user?.email}</span>
              </div>
              
              {profile.staff_unit && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="capitalize">{profile.staff_unit.replace('_', ' ')}</span>
                </div>
              )}
              
              {profile.staff_position && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="capitalize">{profile.staff_position.replace('_', ' ')}</span>
                </div>
              )}

              {phone && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span>{phone}</span>
                </div>
              )}

              {address && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs">{address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Edit Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Update your profile details and contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        type="tel"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Enter your organization"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full address"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Account Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>User Role</Label>
                      <Input
                        value={profile.user_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Role is managed by administrators</p>
                    </div>

                    {(profile.staff_unit || profile.staff_position) && (
                      <div className="space-y-2">
                        <Label>CEPA Assignment</Label>
                        <Input
                          value={`${profile.staff_unit || 'No Unit'} - ${profile.staff_position || 'No Position'}`.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Assignment is managed by administrators</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <div>
                    <Button 
                      variant="destructive" 
                      type="button" 
                      onClick={handleDeleteProfile}
                      disabled={saving}
                    >
                      Delete Account
                    </Button>
                  </div>
                  <div className="flex space-x-4">
                    <Button variant="outline" type="button" onClick={() => window.history.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
