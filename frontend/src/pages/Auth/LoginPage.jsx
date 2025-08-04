// src/pages/Auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import loginBg from '../../assets/images/loginimage.jpg';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // CORRECTED: Destructure the new state and setter names from useAuth.
  // We alias `authActionError` to `error` for easier use in the JSX.
  const { login, actionLoading, authActionError: error, setAuthActionError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthActionError(null); // CORRECTED: Use the correct setter function.
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard'); // Redirect to dashboard on successful login
    }
    // If login fails, `authActionError` is automatically set inside the login function in AuthContext.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 bg-no-repeat bg-cover bg-centre"
    style={{backgroundImage: `url(${loginBg})`}}>
      
      <div className="max-w-md w-full space-y-8 bg-cyan-100 p-10 rounded-lg font-normal shadow-xl transform transition-transform hover:scale-105 hover:bg-orange-50" style={{ opacity: 0.9 }}>
        <div class="my-box text-center text-6xl text-orange-500">
    <h1>FitTrack</h1>
    </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-700">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-center text-sm text-red-600 bg-red-100 p-3 rounded">{error}</p>}
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
            placeholder="Password"
            required
          />

          <div>
            {/* CORRECTED: Use `actionLoading` for button state */}
            <Button type="submit" variant="primary" className="w-full" isLoading={actionLoading} disabled={actionLoading}>
              Sign in
            </Button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Register here
          </Link>
        </p>
        {/* Add Google Sign-In button here too */}
        {/* <div className="mt-6">
          <p className="text-center text-sm text-gray-500">OR</p>
          <Button
            onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5123'}/api/auth/google`}
            variant="secondary" // Or a custom Google style
            className="w-full mt-3"
          >
            Sign in with Google
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;