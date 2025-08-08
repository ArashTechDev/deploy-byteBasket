import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import contactService from '../services/contactService';

const ContactPage = ({ onNavigate }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = t('contact.errors.nameRequired');               // "Name is required"
    if (!formData.email.trim()) newErrors.email = t('contact.errors.emailRequired');             // "Email is required"
    if (!formData.subject.trim()) newErrors.subject = t('contact.errors.subjectRequired');       // "Subject is required"
    if (!formData.message.trim()) newErrors.message = t('contact.errors.messageRequired');       // "Message is required"

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = t('contact.errors.emailInvalid');                                        // "Please enter a valid email address"
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Send the contact form data to the backend
      await contactService.submitContact(formData);
      
      // Show success message
      setShowSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitError(error.message || 'Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header currentPage="contact" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">{t('contact.hero.title')}</h1> {/* "Get in Touch" */}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('contact.hero.description')}
            {/* "We'd love to hear from you! Whether you have questions about volunteering, need assistance with donations, or want to learn more about our mission, we're here to help." */}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Contact Information */}
          <div className="space-y-8">

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">{t('contact.connect.title')}</h2> {/* "Let's Connect" */}

              <div className="space-y-6">

                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{t('contact.address.title')}</h3> {/* "Visit Us" */}
                    <p className="text-gray-600 whitespace-pre-line">
                      {t('contact.address.line1')}{'\n'}
                      {t('contact.address.line2')}{'\n'}
                      {t('contact.address.line3')}
                      {/* "123 Community Street\nFood Bank District\nCity, Province A1B 2C3" */}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{t('contact.phone.title')}</h3> {/* "Call Us" */}
                    <p className="text-gray-600 whitespace-pre-line">
                      {t('contact.phone.main')}<br />
                      {t('contact.phone.emergency')}
                      {/* "Main Office: (555) 123-4567\nEmergency Line: (555) 987-6543" */}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{t('contact.email.title')}</h3> {/* "Email Us" */}
                    <p className="text-gray-600 whitespace-pre-line">
                      {t('contact.email.general')}<br />
                      {t('contact.email.volunteer')}
                      {/* "General Inquiries: info@bytebasket.org\nVolunteer Support: volunteers@bytebasket.org" */}
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{t('contact.hours.title')}</h3> {/* "Office Hours" */}
                    <p className="text-gray-600 whitespace-pre-line">
                      {t('contact.hours.weekdays')}<br />
                      {t('contact.hours.saturday')}<br />
                      {t('contact.hours.sunday')}
                      {/* 
                        Monday - Friday: 9:00 AM - 6:00 PM
                        Saturday: 10:00 AM - 4:00 PM
                        Sunday: Closed
                      */}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">{t('contact.quickActions.title')}</h3> {/* "Quick Actions" */}

              <div className="space-y-4">
                <button
                  onClick={() => onNavigate('volunteer')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-left"
                >
                  🤝 {t('contact.quickActions.volunteer')}
                </button>
                <button
                  onClick={() => onNavigate('donate')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-left"
                >
                  💝 {t('contact.quickActions.donate')}
                </button>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-left"
                >
                  📊 {t('contact.quickActions.dashboard')}
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">{t('contact.form.title')}</h2> {/* "Send us a Message" */}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.nameLabel')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('contact.form.namePlaceholder')}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.emailLabel')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('contact.form.emailPlaceholder')}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.subjectLabel')} *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.subject ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">{t('contact.form.subjectPlaceholder')}</option>
                  <option value="volunteer">{t('contact.form.subjectOptions.volunteer')}</option>
                  <option value="donation">{t('contact.form.subjectOptions.donation')}</option>
                  <option value="partnership">{t('contact.form.subjectOptions.partnership')}</option>
                  <option value="support">{t('contact.form.subjectOptions.support')}</option>
                  <option value="feedback">{t('contact.form.subjectOptions.feedback')}</option>
                  <option value="media">{t('contact.form.subjectOptions.media')}</option>
                  <option value="other">{t('contact.form.subjectOptions.other')}</option>
                </select>
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.messageLabel')} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t('contact.form.messagePlaceholder')}
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>

              {showSuccess && (
                <div className="bg-white border border-green-200 text-green-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('contact.form.successMessage')}</span> {/* "Message sent successfully!" */}
                  </div>
                </div>
              )}

              {submitError && (
                <div className="bg-red-100 border border-red-200 text-red-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{submitError}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>{t('contact.form.sending')}</span> {/* "Sending..." */}
                  </div>
                ) : (
                  t('contact.form.sendButton') /* "Send Message" */
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('contact.faq.title')}</h2> {/* "Frequently Asked Questions" */}
            <p className="text-xl text-gray-600">{t('contact.faq.subtitle')}</p> {/* "Quick answers to common questions" */}
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('contact.faq.q1.question')}</h3> {/* "How can I become a volunteer?" */}
              <p className="text-gray-600">{t('contact.faq.q1.answer')}</p>
              {/* "Simply click on the 'Volunteer' link in our navigation menu and fill out our registration form. We'll review your application and get back to you within 48 hours." */}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('contact.faq.q2.question')}</h3> {/* "What types of donations do you accept?" */}
              <p className="text-gray-600">{t('contact.faq.q2.answer')}</p>
              {/* "We accept both monetary donations and food items. Non-perishable foods, fresh produce, and packaged goods are always needed. Check our donation page for specific requirements." */}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('contact.faq.q3.question')}</h3> {/* "Are there volunteer opportunities for groups?" */}
              <p className="text-gray-600">{t('contact.faq.q3.answer')}</p>
              {/* "Absolutely! We welcome corporate groups, school classes, and community organizations. Contact us to arrange group volunteer sessions and team-building opportunities." */}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('contact.faq.q4.question')}</h3> {/* "How do you ensure food safety?" */}
              <p className="text-gray-600">{t('contact.faq.q4.answer')}</p>
              {/* "Food safety is our top priority. All volunteers receive training on proper food handling, and we follow strict guidelines for food storage, preparation, and distribution." */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
