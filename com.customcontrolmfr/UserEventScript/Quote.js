/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime','N/ui/serverWidget'],
/**
 * @param {serverWidget} serverWidget
 */
function(runtime,serverWidget) {
   
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
        
        if (context.type == context.UserEventType.VIEW) {

        	context.form.addButton({
                id: 'custpage_ccm_importrevision',
                label: 'Import Revision',
                functionName: 'importRevision'
        	});
        }

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

    	context.form.clientScriptModulePath = '../ClientScript/Quote.js';
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
        beforeLoad: beforeLoad/*,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit*/
    };
    
});
