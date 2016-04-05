export declare var RandomUtils: {
    _names: string[];
    _companies: string[];
    _cnt: number;
    _alphaNumeric: string;
    array: (values: any) => any;
    number: (min: any, max: any, round: any) => any;
    fullName: () => any;
    firstName: () => any;
    lastName: () => any;
    companyName: () => any;
    id: () => any;
    stringHash: (length: any) => string;
    numHash: (length: any) => string;
    dateInPast: (resetTime: any) => Date;
    dateInFuture: (resetTime: any) => Date;
    dateAge: (minAge: any, resetTime: any) => Date;
};
