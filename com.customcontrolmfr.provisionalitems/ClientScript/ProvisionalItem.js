/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],

function(record, search) {
    
	var APPROVED = false;
	
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

    	APPROVED = context.currentRecord.getValue({
		    fieldId: 'custrecord_ccm_pi_approved'
		});
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

    	if (context.fieldId == 'custrecord_ccm_pi_approved') {
    		
    		var approved = context.currentRecord.getValue({
    		    fieldId: 'custrecord_ccm_pi_approved'
    		});
    		
    		if (APPROVED && !approved) {
    			
        		context.currentRecord.setValue({
        		    fieldId: 'custrecord_ccm_pi_approved',
        		    value: true
        		});
    		}
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
		
		var itemid = context.currentRecord.getText({
		    fieldId: 'custrecord_ccm_pi_itemid'
		});

	    var s = search.create({
	        type: record.Type.INVENTORY_ITEM,
	        columns: ['internalid'],
	        filters: [
		              search.createFilter({
		                  name: 'itemid',
		                  operator: search.Operator.IS,
		                  values: itemid
		              }),
	         ],
	    });

	    var id = 0;
	    
	    s.run().each(function(result) {
	        
        	id = result.getValue('internalid');
        	
	        return false;
	    });

		if (id > 0) {
			
			alert('Item already exists.')
			
			return false;
		}

	    // VENDOR ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	    
		var vendor = context.currentRecord.getValue({
		    fieldId: 'custrecord_ccm_pi_vendor'
		});
		
		var newvendor = context.currentRecord.getText({
		    fieldId: 'custrecord_ccm_pi_newvendor'
		});

		if (vendor || newvendor) return true;
		
		alert ('You must select an existing vendor or enter a new one.')
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        /*postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,*/
        saveRecord: saveRecord
    };
    
});
