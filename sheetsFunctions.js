async function loadSheets() {
    //fetch the token, make rest of method wait for it
    await getToken() ; 

    //use token to fetch spreadsheet data from Google Sheets API
    const res = await fetch( 
        'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.spreadsheet"&fields=files(id,name)',
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    //get the spreadsheet data
    const data = await res.json() ; 
    if (data.files.length === 0) {
        console.log("no spreadsheets found") ; 
    }

    //traverse every spreadsheet and create button for each 
    document.getElementById("data-extraction").classList.remove("hidden") ; 
    data.files.forEach(file => {
        const button = document.createElement("button") ; 
        button.textContent = file.name ; 
        button.onclick = () => extractData(file.id, file.name) ; 
        document.getElementById("data-extraction").appendChild(button) ; 
    })

}

async function extractData(id, name) {

    //need method to determine range 
    
    let range = "A1:U58"
    let response ; 
    try {
        response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}`,
            {
                headers: {
                    "Authorization" : `Bearer ${token}`, 
                    "Content-Type" : "application/json"
                }
            }
        );
    } catch (error) {
        console.log(`Error getting spreadsheet data from ${name}`) ;
    }

    sendToBackend(await response.json()) ; 
}

async function sendToBackend(json) {
    await fetch (
        "http://localhost:5000/data", {
            method: "POST" , 
            headers: {
                "Content-Type" : "application/json"
            }, 
            body: JSON.stringify(json)
        })
        .then(function(res) {console.log(res)})
        .catch(function(error) {console.log(error)});
}       
