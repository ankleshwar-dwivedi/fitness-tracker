import React, { useState } from 'react';
import '../App.css'; // 👈 Make sure this import exists if it's not already

function WorkoutForm() {
  const [input, setInput] = useState('');
  const [workouts, setWorkouts] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    setWorkouts([...workouts, input]);
    setInput('');
  };

  return (
    <div className="workout-form">
      <h2>Log Your Workout</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="e.g., Pushups"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Log Workout</button>
      </form>

      {workouts.length > 0 && (
        <div className="logged-workouts">
          <h3>📋 Logged Workouts:</h3>
          <ul>
            {workouts.map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default WorkoutForm;
