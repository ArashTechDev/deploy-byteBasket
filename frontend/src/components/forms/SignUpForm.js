import React, { useState } from 'react';
import { registerUser } from '../../services/authService';

const SignUpForm = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!formData.role || !formData.name || !formData.email || !formData.password) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const payload = {
        role: formData.role,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      const response = await registerUser(payload);
      alert(response.message || 'Registered successfully! Please check your email to verify.');
    } catch (error) {
      console.error('Registration error:', error.response);

      if (error.response?.data?.errors) {
        const messages = Object.values(error.response.data.errors)
          .map(err => err.message)
          .join('\n');
        alert(messages);
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Registration failed');
      }
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-white text-sm font-medium mb-2">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-500"
          required
        >
          <option value="">Choose Role</option>
          <option value="donor">Donor</option>
          <option value="volunteer">Volunteer</option>
          <option value="recipient">Recipient</option>
        </select>
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your full name"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Email address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
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
        type="submit"
        className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-md font-medium transition-colors"
      >
        Submit
      </button>
    </form>
  );
};

export default SignUpForm;
