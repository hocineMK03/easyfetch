const https = require('https');
const http = require('http');
const ErrorHandler = require('./ErrorHandling'); // Ensure this is correctly implemented

class EasyFetchClass {
    static DEFAULT_TIMEOUT = 5000; 
    static SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    constructor({ url = "", method = "GET", headers = {}, body = null, contentType = "application/json" }) {
        this.validateParams(url, method);
        this.url = url; // Assigning the URL here
        this.method = method.toUpperCase(); // Normalize method
        this.body = body; // Assigning the body
        this.contentType = contentType; // Assigning the content type
        this.protocol = this.getProtocol(url); // Get protocol  
        this.headers = {
            'User-Agent': 'EasyFetch/1.0.0',
            'Accept': '*/*',
            'Host': new URL(url).host,
            'Content-Type': contentType,
            ...headers
        };
    }

    validateParams(url, method) {
        if (typeof url !== 'string') {
            throw ErrorHandler.handleCustomError('URL must be a string', 400, 'error');
        }
        if (!url) {
            throw ErrorHandler.handleCustomError('URL is required', 400, 'error');
        }
        if (typeof method !== 'string') {
            throw ErrorHandler.handleCustomError('Method must be a string', 400, 'error');
        }
        if (!EasyFetchClass.SUPPORTED_METHODS.includes(method)) {
            throw ErrorHandler.handleCustomError('Unsupported method. Supported methods are: GET, POST, PUT, DELETE, PATCH', 400, 'error');
        }
    }

    getProtocol(url) {
        try {
            const protocol = new URL(url).protocol;
            return protocol === 'https:' ? 'https' : 'http';
        } catch (err) {
            return 'http'; // Default to http if URL parsing fails
        }
    }

    async request() {
        const options = {
            method: this.method,
            headers: this.headers,
            timeout: EasyFetchClass.DEFAULT_TIMEOUT,
        };

        const startTime = Date.now();
        const lib = this.protocol === 'https' ? https : http;

        try {
            const response = await this.executeRequest(options, lib, startTime);
            return response; // Return successful response
        } catch (error) {
            return error; // Return error response directly
        }
    }

    async executeRequest(options, lib, startTime) {
        return new Promise((resolve) => {
            const req = lib.request(this.url, options, (res) => {
                let data = '';

                // Listen to data events to collect response data
                res.on('data', chunk => {
                    data += chunk;
                });

                // Handle end of response
                res.on('end', () => {
                    const endTime = Date.now(); // Get end time
                    const status = res.statusCode;

                    // Handle the response properly
                    const response = this.handleResponse(status, data, startTime, endTime);
                    resolve(response);
                });
            });

            req.on('timeout', () => {
                req.destroy(); // Destroy the request
                const errorResponse = this.handleRequestError('ETIMEDOUT');
                resolve(errorResponse);
            });

            req.on('error', err => {
                // Handle connection errors
                const errorResponse = this.handleRequestError(err.code);
                resolve(errorResponse); // Resolve with error
            });

            // If the method is POST and has a body, write the data to the request
            if (this.method === 'POST' && this.body) {
                req.write(this.body);
            }

            req.end(); // Finalize the request
        });
    }

    handleResponse(status, data, startTime, endTime) {
        const duration = endTime - startTime; // Calculate duration

        // Check if the status code indicates success (200-299)
        if (status >= 200 && status < 300) {
            return {
                status,
                data,
                time: this.styleDuration(duration),
            };
        } else {
            // Handle errors based on response status
            return ErrorHandler.handleCustomError(`HTTP Error: ${status} - ${data}`, status, 'error');
        }
    }

    handleRequestError(errcode) {
        switch (errcode) {
            case 'ECONNREFUSED':
                return ErrorHandler.handleCustomError('Connection refused', 400, 'error');
            case 'ENOTFOUND':
                return ErrorHandler.handleCustomError('Host not found', 400, 'error');
            case 'ECONNRESET':
                return ErrorHandler.handleCustomError('Connection reset', 400, 'error');
            case 'ECONNABORTED':
                return ErrorHandler.handleCustomError('Connection aborted', 400, 'error');
            case 'Request timed out':
                return ErrorHandler.handleCustomError('Request timed out', 408, 'error');
            case 'ETIMEDOUT':
                return ErrorHandler.handleCustomError('Request timed out', 408, 'error');
            default:
                return ErrorHandler.handleCustomError('An unexpected error occurred', 500, 'error');
        }
    }

    styleDuration(duration) {
        return duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(2)}s`;
    }
}

module.exports = EasyFetchClass;
