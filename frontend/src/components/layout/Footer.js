// frontend/src/components/layout/Footer.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                  {/* fixed rounded class */}
                  <div className="w-4 h-3 bg-teal-600 rounded-sm"></div>
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-teal-400">
                  {t('appName', 'Bytebasket')}
                </div>
                <div className="text-sm text-teal-300 -mt-1">basket</div>
              </div>
            </div>

            <p className="text-gray-300 mb-4 max-w-md whitespace-pre-line">
              {t('tagline', 'Nourishing Communities, One Byte at a Time!')}
            </p>

            <div className="flex space-x-4">
              {/* Navigate with router */}
              <button
                onClick={() => navigate('/donate')}
                className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded-full font-medium transition-colors"
              >
                {t('donate', 'Donate')}
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t('footer.quickLinks', 'Quick Links')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  {t('navDashboard', 'Dashboard')}
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="text-gray-300 hover:text-white transition-colors">
                  {t('navVolunteer', 'Volunteer')}
                </Link>
              </li>
              <li>
                <Link to="/inventory" className="text-gray-300 hover:text-white transition-colors">
                  {t('inventoryTitle', 'Inventory')}
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-gray-300 hover:text-white transition-colors">
                  {t('donate', 'Donate')}
                </Link>
              </li>
              <li>
                <Link to="/browse-inventory" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.findFood', 'Find Food')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t('footer.support', 'Support')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  {t('navContact', 'Contact')}
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.help', 'Help')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.privacy', 'Privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.terms', 'Terms')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.about', 'About')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {year} {t('appName', 'Bytebasket')}. {t('footer.rights', 'All rights reserved.')}
          </div>

          {/* Social Media Links (use <a> with valid SVGs) */}
          <div className="flex space-x-6">
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              {/* Replace with a real SVG or an icon component */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.26 4.26 0 0 0-7.27 3.89 12.09 12.09 0 0 1-8.78-4.45 4.25 4.25 0 0 0 1.32 5.67c-.64-.02-1.25-.2-1.78-.49v.05a4.26 4.26 0 0 0 3.42 4.18c-.47.13-.97.15-1.45.06a4.27 4.27 0 0 0 3.98 2.96A8.54 8.54 0 0 1 2 19.54a12.06 12.06 0 0 0 6.54 1.92c7.85 0 12.14-6.5 12.14-12.13 0-.18-.01-.36-.02-.54A8.67 8.67 0 0 0 24 5.6a8.5 8.5 0 0 1-2.46.68 4.26 4.26 0 0 0 1.92-2.35z"/>
              </svg>
            </a>

            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.55v1.86h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z"/>
              </svg>
            </a>

            <a
              href="https://reddit.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Reddit"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21 12.08c0-1.1-.9-2-2-2-.56 0-1.06.23-1.42.6-1.03-.72-2.4-1.18-3.93-1.24l.67-3.16 2.19.46a1.5 1.5 0 1 0 .3-1.48l-2.95-.62a.75.75 0 0 0-.88.57l-.86 4.07c-1.62.05-3.09.51-4.16 1.25a1.99 1.99 0 0 0-1.41-.57 2 2 0 0 0-2 2c0 .6.27 1.13.69 1.49-.03.2-.05.41-.05.62 0 2.62 3.13 4.75 7 4.75s7-2.13 7-4.75c0-.2-.02-.4-.05-.59.41-.37.66-.9.66-1.51ZM9.25 13.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm5.5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm-5.19 2.77a.75.75 0 0 1 1.06-.06c.48.42 1.39.69 2.38.69.99 0 1.9-.27 2.38-.69a.75.75 0 0 1 1 1.12c-.84.74-2.19 1.07-3.38 1.07s-2.54-.33-3.38-1.07a.75.75 0 0 1-.06-1.06Z"/>
              </svg>
            </a>

            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.2c3.3 0 3.7.01 5 .07 1.2.06 1.9.25 2.36.42.6.23 1.03.5 1.48.95.45.45.72.87.95 1.48.17.46.36 1.16.42 2.36.06 1.3.07 1.7.07 5s-.01 3.7-.07 5c-.06 1.2-.25 1.9-.42 2.36a3.8 3.8 0 0 1-.95 1.48 3.8 3.8 0 0 1-1.48.95c-.46.17-1.16.36-2.36.42-1.3.06-1.7.07-5 .07s-3.7-.01-5-.07c-1.2-.06-1.9-.25-2.36-.42a3.8 3.8 0 0 1-1.48-.95 3.8 3.8 0 0 1-.95-1.48c-.17-.46-.36-1.16-.42-2.36C2.21 15.7 2.2 15.3 2.2 12s.01-3.7.07-5c.06-1.2.25-1.9.42-2.36.23-.6.5-1.03.95-1.48.45-.45.87-.72 1.48-.95.46-.17 1.16-.36 2.36-.42 1.3-.06 1.7-.07 5-.07Zm0 1.8c-3.26 0-3.65.01-4.94.07-.95.04-1.46.2-1.8.33-.45.17-.77.37-1.11.71-.34.34-.54.66-.71 1.1-.12.35-.28.86-.33 1.81-.06 1.29-.07 1.68-.07 4.94s.01 3.65.07 4.94c.05.95.21 1.46.33 1.8.17.45.37.77.71 1.11.34.34.66.54 1.1.71.35.12.86.28 1.81.33 1.29.06 1.68.07 4.94.07s3.65-.01 4.94-.07c.95-.05 1.46-.21 1.8-.33.45-.17.77-.37 1.11-.71.34-.34.54-.66.71-1.1.12-.35.28-.86.33-1.81.06-1.29.07-1.68.07-4.94s-.01-3.65-.07-4.94c-.05-.95-.21-1.46-.33-1.8a2.17 2.17 0 0 0-.71-1.11 2.17 2.17 0 0 0-1.1-.71c-.35-.12-.86-.28-1.81-.33-1.29-.06-1.68-.07-4.94-.07Zm0 3.3a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 1.8a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm5.8-2.3a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
