import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { FiX } from 'react-icons/fi';

const PrivacyModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Privacy Policy</DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h3>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Account information (name, email, profile picture) when you sign in with Google OAuth</li>
              <li>Clothing items you upload, including images and metadata</li>
              <li>Outfits you create and calendar events you schedule</li>
              <li>Preferences and settings you configure</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h3>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your requests and transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Provide weather-based outfit suggestions</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">3. Data Security</h3>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information. 
              Your data is encrypted in transit and at rest. We use OAuth 2.0 authentication for secure access 
              and never store your passwords.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">4. Data Storage</h3>
            <p>
              Your clothing images are stored securely on Cloudinary's cloud infrastructure. 
              All other data is stored in MongoDB databases with encryption enabled. 
              We retain your data for as long as your account is active.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">5. Your Rights</h3>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data</li>
              <li>Opt-out of certain data processing</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">6. Third-Party Services</h3>
            <p>
              We use Google OAuth for authentication, Cloudinary for image storage, and OpenWeatherMap 
              for weather data. These services have their own privacy policies. We do not sell or share 
              your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">7. Contact Us</h3>
            <p>
              If you have questions about this Privacy Policy, please contact us at: 
              <a href="mailto:gianpon05@gmail.com" className="text-primary hover:underline ml-1">
                gianpon05@gmail.com
              </a>
            </p>
          </section>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyModal;

