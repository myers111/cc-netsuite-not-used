/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/record','N/currentRecord','N/url'],
/**
 * @param {log} log
 * @param {record} record
 */
function(search,record,currentRecord,url) {

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

    	if (context.mode !== 'create') return;
    	
	    context.currentRecord.setValue({
	        fieldId: 'location',
	        value: 5
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
    
    function importRevision() {

		var objRecord = currentRecord.get();

    	var id = objRecord.getValue({
    	    fieldId: 'id'
    	});

        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_ccm_fileupload_su',
            deploymentId: 'customdeploy_ccm_fileupload_su',
            returnExternalUrl: false,
			params: {
				'iid': id,
				'fid': 1385,
				'sid': 'customscript_ccm_revisionimport_su',
				'did': 'customdeploy_ccm_revisionimport_su',
				'title': 'Import Revision',
				'temp': 'https://system.netsuite.com/core/media/media.nl?id=5693&c=632005&h=Wb80X5ZRpSnaspMibr9ugyT2yDvD43mnEA6OiDuLmt9Pew-o&_xt=.csv',
				'inst': 'https://632005.app.netsuite.com/core/media/media.nl?id=5704&c=632005&h=YZX9911oqvDcBjdQD2nJ6VI6ucaz0-b6nFkF0B-w1MivYo4n&_xt=.pdf',
				'p1': record.Type.ESTIMATE
			}
        });

        location.href = suiteletURL;
    }
    
    function addSpecialItem() {

		var objRecord = currentRecord.get();

    	var id = objRecord.getValue({
    	    fieldId: 'internalid'
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
				'prj': project
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
        importRevision: importRevision,
        addSpecialItem: addSpecialItem,
        handleSpecialItem: handleSpecialItem
    };
    
});
