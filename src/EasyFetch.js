
const EasyFetch = require('./EasyFetchClass');
const easyFetch=({ url = "", method = "GET", headers = {}, body = null, contentType = "application/json" })=>{
    try{
        // json strigify body 
        
        if (body && typeof body === 'object') {
            body = JSON.stringify(body);
        }
        const easyFetchInstance = new EasyFetch({ url, method, headers, body, contentType });
        easyFetchInstance.request().then((response) => {
            console.log('Response data:', response);
        }).catch((error) => {
            console.log('Error: ', error.message);
        });
    }
    catch(error){
        console.log(error);
    }
}

module.exports= easyFetch;


