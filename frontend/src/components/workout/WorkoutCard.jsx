import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { InputField, TextAreaField, StaticLabel } from '../ui/UIComponents';

export const WorkoutCard = ({ exercise, isTopSet, onUpdate }) => {
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
          <InputField
            label="Weight (kg)"
            value={exercise.weightTaken}
            onChange={handleWeightChange}
            placeholder="Enter weight"
            type="number"
          />
        </div>
        
        <div className="rpe-container">
          <div className="label">RPE</div>
          <div className="rpe-controls">
            <InputField
              value={exercise.actual_rpe}
              onChange={handleActualRpeChange}
              placeholder="Actual"
              type="number"
              className="narrow"
            />
            <span className="rpe-separator">/</span>
            <div className="rpe-prescribed">{exercise.prescribed_rpe}</div>
          </div>
        </div>
      </div>
      
      <TextAreaField
        label="Notes"
        value={exercise.notes}
        onChange={handleNotesChange}
        placeholder="Add workout notes..."
        className="textarea-field"
      />
    </div>
  );
};