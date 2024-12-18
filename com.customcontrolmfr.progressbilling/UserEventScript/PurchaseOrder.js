/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', '../Module/ccProgressBilling'],
/**
 * @param {log} log
 * @param {record} record
 */
function(log, record, ccProgressBilling) {

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

            var status = context.newRecord.getValue({
                fieldId: 'status'
            });

            var msg = ccProgressBilling.getMessage({
                poId: context.newRecord.id,
                status: status,
                parameters: context.request.parameters
            });

            if (msg) {

                context.form.addPageInitMessage({
                    title: msg.title,
                    message: msg.message,
                    type: msg.type,
                    duration: msg.duration
                });
            }
            
            if (status != 'Fully Billed') {
                
            	context.form.clientScriptModulePath = '../ClientScript/PurchaseOrder.js';

                var progressPaymentSublist = context.form.getSublist({
                    id: 'customsublist52'
                });

                if (progressPaymentSublist) {

                    progressPaymentSublist.addButton({
                        id: 'custpage_ccm_progresspayment',
                        label: 'New Payment',
                        functionName: 'progressPayment'
                    });

                    progressPaymentSublist.addButton({
                        id: 'custpage_ccm_progresscredit',
                        label: 'New Credit',
                        functionName: 'progressCredit'
                    });
                }
            }
        }        		
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
        //beforeSubmit: beforeSubmit,
        //afterSubmit: afterSubmit
    };
});
