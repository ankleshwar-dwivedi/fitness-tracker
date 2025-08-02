// src/pages/Auth/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState(''); // For client-side validation like password mismatch
  // CORRECTED: Destructure the new state and setter names from useAuth.
  const { register, actionLoading, authActionError: error, setAuthActionError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthActionError(null); // CORRECTED: Use the correct setter for backend errors.
    setFormError(''); // Clear frontend error

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (password.length < 6) { // Example: Basic password length check
       setFormError('Password must be at least 6 characters long.');
       return;
    }

    const success = await register(name, email, password);
    if (success) {
      navigate('/dashboard'); // Redirect to dashboard on successful registration
    }
    // If registration fails, `authActionError` is automatically set inside the register function in AuthContext.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
           {(error || formError) && <p className="text-center text-sm text-red-600 bg-red-100 p-3 rounded">{error || formError}</p>}
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
            error={formError && formError.includes('match') ? formError : null} // Show error specific to this field
          />

          <div>
            {/* CORRECTED: Use `actionLoading` for button state */}
            <Button type="submit" variant="primary" className="w-full" isLoading={actionLoading} disabled={actionLoading}>
              Register
            </Button>
          </div>
        </form>
         <p className="mt-2 text-center text-sm text-gray-600">
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