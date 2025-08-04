// src/pages/LandingPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Common/Button';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInPopup from '../components/Auth/GoogleSignInPopup'; // Import the popup
import fitnessVideo from "../assets/videos/fitness-bg.mp4";
import cardBg from "../assets/images/effortless.jpg";
import motivationBg from "../assets/images/motivated.jpg";
import syncBg from "../assets/images/sync.jpg";






// Example icons (replace with actual SVG components or images if you prefer)
const TrackIcon = () => <svg className="w-12 h-12 mx-auto mb-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const MotivateIcon = () => <svg className="w-12 h-12 mx-auto mb-3 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;
const SyncIcon = () => <svg className="w-12 h-12 mx-auto mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;

const LandingPage = () => {
  const { user, loading: authLoading } = useAuth(); // Use authLoading
  const navigate = useNavigate();

  React.useEffect(() => {
    // If auth is NOT loading and user IS authenticated, redirect.
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // If initial auth check is happening, or user is already defined, don't render landing content.
  // The App.jsx routing logic and AuthContext initial loading screen will handle this.
  // This page should only render if authLoading is false AND user is null.
  if (authLoading || user) {
    return null; // Or a minimal loading state if preferred, but usually handled by AuthContext/App.jsx
  }

  return (
    <>
      <div className="min-h-screen bg-sky-300 text-gray-100 flex flex-col items-center justify-center overflow-x-hidden">

        {/* Hero Section */}
       <section className="relative w-full h-screen text-white text-center overflow-hidden">
  {/* Background video */}
  <video
    autoPlay
    muted
    loop
    playsInline
    className="absolute top-0 left-0 w-full h-full object-cover z-0"
  >
    <source src={fitnessVideo} type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  {/* Dark overlay */}
  <div className="absolute inset-0 bg-transparent bg-opacity-60 z-10" />

  {/* Content on top */}
  <div className="relative z-20 px-6 flex flex-col items-center justify-center h-full">
    <h1 className="text-teal-100 text-4xl sm:text-5xl md:text-6xl font-semibold mb-4 leading-tight">
      Empower Your Fitness Journey. <span className="text-teal-100 font-semibold block sm:inline">Transform Your Life.</span>
    </h1>
    <p className="text-lg sm:text-xl md:text-2xl text-teal-100 font-semibold max-w-3xl mx-auto mb-10">
      FitTrack helps you stay consistent with smart tracking tools for workouts, meals, water, and sleep. 
  Take control, stay motivated, and watch your progress become unstoppable!
    </p>
    <div className="space-x-0 sm:space-x-4 space-y-4 sm:space-y-0">
      <Link to="/register">
        <Button variant="primary" className="w-full sm:w-auto text-lg px-8 py-3 bg-transparent border-2 hover:bg-teal-500 text-blue-100 font-bold shadow-lg transform transition-transform hover:scale-105">
          Start Your FREE Journey
        </Button>
      </Link>
      <Link to="/login">
        <Button variant="primary" className="w-full sm:w-auto text-lg px-13.5 py-3 bg-transparent border-2 border-white hover:bg-teal-500 text-blue-100 font-bold shadow-lg transform transition-transform hover:scale-105">
         Already a member
        </Button>

      </Link>
    </div>
  </div>
</section>


        {/* Features Section */}
        <section className="py-16 md:py-24 w-full">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-cyan-600 mb-16">
              All the Tools You Need — To Stay Fit, Focused, and Fired Up,All in One Place!
            </h2>
            <p className="text-base md:text-lg font-normal text-center text-cyan-600 mb-10">
                 Whether you're tracking your meals, logging workouts, or monitoring progress — we've got you covered.
            </p>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg transform transition-all hover:shadow-2xl hover:-translate-y-1 duration-300"
              style={{ backgroundImage: `url(${cardBg})` }}>
                <TrackIcon />
                <h3 className="text-xl text-cyan-100 font-semibold mb-2 mt-2 style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'">Effortless Tracking</h3>
                <p className="text-cyan-100 text-sm">Log meals, water, and fitness status with our intuitive interface. Spend less time logging, more time living.</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg transform transition-all hover:shadow-2xl hover:-translate-y-1 duration-300 animation-delay-200"
              style={{ backgroundImage: `url(${motivationBg})`}}>
                <MotivateIcon />
                <h3 className="text-xl text-cyan-50 font-semibold mb-2 mt-2 style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' ">Stay Motivated</h3>
                <p className="text-cyan-100 text-sm">Visualize your progress with clear stats and see how far you've come. Set goals and crush them!</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg transform transition-all hover:shadow-2xl hover:-translate-y-1 duration-300 animation-delay-400"
                  style={{ 
                      backgroundImage: `url(${syncBg})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}> 
                    <SyncIcon />
                <h3 className="text-xl text-cyan-50 font-semibold mb-2 mt-2"  style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
                      >Seamless Sync</h3>
                <p className="text-cyan-50 text-sm">
                    Connect your Google Calendar to schedule and get reminders for your fitness activities and meal preps.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section - Example */}
        <section className="py-16 md:py-20 bg-indigo-50 w-full">
            <div   className="container mx-auto px-6 text-center h-[500px] w-full bg-cover bg-center bg-no-repeat"
                 style={{ backgroundImage: `url(${syncBg})` }}>
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">Join Our Growing Community!</h2>
                <p className="text-lg text-cyan-400 mb-8 max-w-xl mx-auto">
                    Hear what our users are saying about their FitTrack experience.
                </p>
                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-cyan-700 italic">"FitTrack has revolutionized how I approach my diet and fitness. So easy to use and genuinely helpful!"</p>
                        <p className="mt-3 font-semibold text-cyan-700">- Sarah L.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-cyan-700 italic">"Finally does it all without being complicated. The Google Calendar sync is a game-changer for me."</p>
                        <p className="mt-3 font-semibold text-cyan-700">- Mike P.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Call to Action Section (Simplified as main CTA is in Hero) */}
       <section className="py-16 md:py-24 w-full">
  <div className="container mx-auto px-6">
    <h2 className="text-3xl md:text-4xl font-bold text-cyan-700 mb-6 text-center">
    Your fitness journey deserves more than just motivation — it deserves a plan, a purpose, and a partner. Start today and make every step count with FitTrack
    </h2>

    {/* Right-aligned button */}
    <div className="flex justify-end">
      <Link to="/register">
        <Button
          variant="primary"
          className="text-xl px-10 py-4 bg-green-500 hover:bg-green-600 text-white font-bold shadow-xl transform transition-transform hover:scale-105"
        >
          Create Your Account Now
        </Button>
      </Link>
    </div>
  </div>
</section>


        <footer className="w-full text-center text-gray-500 text-sm py-8 border-t border-gray-200">
          <p>© {new Date().getFullYear()} FitTrack. Your Health, Simplified.</p>
        </footer>
      </div>
      {/* Google Sign-In Popup will only show if user is not logged in and not authLoading */}
      <GoogleSignInPopup />
    </>
  );
};

export default LandingPage;