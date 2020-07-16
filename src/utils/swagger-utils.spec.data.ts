export const SwaggerUtilsSpecData = {
    'paths'      : {
        '/fetchStartupData': {
            'post': {
                'responses' : {
                    '200': {
                        'schema': {
                            '$ref': '#/definitions/StartupData'
                        }
                    },
                    '401': {
                        'schema': {
                            'required'  : [
                                'fault',
                                'message'
                            ],
                            'properties': {
                                'fault'  : {
                                    'type': 'string',
                                    'enum': [
                                        '900901'
                                    ]
                                },
                                'message': {
                                    'type': 'string'
                                }
                            }
                        }
                    },
                    '500': {
                        'schema': {
                            'required'  : [
                                'responseCode',
                                'responseMessage'
                            ],
                            'properties': {
                                'responseCode'   : {
                                    'type': 'string',
                                    'enum': [
                                        '0001',
                                        '1000'
                                    ]
                                },
                                'responseMessage': {
                                    'type': 'string'
                                }
                            }
                        }
                    }
                },
                'parameters': [
                    {
                        'name'       : 'body',
                        'in'         : 'body',
                        'description': 'application/json',
                        'required'   : true,
                        'schema'     : {
                            'type'      : 'object',
                            'required'  : [
                                'uuid'
                            ],
                            'properties': {
                                'uuid': {
                                    'type': 'string'
                                }
                            }
                        }
                    }
                ]
            }
        }
    },
    'definitions': {
        'StartupData': {
            'type'      : 'object',
            'required'  : [
                'registrationStatus',
                'callCenterNumber',
                'staticCacheBuster',
                'relaxLocationCheck',
                'timeToRefreshLocation',
                'emptyCustomerDropContactNumber',
                'allowCustomerDropNoPutAway',
                'features',
                'pilotNode',
                'allowCourierDeliveryNoPutAway'
            ],
            'properties': {
                'registrationStatus'            : {
                    'type'   : 'string',
                    'enum'   : [
                        'NOT_ADDED'
                    ],
                    'default': 'NOT_ADDED'
                },
                'callCenterNumber'              : {
                    'type': 'string'
                },
                'nodeCode'                      : {
                    'type': 'string'
                },
                'nodeShortName'                 : {
                    'type': 'string'
                },
                'nodeId'                        : {
                    'type': 'number'
                },
                'staticCacheBuster'             : {
                    'type': 'string'
                },
                'relaxLocationCheck'            : {
                    'type': 'boolean'
                },
                'timeToRefreshLocation'         : {
                    'type': 'number'
                },
                'emptyCustomerDropContactNumber': {
                    'type': 'boolean'
                },
                'allowCustomerDropNoPutAway'    : {
                    'type': 'boolean'
                },
                'features'                      : {
                    'type' : 'array',
                    'items': {
                        'type': 'string',
                        'enum': [
                            'LOGGING'
                        ]
                    }
                },
                'pilotNode'                     : {
                    'type': 'boolean'
                },
                'allowCourierDeliveryNoPutAway' : {
                    'type': 'boolean'
                }
            }
        }
    }
};
