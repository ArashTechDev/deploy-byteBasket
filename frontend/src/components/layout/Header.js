// frontend/src/components/layout/Header.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../images/logo.png';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = languageCode => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Select language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700">
          {currentLanguage.code.toUpperCase()}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {languages.map(({ code, name, flag }) => (
            <button
              key={code}
              onClick={() => changeLanguage(code)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                i18n.language === code
                  ? 'bg-orange-100 text-orange-700 font-semibold'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              role="menuitem"
            >
              <span className="text-lg">{flag}</span>
              <span>{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Get current page from pathname
  const currentPage = location.pathname.substring(1) || 'home';

  const navigationItems = [
    { key: 'dashboard', label: t('navDashboard'), path: '/dashboard' },
    { key: 'volunteer', label: t('navVolunteer'), path: '/volunteer' },
    { key: 'signup', label: t('navSignUp'), path: '/signup' },
    { key: 'contact', label: t('navContact'), path: '/contact' },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt={t('appName')} className="w-16 h-16 object-contain" />
            <div>
              <div className="text-lg font-bold text-teal-700">{t('appName')}</div>
            </div>
          </div>

          {/* Navigation + Language Switcher */}
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map(({ key, label, path }) => (
                <button
                  key={key}
                  onClick={() => navigate(path)}
                  className={`font-medium transition-colors ${
                    currentPage === key ? 'text-orange-500' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            <LanguageSwitcher />
          </div>

          {/* Donate Button */}
          <button
            onClick={() => navigate('/donate')}
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
