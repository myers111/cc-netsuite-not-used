/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],

function(record, search) {
    
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

    	if (context.fieldId == 'custrecord_ccm_si_itemquantity') {

        	var itemquantity = context.currentRecord.getValue({
        		fieldId: 'custrecord_ccm_si_itemquantity'
        	});

        	var poid = context.currentRecord.getValue({
        		fieldId: 'custrecord_ccm_si_purchaseorder'
        	});

        	var item = context.currentRecord.getValue({
        		fieldId: 'custrecord_ccm_si_item'
        	});

        	var quantity = itemquantity * subItemQuantity(poid, item);

        	context.currentRecord.setValue({
        		fieldId: 'custrecord_ccm_si_quantity',
        		value: quantity
        	});
    	}
    	else if (context.fieldId == 'custpage_item') {

        	var item = context.currentRecord.getValue({
        		fieldId: 'custpage_item'
        	});

        	context.currentRecord.setValue({
        		fieldId: 'custrecord_ccm_si_item',
        		value: item
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

    	if (context.fieldId != 'custrecord_ccm_si_itemquantity') return true;

    	var itemquantity = context.currentRecord.getValue({
    		fieldId: 'custrecord_ccm_si_itemquantity'
    	});

    	if (itemquantity <= 0) alert('Invalid number (must be positive)');

    	return (itemquantity > 0);
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

    	var item = context.currentRecord.getValue({
    		fieldId: 'custrecord_ccm_si_item'
    	});
    	
    	if (item) return true;

    	item = context.currentRecord.getValue({
    		fieldId: 'custpage_item'
    	});

    	if (item) {
    		
        	context.currentRecord.setValue({
        		fieldId: 'custrecord_ccm_si_item',
        		value: item
        	});
        	
        	return true;
    	}

    	return false;
    }
    
    function subItemQuantity(poid, id) {

	    var s = search.create({
	        type: record.Type.PURCHASE_ORDER,
	        columns: ['quantity'],
	        filters: [
		  	            search.createFilter({
			            	name: 'internalid',
			                operator: search.Operator.IS,
			                values: poid
			            }),
		  	            search.createFilter({
			            	name: 'formulanumeric',
			            	formula: '{item.internalid}',
			                operator: search.Operator.EQUALTO,
			                values: id
			            }),
		    ]
	    });
	    
	    var quantity = 0;
	    
	    s.run().each(function(result) {

	    	quantity = result.getValue('quantity');

    		if (!quantity) quantity = 0;

	        return false;
	    });

	    return parseInt(quantity);
    }

    return {
        //pageInit: pageInit,
        fieldChanged: fieldChanged,/*
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,*/
        validateField: validateField/*,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete*/,
        saveRecord: saveRecord
    };
    
});
