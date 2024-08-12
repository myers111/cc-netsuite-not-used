/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/search', 'N/format'],
/**
 * @param {log} log
 * @param {record} record
 * @param {search} search
 */
function(log, record, search, format) {

    /**
     * This script is used to load and save different types of records in NetSuite. It was created to run the before submit 
     * script on particular types of records instead of having you doing update by dumping all the record data, modifying it, and 
     * uploading to excel. The script was already built into the before submit logic.
     */
	   
	var RECORDNAME = 'Purchase Order';
	var RECORDTYPE = record.Type.PURCHASE_ORDER;

    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {

	    var s = search.create({
	        type: 'transaction',
	        columns: ['internalid'],
	        filters: [
	            search.createFilter({
			        name: 'mainline',
			        operator: search.Operator.IS,
			        values: 'T'
			    }),
                search.createFilter({
		            name: 'formulatext',
	    	  	    formula: '{type}',
	    		    operator: search.Operator.IS,
					values: RECORDNAME
	    		}),
                search.createFilter({
		            name: 'formulanumeric',
	    	  	    formula: 'CASE WHEN {internalid} > 55000 AND {internalid} <= 60000 THEN 1 ELSE 0 END',
	    		    operator: search.Operator.EQUALTO,
					values: 1
	    		}),
/*                  search.createFilter({
                    name: 'formulatext',
                    formula: '{isinactive}',
                    operator: search.Operator.IS,
                    values: 'F'
                }),
*/	         ],
	    });

        var records = [];
        
        s.run().each(function(result) {

            var id = result.getValue('internalid');
            
            records.push({'id':id,'recType':RECORDTYPE});
            
            return true;
        });

    	return records;
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
/*
    	log.debug({
    	    title: 'Records Map',
    	    details: context
    	});
*/
    	var rec = JSON.parse(context.value);

        context.write({
            key: rec.id,
            value: rec
        });
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    	log.debug({
    	    title: 'Records Reduce',
    	    details: context
    	});

    	var records = context.values;

    	for (var i = 0; i < records.length; i++) {
    		
			var rec = JSON.parse(records[i]);

            if (rec) {

                var objRecord = record.load({
                    type: rec.recType,
                    id: rec.id,
                    isDynamic: true,
                });

                objRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
            }
 		}
    }
 
    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {

        if (summary.inputSummary.error) {

        	log.error({ title: 'getInputData error', details: summary.inputSummary.error });
        }

        logErrors('Map', summary.mapSummary);
        logErrors('Reduce', summary.reduceSummary);
    }

    function logErrors(stage, summary) {

        summary.errors.iterator().each(function(key, value) {

        	var message = JSON.parse(value).message;

        	log.error({
        		title: stage + ' Error Key: ' + key,
        		details: message
        	});
        });
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});
