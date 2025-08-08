import React, { useState, useEffect } from 'react';
import './App.css';
import GoogleSignIn from './components/ui/GoogleSignIn';
import { TrendingDown, Dumbbell, FileSpreadsheet, Target, Zap, Calculator, ArrowLeft } from 'lucide-react';
import { useWorkoutNavigation, useWorkoutData, useExerciseCategorization } from './hooks/workoutHooks';
import {
  WorkoutSummary,
  ExerciseSection,
  EmptyWorkoutMessage
} from './components/workout/WorkoutComponents';
import WeightCalculator from './components/workout/WeightCalculator';
import { 
  loadSheets, 
  getSheetDataAndProcessWithFlask, 
  setAuthToken,
  setSpreadSheetId
} from './sheetsFunctions';

const PlApp = () => {
  const [user, setUser] = useState(null);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState(null);
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [sheetsError, setSheetsError] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [flaskData, setFlaskData] = useState(null);
  const [isProcessingData, setIsProcessingData] = useState(false);

  const [currentView, setCurrentView] = useState('main'); // 'main' | 'weight-calculator'

  const {
    selectedWeek,
    selectedDay,
    availableWeeks,
    availableDays,
    setSelectedWeek,
    setSelectedDay
  } = useWorkoutNavigation(flaskData);

  const { workoutExercises, handleExerciseUpdate } = useWorkoutData(
    selectedWeek,
    selectedDay,
    flaskData
  );

  const { topSets, backdownSets, accessories } = useExerciseCategorization(workoutExercises);

  const handleWorkoutCardUpdate = (originalIndex, updatedExercise) => {
    const exercise = workoutExercises.find(ex => ex.originalIndex === originalIndex);
    if (exercise) {
      const oldEx = exercise;
      const newEx = updatedExercise;

      if (oldEx.weightTaken !== newEx.weightTaken) {
        handleExerciseUpdate(exercise.id, 'actualWeight', newEx.weightTaken);
      }
      if (oldEx.actual_rpe !== newEx.actual_rpe) {
        handleExerciseUpdate(exercise.id, 'actualRpe', newEx.actual_rpe);
      }
      if (oldEx.notes !== newEx.notes) {
        handleExerciseUpdate(exercise.id, 'actualNotes', newEx.notes);
      }
    }
  };

  useEffect(() => {
    if (user && user.accessToken) {
      setAuthToken(user.accessToken);
      handleLoadSheets();
    } else {
      setAuthToken(null);
      setAvailableSheets([]);
      setSelectedSheetId(null);
      setSelectedSheetName('');
      setSheetData(null);
      setFlaskData(null);
    }
  }, [user]);

  const handleLoadSheets = async () => {
    setIsLoadingSheets(true);
    setSheetsError(null);

    try {
      const sheets = await loadSheets();
      setAvailableSheets(sheets);
    } catch (error) {
      setSheetsError('Failed to load spreadsheets. Please try signing in again.');
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const handleSignOut = () => {
    setAuthToken(null);
    setUser(null);
    setAvailableSheets([]);
    setSelectedSheetId(null);
    setSelectedSheetName('');
    setSheetData(null);
    setFlaskData(null);
    setCurrentView('main');
  };

  const handleSheetSelect = async (sheetId, sheetName) => {
    setSelectedSheetId(sheetId);
    setSelectedSheetName(sheetName);
    setSheetsError(null);
    setIsProcessingData(true);
    setSpreadSheetId(sheetId);

    try {
      const result = await getSheetDataAndProcessWithFlask(sheetId, 'A1:U58');
      setSheetData(result.rawData);
      setFlaskData(result.processedData);
    } catch (error) {
      setSheetsError(`Failed to load and process data from "${sheetName}". Please check your permissions and Flask backend connection.`);
      setSheetData(null);
      setFlaskData(null);
    } finally {
      setIsProcessingData(false);
    }
  };

  if (!user) {
    return (
      <div className="app-container">
        <GoogleSignIn onUserLoaded={setUser} />
      </div>
    );
  }

  // Weight Calculator view
  if (currentView === 'weight-calculator') {
    return (
      <div className="app-container">
        <div className="main-content">
          <header className="app-header">
            {/* left slot */}
            <div className="header-left-slot">
              <button
                onClick={() => setCurrentView('main')}
                className="btn btn-gray"
              >
                <ArrowLeft size={20} />
                Back to App
              </button>
            </div>

            {/* centered title */}
            <div className="header-right">
              <Calculator size={32} />
              <h1 className="header-title">Weight Calculator</h1>
            </div>

            {/* right actions */}
            <div className="header-actions">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <button onClick={handleSignOut} className="btn btn-red text-sm">
                Sign Out
              </button>
            </div>
          </header>

          <WeightCalculator />
        </div>
      </div>
    );
  }

  // Main app view
  return (
    <div className="app-container">
      <div className="main-content">
        <header className="app-header">
          {/* empty left slot */}
          <div className="header-left-slot" />

          {/* centered title */}
          <div className="header-center">
            <Dumbbell size={40} />
            <h1 className="header-title">project jn</h1>
          </div>

          {/* top-right actions */}
          <div className="header-actions">
            <button
              onClick={() => setCurrentView('weight-calculator')}
              className="btn btn-blue text-sm"
            >
              <Calculator size={16} />
              Weight Calculator
            </button>
            <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            <button onClick={handleSignOut} className="btn btn-red text-sm">
              Sign Out
            </button>
          </div>
        </header>

        {/* Sheets Selection Section */}
        <div className="sheets-section">
          <h2 className="sheets-title">
            <FileSpreadsheet size={24} />
            Select Workout Spreadsheet
          </h2>

          {isLoadingSheets ? (
            <div className="status-message status-loading">
              <span className="loading-spinner" /> Loading spreadsheets...
            </div>
          ) : sheetsError ? (
            <div className="status-message status-error">
              <p className="font-medium">Error:</p>
              <p>{sheetsError}</p>
              <button onClick={handleLoadSheets} className="btn btn-red mt-2 text-sm">
                Retry
              </button>
            </div>
          ) : availableSheets.length === 0 ? (
            <div className="empty-state">
              <FileSpreadsheet size={48} className="empty-state-icon" />
              <p className="empty-state-text">No spreadsheets found</p>
              <button onClick={handleLoadSheets} className="btn btn-blue mt-2">
                Refresh
              </button>
            </div>
          ) : (
            <div>
              <div className="sheets-grid">
                {availableSheets.map((sheet) => (
                  <button
                    key={sheet.id}
                    onClick={() => handleSheetSelect(sheet.id, sheet.name)}
                    disabled={isProcessingData}
                    className={`sheet-card ${selectedSheetId === sheet.id ? 'selected' : ''}`}
                  >
                    <div className="sheet-name">{sheet.name}</div>
                    {selectedSheetId === sheet.id && (
                      <div className="sheet-selected">✓ Selected</div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={handleLoadSheets}
                disabled={isProcessingData}
                className="btn btn-green mt-2"
              >
                Refresh Spreadsheets
              </button>
            </div>
          )}
        </div>

        {isProcessingData && (
          <div className="status-message status-loading">
            <span className="loading-spinner" /> Processing sheet data with Flask backend...
          </div>
        )}

        {selectedSheetId && flaskData && (
          <>
            <div className="workout-navigation">
              <h3 className="navigation-title">Workout Navigation</h3>
              <div className="navigation-grid">
                <div className="form-group">
                  <label className="form-label">Week</label>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select Week</option>
                    {availableWeeks.map((week) => (
                      <option key={week} value={week}>
                        {week}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="form-select"
                    disabled={!selectedWeek}
                  >
                    <option value="">Select Day</option>
                    {availableDays.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {workoutExercises.length === 0 ? (
              <EmptyWorkoutMessage selectedDay={selectedDay} />
            ) : (
              <>
                <WorkoutSummary exercises={workoutExercises} />

                {topSets.length > 0 && (
                  <ExerciseSection
                    title="Top Sets"
                    exercises={topSets}
                    isTopSet={true}
                    onExerciseUpdate={handleWorkoutCardUpdate}
                    icon={Target}
                    titleColor="red"
                    selectedDay={selectedDay}
                    selectedWeek={selectedWeek}
                  />
                )}

                {backdownSets.length > 0 && (
                  <ExerciseSection
                    title="Backdown Sets"
                    exercises={backdownSets}
                    isTopSet={false}
                    onExerciseUpdate={handleWorkoutCardUpdate}
                    icon={TrendingDown}
                    titleColor="orange"
                    selectedDay={selectedDay}
                    selectedWeek={selectedWeek}
                  />
                )}

                {accessories.length > 0 && (
                  <ExerciseSection
                    title="Accessory Exercises"
                    exercises={accessories}
                    isTopSet={false}
                    onExerciseUpdate={handleWorkoutCardUpdate}
                    icon={Zap}
                    titleColor="purple"
                    selectedDay={selectedDay}
                    selectedWeek={selectedWeek}
                  />
                )}
              </>
            )}
          </>
        )}

        {selectedSheetId && !flaskData && !sheetsError && !isProcessingData && (
          <div className="status-message">
            <p>Loading sheet data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlApp;
