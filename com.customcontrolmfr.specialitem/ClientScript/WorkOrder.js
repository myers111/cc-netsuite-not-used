/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/search','N/currentRecord','N/url'],

function(record,search,currentRecord,url) {
    
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

    function addSpecialItem() {

		var objRecord = currentRecord.get();

    	var id = objRecord.getValue({
    	    fieldId: 'id'
    	});

    	var project = objRecord.getText({
    	    fieldId: 'job'
    	});

    	if (!project) {
    		
    		alert('You need to select a project.');
    		
    		return;
    	}
    	
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_ccm_specialitem_su',
            deploymentId: 'customdeploy_ccm_specialitem_su',
            returnExternalUrl: false,
			params: {
				'rid': id,
				'prj': project,
				'cs': 'WorkOrder'
			}
        });
        
        window.open(suiteletURL);
    }
    
    function handleSpecialItem(itemId) {

		var objRecord = currentRecord.get();

    	var itemCount = objRecord.getLineCount({
    	    sublistId: 'item'
    	});

    	objRecord.insertLine({
    	    sublistId: 'item',
    	    line: itemCount
    	});
    	
    	objRecord.setCurrentSublistValue({
    	    sublistId: 'item',
    	    fieldId: 'item',
    	    value: itemId
    	});

        if (itemCount > 25) {

            alert("Your Sales Order has more than 25 items. If you did not choose \"Show All\" before you added the item, your item was created, but it could not be added to the list. You'll have to add it manually.");
        }
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
        validateDelete: validateDelete,
        saveRecord: saveRecord*/
        addSpecialItem: addSpecialItem,
        handleSpecialItem: handleSpecialItem
    };
    
});
