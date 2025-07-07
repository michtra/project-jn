# Powerlifting Program Project (name pending)

A web application to enhance the user experience when observing a powerliftng program from Google Sheets


## Completed Features
- Implemented Google Sign in button with Google's OAuth Athentication
- getToken() function to retrieve the user's token and access to the corresponding google sheets
- updateUI() function to get rid of sign in button once signed in, display the user, as well as restore defaults if nobody has logged in
- added API call to get verfication for Google Sheets token upon using the Load Google Sheets button
- LoadSheets() now loads all of the user's google sheets as seperate buttons 
- using flask framework, google sheets data is sent from frontend js to backend python script 

