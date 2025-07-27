import React, { useState, useEffect } from 'react';
import GoogleSignIn from './components/ui/GoogleSignIn';
import { TrendingUp, TrendingDown, Dumbbell, FileSpreadsheet, Download, Activity } from 'lucide-react';
import { useWorkoutNavigation, useWorkoutData, useExerciseCategorization } from './hooks/workoutHooks';
import {
  WorkoutSummary,
  WorkoutNavigation,
  ExerciseSection,
  EmptyWorkoutMessage
} from './components/workout/WorkoutComponents';
import { 
  loadSheets, 
  getSheetDataAndProcessWithFlask, 
  setAuthToken,
  getLocalFlaskData,
  downloadFlaskDataAsFile 
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

  const { topSets, backdownSets, accessories } = useExerciseCategorization(workoutExercises);

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

  const handleDownloadData = () => {
    if (flaskData) {
      downloadFlaskDataAsFile(flaskData, `workoutData_${selectedSheetName.replace(/[^a-zA-Z0-9]/g, '_')}.js`);
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
        <header className="app-header flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Dumbbell size={40} />
            <h1 className="text-2xl font-bold">project jn</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.name}
            </span>
            {flaskData && (
              <button
                onClick={handleDownloadData}
                className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
              >
                <Download size={16} />
                Download Data
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Sheets Selection Section */}
        <div className="sheets-section mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileSpreadsheet size={24} />
            Select Workout Spreadsheet
          </h2>
          
          {isLoadingSheets ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                Loading spreadsheets...
              </div>
            </div>
          ) : sheetsError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">Error:</p>
              <p>{sheetsError}</p>
              <button 
                onClick={handleLoadSheets}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : availableSheets.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No spreadsheets found</p>
              <button 
                onClick={handleLoadSheets}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableSheets.map((sheet) => (
                  <button
                    key={sheet.id}
                    onClick={() => handleSheetSelect(sheet.id, sheet.name)}
                    disabled={isProcessingData}
                    className={`p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedSheetId === sheet.id 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium truncate text-gray-900">{sheet.name}</div>
                    <div className="text-sm text-gray-500 mt-1">Google Sheets</div>
                    {selectedSheetId === sheet.id && (
                      <div className="text-xs text-blue-600 mt-2 font-medium">
                        ✓ Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={handleLoadSheets}
                disabled={isProcessingData}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                Refresh Spreadsheets
              </button>
            </div>
          )}
        </div>

        {/* Show processing status */}
        {isProcessingData && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <p className="text-blue-800 font-medium">
                Processing sheet data with Flask backend...
              </p>
            </div>
          </div>
        )}

        {/* Show success info if data is loaded and processed */}
        {sheetData && flaskData && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✓ Sheet data loaded and processed by Flask backend
            </p>
            <p className="text-green-700 text-sm mt-1">
              Found {sheetData.values ? sheetData.values.length : 0} rows of raw data
            </p>
            <p className="text-green-700 text-sm">
              Processed into {Object.keys(flaskData || {}).length} workout weeks
            </p>
            <div className="mt-2 flex gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Weeks: {Object.keys(flaskData || {}).join(', ')}
              </span>
            </div>
            <div className="mt-2">
              <button
                onClick={handleDownloadData}
                className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <Download size={14} />
                Download as workoutData.js
              </button>
            </div>
          </div>
        )}

        {/* Only show workout navigation if data is processed */}
        {selectedSheetId && flaskData && (
          <>
            {/* Simplified Navigation - No blocks, just weeks and days */}
            <div className="workout-navigation mb-6 p-4 bg-white rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Workout Navigation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
              </div>
            </div>

            {workoutExercises.length === 0 ? (
              <EmptyWorkoutMessage selectedDay={selectedDay} />
            ) : (
              <>
                <WorkoutSummary exercises={workoutExercises} />

                <ExerciseSection
                  title="Main Exercises"
                  exercises={topSets}
                  exerciseType="main"
                  onExerciseUpdate={handleExerciseUpdate}
                  icon={TrendingUp}
                  titleColor="blue"
                />

                {backdownSets.length > 0 && (
                  <ExerciseSection
                    title="Backdown Sets"
                    exercises={backdownSets}
                    exerciseType="backdown"
                    onExerciseUpdate={handleExerciseUpdate}
                    icon={TrendingDown}
                    titleColor="teal"
                  />
                )}

                {accessories.length > 0 && (
                  <ExerciseSection
                    title="Accessories"
                    exercises={accessories}
                    exerciseType="accessory"
                    onExerciseUpdate={handleExerciseUpdate}
                    icon={Activity}
                    titleColor="purple"
                  />
                )}
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