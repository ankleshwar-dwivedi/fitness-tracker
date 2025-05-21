// src/pages/MealPlanPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getMealPlan, updateMealPlan, getWaterIntake, updateWaterIntake } from '../lib/apiClient';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';

// Helper function to get date string in YYYY-MM-DD format
const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const MealPlanPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateString, setDateString] = useState(getLocalDateString(selectedDate));

  // Meal Plan State
  const [mealPlan, setMealPlan] = useState({
    meal1: '', meal2: '', meal3: '', meal4: '', meal5: '', snacks: ''
  });
  const [mealLoading, setMealLoading] = useState(false);
  const [mealError, setMealError] = useState('');
  const [mealSuccess, setMealSuccess] = useState('');

  // Water Intake State
  const [waterIntake, setWaterIntake] = useState({ litersDrank: '' });
  const [waterLoading, setWaterLoading] = useState(false);
  const [waterError, setWaterError] = useState('');
  const [waterSuccess, setWaterSuccess] = useState('');


  // Fetch data for the selected date
  const fetchDataForDate = useCallback(async (currentDateString) => {
    setMealLoading(true);
    setWaterLoading(true);
    setMealError('');
    setWaterError('');
    setMealSuccess('');
    setWaterSuccess('');

    // Fetch Meal Plan
    try {
      const mealRes = await getMealPlan(currentDateString);
       setMealPlan(mealRes.data || { meal1: '', meal2: '', meal3: '', meal4: '', meal5: '', snacks: '' });
    } catch (err) {
       if (err.response && err.response.status === 404) {
           console.log(`No meal plan found for ${currentDateString}.`);
           setMealPlan({ meal1: '', meal2: '', meal3: '', meal4: '', meal5: '', snacks: '' }); // Reset form
       } else {
           console.error("Failed to fetch meal plan:", err);
           setMealError(`Failed to load meal plan for ${currentDateString}.`);
       }
    } finally {
        setMealLoading(false);
    }

    // Fetch Water Intake
    try {
        const waterRes = await getWaterIntake(currentDateString);
        // Ensure litersDrank is treated as a string for the input, handle null/undefined
        setWaterIntake({ litersDrank: waterRes.data?.litersDrank?.toString() ?? '0' });
    } catch (err) {
       if (err.response && err.response.status === 404) {
           console.log(`No water intake found for ${currentDateString}.`);
           setWaterIntake({ litersDrank: '0' }); // Default to 0 if not found
       } else {
           console.error("Failed to fetch water intake:", err);
           setWaterError(`Failed to load water intake for ${currentDateString}.`);
       }
    } finally {
        setWaterLoading(false);
    }
  }, []); // No dependencies needed here as it uses the passed dateString


  // Effect to fetch data when dateString changes
  useEffect(() => {
      fetchDataForDate(dateString);
  }, [dateString, fetchDataForDate]);


  // Handlers
  const handleDateChange = (event) => {
      const newDate = new Date(event.target.value);
      // Adjust for timezone offset to avoid date shifting
      const timezoneOffset = newDate.getTimezoneOffset() * 60000; // Offset in milliseconds
      const adjustedDate = new Date(newDate.getTime() + timezoneOffset);

      setSelectedDate(adjustedDate);
      setDateString(getLocalDateString(adjustedDate));
  };

  const changeDate = (days) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + days);
      setSelectedDate(newDate);
      setDateString(getLocalDateString(newDate));
  };


  const handleMealChange = (e) => {
    setMealPlan({ ...mealPlan, [e.target.name]: e.target.value });
  };

  const handleWaterChange = (e) => {
     // Allow empty string or numbers (potentially with decimals)
     const value = e.target.value;
     if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setWaterIntake({ litersDrank: value });
     }
  };

  const handleMealUpdate = async (e) => {
    e.preventDefault();
    setMealLoading(true);
    setMealError('');
    setMealSuccess('');

    try {
      const response = await updateMealPlan(dateString, mealPlan);
      setMealPlan(response.data); // Update local state with response
      setMealSuccess('Meal plan updated successfully!');
      setTimeout(() => setMealSuccess(''), 3000);
    } catch (err) {
      console.error("Failed to update meal plan:", err);
      setMealError(err.response?.data?.message || 'Failed to update meal plan.');
    } finally {
      setMealLoading(false);
    }
  };

  const handleWaterUpdate = async (e) => {
    e.preventDefault();
    setWaterLoading(true);
    setWaterError('');
    setWaterSuccess('');

    // Ensure we send a number, default to 0 if empty
    const litersValue = waterIntake.litersDrank === '' ? 0 : parseFloat(waterIntake.litersDrank);

    if (isNaN(litersValue)) {
        setWaterError("Invalid number for liters drank.");
        setWaterLoading(false);
        return;
    }

    const payload = { litersDrank: litersValue };

    try {
      const response = await updateWaterIntake(dateString, payload);
      // Update state with string version from response for consistency with input
      setWaterIntake({ litersDrank: response.data?.litersDrank?.toString() ?? '0' });
      setWaterSuccess('Water intake updated successfully!');
      setTimeout(() => setWaterSuccess(''), 3000);
    } catch (err) {
      console.error("Failed to update water intake:", err);
      setWaterError(err.response?.data?.message || 'Failed to update water intake.');
    } finally {
      setWaterLoading(false);
    }
  };

  const isLoading = mealLoading || waterLoading;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Daily Log</h1>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow">
        <Button onClick={() => changeDate(-1)} variant="secondary"> Previous Day </Button>
        <input
           type="date"
           value={dateString}
           onChange={handleDateChange}
           className="border border-gray-300 rounded px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
         />
        <Button onClick={() => changeDate(1)} variant="secondary">Next Day </Button>
      </div>

      {isLoading && <div className="text-center my-4"><LoadingSpinner /></div>}

      {/* Meal Plan Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Meal Plan for {dateString}</h2>
        {mealError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4">{mealError}</p>}
        {mealSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded mb-4">{mealSuccess}</p>}
        <form onSubmit={handleMealUpdate} className="space-y-4">
          {/* Create inputs for meal1 to meal5 and snacks */}
          {Object.keys(mealPlan).map((mealKey) => (
             <Input
                key={mealKey}
                id={mealKey}
                name={mealKey} // Important for handleMealChange
                label={mealKey.charAt(0).toUpperCase() + mealKey.slice(1).replace(/([A-Z])/g, ' $1')} // Basic label formatting
                type="text"
                value={mealPlan[mealKey]}
                onChange={handleMealChange}
                placeholder={`Enter details for ${mealKey}`}
             />
          ))}
           <Button type="submit" variant="primary" isLoading={mealLoading} disabled={mealLoading || waterLoading}>
             Save Meal Plan
           </Button>
        </form>
      </div>


      {/* Water Intake Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Water Intake for {dateString}</h2>
        {waterError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4">{waterError}</p>}
        {waterSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded mb-4">{waterSuccess}</p>}
        <form onSubmit={handleWaterUpdate} className="space-y-4">
          <Input
            id="litersDrank"
            name="litersDrank" // Important for handleWaterChange
            label="Liters Drank"
            type="text" // Use text to allow decimals and empty string easily
            inputMode="decimal" // Hint for mobile keyboards
            value={waterIntake.litersDrank}
            onChange={handleWaterChange}
            placeholder="e.g., 2.5"
          />
           <Button type="submit" variant="primary" isLoading={waterLoading} disabled={mealLoading || waterLoading}>
             Save Water Intake
           </Button>
        </form>
      </div>
    </div>
  );
};

export default MealPlanPage;