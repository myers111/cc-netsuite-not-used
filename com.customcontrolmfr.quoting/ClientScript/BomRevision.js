/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search'],

function(search) {
    
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

        if (context.sublistId == '') {
            
            if (context.fieldId == 'custpage_quantity' || context.fieldId == 'custpage_quote') recalcMain(context.currentRecord);
        }
        if (context.sublistId == 'custpage_itemssublist') {
            
            if (context.fieldId == 'custpage_quantity' || context.fieldId == 'custpage_price') recalcItem(context.currentRecord);
        }
        if (context.sublistId == 'custpage_expsublist') {
            
            if (context.fieldId == 'custpage_quantity' || context.fieldId == 'custpage_price') recalcExpense(context.currentRecord);
        }
        if (context.sublistId == 'custpage_itemssublist') {
            
            if (context.fieldId == 'custpage_quantity' || context.fieldId == 'custpage_price') recalcItem(context.currentRecord);
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

    function recalcMain(objRecord) {

        var qty = objRecord.getCurrentValue({
            fieldId: 'custpage_quantity'
        });        

        var quote = objRecord.getCurrentValue({
            fieldId: 'custpage_quote'
        });        

        objRecord.setCurrentValue({
            fieldId: 'custpage_extquote',
            value: parseFloat(qty) * parseFloat(quote)
        });
    }

    function recalcItem(objRecord) {

        var qty = objRecord.getCurrentSublistValue({
            sublistId: 'custpage_itemssublist',
            fieldId: 'custpage_quantity'
        });        

        var price = objRecord.getCurrentSublistValue({
            sublistId: 'custpage_itemssublist',
            fieldId: 'custpage_price'
        });        

        var mu = objRecord.getCurrentSublistValue({
            sublistId: 'custpage_itemssublist',
            fieldId: 'custpage_markup'
        });        

        var dfltmu = objRecord.getCurrentValue({
            fieldId: 'custpage_defaultmarkup'
        });        

        objRecord.setCurrentSublistValue({
            sublistId: 'custpage_itemssublist',
            fieldId: 'custpage_quote',
            value: parseFloat(qty) * parseFloat(price) * (1 + (mu ? parseFloat(mu) : parseFloat(dfltmu)))
        });
    }

    function recalcLabor() {

    }

    function recalcExpense() {

    }

    function onCancel() {

    	var objRecord = currentRecord.get();

    	var referer = objRecord.getValue({
    	    fieldId: 'custpage_referer'
    	});

        window.onbeforeunload = null;
        
        location.href = referer;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged/*,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord*/,
        onCancel: onCancel
    };
    
});
