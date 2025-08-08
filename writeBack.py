import os 
import string
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build 
from flask import Flask, request, jsonify
from flask_cors import CORS

def convertToIndex(rowNumber, colNumber):
    col_letter = string.ascii_uppercase[colNumber - 1]
    return f"{col_letter}{rowNumber}"

def findCoordinate(field, weight, day, week, lift, prescribed, rawData):
    #find if the program has an offset (blank space on left), adjust offset accordingly
    leftisBlank = True 
    for row in rawData:
        if len(row) > 0 and row[0] !=  "":
            leftisBlank = False
            break

    colOffset = 1 if leftisBlank else 0
    
    #get the week number into week index 
    weekStartCol = colOffset + 1  # Default fallback
    weekPositions = {}
    
    # Find the row that contains the week headers
    for row in rawData:
        if len(row) > 0:
            week_count = 0
            for col_idx, cell in enumerate(row):
                if isinstance(cell, str) and cell.startswith("Week"):
                    weekPositions[cell] = col_idx
                    week_count += 1
            # If this row has multiple weeks, it's probably the header row
            if week_count > 1:
                break
    
    if week in weekPositions:
        weekStartCol = weekPositions[week]
        print(f"Found {week} at column {weekStartCol}")
    else:
        print(f"Week {week} not found, using fallback")
    
    #calculate column by sheet specifics
    fieldMap = {
        'weightTaken': 3, #weight column (3 positions after week header)
        'actual_rpe': 4, #RPE column (4 positions after week header)
        'notes': 5 #Notes column (5 positions after week header)
    }
    fieldJump = fieldMap.get(field, 3)
    colNumber = weekStartCol + fieldJump
    
    # Calculate prescribed column - 1 position after week header
    prescribedColumn = weekStartCol + 1
    
    #find row number
    currentDay = False
    rowNumber = 0

    for i, row in enumerate(rawData):
        if (len(row) > 0):
            if (row[colOffset] == day):
                currentDay = True
                print(f"Found day: {day} at row {i+1}")
            if (currentDay):
                if (row[colOffset] == lift):
                    prescribed_val = row[prescribedColumn] if len(row) > prescribedColumn else 'N/A'
                    print(f"Found lift: {lift} at row {i+1}, prescribed: '{prescribed_val}' vs '{prescribed}', prescribedColumn: {prescribedColumn}")
                    if len(row) > prescribedColumn and (row[prescribedColumn] == prescribed):
                        #row is found
                        rowNumber = i + 1
                        print(f"MATCH! rowNumber = {rowNumber}")
                        break

    return convertToIndex(rowNumber, colNumber)

def writeData(data):
    sheet_id = data['spreadsheetId']
    field = data['field']
    weight = data['newValue']
    day = data['day']
    week = data['week']
    lift = data['exercise']
    lift = lift.replace('(Backdown)','').strip() #account for backdowns
    rawData = data['rawData']['values']
    prescribed = data['prescribed']
    coordinate = findCoordinate(field, weight, day, week, lift, prescribed, rawData)
    
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    SERVICE_ACCOUNT_FILE = 'gcp_key.json'
    credentials = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('sheets', 'v4', credentials=credentials)

    sheet = service.spreadsheets()
    body = {'values': [[weight]]}

    sheet_write = sheet.values().update(spreadsheetId=sheet_id, range=coordinate, valueInputOption='RAW', body=body).execute()

app = Flask("__name__")
CORS(app)

@app.route("/Newdata", methods = ["POST"])
def getData():
    data = request.get_json()
    writeData(data)
    return data

if __name__ == "__main__":
    app.run(port = 5001, debug = True)