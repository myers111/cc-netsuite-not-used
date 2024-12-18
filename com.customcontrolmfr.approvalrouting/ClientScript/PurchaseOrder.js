/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord','N/email','N/format','N/record','N/runtime','N/ui/message','N/url','N/search'],

function(currentRecord,email,format,record,runtime,message,url,search) {

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

    	if (context.fieldId == 'custpage_nextapprover') {
            
        	var approver = context.currentRecord.getValue({
                fieldId: 'custpage_nextapprover'
            });
            
        	context.currentRecord.setValue({
                fieldId: 'nextapprover',
                value: approver
            });
    	}
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

    }

    function onCancel() {

    	var objRecord = currentRecord.get();

    	var referer = objRecord.getValue({
    	    fieldId: 'custpage_referer'
    	});

        window.onbeforeunload = null;
        
        location.href = referer;
    }

    function approve() {

		var objRecord = currentRecord.get();

    	var id = objRecord.getValue({
    	    fieldId: 'id'
    	});

        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_ccm_ar_purchaseorder_su',
            deploymentId: 'customdeploy_ccm_ar_purchaseorder_su',
            returnExternalUrl: false,
			params: {
				'poid': id,
				'action': 'approve'
			}
        });
        
        location.href = suiteletURL;
    }
    
    function reject() {

		var objRecord = currentRecord.get();

    	var id = objRecord.getValue({
    	    fieldId: 'id'
    	});
   	
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_ccm_ar_purchaseorder_su',
            deploymentId: 'customdeploy_ccm_ar_purchaseorder_su',
            returnExternalUrl: false,
			params: {
				'poid': id,
				'action': 'reject',
			}
        });
        
        location.href = suiteletURL;
    }

    function request() {

		var objRecord = currentRecord.get();

    	var id = objRecord.getValue({
    	    fieldId: 'id'
    	});

        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_ccm_ar_purchaseorder_su',
            deploymentId: 'customdeploy_ccm_ar_purchaseorder_su',
            returnExternalUrl: false,
			params: {
				'poid': id,
				'action': 'request',
			}
        });
        
        location.href = suiteletURL;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,/*
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord,*/
        onCancel: onCancel,
        approve: approve,
        reject: reject,
        request: request
    };  
});
