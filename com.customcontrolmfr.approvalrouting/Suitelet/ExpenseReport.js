/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/email', 'N/log', 'N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url'],

function(email, log, record, redirect, runtime, search, serverWidget, url) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {

        try {

        	if (context.request.method == 'GET') {
                
        		var action = context.request.parameters.action;
        		
        		if (action == 'approve') {

                	var exid = context.request.parameters.exid;

                	var user = runtime.getCurrentUser();

        			approve(exid, user.id);
        		}
        		
        		var title = (action == 'request' ? 'Request Expense Report Approval' : action == 'approve' ? 'Approve Expense Report' : 'Reject Expense Report');

            	var form = serverWidget.createForm({
                    title: title
                });

            	form.clientScriptModulePath = '../ClientScript/ExpenseReport.js';

            	addHiddenField(form, 'custpage_id', context.request.parameters.exid);
            	
            	addHiddenField(form, 'custpage_action', action);
            	
            	addHiddenField(form, 'custpage_referer', context.request.headers.referer);
                
                form.addSubmitButton({
                    label: 'Submit'
                });
                
                form.addButton({
                    id: 'custpage_cancel',
                    label: 'Cancel',
                    functionName: 'onCancel'
                });
             	
                form.addField({
            	    id: 'custpage_comments',
            	    type: serverWidget.FieldType.TEXTAREA,
            	    label: 'Comments'
            	});
               
                context.response.writePage(form);
        	}
        	else if (context.request.method === 'POST') {

        		var id = context.request.parameters.custpage_id;
        		var action = context.request.parameters.custpage_action;
        		var comments = context.request.parameters.custpage_comments;
    			
            	var user = runtime.getCurrentUser();
            	
                var objRecord = record.load({
                    type: record.Type.EXPENSE_REPORT,
                    id: id,
                    isDynamic: true,
                });

        		if (action != 'reject') {

            	    var empSearch = getEmployeeSearch(user.id);

                	empSearch.run().each(function(result) {

            	    	var supervisor = result.getValue('supervisor');
            	    	var approver = result.getValue('approver');
            	    	
            	    	if (!approver) approver = supervisor;
            	    	if (!approver) approver = user.id; // if no approver or supervisor
            	    	if (approver) {
            		
            	    		objRecord.setValue({
                    		    fieldId: 'nextapprover',
                    		    value: approver
                    		});
            	    	}

            	        return false;
            	    });
            		
            		objRecord.save();
        		}

        		// EMAIL /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        		var tranid = objRecord.getValue({
        		    fieldId: 'tranid'
        		});

                var recordURL = url.resolveRecord({
                    recordType: record.Type.EXPENSE_REPORT,
                    recordId: id,
                    isEditMode: false
                });

                if (action == 'reject') {

                	var entity = objRecord.getValue({
            		    fieldId: 'entity'
            		});

                    var message = 'An expense report (<a href=\"' + recordURL + '\">' + tranid + '</a>) that you created has been rejected.';
                    if (comments.length) message += '<br><br>' + comments;

                    sendEmail(user.id, entity, 'Expense Report Rejected', message)
                }
                else {

                	var approver = objRecord.getValue({
            		    fieldId: 'nextapprover'
            		});

					var subject = '';
					var message = '';

					if (action == 'request') {
						
						subject = 'Expense Report Approval Request';
	                    var message = 'I created an expense report (<a href=\"' + recordURL + '\">' + tranid + '</a>) that needs your approval.';
	                }
	                else {

	                	subject = 'Expense Report Needs Approval';
	                    var message = 'I approved an expense report (<a href=\"' + recordURL + '\">' + tranid + '</a>) that now needs your approval.';
	                }

					if (comments.length) message += '<br><br>' + comments;

					sendEmail(user.id, approver, subject, message);
        		}

                redirect.redirect({
                	url: recordURL
                });
        	}
        }
        catch(e) {

            log.error('Expense Report',e);
        }    
    }

    function getEmployeeSearch(id) {

    	return search.create({
	        type: record.Type.EMPLOYEE,
	        columns: ['supervisor','expenselimit','approvallimit','approver'],
	        filters: [
  	                search.createFilter({
	                	name: 'internalid',
    		            operator: search.Operator.IS,
    		            values: id
    		        }),
	        ],
	    });
    }

    function approve(exid, eid) {

    	var approved = false;
    	
	    var empSearch = getEmployeeSearch(eid);

    	empSearch.run().each(function(result) {

	    	var supervisor = result.getValue('supervisor');
	    	var approvalimit = result.getValue('approvallimit');
        	
    		var objRecord = record.load({
                type: record.Type.EXPENSE_REPORT,
                id: exid
            });

        	if (!supervisor) {
        		
        		approved = true;
        	}
        	else {
        		
        		var total = objRecord.getValue({
        		    fieldId: 'total'
        		});

        		if (total < approvalimit) approved = true;
        	}

        	if (approved) {

        		objRecord.setValue({
        		    fieldId: 'approvalstatus',
        		    value: 2 // Approved
        		});

        		objRecord.save({
		            enableSourcing: true,
		            ignoreMandatoryFields: true
		        });

        		var tranid = objRecord.getValue({
        		    fieldId: 'tranid'
        		});
				
                var recordURL = url.resolveRecord({
                    recordType: record.Type.EXPENSE_REPORT,
                    recordId: exid,
                    isEditMode: false
                });

            	var entity = objRecord.getValue({
        		    fieldId: 'entity'
        		});

                var message = 'An expense report (<a href=\"' + recordURL + '\">' + tranid + '</a>) that you created has been approved.';

                sendEmail(eid, entity, 'Expense Report Approved', message);

                redirect.redirect({
                	url: recordURL
                });
        	}
        	
	        return false;
	    });
    }
    
    function sendEmail(a, r, s, m) {

    	if (a == r) return;
    	
		m += '<br><br>';
 
		email.send({
	        author: a,
	        recipients: r,
	        subject: s,
	        body: m
	    });  	
    }

    function addHiddenField(form, id, dflt) {
    	
        var field = form.addField({
    	    id : id,
    	    type : serverWidget.FieldType.TEXT,
    	    label : ' '
    	});
        
        field.defaultValue = dflt;

        field.updateDisplayType({
    	    displayType: serverWidget.FieldDisplayType.HIDDEN
    	});
    }

    return {
        onRequest: onRequest
    };
    
});
