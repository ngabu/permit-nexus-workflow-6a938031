import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, FileText, Building2, CheckCircle, Upload, AlertCircle, MapPin } from 'lucide-react';

export const ApplicationGuide = () => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Info className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Before You Begin</CardTitle>
        </div>
        <p className="text-muted-foreground mt-2">
          Welcome to the CEPA ePermit Application System. Please read the following guidelines carefully.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Application Process Flow */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Application Process Overview
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Register Entity</h4>
              <p className="text-sm text-muted-foreground">
                Before submitting any application, you must register your entity (individual, company, or organization) in the system.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Submit Intent Registration</h4>
              <p className="text-sm text-muted-foreground">
                Register your intent for Level 1, Level 2 or Level 3 activities. Only approved intent registrations can proceed to permit application
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Apply for Environmental Permit</h4>
              <p className="text-sm text-muted-foreground">
                Once your intent is approved, you will be invited to submit your full Environmental Permit application.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Guide */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Navigating the Application System</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Use the sidebar menu to access different sections: Entities, Intent Registrations, Permit Applications, and more.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>You may begin anywhere in the application form. Forms are organized into tabs for easy navigation.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Click 'Next' or 'Previous' buttons to move through form sections, or use the tab headers to jump directly to a specific section.</span>
            </li>
          </ul>
        </div>

        {/* Saving Drafts */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Saving Your Draft Application</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span><strong>Save as you go:</strong> Applications are automatically saved as drafts. You can close the form and return later.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Access your draft applications through the relevant section in the sidebar (Intent Registrations or Permit Applications).</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Draft applications remain editable until you submit them for review.</span>
            </li>
          </ul>
        </div>

        {/* Submitting Applications */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Submitting Your Application</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Review all sections before submitting. Ensure all required fields are completed.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Click 'Submit' when ready. You will not be able to submit until all compulsory questions are completed.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span><strong>Important:</strong> Once submitted, no further editing is possible. You will receive a confirmation notification.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>If you don't receive a confirmation, check your notifications or assume the submission was not successful.</span>
            </li>
          </ul>
        </div>

        {/* Attachments */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Attachments and Support Documents
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Upload required documents as you progress through the application. Documents must be saved on your computer or storage device.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Allow sufficient time for each file to upload before attaching another. Files can be up to 25MB each.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>We recommend keeping files to a maximum of 5MB where possible for faster upload times.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Supported formats: PDF, Word documents, Excel spreadsheets, images (JPG, PNG), and other common file types.</span>
            </li>
          </ul>
        </div>

        {/* GIS Project Site Boundary Files */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            GIS Project Site Boundary Files
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>For Intent Registrations and Permit Applications, you must provide your project site boundary as a GIS file.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span><strong>Accepted file formats:</strong></span>
            </li>
          </ul>
          <div className="ml-6 space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <code className="px-2 py-0.5 rounded bg-muted text-foreground">.geojson</code>
              <span>GeoJSON format</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-0.5 rounded bg-muted text-foreground">.kml / .kmz</code>
              <span>Keyhole Markup Language</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-0.5 rounded bg-muted text-foreground">.zip</code>
              <span>Shapefile (must contain .shp, .shx, and .dbf files)</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-0.5 rounded bg-muted text-foreground">.gpx</code>
              <span>GPS Exchange Format</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-0.5 rounded bg-muted text-foreground">.csv</code>
              <span>Comma-separated values (with latitude/longitude columns)</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Need Help?
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            For queries about the application process, guidelines, deadlines, or technical issues, please contact CEPA:
          </p>
          <div className="space-y-1 text-sm">
            <p><strong>Phone:</strong> +675 [CEPA Contact Number] (during business hours)</p>
            <p><strong>Email:</strong> permits@cepa.gov.pg</p>
            <p><strong>Office Hours:</strong> Monday to Friday, 8:00 AM - 4:00 PM</p>
          </div>
        </div>

        {/* Key Reminders */}
        <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
          <h3 className="font-semibold text-lg mb-3">Key Reminders</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <span>Intent Registration must be submitted at least one month prior to commencing preparatory work for Level 2 and Level 3 activities.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <span>Ensure all entity information is accurate and up-to-date before submitting applications.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <span>Track your application status through the dashboard and respond promptly to any clarification requests.</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
