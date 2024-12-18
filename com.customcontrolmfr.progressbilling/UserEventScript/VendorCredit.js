/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', '../Module/ccProgressBilling'],

function(log, ccProgressBilling) {
   
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
                
        context.form.clientScriptModulePath = '../ClientScript/VendorCredit.js';
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

    	if (context.type == context.UserEventType.DELETE) {

        	var tranid = context.newRecord.getValue({
    		    fieldId: 'tranid'
    		});

        	if (tranid == 'Final Bill') {
        		
            	var poId = context.newRecord.getValue({
        		    fieldId: 'custbody_ccm_purchaseorder'
        		});

				if (!ccProgressBilling.isValid(poId)) return;

				ccProgressBilling.execute({
					poId: poId
				});
        	}
    	}
    }

    return {
        beforeLoad: beforeLoad,
        //beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
});
