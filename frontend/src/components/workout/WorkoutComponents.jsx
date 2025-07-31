import React from 'react';
import { Activity } from 'lucide-react';
import { Select } from '../ui/UIComponents';
import { WorkoutCard } from './WorkoutCard';

export const WorkoutSummary = ({ exercises }) => {
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const totalVolume = exercises.reduce((sum, ex) => 
    sum + (ex.weightTaken ? parseFloat(ex.weightTaken) * ex.sets * ex.reps : 0), 0
  );
  const mainLifts = exercises.filter(ex => 
    ['Squat', 'Bench', 'Deadlift'].includes(ex.exercise)
  ).length;
  
  return (
    <div className="workout-summary">
      <h2>
        <Activity size={20} />
        Workout Summary
      </h2>
      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-value blue">{totalSets}</div>
          <div className="summary-label">Total Sets</div>
        </div>
        <div className="summary-item">
          <div className="summary-value teal">{Math.round(totalVolume).toLocaleString()}</div>
          <div className="summary-label">Volume (kg)</div>
        </div>
        <div className="summary-item">
          <div className="summary-value green">{mainLifts}</div>
          <div className="summary-label">Main Lifts</div>
        </div>
      </div>
    </div>
  );
};

export const WorkoutNavigation = ({ 
  selectedBlock, 
  selectedWeek, 
  selectedDay, 
  availableBlocks, 
  availableWeeks, 
  availableDays,
  onBlockChange,
  onWeekChange,
  onDayChange
}) => {
  return (
    <div className="workout-navigation">
      <h2>Workout Selection</h2>
      <div className="navigation-grid">
        <Select
          label="Block"
          value={selectedBlock}
          onChange={onBlockChange}
          options={availableBlocks.map(block => ({
            value: block,
            label: block.charAt(0).toUpperCase() + block.slice(1)
          }))}
        />
        <Select
          label="Week"
          value={selectedWeek}
          onChange={onWeekChange}
          options={availableWeeks.map(week => ({
            value: week,
            label: `Week ${week}`
          }))}
        />
        <Select
          label="Day"
          value={selectedDay}
          onChange={onDayChange}
          options={availableDays.map(day => ({
            value: day,
            label: day
          }))}
        />
      </div>
    </div>
  );
};

export const ExerciseSection = ({ title, exercises, isTopSet, onExerciseUpdate, icon: Icon, titleColor, selectedDay, selectedWeek }) => {
  if (exercises.length === 0) return null;

  return (
    <div className="exercise-section">
      <h2 className={titleColor}>
        <Icon size={24} />
        {title}
      </h2>
      {exercises.map((exercise, index) => (
        <WorkoutCard 
          key={`${isTopSet ? 'top' : 'backdown'}-${exercise.originalIndex}`}
          exercise={exercise} 
          isTopSet={isTopSet}
          onUpdate={(updatedExercise) => onExerciseUpdate(exercise.originalIndex, updatedExercise)}
          currentWeek={selectedWeek}
          currentDay={selectedDay}
        />
      ))}
    </div>
  );
};

export const EmptyWorkoutMessage = ({ selectedDay }) => {
  return (
    <div className="empty-message">
      <div className="empty-message-content">
        <Activity size={20} />
        <span>No workout data available for {selectedDay}. This might be a rest day or the data hasn't been entered yet.</span>
      </div>
    </div>
  );
};