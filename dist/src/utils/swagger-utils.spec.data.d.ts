export declare const SwaggerUtilsSpecData: {
    'paths': {
        '/fetchStartupData': {
            'post': {
                'responses': {
                    '200': {
                        'schema': {
                            '$ref': string;
                        };
                    };
                    '401': {
                        'schema': {
                            'required': string[];
                            'properties': {
                                'fault': {
                                    'type': string;
                                    'enum': string[];
                                };
                                'message': {
                                    'type': string;
                                };
                            };
                        };
                    };
                    '500': {
                        'schema': {
                            'required': string[];
                            'properties': {
                                'responseCode': {
                                    'type': string;
                                    'enum': string[];
                                };
                                'responseMessage': {
                                    'type': string;
                                };
                            };
                        };
                    };
                };
                'parameters': {
                    'name': string;
                    'in': string;
                    'description': string;
                    'required': boolean;
                    'schema': {
                        'type': string;
                        'required': string[];
                        'properties': {
                            'uuid': {
                                'type': string;
                            };
                        };
                    };
                }[];
            };
        };
    };
    'definitions': {
        'StartupData': {
            'type': string;
            'required': string[];
            'properties': {
                'registrationStatus': {
                    'type': string;
                    'enum': string[];
                    'default': string;
                };
                'callCenterNumber': {
                    'type': string;
                };
                'nodeCode': {
                    'type': string;
                };
                'nodeShortName': {
                    'type': string;
                };
                'nodeId': {
                    'type': string;
                };
                'staticCacheBuster': {
                    'type': string;
                };
                'relaxLocationCheck': {
                    'type': string;
                };
                'timeToRefreshLocation': {
                    'type': string;
                };
                'emptyCustomerDropContactNumber': {
                    'type': string;
                };
                'allowCustomerDropNoPutAway': {
                    'type': string;
                };
                'features': {
                    'type': string;
                    'items': {
                        'type': string;
                        'enum': string[];
                    };
                };
                'pilotNode': {
                    'type': string;
                };
                'allowCourierDeliveryNoPutAway': {
                    'type': string;
                };
            };
        };
    };
};
