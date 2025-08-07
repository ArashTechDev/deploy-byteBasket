import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../../images/logo.png';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
  ];

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
    setOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = languages.find(l => l.code === currentLang)?.label || 'EN';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Select language"
      >
        <span role="img" aria-label="Globe" className="mr-2 text-lg">🌐</span>
        <span>{currentLabel}</span>
        <svg
          className="ml-2 -mr-1 h-4 w-4 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu"
        >
          <div className="py-1">
            {languages.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => changeLanguage(code)}
                className={`block px-4 py-2 text-sm w-full text-left ${
                  currentLang === code ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
                role="menuitem"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Header = ({ currentPage, onNavigate }) => {
  const { t } = useTranslation();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img
              src={logo}
              alt={t('appName')}
              className="w-16 h-16 object-contain"
            />
            <div>
              <div className="text-lg font-bold text-teal-700">{t('appName')}</div>
            </div>
          </div>

          {/* Navigation + Language Switcher */}
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`font-medium ${
                  currentPage === 'dashboard' ? 'text-orange-500' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {t('navDashboard')}
              </button>
              <button
                onClick={() => onNavigate('volunteer')}
                className={`font-medium ${
                  currentPage === 'volunteer' ? 'text-orange-500' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {t('navVolunteer')}
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className={`font-medium ${
                  currentPage === 'signup' ? 'text-orange-500' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {t('navSignUp')}
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className={`font-medium ${
                  currentPage === 'contact' ? 'text-orange-500' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {t('navContact')}
              </button>
            </nav>

            <LanguageSwitcher />
          </div>

          {/* Donate Button */}
          <button
            onClick={() => onNavigate('donate')}
            className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            {t('donate')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
