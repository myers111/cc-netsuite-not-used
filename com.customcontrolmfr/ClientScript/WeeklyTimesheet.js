/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/search'],
/**
 * @param {record} record
 */
function(record,search) {
    
    var subClassId = null;
    
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

		context.currentRecord.setCurrentSublistValue({
		    sublistId: 'timeitem',
		    fieldId: 'location',
		    value: 5,
		    ignoreFieldChange: true
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

    	if (context.sublistId != 'timeitem') return;

    	if (context.fieldId == 'customer') {

            setProjectClass(context.currentRecord);
    	}
    	else if (context.fieldId == 'item') {

    		setAdminClass(context.currentRecord);
    	}
        else if (context.fieldId == 'class') {

            var serviceItemId = context.currentRecord.getCurrentSublistValue({
                sublistId: 'timeitem',
                fieldId: 'item'
            });

            var classId = context.currentRecord.getCurrentSublistValue({
                sublistId: 'timeitem',
                fieldId: 'class'
            });

            subClassId = null;

            if (classId == 7) { // Admin

                subClassId = 13; // Admin
            }
            else {

                switch (parseInt(serviceItemId)) {

                    case 36: // Programming PLC
                    case 37: // Programming HMI
                        subClassId = 8; // PLC & HMI Programming
                        break;
                }
            }
        }
        else if (context.fieldId == 'cseg_ccm_subclass') {

            if (subClassId) {

                context.currentRecord.setCurrentSublistValue({
                    sublistId: 'timeitem',
                    fieldId: 'cseg_ccm_subclass',
                    value: subClassId,
                    ignoreFieldChange: true
                });

                subClassId = null;
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

    }

    function setProjectClass(objRecord) {

        // Get project

    	var projectId = objRecord.getCurrentSublistValue({
    		sublistId: 'timeitem',
    		fieldId: 'customer'
    	});
    	
        // Get project class

  	    search.create({
   	        type: record.Type.JOB,
   	        columns: ['custentity_ccm_class'],
   	        filters: [
                search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.IS,
                    values: [projectId]
                })
            ],
    	}).run().each(function(result) {
    	    	
    	    var classId = result.getValue({
            	name: 'custentity_ccm_class'
	        });
    	
            // Set project class

    		objRecord.setCurrentSublistValue({
    		    sublistId: 'timeitem',
    		    fieldId: 'class',
    		    value: classId,
    		    ignoreFieldChange: true
    		});
    	        
            return true;
	    });
    }

    function setAdminClass(objRecord) {

		var itemId = objRecord.getCurrentSublistValue({
			sublistId: 'timeitem',
			fieldId: 'item'
		});

		switch (parseInt(itemId)) {
		case 20:    // Selling
		case 29:    // Admin
		case 30:    // PTO
		case 1490:  // Holiday
		case 1491:  // Paid Leave
			break;
		default:
			return;
		}
	
		objRecord.setCurrentSublistValue({
		    sublistId: 'timeitem',
		    fieldId: 'class',
		    value: 7 // Admin
		});
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
        saveRecord: saveRecord*/
    };
});
