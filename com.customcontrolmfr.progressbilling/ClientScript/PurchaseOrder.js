/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord','N/record','N/url','N/search'],

function(currentRecord,record,url,search) {
	
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

    function progressPayment() {

		var objRecord = currentRecord.get();

    	var id = objRecord.getValue({
    	    fieldId: 'id'
    	});

    	var projectId = getProjectId(id);

        var recordURL = url.resolveRecord({
            recordType: record.Type.VENDOR_BILL,
            isEditMode: true,
            params: {
                'transform': 'purchord',
                'whence': '',
                'id': id,
                'e': 'T',
                'memdoc': 0,
                'prid': projectId,
                'record.custbody_ccm_purchaseorder': id,
                'record.approvalstatus': 'Pending Approval'
            }
        });

        location.href = recordURL;
	}
    
    function getProjectId(poid) {

	    var s = search.create({
	        type: record.Type.PURCHASE_ORDER,
	        columns: [
	                  search.createColumn({
	                	  name: 'formulanumeric',
	                	  formula: '{job.internalid}'
	                  }),
	        ],
	        filters: [
		  	            search.createFilter({
			            	name: 'internalid',
			                operator: search.Operator.IS,
			                values: poid
			            }),
		  	            search.createFilter({
			            	name: 'formulatext',
			            	formula: '{item}',
			                operator: search.Operator.ISNOTEMPTY
			            }),
		    ]
	    });
	    
	    var projectId = 0;
	    
	    s.run().each(function(result) {

	    	projectId = result.getValue(result.columns[0]);

    		if (!projectId) projectId = 0;

	        return false;
	    });

	    return parseInt(projectId);
    }
    
    function progressCredit() {
    	
		var objRecord = currentRecord.get();

    	var id = objRecord.getValue({
    	    fieldId: 'id'
    	});
    	
        var recordURL = url.resolveRecord({
            recordType: record.Type.VENDOR_CREDIT,
            isEditMode: true,
            params: {
                'transform': 'purchord',
                'whence': '',
                'id': id,
                'e': 'T',
                'memdoc': 0,
                'record.custbody_ccm_purchaseorder': id
            }
        });

        location.href = recordURL;
	}

    return {
        pageInit: pageInit,
        /*fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord,*/
        progressPayment: progressPayment,
        progressCredit: progressCredit,
    };  
});
