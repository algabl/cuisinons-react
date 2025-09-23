import Link from 'next/link';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-gray-800 p-6 mt-12">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
        <p className="mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} Cuisinons. All rights reserved.
        </p>
        <div className="flex space-x-4">
          <Link
            href="/privacy"
            className="hover:text-gray-300 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="hover:text-gray-300 transition-colors"
          >
            Terms of Use
          </Link>
          <a
            href="mailto:cuisinons@imalexblack.dev"
            className="hover:text-gray-300 transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;