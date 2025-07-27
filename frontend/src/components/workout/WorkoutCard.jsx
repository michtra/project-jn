import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { InputField, TextAreaField, StaticLabel } from '../ui/UIComponents';

export const WorkoutCard = ({ exercise, exerciseType = 'main', onUpdate }) => {
  const handleWeightChange = (newWeight) => {
    onUpdate({ ...exercise, weightTaken: newWeight });
  };

  const handleActualRpeChange = (newRpe) => {
    onUpdate({ ...exercise, actual_rpe: newRpe });
  };

  const handleNotesChange = (newNotes) => {
    onUpdate({ ...exercise, notes: newNotes });
  };

  // Determine icon, label, and styling based on exercise type
  const getExerciseConfig = () => {
    switch (exerciseType) {
      case 'main':
        return {
          icon: <TrendingUp size={14} />,
          label: 'Main Exercise',
          cardClass: 'main-exercise',
          badgeClass: 'main-exercise'
        };
      case 'backdown':
        return {
          icon: <TrendingDown size={14} />,
          label: 'Backdown',
          cardClass: 'backdown-set',
          badgeClass: 'backdown-set'
        };
      case 'accessory':
        return {
          icon: <Activity size={14} />,
          label: 'Accessory',
          cardClass: 'accessory-set',
          badgeClass: 'accessory-set'
        };
      default:
        return {
          icon: <TrendingUp size={14} />,
          label: 'Exercise',
          cardClass: 'main-exercise',
          badgeClass: 'main-exercise'
        };
    }
  };

  const config = getExerciseConfig();

  return (
    <div className={`workout-card ${config.cardClass}`}>
      <div className="card-header">
        <h3 className="card-title">{exercise.exercise}</h3>
        <span className={`card-badge ${config.badgeClass}`}>
          {config.icon}
          {config.label}
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