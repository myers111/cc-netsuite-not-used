/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/search'],
/**
 * @param {log} log
 * @param {record} record
 * @param {search} search
 */
function(log, record, search) {

    /**
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) {

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

    	var data = {
            header: ["Project Number", "Project Name", "Engraving","Fabrication","Assembly", "Parts %", "Overall Status"],
            rows: []
        };

	    var s = search.create({
	        type: record.Type.JOB,
			columns: [
				search.createColumn({
					name: 'formulatext',
					formula: '{entityid}'
				}),
				search.createColumn({
					name: 'formulatext',
					formula: '{altname}'
				}),
				search.createColumn({
					name: 'formulanumeric',
					formula: 'CASE {custentity_ccm_estengravinghrs} WHEN 0 THEN null ELSE ROUND({custentity_ccm_actengravinghrs}/{custentity_ccm_estengravinghrs}*100) END'
				}),
				search.createColumn({
					name: 'formulanumeric',
					formula: 'CASE {custentity_ccm_estfabhrs} WHEN 0 THEN null ELSE ROUND({custentity_ccm_actfabhrs}/{custentity_ccm_estfabhrs}*100) END'
				}),
				search.createColumn({
					name: 'formulanumeric',
					formula: 'CASE {custentity_ccm_estassemblyhrs} WHEN 0 THEN null ELSE ROUND({custentity_ccm_actassemblyhrs}/{custentity_ccm_estassemblyhrs}*100) END'
				}),
				search.createColumn({
					name: 'formulanumeric',
					formula: 'ROUND({custentity_ccm_materialpercent}*100)'
				}),
				search.createColumn({
					name: 'formulanumeric',
					formula: 'CASE WHEN {custentity_ccm_estengravinghrs} + {custentity_ccm_estfabhrs} + {custentity_ccm_estassemblyhrs} = 0 THEN 100 ELSE ROUND(({custentity_ccm_actengravinghrs} + {custentity_ccm_actfabhrs} + {custentity_ccm_actassemblyhrs})/({custentity_ccm_estengravinghrs} + {custentity_ccm_estfabhrs} + {custentity_ccm_estassemblyhrs})*100) END'
				}),
			],
            filters: [
                search.createFilter({
                    name: 'formulatext',
                    formula: "{isinactive}",
                    operator: search.Operator.IS,
                    values: 'F'
                }),
                search.createFilter({
                    name: 'formulanumeric',
					formula: "CASE {status} WHEN 'Awarded' THEN 1 WHEN 'In Progress' THEN 1 WHEN 'In Storage' THEN 1 WHEN 'Pending Retension' THEN 1 ELSE 0 END",
                    operator: search.Operator.EQUALTO,
                    values: 1
                }),
                search.createFilter({
                    name: 'formulatext',
                    formula: "{custentity_ccm_prodsubclass}",
                    operator: search.Operator.ISNOTEMPTY
                }),
            ],
        });

	    s.run().each(function(result) {
	    	
            var row = [];

            for (var i = 0; i < result.columns.length; i++) {

                row.push(result.getValue(result.columns[i]));
            }

            if (row[0] && row[1]) {

                if (row[2] || row[3] || row[4]) { // if all are null, then tasks are completed

                    if (!row[2]) row[2] = 100;
                    if (!row[3]) row[3] = 100;
                    if (!row[4]) row[4] = 100;
                    if (!row[5]) row[5] = 0;
                    if (!row[6]) row[6] = 100;
    
                    var div = 1 - row[6]/100.0;
            
                    if ((requestBody.id == 'mfg') && (div != 0)) {

                        if (row[2] != 100) row[2] = (row[2] / div).toFixed(0);
                        if (row[3] != 100) row[3] = (row[3] / div).toFixed(0);
                        if (row[4] != 100) row[4] = (row[4] / div).toFixed(0);
                        if (row[6] != 100) row[6] = (row[6] / div).toFixed(0);
                    }

                    data.rows.push(row);
                }
            }
	        
	        return true;
	    });    	

        return data;
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

    return {
        'get': doGet,
        put: doPut,
        post: doPost,
        'delete': doDelete
    };  
});
