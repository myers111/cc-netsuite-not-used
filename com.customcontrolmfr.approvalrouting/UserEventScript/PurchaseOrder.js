/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/ui/serverWidget', 'N/search', 'N/runtime'],
/**
 * @param {log} log
 * @param {record} record
 */
function(log, record, serverWidget, search, runtime) {

	/**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {string} context.type - Trigger type
     * @param {Form} context.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(context) {

    	if (context.type == context.UserEventType.PRINT) return;

        var user = runtime.getCurrentUser();

        var approvalstatus = context.newRecord.getValue({
            fieldId: 'approvalstatus'
        });
        
        var recordcreatedby = context.newRecord.getValue({
            fieldId: 'recordcreatedby'
        });

        var approver = context.newRecord.getValue({
            fieldId: 'nextapprover'
        });

        if (context.type == context.UserEventType.CREATE) {

            addNextApprover(context, user.id, null);
        }
        else if (context.type == context.UserEventType.EDIT) {

            if (approvalstatus != 2) addNextApprover(context, recordcreatedby, approver);
        }
        else if (context.type == context.UserEventType.VIEW) {

            if (approvalstatus != 2) { // approved

                if (approver) addNextApprover(context, recordcreatedby, approver);

                if (approver < 0 && approver != -5) approver = getNextApprover(context.newRecord, user.id, recordcreatedby);

                if (user.id == approver) {

                    context.form.addButton({
                        id: 'custpage_ccm_approve',
                        label: 'Approve',
                        functionName: 'approve'
                    });

                    context.form.addButton({
                        id: 'custpage_ccm_reject',
                        label: 'Reject',
                        functionName: 'reject'
                    });
                }
                else if (user.id == recordcreatedby) {
                  
                    context.form.addButton({
                        id: 'custpage_ccm_requestapproval',
                        label: 'Request Approval',
                        functionName: 'request'
                    });
                }
            }
        }
                
        context.form.clientScriptModulePath = '../ClientScript/PurchaseOrder.js';
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {Record} context.oldRecord - Old record
     * @param {string} context.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(context) {

    	var approvalstatus = context.newRecord.getValue({
		    fieldId: 'approvalstatus'
		});

    	if (approvalstatus == 2) return;

    	var user = runtime.getCurrentUser();

    	var recordcreatedby = context.newRecord.getValue({
		    fieldId: 'recordcreatedby'
		});

    	if (recordcreatedby && user.id != recordcreatedby) return;

	    var empSearch = getEmployeeSearch(user.id);

    	empSearch.run().each(function(result) {

	    	var limit = result.getValue('purchaseorderlimit');

	    	var total = context.newRecord.getValue({
			    fieldId: 'total'
			});

        	if (limit && total < limit) {

            	context.newRecord.setValue({
        		    fieldId: 'approvalstatus',
        		    value: 2
        		});
        	}
        	
	        return false;
	    });
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {Record} context.oldRecord - Old record
     * @param {string} context.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(context) {

	}

    function addNextApprover(context, recordcreatedby, selected) {
    	
		var field = context.form.addField({
		    id: 'custpage_nextapprover',
		    type: serverWidget.FieldType.SELECT,
		    label: 'Next Approver'
		});
		
		context.form.insertField({
		    field: field,
		    nextfield: 'nextapprover'
		});	
		
    	field.addSelectOption({
    	    value: '',
    	    text: ''
    	});

    	var s1 = search.create({
	        type: record.Type.EMPLOYEE,
	        columns: [
	                  'supervisor',
	                  'purchaseorderapprover',
	                  search.createColumn({
	                	  name: 'formulatext',
					      formula: '{supervisor}'
	                  }),
	                  search.createColumn({
	                	  name: 'formulatext',
					      formula: '{purchaseorderapprover}'
	                  }),
	        ],
	        filters: [
  	                search.createFilter({
	                	name: 'internalid',
    		            operator: search.Operator.IS,
    		            values: recordcreatedby
    		        }),
	        ],
	    });

    	var supervisor = null;
    	var approver = null;

    	s1.run().each(function(result) {

	    	supervisor = result.getValue('supervisor');
	    	approver = result.getValue('purchaseorderapprover');
	    	var supervisorname = result.getValue(result.columns[2]);
	    	var approvername = result.getValue(result.columns[3]);

	    	if (supervisor) {
	    		
		    	field.addSelectOption({
		    	    value: supervisor,
		    	    text: supervisorname,
		    	    isSelected: (selected == supervisor)
		    	});
	    	}

	    	if (approver && approver != supervisor) {
	    		
		    	field.addSelectOption({
		    	    value: approver,
		    	    text: approvername,
		    	    isSelected: (selected == approver)
		    	});
	    	}

	        return false;
	    });

    	var s2 = search.create({
	        type: record.Type.EMPLOYEE,
	        columns: ['internalid','entityid'],
	        filters: [
  	                search.createFilter({
	                	name: 'isjobmanager',
    		            operator: search.Operator.IS,
    		            values: true
    		        }),
	        ],
	    });

    	s2.run().each(function(result) {

	    	var id = result.getValue('internalid');
	    	var name = result.getValue('entityid');

	    	if (id != supervisor && id != approver) {
	    		
		    	field.addSelectOption({
		    	    value: id,
		    	    text: name,
		    	    isSelected: (selected == id)
		    	});
	    	}

	        return true;
	    });
    }

    function getEmployeeSearch(id) {

    	return search.create({
	        type: record.Type.EMPLOYEE,
	        columns: ['supervisor','purchaseorderlimit','purchaseorderapprovallimit','purchaseorderapprover'],
	        filters: [
  	                search.createFilter({
	                	name: 'internalid',
    		            operator: search.Operator.IS,
    		            values: id
    		        }),
	        ],
	    });
    }

    function getNextApprover(objRecord, id, recordcreatedby) {

    	var approver = null;
    	
	    var empSearch = getEmployeeSearch(recordcreatedby);

    	empSearch.run().each(function(result) {

	    	var supervisor = result.getValue('supervisor');
	    	approver = result.getValue('purchaseorderapprover');
	    	var limit = result.getValue('purchaseorderlimit');
	    	
	    	var total = objRecord.getValue({
			    fieldId: 'total'
			});

        	if (recordcreatedby == id && limit && total < limit) approver = id;
	    	if (!approver) approver = supervisor;
	    	if (!approver) approver = id; // if no approver or supervisor

	        return false;
	    });
    	
    	return approver;
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        //afterSubmit: afterSubmit
    };
});
