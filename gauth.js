let currentUser = null ; 
let token = null ; 
let tokenClient = null ; 


function handleCredentialResponse(response) {
    try {
        //get user info
        const userinfo = decodeResponse(response.credential) ; 

        //define user data into current user
        currentUser = { 
            id: userinfo.sub, 
            name: userinfo.name, 
            email: userinfo.email,
            picture: userinfo.picture
        }; 

        updateUI() ; 
    }
    catch (error) {
        console.error("Error with credential reponse", error) ; 
    }
    
}

//decode JWT token and parse into JavaScript Object
function decodeResponse(token) {
    //make token presentable
    const base64Url = token.split(".")[1] ;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/") ;
    const jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2) ;
    }).join("")) ;
    return JSON.parse(jsonPayload) ;
}

function getToken() {
    //prompt user for verfication of data, then fetch token for API 
    return new Promise((resolve, reject) => {

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: "473070785433-j66nu8cvkos5mkhml3se4mr1b4iop3po.apps.googleusercontent.com" , 
            scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
                callback: (tokenResponse) => {
                    if (tokenResponse.error) {
                        reject(tokenResponse) ;
                    } else {
                        token = tokenResponse.access_token ; 
                        resolve(token) ; 
                    }
                }
        });
        tokenClient.requestAccessToken({prompt: ""}) ; 
    });
}

function updateUI() {
    //get rid of sign in button and show credentials, as well as spreadsheet button 
    if (currentUser) {
        document.getElementById("signin").classList.add("hidden") ; 
        document.getElementById("user-info").classList.remove("hidden") ; 
        document.getElementById("sheets-selection").classList.remove("hidden") ; 
        document.getElementById("display-user-info").innerHTML = `
            <img src = "${currentUser.picture}" alt = "User Profile Pic">
            <div>
                <a> 👋Hello , ${currentUser.name} (${currentUser.email}) ! </a>
            </div>
        ` ; 
    } else {
        //restore defaults
        document.getElementById("signin").classList.remove("hidden") ; 
        document.getElementById("user-info").classList.add("hidden") ; 
        document.getElementById("sheets-selection").classList.add("hidden") ; 
    }
}

//allow everything to load properly
window.onload = function() {
    setTimeout(() => {
        updateUI() ;
    }, 100) ; 
};



