import React from 'react';

const SignUpForm = ({ onToggleForm }) => (
  <div className="space-y-6">
    <div>
      <div className="block text-white text-sm font-medium mb-2">Role</div>
      <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-500">
        <option>Choose Role</option>
        <option>Donor</option>
        <option>Volunteer</option>
        <option>Recipient</option>
      </select>
    </div>
    
    <div>
      <div className="block text-white text-sm font-medium mb-2">Email address</div>
      <input 
        type="email" 
        placeholder="Value"
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
      />
    </div>
    
    <div>
      <div className="block text-white text-sm font-medium mb-2">Username</div>
      <input 
        type="text" 
        placeholder="Value"
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
      />
    </div>
    
    <div>
      <div className="block text-white text-sm font-medium mb-2">Password</div>
      <input 
        type="password" 
        placeholder="Value"
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
      />
    </div>
    
    <div>
      <div className="block text-white text-sm font-medium mb-2">Confirm Password</div>
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
        or Sign in!
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

export default SignUpForm;
