import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Zap, Calculator } from 'lucide-react';
import { InputField, TextAreaField, StaticLabel } from '../ui/UIComponents';
import { sendNewDataToBackend } from '../../sheetsFunctions';
import WeightCalculator from './WeightCalculator';

export const WorkoutCard = ({ exercise, isTopSet, exerciseType, onUpdate, currentWeek, currentDay }) => {
  const [showWeightCalculator, setShowWeightCalculator] = useState(false);

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

  const handleWeightKeyDown = (e) => {
    if (e.key === 'Enter') {
      const newValue = e.target.value;
      sendTrackingUpdate('weightTaken', newValue);
    }
  };

  const handleRpeKeyDown = (e) => {
    if (e.key === 'Enter') {
      const newValue = e.target.value;
      sendTrackingUpdate('actual_rpe', newValue);
    }
  };

  const handleNotesKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const newValue = e.target.value;
      sendTrackingUpdate('notes', newValue);
    }
  };

  const handleWeightChange = (newWeight) => {
    onUpdate({ ...exercise, weightTaken: newWeight });
  };

  const handleActualRpeChange = (newRpe) => {
    onUpdate({ ...exercise, actual_rpe: newRpe });
  };

  const handleNotesChange = (newNotes) => {
    onUpdate({ ...exercise, notes: newNotes });
  };

  const shouldShowWeightCalculator = () => {
    return exerciseType === 'topset' || exerciseType === 'backdown' || 
           (exerciseType === undefined && (isTopSet || !isTopSet));
  };

  const getBadgeProperties = () => {
    switch (exerciseType) {
      case 'topset':
        return {
          icon: <TrendingUp size={14} />,
          text: 'Top Set',
          className: 'top-set'
        };
      case 'backdown':
        return {
          icon: <TrendingDown size={14} />,
          text: 'Backdown',
          className: 'backdown-set'
        };
      case 'accessory':
        return {
          icon: <Zap size={14} />,
          text: 'Accessory',
          className: 'accessory-set'
        };
      default:
        return {
          icon: isTopSet ? <TrendingUp size={14} /> : <TrendingDown size={14} />,
          text: isTopSet ? 'Top Set' : 'Backdown',
          className: isTopSet ? 'top-set' : 'backdown-set'
        };
    }
  };

  const badgeProps = getBadgeProperties();

  return (
    <div className={`workout-card ${badgeProps.className}`}>
      <div className="card-header">
        <h3 className="card-title">{exercise.exercise}</h3>
        <span className={`card-badge ${badgeProps.className}`}>
          {badgeProps.icon}
          {badgeProps.text}
        </span>
      </div>
      
      <div className="card-grid">
        <StaticLabel label="Sets" value={exercise.sets} />
        <StaticLabel label="Reps" value={exercise.reps} />
        
        <div className="input-field">
          <label>Weight (kg)</label>
          <div className="weight-input-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              value={exercise.weightTaken || ''}
              onChange={(e) => handleWeightChange(e.target.value)}
              onKeyDown={handleWeightKeyDown}  
              placeholder="ex. 100"
              style={{ border: '1px solid #ccc', padding: '8px', flex: '1' }}
            />
            {shouldShowWeightCalculator() && exercise.weightTaken && (
              <button
                onClick={() => setShowWeightCalculator(!showWeightCalculator)}
                className="weight-calc-btn"
                style={{
                  padding: '8px',
                  border: '1px solid #3b82f6',
                  backgroundColor: showWeightCalculator ? '#3b82f6' : 'white',
                  color: showWeightCalculator ? 'white' : '#3b82f6',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: '36px',
                  justifyContent: 'center'
                }}
                title="Show plate configuration"
              >
                <Calculator size={16} />
              </button>
            )}
          </div>
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
      
      {shouldShowWeightCalculator() && showWeightCalculator && exercise.weightTaken && (
        <div style={{ 
          marginTop: '16px', 
          padding: '16px', 
          backgroundColor: '#f8fafc', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Plate Configuration for {exercise.weightTaken}kg:
          </div>
          <WeightCalculator initialWeight={parseFloat(exercise.weightTaken) || 20} compact={true} />
        </div>
      )}
      
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