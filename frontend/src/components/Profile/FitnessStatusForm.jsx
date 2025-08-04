// src/components/Profile/FitnessStatusForm.jsx
import React from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';

const FitnessStatusForm = ({
  statusData,
  handleStatusChange,
  handleStatusUpdate,
  statusLoading,
  statusError,
  statusSuccess
}) => {
  return (
    <div className="bg-cyan-200 p-6 rounded-lg shadow-md ">
      <h2 className="text-2xl text-indigo-500 font-semibold mb-4">Fitness Status</h2>
      {statusError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4">{statusError}</p>}
      {statusSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded mb-4">{statusSuccess}</p>}
      <form onSubmit={handleStatusUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="height" name="height" label="Height (cm)" type="number" 
          value={statusData.height || ''} onChange={handleStatusChange} placeholder="e.g., 175"
        />
        <Input
          id="weight" name="weight" label="Current Weight (kg)" type="number" step="0.1" 
          value={statusData.weight || ''} onChange={handleStatusChange} placeholder="e.g., 70.5"
        />
        <Input
          id="goalWeight" name="goalWeight" label="Goal Weight (kg)" type="number" step="0.1"
          value={statusData.goalWeight || ''} onChange={handleStatusChange} placeholder="e.g., 68"
        />
        <Input
          id="age" name="age" label="Age" type="number"
          value={statusData.age || ''} onChange={handleStatusChange} placeholder="e.g., 30"
        />
        <div className="mb-4">
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            id="gender" name="gender" value={statusData.gender || ''} onChange={handleStatusChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
          <select
            id="activityLevel" name="activityLevel" value={statusData.activityLevel || ''} onChange={handleStatusChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Activity Level</option>
            <option value="sedentary">Sedentary</option>
            <option value="lightlyActive">Lightly Active</option>
            <option value="active">Active</option>
            <option value="veryActive">Very Active</option>
          </select>
        </div>
        <div className="mb-4 md:col-span-2">
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Primary Goal</label>
          <select
            id="goal" name="goal" value={statusData.goal || ''} onChange={handleStatusChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Goal</option>
            <option value="Cutting">Weight Loss (Cutting)</option>
            <option value="Maintenance">Weight Maintenance</option>
            <option value="Bulking">Weight Gain (Bulking)</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <Button type="submit" variant="primary" className="w-full md:w-auto" isLoading={statusLoading} disabled={statusLoading}>
            Update Status
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FitnessStatusForm;