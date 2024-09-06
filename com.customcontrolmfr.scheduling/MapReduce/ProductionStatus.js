/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/log','N/record','N/search'],
/**
 * @param {log} log
 * @param {record} record
 * @param {search} search
 */
function(log,record,search) {

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

        var projects = [];

        search.create({
            type: record.Type.PURCHASE_ORDER,
            columns: [
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{job.internalid}',
                    summary: search.Summary.GROUP
                }),
                search.createColumn({
                    name: 'formuladate',
                    summary: search.Summary.MAX,
                    formula: '{expectedreceiptdate}'
                }),
            ],
            filters: [
                search.createFilter({
                    name: 'mainline',
                    operator: search.Operator.IS,
                    values: 'F'
                }),
                search.createFilter({
                    name: 'closed',
                    operator: search.Operator.IS,
                    values: 'F'
                }),
                search.createFilter({
                    name: 'formulanumeric',
                    formula: '{job.internalid}',
                    operator: search.Operator.ISNOTEMPTY
                }),
                search.createFilter({
                    name: 'formuladate',
                    formula: '{expectedreceiptdate}',
                    operator: search.Operator.ISNOTEMPTY
                }),
            ],
        }).run().each(function(result) {

            projects.push({
                id: result.getValue(result.columns[0]),
                dt: result.getValue(result.columns[1])
            });

            return true;
        });

    	return projects;
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    
    	log.debug({
    	    title: 'map context',
    	    details: context
    	});

    	var project = JSON.parse(context.value);

        record.submitFields({
            type: record.Type.JOB,
            id: project.id,
            values: {
                'custentity_ccm_materialrecdate': project.dt
            }
        });
}

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {
    
    }

    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {

    }

    return {
        getInputData: getInputData,
        map: map,
        //reduce: reduce,
        //summarize: summarize
    };
});
