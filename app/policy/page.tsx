import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - PAU Mosque',
  description: 'Privacy Policy for PAU Mosque Web Application',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[var(--brand-primary)] mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-slate-600">
              Pan Atlantic University Mosque Web Application
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                1. Information We Collect
              </h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  When you use our Google Calendar integration feature, we collect the following information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Google Account Information:</strong> Your name, email address, and profile picture from your Google account</li>
                  <li><strong>Calendar Access:</strong> Permission to create events in your Google Calendar</li>
                  <li><strong>Prayer Time Data:</strong> Date ranges you select for calendar subscription</li>
                  <li><strong>Authentication Tokens:</strong> OAuth access and refresh tokens for Google Calendar integration</li>
                </ul>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Google User Data Usage</h3>
                  <p className="text-blue-700 text-sm">
                    Our use of information received from Google APIs will adhere to the 
                    <a href="https://developers.google.com/terms/api-services-user-data-policy" 
                       className="underline hover:no-underline" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      Google API Services User Data Policy
                    </a>, including the Limited Use requirements.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                2. How We Use Your Information
              </h2>
              <div className="space-y-4 text-slate-700">
                <p>We use the collected information solely for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Creating prayer time events in your personal Google Calendar</li>
                  <li>Providing you with accurate prayer time notifications</li>
                  <li>Improving our service and user experience</li>
                  <li>Communicating with you about our services (if you provide consent)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                3. Google Calendar Integration and Data Access
              </h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Our application integrates with Google Calendar to help you stay informed about prayer times. 
                  When you connect your Google account:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Data Access:</strong> We request permission to create events in your calendar</li>
                  <li><strong>Data Usage:</strong> We only create new prayer time events based on your selected date range</li>
                  <li><strong>Data Storage:</strong> We store OAuth tokens securely in httpOnly cookies for session management</li>
                  <li><strong>Data Sharing:</strong> We do not share your Google data with third parties</li>
                  <li><strong>Data Retention:</strong> Tokens are automatically refreshed and can be revoked at any time</li>
                  <li><strong>Limited Access:</strong> We do not read, modify, or delete existing events in your calendar</li>
                  <li><strong>User Control:</strong> You can revoke access at any time through your Google account settings</li>
                </ul>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">In-Product Privacy Notice</h3>
                  <p className="text-yellow-700 text-sm">
                    <strong>Important:</strong> By connecting your Google Calendar, you authorize us to create prayer time events in your personal calendar. 
                    We will only create new events and will not access, modify, or delete your existing calendar data. 
                    You can disconnect this integration at any time through your Google account settings.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                4. Data Storage and Security
              </h2>
              <div className="space-y-4 text-slate-700">
                <p>We implement appropriate security measures to protect your information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Authentication tokens are stored securely using httpOnly cookies</li>
                  <li>We use HTTPS encryption for all data transmission</li>
                  <li>We do not store your Google account password or personal data on our servers</li>
                  <li>Access to your information is limited to authorized personnel only</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                5. Data Sharing
              </h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties, except:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>When required by law or legal process</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>With your explicit consent</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                6. Your Rights
              </h2>
              <div className="space-y-4 text-slate-700">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Withdraw consent for data processing</li>
                  <li>Disconnect your Google account at any time</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                7. Cookies and Tracking
              </h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  We use cookies to maintain your authentication session and improve your experience. 
                  You can control cookie settings through your browser preferences.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                8. Google API Services User Data Policy Compliance
              </h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Our application's use of information received from Google APIs will adhere to the 
                  <a href="https://developers.google.com/terms/api-services-user-data-policy" 
                     className="text-[var(--brand-secondary)] hover:underline" 
                     target="_blank" 
                     rel="noopener noreferrer">
                    Google API Services User Data Policy
                  </a>, including the Limited Use requirements.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Limited Use:</strong> We only use Google user data to provide and improve our calendar integration feature</li>
                  <li><strong>No Transfer:</strong> We do not transfer Google user data to third parties except as necessary to provide our service</li>
                  <li><strong>No Advertising:</strong> We do not use Google user data for advertising purposes</li>
                  <li><strong>No Human Reading:</strong> We do not allow humans to read Google user data except in limited circumstances for security purposes</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                9. Changes to This Policy
              </h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date.
                  We will also update our in-product privacy notifications to reflect any changes in how we use Google user data.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                10. Contact Information
              </h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p><strong>Pan Atlantic University Muslim </strong></p>
                  <p>Email: <a href="mailto:pro.muslimummah@gmail.com" className="text-[var(--brand-secondary)] hover:underline">pro.muslimummah@gmail.com</a></p>
                  <p>Address: Pan Atlantic University, Lekki, Lagos, Nigeria</p>
                </div>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500 text-center">
                This Privacy Policy is effective as of the date listed above and applies to all users of the 
                PAU Muslim Ummah Web Application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
