// app/terms/page.tsx
import React from 'react';

const TermsOfUsePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Use for Cuisinons</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last Updated: September 17, 2025
      </p>

      <section className="mb-8">
        <p className="mb-4">
          Welcome to Cuisinons! These Terms of Use ("Terms") govern your
          access to and use of the Cuisinons recipe application (the "App")
          provided by Alex Black ("we," "us,"
          or "our").
        </p>
        <p className="mb-4">
          By accessing or using the App, you agree to be bound by these Terms.
          If you disagree with any part of the terms, then you may not access
          the App.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Purpose of the App</h2>
        <p className="mb-4">
          Cuisinons is designed to provide a platform for users to discover
          and share recipes. Our goal is to foster a community around cooking
          and culinary exploration.
        </p>
      </section>

      {/* Continue with other sections of the Terms of Use */}

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
        <p className="mb-4">
          To access certain features of the App, you may be required to create a user account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>
            <strong>Account Creation:</strong> While publicly shared recipes may be viewable by anyone, full use of the App, including saving recipes and submitting your own, requires you to create an account. You agree to provide accurate, current, and complete information during the registration process and to keep your account information updated.
          </li>
          <li>
            <strong>Account Security:</strong> You are solely responsible for maintaining the confidentiality of your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. You may not have more than one account.
          </li>
          <li>
            <strong>Third-Party Authentication:</strong> We use Clerk for user authentication and account management. Your account creation and security are subject to Clerk's terms and privacy policies in addition to ours.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. User-Generated Content (UGC)</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>
            <strong>Your Content:</strong> You are solely responsible for the recipes, comments, photos, and any other content ("User Content") that you submit, post, or display on or through the App.
          </li>
          <li>
            <strong>Ownership:</strong> You retain all ownership rights to your User Content.
          </li>
          <li>
            <strong>License Grant:</strong> By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content in connection with the App and our (and our successors' and affiliates') business, including without limitation for promoting and redistributing part or all of the App (and derivative works thereof) in any media formats and through any media channels. This license includes the right for us to make your User Content publicly available or available to selected groups, as per your sharing settings within the App, and to display your username and profile picture alongside it.
          </li>
          <li>
            <strong>Prohibited Content:</strong> You agree not to submit User Content that is:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Illegal, offensive, harmful, or promotes discrimination.</li>
              <li>Spam or unauthorized advertising.</li>
              <li>Infringes upon any third party's intellectual property rights (including copyright, trademark, privacy, or publicity rights) for which you do not have permission.</li>
            </ul>
          </li>
          <li>
            <strong>Our Rights:</strong> We reserve the right, but are not obligated, to monitor, edit, or remove any User Content, at our sole discretion, that we deem in violation of these Terms or harmful to the App or its users. We are not responsible for the accuracy, legality, or reliability of any User Content posted by users.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property Rights</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>
            <strong>Our IP:</strong> The App, its original content (excluding User Content), features, and functionality are and will remain the exclusive property of Alex Black and its licensors. This includes the app's code, design, name ("Cuisinons"), and logo. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
          </li>
          <li>
            <strong>Third-Party Content:</strong> While users may submit recipes, we do not claim ownership over the general concept of recipes. However, all original descriptive text, photos, and other copyrighted material provided by us within the App are protected by copyright.
          </li>
        </ul> 
      </section>

      <section className="mb">
        <h2 className="text-2xl font-semibold mb-4">5. Disclaimers and Limitation of Liability</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>
            <strong>Recipe Disclaimers:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Health and Safety:</strong> Recipes provided on Cuisinons, whether by us or by other users, are for informational purposes only. We are not responsible for the outcome of any recipe you try from the App, nor for any health outcomes, allergies, injuries, or other adverse effects that may result from following a recipe.
              </li>
              <li>
                <strong>Personal Responsibility:</strong> You assume full responsibility for your health, diet, and for the safe preparation of food. Always use common sense, proper hygiene, and kitchen safety practices. If you have dietary restrictions, allergies, or health concerns, or are unsure about an ingredient or preparation method, always consult
                with a qualified medical professional, dietitian, or culinary expert before preparing or consuming food based on recipes from the App.
              </li>
              <li>
                <strong>Accuracy:</strong> We do not guarantee the accuracy, completeness, or reliability of any recipe or nutritional information presented on the App.
              </li>
            </ul>
          </li>
          <li>
            <strong>"As Is" Basis:</strong> The App is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, express or implied, regarding the operation or availability of the App, or the information, content, and materials included therein.
          </li>
          <li>
            <strong>No Guarantees:</strong> We do not guarantee that the App will be uninterrupted, secure, or free from errors or viruses.
          </li>
          <li>
            <strong>Limitation of Liability:</strong> In no event shall Alex Black, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the App; (ii) any conduct or content of any third party on the App; (iii) any content obtained from the App; and (iv) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
        <p className="mb-4">
          We may terminate or suspend your account and bar access to the App immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms. Upon termination, your right to use the App will immediately cease. If you wish to terminate your account, you may do so through the functionality provided within the App (via Clerk).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Governing Law</h2>
        <p className="mb-4">
          These Terms shall be governed and construed in accordance with the laws of the United States of America, without regard to its conflict of law provisions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our App after any revisions become effective, you agree to be bound by the revised terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these Terms, please contact us:
        </p>
        <p>
          <strong>Email:</strong>{' '}
          <a
            href="mailto:cuisinons@imalexblack.dev"
            className="text-blue-600 hover:underline"
          >
            cuisinons@imalexblack.dev
          </a>
        </p>
      </section>
    </div>
  );
};

export default TermsOfUsePage;