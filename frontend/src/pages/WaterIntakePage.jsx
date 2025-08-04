// src/pages/WaterIntakePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getWaterIntake, updateWaterIntake } from '../lib/apiClient';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import waater from "../assets/videos/water.mp4"; // ✅ Background image

const getLocalDateString = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

const WaterIntakePage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dateString, setDateString] = useState(getLocalDateString(selectedDate));
    const [waterData, setWaterData] = useState({ litersDrank: 0 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchWaterIntake = useCallback(async (currentDateString) => {
        setLoading(true); setError(''); setSuccess('');
        try {
            const res = await getWaterIntake(currentDateString);
            setWaterData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load water intake data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWaterIntake(dateString);
    }, [dateString, fetchWaterIntake]);

    const handleWaterChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
           setWaterData({ ...waterData, litersDrank: value });
        }
    };

    const handleUpdateWater = async (e) => {
        e.preventDefault();
        setActionLoading(true); setError(''); setSuccess('');
        const litersValue = waterData.litersDrank === '' ? 0 : parseFloat(waterData.litersDrank);
        if (isNaN(litersValue) || litersValue < 0) {
            setError("Please enter a valid, non-negative number.");
            setActionLoading(false);
            return;
        }
        try {
            const res = await updateWaterIntake(dateString, { litersDrank: litersValue });
            setWaterData(res.data);
            setSuccess('Water intake updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update water intake.');
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

    if (loading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;

    return (
        <div className="relative min-h-screen overflow-hidden">
  {/* Background Video */}
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute top-0 left-0 w-full h-full object-cover z-0"
  >
    <source src={waater} type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  {/* Overlay content */}
  <div className="relative z-10 px-4 py-8">
        
            <div className="container mx-auto max-w-lg bg-white/80 p-6 rounded-xl shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-indigo-500">Log Water Intake</h1>

                <div className="flex items-center justify-between mb-6 bg-white/70 p-4 rounded-lg shadow">
                    <Button onClick={() => changeDate(-1)} variant="primary"> Previous Day </Button>
                    <input
                        type="date"
                        value={dateString}
                        onChange={(e) => setDateString(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-lg font-semibold"
                    />
                    <Button onClick={() => changeDate(1)} variant="primary">Next Day </Button>
                </div>

                <div className="bg-white/80 p-6 rounded-lg shadow-md">
                    {error && <p className="text-indigo-500 bg-indigo-900 p-3 rounded mb-4">{error}</p>}
                    {success && <p className="text-indigo-500 bg-indigo-100 p-3 rounded mb-4">{success}</p>}

                    <form onSubmit={handleUpdateWater}>
                        <Input
                            id="litersDrank"
                            label={`Liters Drank on ${dateString}`}
                            type="text"
                            inputMode="decimal"
                            value={waterData.litersDrank}
                            onChange={handleWaterChange}
                            placeholder="e.g., 2.5"
                        />
                        <Button type="submit" isLoading={actionLoading} disabled={actionLoading} className="w-full mt-4">
                            Save Water Intake
                        </Button>
                    </form>
                </div>
            </div>
        </div>
        </div>
    );
};

export default WaterIntakePage;
