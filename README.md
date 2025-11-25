# project jn

A web application to enhance the user experience when observing a powerliftng program from Google Sheets

# Setup
You need one terminal instance for the backend and one for the frontend.

## Prerequisites
### Google Cloud Platform (GCP) Service Account Key
The application requires a GCP service account key to access Google Sheets.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create a service account:
   - Navigate to "API/Service Details" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the service account details and click "Create"
   - Grant `Editor` permissions and click "Done"
5. Create and download the key:
   - Click on the newly created service account
   - Go to the "Keys" tab
   - Click "Add Key" > "Create new key"
   - Select "JSON" format
   - Click "Create" to download the key file
6. Save the downloaded JSON file as `gcp_key.json` in the project root directory
7. Share your Google Sheet with the service account:
   - Open the `gcp_key.json` file and copy the `client_email` value (e.g., `your-service-account@your-project.iam.gserviceaccount.com`)
   - Open your Google Sheet
   - Click the "Share" button
   - Paste the service account email
   - Grant "Editor" permissions
   - Click "Send"

## Backend
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```
For writeback functionality into Sheets:
```
source .venv/bin/activate
pip install -r requirements.txt
python writeBack.py
```

## Frontend
```bash
cd frontend
npm i
npm start
```
