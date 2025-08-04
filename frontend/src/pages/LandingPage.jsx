// src/pages/LandingPage.jsx
import React from 'react'; // THIS LINE FIXES THE "react is not defined" ERROR
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Common/Button';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInPopup from '../components/Auth/GoogleSignInPopup';

// Example icons for the features section
const TrackIcon = () => <svg className="w-12 h-12 mx-auto mb-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const MotivateIcon = () => <svg className="w-12 h-12 mx-auto mb-3 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;
const SyncIcon = () => <svg className="w-12 h-12 mx-auto mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;

const LandingPage = () => {
  const { user, initialAuthLoading } = useAuth();
  const navigate = useNavigate();

  // This hook handles redirecting a user if they are already logged in.
  // It uses React.useEffect, which requires the `import React` statement.
  React.useEffect(() => {
    if (!initialAuthLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, initialAuthLoading, navigate]);

  // If the initial auth check is happening or the user is already logged in,
  // we don't need to render the landing page content.
  if (initialAuthLoading || user) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center justify-center overflow-x-hidden">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
              Track Your Fitness. <span className="block sm:inline">Achieve Your Goals.</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10">
              FitTrack makes it simple to log your meals, monitor water intake, and visualize your progress.
              Join thousands who are taking control of their health journey!
            </p>
            <div className="space-x-0 sm:space-x-4 space-y-4 sm:space-y-0">
              <Link to="/register">
                <Button variant="primary" className="w-full sm:w-auto text-lg px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-blue-700 font-bold shadow-lg transform transition-transform hover:scale-105">
                  Start Your FREE Journey
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="w-full sm:w-auto text-lg px-8 py-3 bg-transparent border-2 border-white hover:bg-white hover:text-indigo-600 text-white font-medium shadow-lg transform transition-transform hover:scale-105">
                  I'm Already a Member
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 w-full">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
              Everything You Need, All in One Place
            </h2>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg transform transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
                <TrackIcon />
                <h3 className="text-xl font-semibold mb-2 mt-2">Effortless Tracking</h3>
                <p className="text-gray-600 text-sm">Log meals, water, and fitness status with our intuitive interface. Spend less time logging, more time living.</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg transform transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
                <MotivateIcon />
                <h3 className="text-xl font-semibold mb-2 mt-2">Stay Motivated</h3>
                <p className="text-gray-600 text-sm">Visualize your progress with clear stats and see how far you've come. Set goals and crush them!</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg transform transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
                <SyncIcon />
                <h3 className="text-xl font-semibold mb-2 mt-2">Seamless Sync</h3>
                <p className="text-gray-600 text-sm">Connect your Google Calendar to schedule and get reminders for your fitness activities and meal preps.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-16 md:py-20 bg-indigo-50 w-full">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Join Our Growing Community!</h2>
                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-gray-700 italic">"FitTrack has revolutionized how I approach my diet and fitness. So easy to use and genuinely helpful!"</p>
                        <p className="mt-3 font-semibold text-indigo-600">- Sarah L.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-gray-700 italic">"The Google Calendar sync is a game-changer for me."</p>
                        <p className="mt-3 font-semibold text-indigo-600">- Mike P.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24 text-center w-full">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                    Ready to Transform Your Fitness?
                </h2>
                <Link to="/register">
                    <Button variant="primary" className="text-xl px-10 py-4 bg-green-500 hover:bg-green-600 text-white font-bold shadow-xl transform transition-transform hover:scale-105">
                        Create Your Account Now
                    </Button>
                </Link>
            </div>
        </section>

        <footer className="w-full text-center text-gray-500 text-sm py-8 border-t border-gray-200">
          <p>© {new Date().getFullYear()} FitTrack. Your Health, Simplified.</p>
        </footer>
      </div>

      <GoogleSignInPopup />
    </>
  );
};

export default LandingPage;