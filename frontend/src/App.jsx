import React from 'react';
import { TrendingUp, TrendingDown, Dumbbell } from 'lucide-react';
import { useWorkoutNavigation, useWorkoutData, useExerciseCategorization } from './hooks/workoutHooks';
import { 
  WorkoutSummary, 
  WorkoutNavigation, 
  ExerciseSection, 
  EmptyWorkoutMessage 
} from './components/workout/WorkoutComponents';

const PlApp = () => {
  const {
    selectedBlock,
    selectedWeek,
    selectedDay,
    availableBlocks,
    availableWeeks,
    availableDays,
    setSelectedBlock,
    setSelectedWeek,
    setSelectedDay
  } = useWorkoutNavigation();

  const { workoutExercises, handleExerciseUpdate } = useWorkoutData(
    selectedBlock, 
    selectedWeek, 
    selectedDay
  );

  const { topSets, backdownSets } = useExerciseCategorization(workoutExercises);
  
  return (
    <div className="app-container">
      <div className="main-content">
        <h1 className="app-header">
          <Dumbbell size={40} />
          project jn
        </h1>
        
        <WorkoutNavigation
          selectedBlock={selectedBlock}
          selectedWeek={selectedWeek}
          selectedDay={selectedDay}
          availableBlocks={availableBlocks}
          availableWeeks={availableWeeks}
          availableDays={availableDays}
          onBlockChange={(e) => setSelectedBlock(e.target.value)}
          onWeekChange={(e) => setSelectedWeek(e.target.value)}
          onDayChange={(e) => setSelectedDay(e.target.value)}
        />
        
        {workoutExercises.length === 0 ? (
          <EmptyWorkoutMessage selectedDay={selectedDay} />
        ) : (
          <>
            <WorkoutSummary exercises={workoutExercises} />
            
            <ExerciseSection
              title="Top Sets"
              exercises={topSets}
              isTopSet={true}
              onExerciseUpdate={handleExerciseUpdate}
              icon={TrendingUp}
              titleColor="blue"
            />
            
            <ExerciseSection
              title="Backdown Sets"
              exercises={backdownSets}
              isTopSet={false}
              onExerciseUpdate={handleExerciseUpdate}
              icon={TrendingDown}
              titleColor="teal"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PlApp;