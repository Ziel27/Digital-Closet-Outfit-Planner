import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

const TermsModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Terms of Service</DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
            <p>
              By accessing and using Digital Closet, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">2. Description of Service</h3>
            <p>
              Digital Closet is a web-based application that allows users to organize their wardrobe, 
              plan outfits, and receive weather-based style suggestions. The service is provided 
              "as-is" and "as-available" without warranties of any kind.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">3. User Accounts</h3>
            <p>To use Digital Closet, you must:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Be at least 13 years old</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">4. User Content</h3>
            <p>
              You retain ownership of all content you upload to Digital Closet. By uploading content, 
              you grant us a license to store, display, and process your content solely for the purpose 
              of providing our services. You are responsible for ensuring you have the right to upload 
              any content you submit.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">5. Acceptable Use</h3>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Use the service for any illegal purpose</li>
              <li>Upload malicious code or viruses</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Upload content that violates others' rights</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">6. Free Service</h3>
            <p>
              Digital Closet is currently provided free of charge. We reserve the right to modify, 
              suspend, or discontinue any part of the service at any time. We may introduce paid 
              features in the future, but will notify users in advance.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">7. Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, Digital Closet shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages, or any loss of 
              profits or revenues, whether incurred directly or indirectly.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">8. Termination</h3>
            <p>
              We may terminate or suspend your account immediately, without prior notice, for conduct 
              that we believe violates these Terms of Service or is harmful to other users, us, or 
              third parties. You may delete your account at any time through your account settings.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">9. Changes to Terms</h3>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any 
              material changes via email or through the service. Continued use after changes constitutes 
              acceptance of the new terms.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">10. Contact Information</h3>
            <p>
              For questions about these Terms of Service, please contact us at: 
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

export default TermsModal;

