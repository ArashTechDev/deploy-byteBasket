import React from 'react';
import Header from '../components/layout/Header';

const HomePage = ({ onNavigate }) => (
  <div className="min-h-screen bg-gray-100">
    <Header currentPage="home" onNavigate={onNavigate} />
    
    {/* Hero Section */}
    <main className="bg-gray-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-8">Bytebasket</h1>
            <h2 className="text-3xl mb-12 leading-relaxed">
              Nourishing Communities,<br />
              One Byte at a Time!
            </h2>
            <div className="flex space-x-6">
              <button 
                onClick={() => onNavigate('donate')}
                className="bg-orange-400 hover:bg-orange-500 text-white px-8 py-3 rounded-full font-medium text-lg transition-colors"
              >
                Donate
              </button>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <div className="w-80 h-80 bg-white rounded-full flex items-center justify-center">
              <div className="relative">
                {/* Food basket illustration */}
                <div className="w-48 h-32 bg-orange-200 rounded-t-3xl border-4 border-black relative">
                  {/* Food items */}
                  <div className="absolute -top-6 left-4 w-12 h-16 bg-red-400 rounded-full border-2 border-black"></div>
                  <div className="absolute -top-8 left-20 w-10 h-14 bg-yellow-400 rounded-full border-2 border-black transform rotate-12"></div>
                  <div className="absolute -top-4 right-6 w-10 h-12 bg-gray-300 rounded-full border-2 border-black"></div>
                  <div className="absolute -top-2 right-16 w-8 h-6 bg-blue-400 rounded border-2 border-black"></div>
                </div>
                {/* Hands */}
                <div className="absolute -bottom-8 left-8 w-32 h-20 bg-orange-300 rounded-full border-2 border-black transform -rotate-12"></div>
                <div className="absolute -bottom-6 right-8 w-28 h-16 bg-orange-300 rounded-full border-2 border-black transform rotate-12"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    {/* Ways to Give Section */}
    <section className="bg-gray-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-16">Ways to give</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Inventory Card */}
          <div className="bg-teal-200 rounded-3xl p-8 text-center text-gray-800">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg className="w-12 h-12 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.5 12.5L6 15l-1.5-1.5L3 15l3 3 6-6-1.5-1.5z"/>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Inventory</h3>
            <p className="text-gray-700 leading-relaxed">
              Effortlessly monitor and contribute to our inventory online, ensuring transparency 
              and convenience in accessing and donating items.
            </p>
          </div>

          {/* Give Card */}
          <div className="bg-teal-200 rounded-3xl p-8 text-center text-gray-800">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg className="w-12 h-12 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  <path d="M7 14h2v2h6v-2h2v3c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2v-3z"/>
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Give</h3>
            <p className="text-gray-700 leading-relaxed">
              Contribute to our mission of alleviating hunger by supporting us through monetary 
              donations and food contributions.
            </p>
          </div>

          {/* Volunteer Card */}
          <div className="bg-teal-200 rounded-3xl p-8 text-center text-gray-800">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg className="w-12 h-12 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 7h-2.08c-.8 0-1.54.5-1.85 1.26L12.94 12H9.5c-.83 0-1.5.67-1.5 1.5S8.67 15 9.5 15h3.5l1.5-4.5L16 22h4z"/>
                  <path d="M12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5z"/>
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Volunteer</h3>
            <p className="text-gray-700 leading-relaxed">
              Join us in the fight against hunger by volunteering at our food bank and making 
              a meaningful difference in the lives of those in need.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default HomePage;
