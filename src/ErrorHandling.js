class ErrorHandler {
    

    static handleCustomError(message, statusCode,status) {
        return {
            status : status || 'error',
            error: message || 'Internal Server Error',
            statusCode: statusCode || 500
        };
    }

    static handleConnectionError(err) {
        switch (err.code) {
            case 'ECONNREFUSED':
                return this.handleCustomError('Connection refused', 400, 'error');
            case 'ENOTFOUND':
                return this.handleCustomError('Host not found', 404, 'error');
            case 'ECONNRESET':
                return this.handleCustomError('Connection reset', 400, 'error');
            case 'ECONNABORTED':
                return this.handleCustomError('Connection aborted', 400, 'error');
            case 'ETIMEDOUT':
                return this.handleCustomError('Request timed out', 408, 'error');
            default:
                return this.handleCustomError(`Unexpected error: ${err.message}`, 500, 'error');
        }
    }
}

module.exports = ErrorHandler;
