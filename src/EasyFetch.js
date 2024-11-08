const EasyFetch = require('./EasyFetchClass');

const easyFetch =async ({ url = "", method = "GET", headers = {}, body = null, contentType = "application/json" }) => {
    try {
        // JSON stringify body if it's an object
        if (body && typeof body === 'object') {
            body = JSON.stringify(body);
        }
        method = method.toUpperCase();
        const easyFetchInstance = new EasyFetch({ url, method, headers, body, contentType });
        
        // Return the promise to allow the calling function to handle it
        return await easyFetchInstance.request()
            .then((response) => {
                
                return response; 
            })
            .catch((error) => {
                
                throw error; 
            });
    } catch (error) {
        console.log(error);
        throw error; 
    }
}

module.exports = easyFetch;
