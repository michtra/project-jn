import copy
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask("__name__")
CORS(app)

#horizontal scanning function (assuming CLS style programming sheet; could account for more weeks)
def horizontal_parse(jsondata):
    data = jsondata['values']

    #find if the program has an offset (blank space on left), delete (only checking if leftmost col is empty based on programs)
    leftisBlank = True 
    for row in data:
        if len(row) > 0 and row[0] !=  "":
            leftisBlank = False

    if (leftisBlank):
        for row in data:
            if len(row) > 0:
                del row[0]

    #get the array consisting of the week names (Week1, Week2, etc. )
    weeks = []
    for row in data:
        if len(row) > 0 and row[0].startswith("Week"):
            weeks = row

    #loop and populate new array with every week defined 
    weekArray = []
    for i in weeks:
        if i.startswith("Week") or i.startswith("week"):
            weekArray.append(i)

    #create dictionary with inner dictionaries where keys = days of week and values = array of lifts needed to be performed
    sheetDictionary = {key: {} for key in weekArray}
    daysOfWeek = []

    for row in data:
        if len(row) > 0 and any(day in row[0] for day in ["Mon","Tues","Wed","Thur","Fri","Sat","Sun"]):
            daysOfWeek.append(row[0])

    innerDictionary = {key: {} for key in daysOfWeek}
    numofWeeks = len(weekArray)
    for i in range(numofWeeks):
        sheetDictionary[weekArray[i]] = copy.deepcopy(innerDictionary)

    #implement sorting loop to get final dictionary
    weekstarted = False
    currentDay = ""
    
    for row in data:
        #find a header marking the day
        if len(row) > 0 and row[0] in daysOfWeek:
            weekstarted = True
            currentDay = row[0]
            continue

        #skip until a header is found 
        if not (weekstarted):
            continue

        #skip if not valid row
        if len(row) == 0:
            continue

        #check for rest day
        if row[0] == "rest" or row[0] == "Rest":
            for i in range(numofWeeks):
                exerciseDictionary = {"Rest": 0}
                sheetDictionary[weekArray[i]][currentDay]["Rest"] = exerciseDictionary
            continue
        
        if currentDay != row[0]:
            for i in range(numofWeeks):
                #these two are always defined
                Exercise = row[0 + 5*i] if len(row) > 0 + 5*i else ""
                Prescribed = row[1 + 5*i] if len(row) > 1 + 5*i else ""

                #these need to be checked if there or not (jumps defined by spaces apart in google sheet following CLS format)
                Weight = row[2 + 5*i] if len(row) > 2 + 5*i else ""
                RPE = row[3 + 5*i] if len(row) > 3 + 5*i else ""
                Notes = row[4 + 5*i] if len(row) > 4 + 5*i else ""
    
                exerciseDictionary = {"Prescribed": Prescribed, "Weight": Weight, "RPE": RPE, "Notes": Notes}
                if Exercise in sheetDictionary[weekArray[i]][currentDay]:
                    Exercise = f"{Exercise} (Backdown)"

                sheetDictionary[weekArray[i]][currentDay][Exercise] = exerciseDictionary

    return sheetDictionary

@app.route("/data", methods = ["POST"])
def getData():
    data = request.get_json()
    data_sorted = horizontal_parse(data)
    return jsonify(data_sorted)

if __name__ == "__main__":
    app.run(port = 5000, debug = True)
    
