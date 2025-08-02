// src/pages/WorkoutPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getWorkoutLogForDate, addExerciseToLog, removeExerciseFromLog } from '../lib/apiClient';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const getLocalDateString = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

const WorkoutPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dateString, setDateString] = useState(getLocalDateString(selectedDate));
    const [workoutLog, setWorkoutLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [exerciseName, setExerciseName] = useState('');
    const [duration, setDuration] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchWorkoutLog = useCallback(async (currentDateString) => {
        setLoading(true); setError(''); setSuccess('');
        try {
            const res = await getWorkoutLogForDate(currentDateString);
            setWorkoutLog(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load workout log.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkoutLog(dateString);
    }, [dateString, fetchWorkoutLog]);

    const showFeedback = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleAddExercise = async (e) => {
        e.preventDefault();
        if (!exerciseName || !duration || parseInt(duration, 10) <= 0) {
            alert('Please enter a valid exercise name and a positive duration in minutes.');
            return;
        }
        setActionLoading(true);
        try {
            const exerciseData = { name: exerciseName, duration_min: parseInt(duration, 10) };
            await addExerciseToLog(dateString, exerciseData);
            setExerciseName('');
            setDuration('');
            showFeedback('Exercise added successfully!');
            await fetchWorkoutLog(dateString);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add exercise.');
        } finally {
            setActionLoading(false);
        }
    };
    
    const handleRemoveExercise = async (exerciseId) => {
        if (!window.confirm("Are you sure you want to remove this exercise?")) return;
        setActionLoading(true);
        try {
            await removeExerciseFromLog(dateString, exerciseId);
            showFeedback('Exercise removed.');
            await fetchWorkoutLog(dateString);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove exercise.');
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

    if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Workout Log</h1>
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow">
                <Button onClick={() => changeDate(-1)} variant="secondary"> Previous Day </Button>
                <input type="date" value={dateString} onChange={(e) => setDateString(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-lg font-semibold"/>
                <Button onClick={() => changeDate(1)} variant="secondary">Next Day </Button>
            </div>
            
            {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
            {success && <p className="text-green-500 bg-green-100 p-3 rounded mb-4">{success}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Exercise Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Workout</h2>
                    <form onSubmit={handleAddExercise} className="space-y-4">
                        <Input id="exerciseName" label="Exercise Name" type="text" value={exerciseName} onChange={e => setExerciseName(e.target.value)} placeholder="e.g., Running, Weightlifting" />
                        <Input id="duration" label="Duration (minutes)" type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g., 30" />
                        <Button type="submit" isLoading={actionLoading} disabled={actionLoading} className="w-full">Add to Log</Button>
                    </form>
                </div>
                
                {/* Logged Exercises */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Logged on {dateString}</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {workoutLog?.exercises && workoutLog.exercises.length > 0 ? (
                            workoutLog.exercises.map(ex => (
                                <div key={ex._id} className="flex justify-between items-center p-3 bg-gray-50 rounded group">
                                    <div>
                                        <p className="font-medium text-gray-800">{ex.name}</p>
                                        <p className="text-xs text-gray-500">{ex.duration_min} min</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-red-500">{ex.calories_burned} kcal</p>
                                        <button onClick={() => handleRemoveExercise(ex._id)} className="text-xs text-gray-400 hover:text-red-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm mt-4 text-center py-10">No exercises logged for this day.</p>
                        )}
                    </div>
                     <div className="mt-4 pt-4 border-t text-right">
                        <p className="text-gray-700">Total Burned Today: <span className="font-bold text-lg text-red-600">{workoutLog?.totalCaloriesBurned || 0} kcal</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutPage;