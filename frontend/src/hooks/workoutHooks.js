import { useState, useEffect, useMemo } from 'react';

// Hook for navigation between blocks, weeks, and days
export function useWorkoutNavigation(flaskData = null) {
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  // Get available weeks from Flask data structure
  const availableWeeks = useMemo(() => {
    if (!flaskData) return [];
    return Object.keys(flaskData);
  }, [flaskData]);

  // Get available days for the selected week
  const availableDays = useMemo(() => {
    if (!flaskData?.[selectedWeek]) return [];
    return Object.keys(flaskData[selectedWeek]);
  }, [flaskData, selectedWeek]);

  // Auto-select first available options when data changes
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeek) {
      setSelectedWeek(availableWeeks[0]);
    }
  }, [availableWeeks, selectedWeek]);

  useEffect(() => {
    if (availableDays.length > 0 && !selectedDay) {
      setSelectedDay(availableDays[0]);
    }
  }, [availableDays, selectedDay]);

  // Reset selections when data changes
  useEffect(() => {
    if (flaskData) {
      setSelectedWeek('');
      setSelectedDay('');
    }
  }, [flaskData]);

  return {
    selectedWeek,
    selectedDay,
    availableWeeks,
    availableDays,
    setSelectedWeek,
    setSelectedDay
  };
}

// Hook for managing workout data and exercise updates
export function useWorkoutData(selectedWeek, selectedDay, flaskData) {
  const [localExercises, setLocalExercises] = useState([]);

  // Convert Flask data structure to exercise array
  const workoutExercises = useMemo(() => {
    if (!flaskData?.[selectedWeek]?.[selectedDay]) {
      return [];
    }
    
    const dayExercises = flaskData[selectedWeek][selectedDay];
    const exercises = [];
    
    // Convert Flask exercise object to array
    Object.keys(dayExercises).forEach((exerciseName, index) => {
      const exerciseData = dayExercises[exerciseName];
      
      // Handle rest day
      if (exerciseName === "Rest") {
        exercises.push({
          id: `${selectedWeek}-${selectedDay}-rest`,
          exercise: "Rest",
          sets: 0,
          reps: 0,
          prescribed: "Rest",
          weight: "",
          rpe: "",
          notes: "Rest Day",
          actualWeight: "",
          actualRpe: "",
          actualNotes: "",
          originalIndex: index
        });
        return;
      }
      
      // Regular exercise
      exercises.push({
        id: `${selectedWeek}-${selectedDay}-${exerciseName}-${index}`,
        exercise: exerciseName,
        prescribed: exerciseData.Prescribed || "",
        weight: exerciseData.Weight || "",
        rpe: exerciseData.RPE || "",
        notes: exerciseData.Notes || "",
        // Parse sets and reps from prescribed format (e.g., "3x5" -> sets: 3, reps: 5)
        sets: parseSets(exerciseData.Prescribed),
        reps: parseReps(exerciseData.Prescribed),
        // Fields for actual performance logging
        actualWeight: exerciseData.Weight || "",
        actualRpe: exerciseData.RPE || "",
        actualNotes: exerciseData.Notes || "",
        originalIndex: index
      });
    });
    
    return exercises;
  }, [flaskData, selectedWeek, selectedDay]);

  // Update local exercises when workout exercises change
  useEffect(() => {
    setLocalExercises(workoutExercises);
  }, [workoutExercises]);

  // Handle exercise updates (for logging actual weights, RPE, etc.)
  const handleExerciseUpdate = (exerciseId, updates) => {
    setLocalExercises(prev => 
      prev.map(exercise => 
        exercise.id === exerciseId 
          ? { ...exercise, ...updates }
          : exercise
      )
    );
  };

  // Get exercise by ID
  const getExerciseById = (exerciseId) => {
    return localExercises.find(exercise => exercise.id === exerciseId);
  };

  // Reset all exercises to prescribed values
  const resetExercises = () => {
    setLocalExercises(workoutExercises);
  };

  return {
    workoutExercises: localExercises,
    handleExerciseUpdate,
    getExerciseById,
    resetExercises
  };
}

// Hook for categorizing exercises into top sets and backdown sets
export function useExerciseCategorization(exercises) {
  const { topSets, backdownSets } = useMemo(() => {
    const top = [];
    const backdown = [];
    
    exercises.forEach(exercise => {
      // Check if exercise name contains "Backdown" or similar indicators
      if (exercise.exercise.toLowerCase().includes('backdown') || 
          exercise.exercise.toLowerCase().includes('back down') ||
          exercise.exercise.includes('(Backdown)')) {
        backdown.push(exercise);
      } else if (exercise.exercise === "Rest") {
        // Rest days go to top sets section
        top.push(exercise);
      } else {
        top.push(exercise);
      }
    });
    
    return { topSets: top, backdownSets: backdown };
  }, [exercises]);

  return { topSets, backdownSets };
}

// Utility functions to parse prescribed format
function parseSets(prescribed) {
  if (!prescribed || prescribed === "Rest") return 0;
  const match = prescribed.match(/^(\d+)x/);
  return match ? parseInt(match[1]) : 1;
}

function parseReps(prescribed) {
  if (!prescribed || prescribed === "Rest") return 0;
  const match = prescribed.match(/x(\d+)/);
  return match ? parseInt(match[1]) : 1;
}

// Hook for workout statistics
export function useWorkoutStats(exercises) {
  const stats = useMemo(() => {
    const totalExercises = exercises.filter(ex => ex.exercise !== "Rest").length;
    const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
    const completedSets = exercises.filter(ex => ex.actualWeight && ex.actualWeight !== "").length;
    const restDay = exercises.some(ex => ex.exercise === "Rest");
    
    return {
      totalExercises,
      totalSets,
      completedSets,
      completionPercentage: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
      isRestDay: restDay
    };
  }, [exercises]);

  return stats;
}