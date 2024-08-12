/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
/**
 * @param {record} record
 */
function(record) {
	
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
		
		var workunits = context.currentRecord.getValue({
		    fieldId: 'custevent_ccm_plannedworkunits'
		});

		if (workunits.length == 0) {
			
			context.currentRecord.setValue({
			    fieldId: 'custevent_ccm_plannedworkunits',
			    value: 1,
			    ignoreFieldChange: true
			});
		}

		var plannedwork = context.currentRecord.getValue({
		    fieldId: 'plannedwork'
		});

		var calculated = 0;
	
		switch (parseInt(workunits)) {
		case 1:
			calculated = parseFloat(plannedwork); // hours
			break;
		case 2:
			calculated = parseFloat(plannedwork) / 8.0; // days
			break;
		case 3:
			calculated = parseFloat(plannedwork) / 40.0; // weeks
			break;
		}

		context.currentRecord.setValue({
		    fieldId: 'custevent_ccm_plannedwork',
		    value: calculated,
		    ignoreFieldChange: true
		});
		
    	autoPlannedWork(context);
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

    	if (context.sublistId == null && (context.fieldId == 'custevent_ccm_plannedwork' || context.fieldId == 'custevent_ccm_plannedworkunits')) {

			var work = context.currentRecord.getValue({
			    fieldId: 'custevent_ccm_plannedwork'
			});
		
			var workunits = context.currentRecord.getValue({
			    fieldId: 'custevent_ccm_plannedworkunits'
			});
	
			var calculated = 0;
	

	    	if (context.fieldId == 'custevent_ccm_plannedwork') {

				switch (parseInt(workunits)) {
				case 1:
					calculated = parseFloat(work); // hours
					break;
				case 2:
					calculated = parseFloat(work) * 8.0; // days
					break;
				case 3:
					calculated = parseFloat(work) * 40.0; // weeks
					break;
				}
				
				context.currentRecord.setValue({
				    fieldId: 'plannedwork',
				    value: calculated,
				    ignoreFieldChange: false
				});
	    	}
	    	else {

				var plannedwork = context.currentRecord.getValue({
				    fieldId: 'plannedwork'
				});
		
				switch (parseInt(workunits)) {
				case 1:
					calculated = parseFloat(plannedwork); // hours
					break;
				case 2:
					calculated = parseFloat(plannedwork) / 8.0; // days
					break;
				case 3:
					calculated = parseFloat(plannedwork) / 40.0; // weeks
					break;
				}
				
				context.currentRecord.setValue({
				    fieldId: 'custevent_ccm_plannedwork',
				    value: calculated,
				    ignoreFieldChange: false
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

    	if (context.sublistId != 'assignee') return;
		
		autoPlannedWork(context);

    	var work = 0;
    	
		var numLines = context.currentRecord.getLineCount({
		    sublistId: 'assignee'
		});

		for (var i = 0; i < numLines; i++) {
			
			work += context.currentRecord.getSublistValue({
			    sublistId: 'assignee',
			    fieldId: 'plannedwork',
			    line: i
			});
		}

		var workunits = context.currentRecord.getValue({
		    fieldId: 'custevent_ccm_plannedworkunits'
		});

		var calculated = 0;

		switch (parseInt(workunits)) {
		case 1:
			calculated = parseFloat(work); // hours
			break;
		case 2:
			calculated = parseFloat(work) * 8.0; // days
			break;
		case 3:
			calculated = parseFloat(work) * 40.0; // weeks
			break;
		}

		context.currentRecord.setValue({
		    fieldId: 'custevent_ccm_plannedwork',
		    value: parseInt(calculated),
		    ignoreFieldChange: true
		});
		
		if (numLines == 0) {

			context.currentRecord.setValue({
			    fieldId: 'plannedwork',
			    value: 0,
			    ignoreFieldChange: true
			});
		}
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
    	
    	var valid = true;
    	
    	if (context.fieldId == 'custevent_ccm_plannedworkunits') {
    		
			var workunits = context.currentRecord.getValue({
			    fieldId: 'custevent_ccm_plannedworkunits'
			});
			
			valid = (workunits.length > 0);
    	}
    	
    	return valid;
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

    function autoPlannedWork(context) {

    	var numLines = context.currentRecord.getLineCount({
    	    sublistId: 'assignee'
    	});

    	var auto = (numLines > 0);
    	
		if (auto) {

			context.currentRecord.setValue({
			    fieldId: 'custevent_ccm_plannedworkunits',
			    value: 1,
			    ignoreFieldChange: true
			});
		}
		
		context.currentRecord.getField({
		    fieldId: 'custevent_ccm_plannedworkunits'
		}).isDisabled = auto;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,/*
        postSourcing: postSourcing,*/
        sublistChanged: sublistChanged,/*
        lineInit: lineInit,*/
        validateField: validateField/*,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord*/
    };
});
