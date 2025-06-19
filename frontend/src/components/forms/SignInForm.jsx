import React from 'react';
import PropTypes from 'prop-types';

const SignInForm = ({ onToggleForm }) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="block text-white text-sm font-medium mb-2">
          Email address / Username
        </div>
        <input 
          type="text" 
          placeholder="Value"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
        />
      </div>
      
      <div>
        <div className="block text-white text-sm font-medium mb-2">
          Password
        </div>
        <input 
          type="password" 
          placeholder="Value"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
        />
      </div>
      
      <div className="text-right">
        <button 
          type="button"
          onClick={onToggleForm}
          className="text-orange-400 text-sm hover:text-orange-300"
        >
          or Sign up!
        </button>
      </div>
      
      <button 
        type="button"
        className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-md font-medium transition-colors"
      >
        Submit
      </button>
    </div>
  );
};

SignInForm.propTypes = {
  onToggleForm: PropTypes.func.isRequired,
};

export default SignInForm;