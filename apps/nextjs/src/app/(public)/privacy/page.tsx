// app/privacy/page.tsx
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy for Cuisinons</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last Updated: September 17, 2025
      </p>

      <section className="mb-8">
        <p className="mb-4">
          Welcome to Cuisinons! This Privacy Policy explains how Cuisinons
          ("we," "us," or "our") collects, uses, and discloses information
          about you when you use our recipe application (the "App") and its
          related services.
        </p>
        <p className="mb-4">
          By using Cuisinons, you agree to the collection and use of
          information in accordance with this policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          1. Information We Collect
        </h2>
        <p className="mb-2">
          We collect information to provide and improve our services to you.
        </p>
        <h3 className="text-xl font-medium mt-4 mb-2">
          Information You Provide to Us:
        </h3>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>
            <strong>Account Information:</strong> When you create an account,
            we collect your email address, username, full name, and password.
            This information is managed by Clerk, our third-party
            authentication service.
          </li>
          <li>
            <strong>Profile Information:</strong> Your chosen profile picture
            and username are collected and displayed alongside your public or
            group-shared recipe submissions.
          </li>
          <li>
            <strong>User-Generated Content:</strong> When you submit recipes,
            comments, or other content, we collect the text, images, and
            associated data you provide. This content may be linked to your
            username and profile picture.
          </li>
        </ul>
        <h3 className="text-xl font-medium mt-4 mb-2">
          Information We Collect Automatically:
        </h3>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>
            <strong>Usage Data:</strong> We collect information about your
            interactions with the App, such as the recipes you view, saved
            recipes, and general usage patterns. This data is collected
            through PostHog Analytics.
          </li>
          <li>
            <strong>Technical Data:</strong> We collect information about your
            device and how you access the App, which may include your IP
            address, device type, operating system, and browser type. This is
            primarily for analytics and to ensure the App functions correctly.
          </li>
          <li>
            <strong>Cookies and Tracking Technologies:</strong> We use
            client-side and session cookies, as well as cookies provided by
            PostHog Analytics, to manage user sessions, remember your
            preferences, and gather analytics data.
          </li>
        </ul>
      </section>

      {/* Continue with other sections of the Privacy Policy */}

      <section className="mb8">
        <h2 className="text-2xl font-semibold mb-4">
          2. How We Use Your Information
        </h2>
        <p className="mb-4">
          We use the information we collect for various purposes:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>
            <strong>To Provide and Maintain the App:</strong> To operate,
            deliver, and ensure the functionality of Cuisinons, including
            managing user accounts and enabling recipe submissions.
          </li>
          <li>
            <strong>To Improve and Personalize the App:</strong> To understand
            how users interact with our services, analyze usage trends, and
            develop new features. We may use your saved recipes and usage
            patterns to personalize your experience.
          </li>
          <li>
            <strong>To Facilitate Sharing:</strong> To display your username
            and profile picture alongside your submitted recipes if you choose
            to make them public or share them with groups.
          </li>
          <li>
            <strong>To Monitor Performance:</strong> For generalized analytics
            and performance monitoring of the App and its infrastructure.
          </li>
          <li>
            <strong>To Communicate with You:</strong> To send you
            service-related notifications and updates related to your account
            or the App.
          </li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          3. Sharing Your Information
        </h2>
        <p className="mb-4">
          We share your information only in limited circumstances:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>
            <strong>With Service Providers:</strong> We utilize third-party
            services to operate and improve our App.
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Clerk (Authentication):</strong> For secure user
                authentication and account management.
              </li>
              <li>
                <strong>Vercel (Hosting):</strong> Our hosting provider for
                the App's infrastructure.
              </li>
              <li>
                <strong>PostHog (Analytics):</strong> For generalized
                analytics and to understand user behavior.
              </li>
              <li>
                <strong>Neon (Database):</strong> For storing your account and
                recipe data.
              </li>
            </ul>
            These providers have access to your information only to perform
            these tasks on our behalf and are obligated not to disclose or use
            it for any other purpose.
          </li>
          <li>
            <strong>User-Generated Content:</strong> Your submitted recipes,
            username, and profile picture may be visible to other users if you
            choose to make them public or share them within groups.
          </li>
          <li>
            <strong>Legal Requirements:</strong> We may disclose your
            information if required to do so by law or in response to valid
            requests by public authorities (e.g., a court order or government
            agency).
          </li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          4. Data Storage and Security
        </h2>
        <p className="mb-4">
          Your data is primarily stored by Clerk (for authentication) and in a Neon database (for app data).
        </p>
        <p className="mb-4">
          We implement appropriate security measures to protect your
          information. However, please remember that no method of transmission
          over the Internet or method of electronic storage is 100% secure.
        </p>
        <p>
          While we strive to use commercially acceptable means to protect your
          Personal Information, we cannot guarantee its absolute security.
        </p>
 
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Your Data Rights</h2>
        <p className="mb-4">
          You can manage and delete your account and associated data directly through your settings within the Cuisinons app, powered by Clerk.
        </p>
      </section>
      <section className="mb">
        <h2 className="text-2xl font-semibold mb-4">6. Children's Privacy</h2>
        <p className="mb-4">
          Cuisinons is not intended for use by anyone under the age of 13. We
          do not knowingly collect personally identifiable information from
          anyone under 13. If you are a parent or guardian and you are aware
          that your child has provided us with Personal Information, please
          contact us. If we become aware that we have collected Personal
          Information from children without verification of parental consent,
          we take steps to remove that information from our servers.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Changes to This Privacy Policy</h2>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact
          us:
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

export default PrivacyPolicyPage;