class APIError extends Error {
    private date: Date;
    private options: Record<any, any>;

    /**
     * Constructor
     * @param {object} options Used to hold additional information about custom error
     * @param  {...any} params Primary details of error
     */
    constructor(options: Record<any, any>, ...params: string[]) {
        super(...params);

        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;

        this.date = new Date();
        this.options = options;

        // This clips the constructor invocation from the stack trace.
        Error.captureStackTrace(this, this.constructor);
    }
}

const createError = (message: string, error_type = '', options = {}): APIError => new APIError({ error_type, ...options }, message);

export { createError };
