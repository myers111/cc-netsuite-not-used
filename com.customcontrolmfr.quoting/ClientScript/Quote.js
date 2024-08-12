/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord','N/record','N/url','N/search'],

function(currentRecord,record,url,search) {
	
    var MILESTONE_PAYMENT = 34;

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
    	
		var numLines = context.currentRecord.getLineCount({
		    sublistId: 'item'
		});

        for (var i = 0; i < numLines; i++) {

            var itemId = context.currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });

            disableBomFields(itemId, context.currentRecord, i);
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

        if (context.sublistId != 'item') return;
        if (context.fieldId != 'item') return;

        var itemId = context.currentRecord.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item'
        });

        disableBomFields(itemId, context.currentRecord, context.line);
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

    function disableBomFields(itemId, objRecord, line) {

        if (!itemId) return;
//alert('|'+itemId+'|'+MILESTONE_PAYMENT+'|');
var isDisabled = false;//((itemId + '') == (MILESTONE_PAYMENT + '') ? false : true);

        objRecord.getSublistField({
            sublistId: 'item',
            fieldId: 'custcol_ccm_bom',
            line: line
        }).isDisabled = isDisabled;

        objRecord.getSublistField({
            sublistId: 'item',
            fieldId: 'custcol_ccm_bomrevision',
            line: line
        }).isDisabled = isDisabled;
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
    };  
});
