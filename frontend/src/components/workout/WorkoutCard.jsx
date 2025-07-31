import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { InputField, TextAreaField, StaticLabel } from '../ui/UIComponents';
import { sendNewDataToBackend } from '../../sheetsFunctions';

export const WorkoutCard = ({ exercise, isTopSet, onUpdate, currentWeek, currentDay }) => {
  // Clean tracking function - only 4 fields
  const sendTrackingUpdate = async (field, newValue) => {
    const cleanData = {
      field: field,
      newValue: newValue,
      day: currentDay,
      week: currentWeek,
      exercise: exercise.exercise,
      prescribed: exercise.prescribed
    };

    try {
      await sendNewDataToBackend(cleanData);
      console.log('Data sent on Enter:', cleanData);
    } catch (error) {
      console.error('Failed to send data:', error);
    }
  };

  // Handle Enter key press for weight field
  const handleWeightKeyDown = (e) => {
    if (e.key === 'Enter') {
      const newValue = e.target.value;
      sendTrackingUpdate('weightTaken', newValue);
    }
  };

  // Handle Enter key press for RPE field
  const handleRpeKeyDown = (e) => {
    if (e.key === 'Enter') {
      const newValue = e.target.value;
      sendTrackingUpdate('actual_rpe', newValue);
    }
  };

  // Handle Enter key press for Notes field
  const handleNotesKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Allow Shift+Enter for new lines in notes
      const newValue = e.target.value;
      sendTrackingUpdate('notes', newValue);
    }
  };

  // Regular onChange handlers (no backend sending, just UI updates)
  const handleWeightChange = (newWeight) => {
    onUpdate({ ...exercise, weightTaken: newWeight });
  };

  const handleActualRpeChange = (newRpe) => {
    onUpdate({ ...exercise, actual_rpe: newRpe });
  };

  const handleNotesChange = (newNotes) => {
    onUpdate({ ...exercise, notes: newNotes });
  };

  return (
  <div className={`workout-card ${isTopSet ? 'top-set' : 'backdown-set'}`}>
    <div className="card-header">
      <h3 className="card-title">{exercise.exercise}</h3>
      <span className={`card-badge ${isTopSet ? 'top-set' : 'backdown-set'}`}>
        {isTopSet ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {isTopSet ? 'Top Set' : 'Backdown'}
      </span>
    </div>
    
    <div className="card-grid">
      <StaticLabel label="Sets" value={exercise.sets} />
      <StaticLabel label="Reps" value={exercise.reps} />
      
      <div className="input-field">
        <label>Weight (kg)</label>
        <input
          type="number"
          value={exercise.weightTaken || ''}
          onChange={(e) => handleWeightChange(e.target.value)}
          onKeyDown={handleWeightKeyDown}  
          placeholder="ex. 100"
          style={{ border: '1px solid #ccc', padding: '8px', width: '100%' }}
        />
      </div>
      
      <div className="rpe-container">
        <label>RPE</label>
        <input
          type="number"
          value={exercise.actual_rpe || ''}
          onChange={(e) => handleActualRpeChange(e.target.value)}
          onKeyDown={handleRpeKeyDown}  
           placeholder={exercise.prescribed ? `${exercise.prescribed.split('@')[1] || exercise.prescribed}` : "ex. 6"}
          style={{ border: '1px solid #ccc', padding: '8px', width: '80px' }}
        />
      </div>
    </div>
    
    <div>
      <label>Notes</label>
      <textarea
        value={exercise.notes || ''}
        onChange={(e) => handleNotesChange(e.target.value)}
        onKeyDown={handleNotesKeyDown}  
        placeholder="Add notes"
        style={{ border: '1px solid #ccc', padding: '8px', width: '100%' }}
      />
    </div>

    <div className="text-xs text-gray-400 mt-2 text-center">
      💡 Press <kbd className="px-1 bg-gray-200 rounded">Enter</kbd> to save changes.
    </div>
  </div>
);
};