import { useState, useEffect, useMemo, useCallback } from 'react';
// NO backend imports - all tracking done in WorkoutCard now

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

// CLEAN useWorkoutData - only manages local state, no backend tracking
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
          originalIndex: index,
          // Add fields that WorkoutCard expects
          weightTaken: "",
          actual_rpe: ""
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

        // Parse sets and reps from prescribed format ( "3x5" -> sets: 3, reps: 5)
        sets: parseSets(exerciseData.Prescribed),
        reps: parseReps(exerciseData.Prescribed),

        // Fields for actual performance logging (workoutHooks format)
        actualWeight: exerciseData.Weight || "",
        actualRpe: exerciseData.RPE || "",
        actualNotes: exerciseData.Notes || "",
        
        // Fields that WorkoutCard expects
        weightTaken: exerciseData.Weight || "",
        actual_rpe: exerciseData.RPE || "",
        
        originalIndex: index
      });
    });
    
    return exercises;
  }, [flaskData, selectedWeek, selectedDay]);

  // Update local exercises when workout exercises change
  useEffect(() => {
    setLocalExercises(workoutExercises);
  }, [workoutExercises]);

  const handleExerciseUpdate = useCallback((exerciseId, field, value) => {
    console.log('🔍 Local state update:', { exerciseId, field, value });
    
    // Map field names between workoutHooks and WorkoutCard formats
    const fieldMapping = {
      'actualWeight': 'weightTaken',
      'actualRpe': 'actual_rpe',
      'actualNotes': 'notes'
    };
    
    // Update local state with both field formats for compatibility
    setLocalExercises(prev => 
      prev.map(exercise => {
        if (exercise.id === exerciseId) {
          const updates = { [field]: value };
          
          // Also update the corresponding field in the other format
          if (fieldMapping[field]) {
            updates[fieldMapping[field]] = value;
          }
          
          return { ...exercise, ...updates };
        }
        return exercise;
      })
    );
  }, []);

  const getExerciseById = useCallback((exerciseId) => {
    return localExercises.find(exercise => exercise.id === exerciseId);
  }, [localExercises]);

  // Reset all exercises to prescribed values
  const resetExercises = useCallback(() => {
    setLocalExercises(workoutExercises);
  }, [workoutExercises]);

  return {
    workoutExercises: localExercises,
    handleExerciseUpdate,
    getExerciseById,
    resetExercises
  };
}

// Hook for categorizing exercises into top sets and backdown sets
export function useExerciseCategorization(exercises) {
  const { topSets, backdownSets, accessories } = useMemo(() => {
    // Safety check for undefined or non-array exercises
    if (!exercises || !Array.isArray(exercises)) {
      return { topSets: [], backdownSets: [], accessories: [] };
    }

    const topSets = [];
    const backdownSets = [];
    const accessories = [];

    // Helper function to check if exercise is a competition movement
    const isCompetitionMovement = (exerciseName) => {
      if (!exerciseName) return false;
      
      const name = exerciseName.toLowerCase().trim();
      
      const compPatterns = [
        'comp sq',
        'comp bench', 
        'comp deadlift',
        'comp dl',
        'competition squat',
        'competition bench',
        'competition deadlift'
      ];
      
      return compPatterns.some(pattern => name.includes(pattern));
    };

    // Helper function to check if exercise is labeled as backdown
    const isBackdownSet = (exerciseName) => {
      if (!exerciseName) return false;
      
      const name = exerciseName.toLowerCase();
      
      return name.includes('backdown') || 
             name.includes('back down') || 
             name.includes('(backdown)');
    };

    exercises.forEach(exercise => {
      // Handle rest days
      if (exercise.exercise === "Rest") {
        topSets.push(exercise);
        return;
      }

      // First check if it's labeled as backdown (takes priority)
      if (isBackdownSet(exercise.exercise)) {
        backdownSets.push(exercise);
      }
      // Then check if it's a competition movement (and not backdown)
      else if (isCompetitionMovement(exercise.exercise)) {
        topSets.push(exercise);
      }
      // Everything else is an accessory
      else {
        accessories.push(exercise);
      }
    });

    console.log('📊 Exercise Categorization:');
    console.log(`🎯 Top Sets (Comp lifts): ${topSets.length}`);
    console.log(`📉 Backdown Sets: ${backdownSets.length}`);
    console.log(`💪 Accessories: ${accessories.length}`);

    return { topSets, backdownSets, accessories };
  }, [exercises]);

  return { topSets, backdownSets, accessories };
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