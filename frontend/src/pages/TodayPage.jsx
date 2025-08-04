import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTodaySummary } from '../lib/apiClient';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useAuth } from '../contexts/AuthContext';
import pBg from "../assets/images/phc.jpeg";

ChartJS.register(ArcElement, Tooltip, Legend);

const CalorieChart = ({ summary }) => {
  const { calorieGoal } = summary.goals;
  const { caloriesConsumed, caloriesBurned } = summary.today;

  const netCaloriesConsumed = Math.max(0, caloriesConsumed - caloriesBurned);
  const caloriesLeft = Math.max(0, calorieGoal - netCaloriesConsumed);

  const data = {
    labels: ['Net Calories', 'Remaining'],
    datasets: [{
      data: [netCaloriesConsumed, caloriesLeft],
      backgroundColor: [
        netCaloriesConsumed > calorieGoal ? '#ef4444' : '#4f46e5',
        '#e5e7eb'
      ],
      borderColor: ['#ffffff', '#ffffff'],
      borderWidth: 3,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${Math.round(context.raw)} kcal`
        }
      }
    },
  };

  return (
    <div className="relative w-full h-48 md:h-64">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-3xl md:text-4xl font-bold text-indigo-700">
          {Math.round(caloriesLeft)}
        </span>
        <span className="text-sm text-indigo-700">kcal Left</span>
      </div>
    </div>
  );
};

const TodayPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await getTodaySummary();
        setSummary(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load today's summary.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>
        <Link to="/profile">
          <Button variant="primary" className="mt-4">Go to Profile</Button>
        </Link>
      </div>
    );
  }

  if (!summary) {
    return <div className="text-center text-black p-8">No summary data available to display.</div>;
  }

  const noMealsLogged = Object.values(summary.today.meals).every(meal => !meal || meal.items.length === 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-50xl min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${pBg})` }}>
      <h1 className="text-5xl font-bold mb-6 text-indigo-200">
        {user?.name ? `${user.name}'s Dashboard` : "Dashboard"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-cyan-100 p-6 rounded-lg shadow-md flex flex-col items-center transition-transform transform hover:scale-95 hover:bg-blue-200 hover:shadow-lg cursor-pointer"
              style={{ opacity: 0.8 }}>

            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">
              Calorie Goal: {summary.goals.calorieGoal} kcal
            </h2>
            <CalorieChart summary={summary} />
            <div className="w-full text-center mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-indigo-700"><span>Consumed:</span> <span className="text-indigo-700 font-semibold">{summary.today.caloriesConsumed} kcal</span></div>
              <div className="flex justify-between text-indigo-700"><span>Burned:</span> <span className="text-indigo-700 font-semibold">{summary.today.caloriesBurned} kcal</span></div>
              <hr className="my-1" />
              <div className="flex justify-between font-bold text-indigo-700"><span>Net Intake:</span> <span className="text-indigo-700 font-semibold">{summary.today.caloriesConsumed - summary.today.caloriesBurned} kcal</span></div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-cyan-100 p-6 rounded-lg shadow-md transition-transform transform hover:scale-95 hover:shadow-lg hover:bg-blue-200 cursor-pointer"
            style={{ opacity: 0.8 }}
>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-indigo-700">Meals Logged</h2>
              <Link to="/meal-plan">
                <Button variant="primary" className="text-ys py-1 px-3">Log / Edit Meals</Button>
              </Link>
            </div>
            {noMealsLogged ? (
              <p className="text-black text-sm">No meals logged yet for today.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(summary.today.meals).filter(([, mealData]) => mealData?.items.length > 0).map(([mealType, mealData]) => (
                  <div key={mealType}>
                    <h3 className="font-semibold capitalize text-gray-600 flex justify-between">
                      <span>{mealType}</span>
                      <span className="font-normal text-black">{mealData.totalCalories} kcal</span>
                    </h3>
                    <ul className="list-disc list-inside text-sm text-black pl-2 mt-1">
                      {mealData.items.map((item, index) => (
                        <li key={index}>{item.description} ({item.calories} kcal)</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-cyan-100 p-6 rounded-lg shadow-md transition-transform transform hover:scale-95 hover:shadow-lg hover:bg-blue-200 cursor-pointer"
            style={{ opacity: 0.8 }}
>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-indigo-700">Workouts Logged</h2>
              <Link to="/workouts">
                <Button variant="primary" className="text-ys py-1 px-7">Log Workout</Button>
              </Link>
            </div>
            {summary.today.workouts.length > 0 ? (
              <ul className="space-y-2">
                {summary.today.workouts.map((ex) => (
                  <li key={ex._id} className="flex justify-between items-center text-sm">
                    <span>{ex.name} <span className="text-gray-400">({ex.duration_min} min)</span></span>
                    <span className="font-semibold text-red-500">{ex.calories_burned} kcal</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-black text-sm">No workouts logged yet for today.</p>
            )}
          </div>

          {/* ⬇ Water Intake block moved below workouts */}
          <div className="bg-cyan-100 p-6 rounded-lg shadow-md transition-transform transform hover:scale-95 hover:shadow-lg hover:bg-blue-200 cursor-pointer"
            style={{ opacity: 0.8 }}
>
  <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold mb-2 text-indigo-700">Water Intake</h2>
            <p className="text-2xl font-bold text-blue-500">
              {summary.today.waterIntakeLiters}
              <span className="text-lg font-normal text-black"> Liters</span>
            </p>
              <Link to="/water">
                <Button variant="primary" className="text-ys py-1 px-7">Log Water</Button>
              </Link>
            </div>
            </div>
            
          </div>
        </div>
      </div>
    
    
  );
};

export default TodayPage;
