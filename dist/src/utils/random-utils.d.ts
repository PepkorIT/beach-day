export declare var RandomUtils: {
    _names: string[];
    _companies: string[];
    _cnt: number;
    _alphaNumeric: string;
    /**
     * Random value from an array
     * @param values {Array} Array to choose from
     * @returns {Object}
     */
    array: (values: any) => any;
    /**
     * Random number between or equal to min and max values
     * @param min {Number} The minimum value
     * @param max {Number} The maximum value
     * @param round {Boolean} If true the result is rounded. Defaults to true, set to false for decimals.
     * @returns {Number}
     */
    number: (min: any, max: any, round: any) => any;
    /**
     * Returns a random full name from the source of available names
     * @returns {String}
     */
    fullName: () => any;
    /**
     * Returns a random first name from the source of available names
     * @returns {String}
     */
    firstName: () => any;
    /**
     * Returns a random last name from the source of available names
     * @returns {String}
     */
    lastName: () => any;
    /**
     * Returns a random company name from the source of available companies
     * @returns {String}
     */
    companyName: () => any;
    /**
     * Returns an id starting at 100000 and incrementing
     * @returns {Number}
     */
    id: () => any;
    /**
     * Returns a string of random string of upper & lower case letters and numbers.
     * @param length The length the result should be. Defaults to 5
     * @returns {String}
     */
    stringHash: (length: any) => string;
    /**
     * Returns a string of random numbers, not starting with 0.
     * @param length The length the result should be. Defaults to 5
     * @returns {String}
     */
    numHash: (length: any) => string;
    /**
     * Returns a random date from the past.
     * @param resetTime If true the time is reset to 0 otherwise it is the same as now. Defaults to true
     * @returns {Date}
     */
    dateInPast: (resetTime: any) => Date;
    /**
     * Returns a random date in the future.
     * @param resetTime If true the time is reset to 0 otherwise it is the same as now. Defaults to true
     * @returns {Date}
     */
    dateInFuture: (resetTime: any) => Date;
    /**
     * Returns a random date who's age is greater than minAge.
     * @param minAge {Number} The minimum age the date needs to be
     * @param resetTime {Boolean} If true the time is reset to 0 otherwise it is the same as now. Defaults to true
     * @returns {Date}
     */
    dateAge: (minAge: any, resetTime: any) => Date;
};
