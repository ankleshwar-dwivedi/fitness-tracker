// src/pages/Auth/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import athlete from '../../assets/images/athlete.png'; // ✅ Corrected import path

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { register, actionLoading, authActionError: error, setAuthActionError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthActionError(null);
    setFormError('');

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${athlete})` }} // ✅ Background image
    >
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-10 rounded-xl shadow-md transition-transform transform hover:scale-105 hover:shadow-lg hover:bg-blue-200 cursor-pointer" style = {{opacity:0.9}}>
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-indigo-900">Your Journey Starts Here</h2>
          <p className="text-sm text-gray-600 mt-1">Begin your transformation today.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || formError) && (
            <p className="text-center text-sm text-red-600 bg-red-100 p-3 rounded">
              {error || formError}
            </p>
          )}

          <Input
            id="name"
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
          />

          <Input
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane.doe@example.com"
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 6 characters)"
            required
          />

          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
            error={formError && formError.includes('match') ? formError : null}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={actionLoading}
            disabled={actionLoading}
          >
            Register
          </Button>
        </form>

        <p className="mt-2 text-center text-sm text-gray-700">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
