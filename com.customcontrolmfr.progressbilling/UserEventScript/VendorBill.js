/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/redirect', 'N/search', 'N/ui/message', 'N/url', '../Module/ccProgressBilling'],
/**
 * @param {log} log
 * @param {record} record
 * @param {redirect} redirect
 * @param {search} search
 * @param {message} message
 * @param {url} url
 * @param {ccProgressBilling} ccProgressBilling
 */
function(log, record, redirect, search, message, url, ccProgressBilling) {
   
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
                
        context.form.clientScriptModulePath = '../ClientScript/VendorBill.js';
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

    	if (context.type != context.UserEventType.CREATE && context.type != context.UserEventType.EDIT) return;

        var poId = context.newRecord.getValue({
            fieldId: 'custbody_ccm_purchaseorder'
        });

		if (!ccProgressBilling.isValid(poId)) return;

		var finalPayment = context.newRecord.getValue({
            fieldId: 'custbody_ccm_finalpayment'
        });

		var success = ccProgressBilling.execute({
			poId: poId,
			finalPayment: finalPayment
		});

		var recordURL = url.resolveRecord({
			recordType: record.Type.PURCHASE_ORDER,
			recordId: poId,
			isEditMode: false
		});

		if (!success) recordURL += '&pb=1';

		redirect.redirect({
			url: recordURL
		});
	}

    return {
        beforeLoad: beforeLoad,
        //beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
