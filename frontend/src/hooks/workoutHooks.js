import { useState, useEffect, useMemo } from 'react';
import { workoutData } from '../data/workoutData';

export const useWorkoutNavigation = () => {
  const [selectedBlock, setSelectedBlock] = useState('quadruple block');
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [selectedDay, setSelectedDay] = useState('Monday (1st Squat)');
  
  const availableBlocks = Object.keys(workoutData.blocks);
  
  const availableWeeks = useMemo(() => {
    return selectedBlock ? Object.keys(workoutData.blocks[selectedBlock].weeks) : [];
  }, [selectedBlock]);
  
  const availableDays = useMemo(() => {
    return selectedBlock && selectedWeek ? 
      Object.keys(workoutData.blocks[selectedBlock].weeks[selectedWeek].days) : [];
  }, [selectedBlock, selectedWeek]);
  
  // Auto-select first available day when week changes
  useEffect(() => {
    if (availableDays.length > 0 && !availableDays.includes(selectedDay)) {
      setSelectedDay(availableDays[0]);
    }
  }, [selectedWeek, availableDays, selectedDay]);
  
  // Auto-select first week when block changes
  useEffect(() => {
    if (availableWeeks.length > 0 && !availableWeeks.includes(selectedWeek)) {
      setSelectedWeek(availableWeeks[0]);
    }
  }, [selectedBlock, availableWeeks, selectedWeek]);

  return {
    selectedBlock,
    selectedWeek,
    selectedDay,
    availableBlocks,
    availableWeeks,
    availableDays,
    setSelectedBlock,
    setSelectedWeek,
    setSelectedDay
  };
};

export const useWorkoutData = (selectedBlock, selectedWeek, selectedDay) => {
  const [workoutExercises, setWorkoutExercises] = useState([]);

  // Load workout data when selection changes
  useEffect(() => {
    if (selectedBlock && selectedWeek && selectedDay) {
      const currentWorkout = workoutData.blocks[selectedBlock].weeks[selectedWeek].days[selectedDay] || [];
      setWorkoutExercises([...currentWorkout]);
    }
  }, [selectedBlock, selectedWeek, selectedDay]);

  const handleExerciseUpdate = (originalIndex, updatedExercise) => {
    setWorkoutExercises(prev => {
      const newExercises = [...prev];
      newExercises[originalIndex] = { ...updatedExercise };
      return newExercises;
    });
  };

  return {
    workoutExercises,
    handleExerciseUpdate
  };
};

export const useExerciseCategorization = (workoutExercises) => {
  return useMemo(() => {
    const topSets = [];
    const backdownSets = [];
    
    // Group exercises by name to identify top sets vs backdown sets
    const exerciseGroups = {};
    workoutExercises.forEach((exercise, index) => {
      if (!exerciseGroups[exercise.exercise]) {
        exerciseGroups[exercise.exercise] = [];
      }
      exerciseGroups[exercise.exercise].push({ ...exercise, originalIndex: index });
    });
    
    // Categorize sets - first occurrence is typically top set, rest are backdown
    Object.values(exerciseGroups).forEach(group => {
      group.forEach((exercise, index) => {
        if (index === 0) {
          topSets.push(exercise);
        } else {
          backdownSets.push(exercise);
        }
      });
    });
    
    return { topSets, backdownSets };
  }, [workoutExercises]);
};