// src/pages/MealPlanPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getMealPlanForDate, saveMealPlanForDate, searchFoodNutrition } from '../lib/apiClient';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Input from '../components/Common/Input';
import Modal from '../components/Common/Modal';
import mealBg from "../assets/images/meals.jpg";
import lunchBg from "../assets/images/lunch.avif";
import dinnerBg from "../assets/images/dinner.jpg";
import snacksBg from "../assets/images/snakcs.jpg";
import breakfastBg from "../assets/images/breakfast.avif";



const getLocalDateString = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

const MealPlanPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateString, setDateString] = useState(getLocalDateString(selectedDate));
  
  const defaultMealPlan = {
      breakfast: { items: [], totalCalories: 0 }, lunch: { items: [], totalCalories: 0 },
      dinner: { items: [], totalCalories: 0 }, snacks: { items: [], totalCalories: 0 }
  };
  const [mealPlan, setMealPlan] = useState(defaultMealPlan);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeMealType, setActiveMealType] = useState(null);
  
  const debounceTimeout = useRef(null);

  const fetchMealPlan = useCallback(async (currentDateString) => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await getMealPlanForDate(currentDateString);
      setMealPlan({ ...defaultMealPlan, ...(res.data || {}) });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load meal plan.');
      setMealPlan(defaultMealPlan);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMealPlan(dateString); }, [dateString, fetchMealPlan]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    clearTimeout(debounceTimeout.current);
    if (query.length < 3) { setSearchResults([]); return; }
    setSearchLoading(true);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const res = await searchFoodNutrition(query);
        // API-Ninjas returns an array directly, so we use res.data
        setSearchResults(res.data);
      } catch (err) { console.error("Food search failed:", err); } 
      finally { setSearchLoading(false); }
    }, 500);
  };

  const handleAddFoodItem = (foodItem) => {
    if (!activeMealType) return;
    // Adapt to API-Ninjas response format
    const newFoodItem = {
      description: foodItem.name,
      calories: foodItem.calories,
      protein_g: foodItem.protein_g,
      carbohydrates_total_g: foodItem.carbohydrates_total_g,
      fat_total_g: foodItem.fat_total_g,
      serving_size_g: foodItem.serving_size_g,
    };
    setMealPlan(prev => ({ ...prev, [activeMealType]: { items: [...(prev[activeMealType]?.items || []), newFoodItem] } }));
    closeSearchModal();
  };
  
  const handleRemoveFoodItem = (mealType, itemIndex) => {
    setMealPlan(prev => {
        const updatedItems = [...prev[mealType].items];
        updatedItems.splice(itemIndex, 1);
        return { ...prev, [mealType]: { ...prev[mealType], items: updatedItems } };
    });
  };

  const handleSaveMealPlan = async () => {
    setActionLoading(true); setError(''); setSuccess('');
    try {
      const res = await saveMealPlanForDate(dateString, mealPlan);
      setMealPlan({ ...defaultMealPlan, ...res.data });
      setSuccess('Meal plan saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save meal plan.');
    } finally {
      setActionLoading(false);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
    setDateString(getLocalDateString(newDate));
  };
  
  const mealbackground = {
    breakfast: breakfastBg,
    lunch: lunchBg,
    dinner: dinnerBg,
    snacks: snacksBg
};
  const openSearchModal = (mealType) => { setSearchQuery(''); setSearchResults([]); setActiveMealType(mealType); };
  const closeSearchModal = () => setActiveMealType(null);
  
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

  if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;

  return (
<div
    className="min-h-screen bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${mealBg})` }}>
    
    <div className="container mx-auto px-4 py-8 max-w-4xl " >
      <div className="flex items-center justify-between mb-6 bg-cyan-100 p-4 rounded-lg shadow transition-transform transform hover:scale-105 hover:shadow-lg hover:bg-blue-200 cursor-pointer">
        <Button onClick={() => changeDate(-1)} variant="primary"> Previous Day </Button>
        <input type="date" value={dateString} onChange={(e) => setDateString(e.target.value)} className="border border-black rounded px-3 py-2 text-lg font-semibold"/>
        <Button onClick={() => changeDate(1)} variant="primary">Next Day </Button>
      </div>

      {error && <p className="text-indigo-900 bg-indigo-100 p-3 rounded mb-4">{error}</p>}
      {success && <p className="text-indigo-900 bg-indigo-100 p-3 rounded mb-4">{success}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mealTypes.map(mealType => (
          <div key={mealType} className="bg-rose-100 p-6 rounded-lg shadow-md transition-transform transform hover:scale-120 hover:shadow-lg hover:bg-blue-200 cursor-pointer"
          style={{
            backgroundImage: `url(${mealbackground[mealType]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: 0.8
 
          }}>
            <h2 className="text-xl font-semibold mb-4 capitalize text-indigo-800">{mealType}</h2>
            <ul className="space-y-2 mb-4 min-h-[60px]">
              {(mealPlan[mealType]?.items || []).map((item, index) => (
                <li key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-indigo-900">{item.description}</p>
                    <p className="text-xs text-indigo-900">{item.calories} kcal, {item.serving_size_g}g</p>
                  </div>
                  <button onClick={() => handleRemoveFoodItem(mealType, index)} className="text-indigo-700 hover:text-indigo-300 text-xs font-semibold">REMOVE</button>
                </li>
              ))}
            </ul>
            <Button onClick={() => openSearchModal(mealType)} variant="secondary" className="w-full text-sm text-indigo-900">Add Food to {mealType}</Button>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button onClick={handleSaveMealPlan} isLoading={actionLoading} disabled={actionLoading}>
            Save All Meals for {dateString}
        </Button>
      </div>

      <Modal isOpen={!!activeMealType} onClose={closeSearchModal} title={`Add Food to ${activeMealType}`}>
          <Input id="food-search" type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Search for food (e.g., '1 cup of rice')..." autoFocus />
          {searchLoading && <LoadingSpinner size="w-6 h-6 mx-auto my-4"/>}
          <ul className="max-h-60 overflow-y-auto space-y-2">
            {searchResults.length > 0 ? searchResults.map((item, index) => (
              <li key={index} onClick={() => handleAddFoodItem(item)} className="p-3 bg-gray-50 hover:bg-indigo-100 rounded cursor-pointer transition-colors">
                <p className="font-semibold text-gray-800 capitalize">{item.name}</p>
                <p className="text-sm text-gray-600">{Math.round(item.calories)} kcal / {item.serving_size_g}g</p>
              </li>
            )) : <p className="text-center text-sm text-gray-400 py-4">{searchQuery.length < 3 ? 'Type 3+ characters to search' : 'No results found.'}</p>}
          </ul>
      </Modal>
    </div>
  </div>
  );
};

export default MealPlanPage;