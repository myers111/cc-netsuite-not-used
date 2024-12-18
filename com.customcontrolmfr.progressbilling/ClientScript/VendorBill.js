 /**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record','../Module/ccProgressBilling'],
/**
 * @param {record} record
 */
function(record, ccProgressBilling) {

    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(context) {

        if (context.mode == 'copy') {

            var poId = context.currentRecord.getValue({
                fieldId: 'custbody_ccm_purchaseorder'
            });

            if (poId) {

            	var numLines = context.currentRecord.getLineCount({
                    sublistId: 'item'
                });

                while (numLines > 0) {

                    context.currentRecord.removeLine({
                        sublistId: 'item',
                        line: 0,
                        ignoreRecalc: true
                    });

                    numLines = context.currentRecord.getLineCount({
                        sublistId: 'item'
                    });
                }

            	var projectId = 0;
            	
            	var params = window.location.search.substring(1).split('&');

            	for (var i = 0; i < params.length; i++) {
            		
            		var kvp = params[i].split('=');

            		if (kvp[0] == 'prid') {
            			
            			projectId = kvp[1];
                		
                		break;
            		}
            	}

                context.currentRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: 2638, // Progress Payment
                    ignoreFieldChange: true
                });
                
                context.currentRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: 1,
                    ignoreFieldChange: true
                });
                
                context.currentRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'customer',
                    value: projectId,
                    ignoreFieldChange: true
                });
            }
        }
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     * @param {string} context.fieldId - Field name
     * @param {number} context.line - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} context.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(context) {

    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     * @param {string} context.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(context) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(context) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(context) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     * @param {string} context.fieldId - Field name
     * @param {number} context.line - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} context.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(context) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(context) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(context) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(context) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(context) {

        var poId = context.currentRecord.getValue({
            fieldId: 'custbody_ccm_purchaseorder'
        });

        if (!poId) return true;

        var amount = context.currentRecord.getValue({
            fieldId: 'usertotal'
        });

        if (ccProgressBilling.isFinalPayment({
            billId: context.currentRecord.id,
            poId: poId,
            amount: amount
        })) {

            context.currentRecord.setValue({
                fieldId: 'custbody_ccm_finalpayment',
                value: true
            });
        }

    	return true;
    }

    return {
        pageInit: pageInit,/*
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,*/
        saveRecord: saveRecord
    };
    
});
