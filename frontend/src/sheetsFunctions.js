let token = null;
let tokenClient = null;
let spreadsheetId = null;
let rawData = null;

export function setAuthToken(authToken) {
  token = authToken;
}

export function getAuthToken() {
  return token;
}

export function setSpreadSheetId(sheetId) {
  spreadsheetId = sheetId;
}

export function getSpreadSheetId() {
  return spreadsheetId;
}

// Initialize Google API token client
export function getToken() {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services not loaded'));
      return;
    }

    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: "473070785433-j66nu8cvkos5mkhml3se4mr1b4iop3po.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            console.error('Token error:', tokenResponse.error);
            reject(new Error(tokenResponse.error));
          } else {
            token = tokenResponse.access_token;
            console.log('Token received successfully');
            resolve(token);
          }
        }
      });
      
      tokenClient.requestAccessToken({ prompt: "" });
    } catch (error) {
      console.error('Error initializing token client:', error);
      reject(error);
    }
  });
}

export async function loadSheets() {
  if (!token) {
    throw new Error('No authentication token available');
  }

  try {
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.spreadsheet"&fields=files(id,name)',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to load sheets: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'API Error');
    }

    return data.files || [];
  } catch (error) {
    console.error('Error loading sheets:', error);
    throw error;
  }
}

export async function getSheetData(sheetId, range = "A1:U58") {
  if (!token) {
    throw new Error('No authentication token available');
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get sheet data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    rawData = data;
    
    if (data.error) {
      throw new Error(data.error.message || 'API Error');
    }

    return data;
  } catch (error) {
    console.error('Error getting sheet data:', error);
    throw error;
  }
}

// Send data to Flask backend
export async function sendToBackend(json) {
  try {
    const response = await fetch("http://localhost:5000/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    });

    if (!response.ok) {
      throw new Error(`Failed to send to backend: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending to backend:', error);
    throw error;
  }
}

// Store workout data locally (in memory/state) - using Flask structure
let localFlaskData = null;

export function setLocalFlaskData(data) {
  localFlaskData = data;
  console.log('Flask workout data stored locally:', data);
}

export function getLocalFlaskData() {
  return localFlaskData;
}

// Get sheet data, process it with Flask backend, and store locally
export async function getSheetDataAndProcessWithFlask(sheetId, range = "A1:U58") {
  try {
    console.log('Fetching sheet data...');
    const sheetData = await getSheetData(sheetId, range);
    
    console.log('Sending data to Flask backend for processing...');
    const processedData = await sendToBackend(sheetData);
    
    console.log('Storing Flask processed data locally...');
    setLocalFlaskData(processedData);
    
    return {
      rawData: sheetData,
      processedData: processedData
    };
  } catch (error) {
    console.error('Error in getSheetDataAndProcessWithFlask:', error);
    throw error;
  }
}

// Save Flask data structure as JavaScript file
export function downloadFlaskDataAsFile(data, filename = 'workoutData.js') {
  const fileContent = `// Generated workout data from Google Sheets (Flask format)
export const workoutData = ${JSON.stringify(data, null, 2)};

// Data structure explanation:
// {
//   "Week1": {
//     "Monday (1st Squat)": {
//       "Squat": {
//         "Prescribed": "1x4",
//         "Weight": "220",
//         "RPE": "5",
//         "Notes": "Felt solid, good depth"
//       },
//       "Squat (Backdown)": {
//         "Prescribed": "3x5",
//         "Weight": "200",
//         "RPE": "5", 
//         "Notes": "Good backdown volume"
//       }
//     }
//   }
// }`;
  
  const blob = new Blob([fileContent], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log(`Flask workout data downloaded as ${filename}`);
}

// Extract data from a sheet and optionally send to backend
// range specified by max sheet size accounting for data that doesn't start in first column
export async function extractData(sheetId, sheetName, range = "A1:U58") {
  try {
    const data = await getSheetData(sheetId, range);
    return data;
  } catch (error) {
    console.error(`Error extracting data from ${sheetName}:`, error);
    throw error;
  }
}

// Send data to Flask backend
export async function sendNewDataToBackend(json) {
  try {

    //get current spreadsheetID
    const currentspreadsheetID = getSpreadSheetId();

    //include SSID in data
    const jsonWithSpreadsheetID = {
      ...json, 
      spreadsheetId: currentspreadsheetID,
      rawData: rawData
    };


    const response = await fetch("http://localhost:5001/Newdata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(jsonWithSpreadsheetID)
    });

    if (!response.ok) {
      throw new Error(`Failed to send to backend: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending to backend:', error);
    throw error;
  }
}