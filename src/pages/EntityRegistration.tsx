import React, { useState } from 'react';
import { Building, User, MapPin, FileText, Shield, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';

const EntityRegistration = () => {
  const { toast } = useToast();
  const [entityType, setEntityType] = useState('individual');
  const [formData, setFormData] = useState({
    // Common fields
    fullName: '',
    email: '',
    phone: '',
    
    // Individual fields
    idType: 'passport',
    passportNumber: '',
    nidNumber: '',
    nationality: '',
    dateOfBirth: '',
    
    // Company fields
    companyName: '',
    companyType: '',
    registrationNumber: '',
    ipaRegistration: '',
    ircRegistration: '',
    operationalAddress: '',
    postalAddress: '',
    coordinates: { lat: -9.4780, lng: 147.1494 },
    authorizedRepresentative: '',
    representativePosition: '',
    
    // Contact details
    businessPhone: '',
    businessEmail: '',
    website: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    const registrations = JSON.parse(localStorage.getItem('entityRegistrations') || '[]');
    const newRegistration = {
      ...formData,
      entityType,
      id: Date.now(),
      registrationDate: new Date().toISOString(),
      status: 'Pending'
    };
    
    registrations.push(newRegistration);
    localStorage.setItem('entityRegistrations', JSON.stringify(registrations));
    
    toast({
      title: "Registration Submitted!",
      description: "Your entity registration has been submitted successfully.",
    });
    
    // Reset form
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      idType: 'passport',
      passportNumber: '',
      nidNumber: '',
      nationality: '',
      dateOfBirth: '',
      companyName: '',
      companyType: '',
      registrationNumber: '',
      ipaRegistration: '',
      ircRegistration: '',
      operationalAddress: '',
      postalAddress: '',
      coordinates: { lat: -9.4780, lng: 147.1494 },
      authorizedRepresentative: '',
      representativePosition: '',
      businessPhone: '',
      businessEmail: '',
      website: ''
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-4">
              Entity Registration
            </h1>
            <p className="text-muted-foreground text-lg">
              Register as an individual or company to access CEPA services.
            </p>
          </div>

          <div className="space-y-6">
            {/* Entity Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Entity Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={entityType} onValueChange={setEntityType} className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Individual
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer">
                      <Building className="w-4 h-4" />
                      Company
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Individual Registration Form */}
            {entityType === 'individual' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Individual Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="nationality">Nationality *</Label>
                      <Input
                        id="nationality"
                        value={formData.nationality}
                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                        placeholder="Papua New Guinea"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+675 XXX XXXX"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Identification Type *</Label>
                    <RadioGroup value={formData.idType} onValueChange={(value) => handleInputChange('idType', value)} className="flex space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="passport" id="passport" />
                        <Label htmlFor="passport">Passport</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nid" id="nid" />
                        <Label htmlFor="nid">National ID</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.idType === 'passport' ? (
                    <div>
                      <Label htmlFor="passportNumber">Passport Number *</Label>
                      <Input
                        id="passportNumber"
                        value={formData.passportNumber}
                        onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                        placeholder="Enter passport number"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="nidNumber">National ID Number *</Label>
                      <Input
                        id="nidNumber"
                        value={formData.nidNumber}
                        onChange={(e) => handleInputChange('nidNumber', e.target.value)}
                        placeholder="Enter National ID number"
                        required
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Company Registration Form */}
            {entityType === 'company' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-primary" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          placeholder="Enter company name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyType">Company Type *</Label>
                        <Select value={formData.companyType} onValueChange={(value) => handleInputChange('companyType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pty-ltd">Pty Ltd</SelectItem>
                            <SelectItem value="limited">Limited</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="sole-trader">Sole Trader</SelectItem>
                            <SelectItem value="ngo">NGO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="registrationNumber">Registration Number *</Label>
                        <Input
                          id="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                          placeholder="Company reg number"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ipaRegistration">IPA Registration *</Label>
                        <Input
                          id="ipaRegistration"
                          value={formData.ipaRegistration}
                          onChange={(e) => handleInputChange('ipaRegistration', e.target.value)}
                          placeholder="IPA registration number"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ircRegistration">IRC Registration *</Label>
                        <Input
                          id="ircRegistration"
                          value={formData.ircRegistration}
                          onChange={(e) => handleInputChange('ircRegistration', e.target.value)}
                          placeholder="IRC registration number"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="authorizedRepresentative">Authorized Representative *</Label>
                        <Input
                          id="authorizedRepresentative"
                          value={formData.authorizedRepresentative}
                          onChange={(e) => handleInputChange('authorizedRepresentative', e.target.value)}
                          placeholder="Full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="representativePosition">Position *</Label>
                        <Input
                          id="representativePosition"
                          value={formData.representativePosition}
                          onChange={(e) => handleInputChange('representativePosition', e.target.value)}
                          placeholder="CEO, Director, etc."
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Operational Address & Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="operationalAddress">Base Operational Address *</Label>
                      <Textarea
                        id="operationalAddress"
                        value={formData.operationalAddress}
                        onChange={(e) => handleInputChange('operationalAddress', e.target.value)}
                        placeholder="Enter the full operational address including street, suburb, city, and postal code"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="postalAddress">Postal Address</Label>
                      <Textarea
                        id="postalAddress"
                        value={formData.postalAddress}
                        onChange={(e) => handleInputChange('postalAddress', e.target.value)}
                        placeholder="Enter postal address if different from operational address"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="latitude">GPS Latitude *</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={formData.coordinates.lat}
                          onChange={(e) => handleInputChange('coordinates', { ...formData.coordinates, lat: parseFloat(e.target.value) || 0 })}
                          placeholder="-9.4780"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="longitude">GPS Longitude *</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={formData.coordinates.lng}
                          onChange={(e) => handleInputChange('coordinates', { ...formData.coordinates, lng: parseFloat(e.target.value) || 0 })}
                          placeholder="147.1494"
                          required
                        />
                      </div>
                    </div>

                    <div className="h-48 bg-muted/20 rounded-lg border border-dashed border-border flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MapPin className="w-8 h-8 mx-auto mb-2" />
                        <p>Map Plotting Verification</p>
                        <p className="text-sm">Interactive map will display the location based on coordinates</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="businessEmail">Business Email *</Label>
                        <Input
                          id="businessEmail"
                          type="email"
                          value={formData.businessEmail}
                          onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                          placeholder="business@company.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessPhone">Business Phone *</Label>
                        <Input
                          id="businessPhone"
                          type="tel"
                          value={formData.businessPhone}
                          onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                          placeholder="+675 XXX XXXX"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://www.company.com"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Registration
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EntityRegistration;