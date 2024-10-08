/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord','N/url','../Module/ccTransaction','../Module/ccItem'],
/**
 * @param {log} log
 * @param {record} record
 */
function(currentRecord,url,ccTransaction,ccItem) {

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

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    function addSpecialItem() {

		var objRecord = currentRecord.get();

    	var project = objRecord.getText({
    	    fieldId: 'job'
    	});

    	if (!project) {
    		
    		alert('You need to select a project.');
    		
    		return;
    	}

        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_ccm_items_special_su',
            deploymentId: 'customdeploy_ccm_items_special_su',
            returnExternalUrl: false,
			params: {
				'rid': objRecord.id,
				'prj': project,
				'cs': 'SalesOrder'
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

    function importItems() {

        window.open(ccTransaction.getImportURL('SalesOrder'));
    }

    function exportItems() {

        location.href = ccTransaction.getExportURL('SalesOrder');
    }

    function handleItems(data) {

		var objRecord = currentRecord.get();

        objRecord.setValue({
            fieldId: 'custpage_importinprogress',
            value: true
        });

        for (var i = 0; i < data.items.length; i++) {

            var numLines = objRecord.getLineCount({
                sublistId: 'item'
            });

            objRecord.insertLine({
                sublistId: 'item',
                line: numLines
            });

            var item = data.items[i];

            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: parseInt(item.id),
                ignoreFieldChange: false,
                fireSlavingSync: true
            });

            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: item.qty,
                fireSlavingSync: true
            });

            var unitsId = (item.units ? ccItem.getUnitsIdFromClient(item.units) : 1);

            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'units',
                value: unitsId,
                fireSlavingSync: true
            });

            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: parseFloat(item.price),
                fireSlavingSync: true
            });

            objRecord.commitLine({
                sublistId: 'item'
            });
        }

        objRecord.setValue({
            fieldId: 'custpage_importinprogress',
            value: false
        });
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
        saveRecord: saveRecord,*/
        addSpecialItem: addSpecialItem,
        handleSpecialItem: handleSpecialItem,
        importItems: importItems,
        exportItems: exportItems,
        handleItems: handleItems
    };
});
