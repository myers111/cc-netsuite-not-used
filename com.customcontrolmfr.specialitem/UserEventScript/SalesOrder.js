/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/format', 'N/log', 'N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url'],

function(format, log, record, redirect, runtime, search, serverWidget, url) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {string} context.type - Trigger type
     * @param {Form} context.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(context) {

    	var sublist = context.form.getSublist({
    	    id: 'item'
    	});

    	if (sublist) {
    		
        	sublist.addButton({
        	    id: 'custpage_ccm_specialitem',
        	    label: 'Add Special',
        	    functionName: 'addSpecialItem'
        	});
    	}
                
        context.form.clientScriptModulePath = '../ClientScript/SalesOrder.js';
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {Record} context.oldRecord - Old record
     * @param {string} context.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(context) {
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {Record} context.oldRecord - Old record
     * @param {string} context.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(context) {

    }

    return {
        beforeLoad: beforeLoad,
        //beforeSubmit: beforeSubmit/*,
        //afterSubmit: afterSubmit*/
    };
});
