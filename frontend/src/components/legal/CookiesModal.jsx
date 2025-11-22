import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

const CookiesModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Cookie Policy</DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">What Are Cookies?</h3>
            <p>
              Cookies are small text files that are placed on your device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information to 
              the website owners.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">How We Use Cookies</h3>
            <p>Digital Closet uses cookies for the following purposes:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
              <li>
                <strong className="text-foreground">Essential Cookies:</strong> These cookies are 
                necessary for the website to function properly. They enable core functionality such as 
                authentication, security, and session management. Without these cookies, services you 
                have requested cannot be provided.
              </li>
              <li>
                <strong className="text-foreground">Session Cookies:</strong> We use session cookies 
                to maintain your login state and remember your preferences while you navigate our site. 
                These cookies are temporary and are deleted when you close your browser.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">Types of Cookies We Use</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Authentication Cookies</h4>
                <p>
                  These cookies are essential for maintaining your login session. They are set when 
                  you authenticate with Google OAuth and are required for the service to function.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Preference Cookies</h4>
                <p>
                  These cookies remember your preferences and settings, such as your theme choice 
                  and display preferences, to provide a personalized experience.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">Third-Party Cookies</h3>
            <p>
              We use the following third-party services that may set cookies:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>
                <strong className="text-foreground">Google OAuth:</strong> Used for authentication. 
                Google's privacy policy applies to these cookies.
              </li>
              <li>
                <strong className="text-foreground">Cloudinary:</strong> Used for image storage and 
                delivery. Cloudinary may set cookies for content delivery optimization.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">Managing Cookies</h3>
            <p>
              You can control and manage cookies in various ways. Please keep in mind that removing 
              or blocking cookies can impact your user experience and parts of our website may no 
              longer be fully accessible.
            </p>
            <p className="mt-2">
              Most browsers automatically accept cookies, but you can usually modify your browser 
              settings to decline cookies if you prefer. You can also delete cookies that have 
              already been set.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">Browser-Specific Instructions</h3>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li><strong className="text-foreground">Chrome:</strong> Settings → Privacy and Security → Cookies</li>
              <li><strong className="text-foreground">Firefox:</strong> Options → Privacy & Security → Cookies</li>
              <li><strong className="text-foreground">Safari:</strong> Preferences → Privacy → Cookies</li>
              <li><strong className="text-foreground">Edge:</strong> Settings → Privacy → Cookies</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">Do Not Track</h3>
            <p>
              Digital Closet does not currently respond to "Do Not Track" signals. However, we do 
              not use tracking cookies or analytics cookies that follow you across websites.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">Updates to This Policy</h3>
            <p>
              We may update this Cookie Policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">Contact Us</h3>
            <p>
              If you have questions about our use of cookies, please contact us at: 
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

export default CookiesModal;

