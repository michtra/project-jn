import React, { useState, useEffect } from 'react';
import GoogleSignIn from './components/ui/GoogleSignIn';
import { Dumbbell, FileSpreadsheet } from 'lucide-react';
import { useWorkoutNavigation, useWorkoutData, useExerciseCategorization } from './hooks/workoutHooks';
import {
  WorkoutSummary,
  ExerciseSection,
  EmptyWorkoutMessage
} from './components/workout/WorkoutComponents';
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
  const [weightUnit, setWeightUnit] = useState('lbs'); // 'kg' or 'lbs'

  // Use Flask data structure with navigation hooks
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
    flaskData // Use Flask processed data directly
  );

  const handleWorkoutCardUpdate = (originalIndex, updatedExercise) => {
    console.log('App received update:', { originalIndex, updatedExercise });
    
    // Find the exercise by originalIndex
    const exercise = workoutExercises.find(ex => ex.originalIndex === originalIndex);
    if (exercise) {
      // Determine what field changed by comparing old vs new
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
      console.log('Loaded sheets:', sheets);
    } catch (error) {
      console.error('Error loading sheets:', error);
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
  };

  const handleSheetSelect = async (sheetId, sheetName) => {
    setSelectedSheetId(sheetId);
    setSelectedSheetName(sheetName);
    setSheetsError(null);
    setIsProcessingData(true);
    setSpreadSheetId(sheetId);

    try {
      console.log(`Loading and processing data from sheet: ${sheetName}`);
      
      // Get sheet data and process it with Flask backend
      const result = await getSheetDataAndProcessWithFlask(sheetId, 'A1:U58');
      
      console.log('Sheet data loaded and processed by Flask:', result);
      setSheetData(result.rawData);
      setFlaskData(result.processedData);
      
    } catch (error) {
      console.error('Error loading/processing sheet data:', error);
      setSheetsError(`Failed to load and process data from "${sheetName}". Please check your permissions and Flask backend connection.`);
      setSheetData(null);
      setFlaskData(null);
    } finally {
      setIsProcessingData(false);
    }
  };

  if (!user) {
    return (
      <div className='app-container'>
        <GoogleSignIn onUserLoaded={setUser} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-content">
        <header className="app-header">
          <div>
            <Dumbbell size={40} />
            <h1>project jn</h1>
          </div>
          <div>
            <span>
              Welcome, {user.name}
            </span>
            <button
              onClick={handleSignOut}
              className="bg-red-500"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Sheets Selection Section */}
        <div className="sheets-section">
          <h2>
            <FileSpreadsheet size={24} />
            Select Workout Spreadsheet
          </h2>

          {isLoadingSheets ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2" style={{ color: '#94a3b8' }}>
                <div className="animate-spin"></div>
                Loading spreadsheets...
              </div>
            </div>
          ) : sheetsError ? (
            <div className="bg-red-50">
              <p className="font-medium">Error:</p>
              <p>{sheetsError}</p>
              <button
                onClick={handleLoadSheets}
                className="mt-2 bg-red-500"
              >
                Retry
              </button>
            </div>
          ) : availableSheets.length === 0 ? (
            <div className="bg-gray-50">
              <FileSpreadsheet size={48} className="text-gray-400" />
              <p className="text-gray-500">No spreadsheets found</p>
              <button
                onClick={handleLoadSheets}
                className="mt-2 bg-blue-500"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                    Spreadsheet
                  </label>
                  <select
                    value={selectedSheetId || ''}
                    onChange={(e) => {
                      const sheetId = e.target.value;
                      const sheet = availableSheets.find(s => s.id === sheetId);
                      if (sheet) {
                        handleSheetSelect(sheet.id, sheet.name);
                      }
                    }}
                    disabled={isProcessingData}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '0.5rem',
                      background: 'rgba(51, 65, 85, 0.5)',
                      color: '#f1f5f9',
                      fontSize: '0.95rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {!selectedSheetId && <option value="">Select a spreadsheet</option>}
                    {availableSheets.slice(0, 2).map((sheet) => ( /** ONLY SHOW TWO SPREADSHEETS FOR DEMO PURPOSES **/
                      <option key={sheet.id} value={sheet.id}>
                        {sheet.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleLoadSheets}
                  disabled={isProcessingData}
                  className="bg-green-500"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Show processing status */}
        {isProcessingData && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <p className="font-medium" style={{ color: '#93c5fd' }}>
                Processing sheet data with Flask backend...
              </p>
            </div>
          </div>
        )}

        {/* Only show workout navigation if data is processed */}
        {selectedSheetId && flaskData && (
          <>
            <div className="workout-navigation">
              <h3 className="text-lg font-semibold mb-4">Workout Navigation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Week
                  </label>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Week</option>
                    {availableWeeks.map((week) => (
                      <option key={week} value={week}>
                        {week}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Day
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Weight Unit
                  </label>
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="lbs">Pounds (lbs)</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
              </div>
            </div>

            {workoutExercises.length === 0 ? (
              <EmptyWorkoutMessage selectedDay={selectedDay} />
            ) : (
              <>
                <WorkoutSummary exercises={workoutExercises} weightUnit={weightUnit} />

                <ExerciseSection
                  title="Workout"
                  exercises={workoutExercises}
                  isTopSet={false}
                  onExerciseUpdate={handleWorkoutCardUpdate}
                  icon={Dumbbell}
                  titleColor="blue"
                  selectedDay={selectedDay}
                  selectedWeek={selectedWeek}
                  weightUnit={weightUnit}
                />
              </>
            )}
          </>
        )}

        {/* Show message if sheet is selected but no data processed yet */}
        {selectedSheetId && !flaskData && !sheetsError && !isProcessingData && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
              Loading sheet data...
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default PlApp;