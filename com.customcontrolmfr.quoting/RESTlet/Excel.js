/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/log','N/record','N/search','../Module/ccQuote'],
/**
 * @param {log} log
 * @param {record} record
 * @param {search} search
 */
function(log,record,search,ccQuote) {

    var NEW_ITEM = 3757;

    /**
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) {

    	log.debug({
    	    title: 'doGet',
    	    details: JSON.stringify(requestParams)
    	});

    	switch (requestParams.path) {
            case 'customers':
                return getCustomers();
            case 'projects':
                return getProjects(requestParams);
            case 'quotes':
                return getQuotes(requestParams);
            case 'quote':
                return getQuote(requestParams.id);
            case 'revisions':
                return getRevisions(requestParams);
            case 'revision':
                return getRevision(requestParams.id);
            }
    }

    /**
     * Function called upon sending a PUT request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPut(requestBody) {

    }

    /**
     * Function called upon sending a POST request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) {

    	log.debug({
    	    title: 'doPost',
    	    details: JSON.stringify(requestBody)
    	});

    	switch (requestBody.path) {
            case 'revision':
                return setRevision();
        }
    }

    /**
     * Function called upon sending a DELETE request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doDelete(requestParams) {

    }

    // GET ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function getCustomers() {

    	var data = [];

	    search.create({
	        type: search.Type.ESTIMATE,
	        columns: [
                search.createColumn({
                    name: 'formulanumeric',
                    formula: "{customermain.internalid}",
                    summary: search.Summary.GROUP
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: "{customermain.entityid}",
                    sort: search.Sort.ASC,
                    summary: search.Summary.MIN
                })
            ],
	        filters: [
	            search.createFilter({
	            	name: 'entity',
	                operator: search.Operator.ISNOTEMPTY
	            }),
                search.createFilter({
                    name: 'mainline',
                    operator: search.Operator.IS,
                    values: 'T'
                }),
            ]
	    }).run().each(function(result) {

            data.push({
                id: result.getValue(result.columns[0]),
	        	name: result.getValue(result.columns[1])
	        });
	        
	        return true;
	    });    	

    	log.debug({
    	    title: 'getCustomers',
    	    details: JSON.stringify(data)
    	});

    	return JSON.stringify(data);
    }

    function getProjects(options) {

    	var data = [];

	    var s = search.create({
	        type: search.Type.ESTIMATE,
	        columns: [
                search.createColumn({
                    name: 'formulanumeric',
                    formula: "{jobmain.internalid}",
                    summary: search.Summary.GROUP
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: "CONCAT(CONCAT({jobmain.entityid}, ' - '), {jobmain.altname})",
                    sort: search.Sort.ASC,
                    summary: search.Summary.MIN
                })
            ],
            filters: [
                search.createFilter({
                    name: 'formulanumeric',
                    formula: "{customermain.internalid}",
                    operator: search.Operator.GREATERTHAN,
                    values: 0
                }),
                search.createFilter({
                    name: 'mainline',
                    operator: search.Operator.IS,
                    values: 'T'
                }),
            ]
	    });
        
        if (options) {
        
            if (options.customerId) {

                s.filters.push(search.createFilter({
                    name: 'formulanumeric',
                    formula: "{customermain.internalid}",
                    operator: search.Operator.EQUALTO,
                    values: parseInt(options.customerId)
                }));
            }
        }

        s.run().each(function(result) {

            data.push({
                id: result.getValue(result.columns[0]),
	        	name: result.getValue(result.columns[1])
	        });
	        
	        return true;
	    });    	

    	log.debug({
    	    title: 'getProjects',
    	    details: JSON.stringify(data)
    	});

    	return JSON.stringify(data);
    }

    function getQuotes(options) {

    	var data = [];

	    var s = search.create({
	        type: search.Type.ESTIMATE,
	        columns: [
                search.createColumn({
                    name: 'formulanumeric',
                    formula: "{internalid}"
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: "{number}",
                    sort: search.Sort.ASC
                })
            ],
            filters: [
                search.createFilter({
                    name: 'mainline',
                    operator: search.Operator.IS,
                    values: 'T'
                }),
            ]
	    });
                
        if (options) {
        
            if (options.projectId) {

                s.filters.push(search.createFilter({
                    name: 'formulanumeric',
                    formula: "{jobmain.internalid}",
                    operator: search.Operator.EQUALTO,
                    values: parseInt(options.projectId)
                }));
            }
            else if (options.customerId) {

                s.filters.push(search.createFilter({
                    name: 'formulanumeric',
                    formula: "{customermain.internalid}",
                    operator: search.Operator.EQUALTO,
                    values: parseInt(options.customerId)
                }));
            }
        }

        s.run().each(function(result) {

            data.push({
                id: result.getValue(result.columns[0]),
	        	name: result.getValue(result.columns[1])
	        });
	        
	        return true;
	    });    	

    	log.debug({
    	    title: 'getQuotes',
    	    details: JSON.stringify(data)
    	});

    	return JSON.stringify(data);
    }

    function getQuote(quoteId) {

    	var data = {};

        if (!quoteId) return data;

        search.create({
            type: search.Type.ESTIMATE,
            columns: [
                search.createColumn({
                    name: 'formulacurrency',
                    formula: '{amount}'
                }),
                    search.createColumn({
                    name: 'formulacurrency',
                    formula: 'NVL({custbody_ccm_defaultmarkup}, 0)'
                }),
                ],
            filters: [
                search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.IS,
                    values: parseInt(quoteId)
                }),
                search.createFilter({
                    name: 'mainline',
                    operator: search.Operator.IS,
                    values: 'T'
                }),
            ]
        }).run().each(function(result) {

            data['amount'] = result.getValue(result.columns[0]);
            data['markup'] = result.getValue(result.columns[1]);
            
            return false;
        });    	

    	log.debug({
    	    title: 'getQuote',
    	    details: JSON.stringify(data)
    	});

    	return JSON.stringify(data);
    }

    function getRevisions(options) {

    	var data = [];

	    var s = search.create({
	        type: search.Type.ESTIMATE,
	        columns: [
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{custcol_ccm_bomrevision.internalid}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: '{custcol_ccm_bomrevision.name}',
                    sort: search.Sort.ASC
                })
            ],
            filters: [
                search.createFilter({
                    name: 'mainline',
                    operator: search.Operator.IS,
                    values: 'F'
                }),
                search.createFilter({
                    name: 'formulanumeric',
                    formula: '{custcol_ccm_bomrevision.internalid}',
                    operator: search.Operator.GREATERTHAN,
                    values: 0
                }),
            ]
	    });
                
        if (options) {

            if (options.quoteId) {

                s.filters.push(search.createFilter({
                    name: 'formulanumeric',
                    formula: "{internalid}",
                    operator: search.Operator.EQUALTO,
                    values: parseInt(options.quoteId)
                }));
            }
            else if (options.projectId) {

                s.filters.push(search.createFilter({
                    name: 'formulanumeric',
                    formula: "{jobmain.internalid}",
                    operator: search.Operator.EQUALTO,
                    values: parseInt(options.projectId)
                }));
            }
            else if (options.customerId) {

                s.filters.push(search.createFilter({
                    name: 'formulanumeric',
                    formula: "{customermain.internalid}",
                    operator: search.Operator.EQUALTO,
                    values: parseInt(options.customerId)
                }));
            }
        }

        s.run().each(function(result) {

            data.push({
                id: result.getValue(result.columns[0]),
	        	name: result.getValue(result.columns[1])
	        });
	        
	        return true;
	    });    	

    	log.debug({
    	    title: 'getRevisions',
    	    details: JSON.stringify(data)
    	});
        
    	return JSON.stringify(data);
    }

    function getRevision(revisionId) {

    	var data = ccQuote.getRevision(revisionId);

        // Format data.items as array of arrays to work with range in excel so less data is sent

        var items = [['Item *','Description','Quantity *','Units','Price','Amount','Vendor','Manufacturer','MPN','MU%','Quote']];

        for (var i = 0; i < data.items.length; i++) {
    
            var item = data.items[i];

            var quantity = (item.quantity ? parseInt(item.quantity) : 0);
            var price = (item.price ? parseFloat(item.price) : 0);
            var markup = (item.markup ? parseFloat(item.markup) : 0);
            var defaultMarkup = (item.defaultMarkup ? parseFloat(item.defaultMarkup) : 0);
            
            items.push([
                (item.itemId == NEW_ITEM ? item.newItem : item.item),
                (item.itemId == NEW_ITEM ? item.newDescription : item.description),
                quantity,
                item.units,
                price,
                (quantity * price),
                (item.vendorId ? item.vendor : item.newVendor),
                item.manufacturer,
                item.mpn,
                markup,
                (quantity * price * (1 + (markup > 0 ? markup : defaultMarkup)))
            ]);   
        }
    
        // Replace items

        data.items = items;

    	log.debug({
    	    title: 'getRevision',
    	    details: JSON.stringify(data)
    	});

    	return JSON.stringify(data);
    }


    // POST /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setRevision(options) {

    	var success = false;
    	    	
	    var s = search.create({
	        type: search.Type.EMPLOYEE,
	        columns: ['internalid'],
	        filters: [
	            search.createFilter({
	            	name: 'formulanumeric',
                    formula: '{internalid}',
	                operator: search.Operator.EQUALTO,
	                values: options.id
	            }),
	        ],
	    });

	    s.run().each(function(result) {
	    	
	        success = true;
	        
	        return false;
	    });    	

    	return success;
    }

    return {
        'get': doGet,
        put: doPut,
        post: doPost,
        'delete': doDelete
    };  
});
