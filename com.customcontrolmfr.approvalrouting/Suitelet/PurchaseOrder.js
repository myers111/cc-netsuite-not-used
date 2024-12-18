/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/email', 'N/log', 'N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url'],
/**
 * @param {log} log
 * @param {record} record
 */
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

            	var user = runtime.getCurrentUser();

        		var action = context.request.parameters.action;
        		
        		if (action == 'approve') approve(context.request.parameters.poid, user.id); // will redirect if approved
        		
        		var title = (action == 'request' ? 'Request Purchase Order Approval' : action == 'approve' ? 'Approve Purchase Order' : 'Reject Purchase Order');

            	var form = serverWidget.createForm({
                    title: title
                });

            	form.clientScriptModulePath = '../ClientScript/PurchaseOrder.js';

            	addHiddenField(form, 'custpage_id', context.request.parameters.poid);
            	
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
        		
        		if (action == 'approve') addNextApprover(form, user.id);

                context.response.writePage(form);
        	}
        	else if (context.request.method === 'POST') {

        		var id = context.request.parameters.custpage_id;
        		var action = context.request.parameters.custpage_action;
        		var approver = context.request.parameters.custpage_nextapprover;
        		var comments = context.request.parameters.custpage_comments;
    			
            	var user = runtime.getCurrentUser();
            	
                var objRecord = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: id,
                    isDynamic: true,
                });

        		if (action != 'reject') {

        			if (!approver) {
        				
                    	approver = objRecord.getValue({
                		    fieldId: 'nextapprover'
                		});

                    	if (approver <= 0 || approver == user.id) {
                    		
                    	    var empSearch = getEmployeeSearch(user.id);

                        	empSearch.run().each(function(result) {

                    	    	var supervisor = result.getValue('supervisor');
                    	    	var approver = result.getValue('purchaseorderapprover');
                    	    	
                    	    	if (!approver) approver = supervisor;
                    	    	if (!approver) approver = user.id; // if no approver or supervisor

                    	        return false;
                    	    });
                    	}
        			}
        			
        	    	if (approver) {
                		
        	    		objRecord.setValue({
                		    fieldId: 'nextapprover',
                		    value: approver
                		});
                		
                		objRecord.save();
        	    	}
        		}

        		// EMAIL /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        		var tranid = objRecord.getValue({
        		    fieldId: 'tranid'
        		});

                var recordURL = url.resolveRecord({
                    recordType: record.Type.PURCHASE_ORDER,
                    recordId: id,
                    isEditMode: false
                });

                if (action == 'reject') {

            		var recordcreatedby = objRecord.getValue({
            		    fieldId: 'recordcreatedby'
            		});

                    var message = 'A purchase order (<a href=\"' + recordURL + '\">' + tranid + '</a>) that you created has been rejected.';
                    if (comments.length) message += '<br><br>' + comments;

                    sendEmail(user.id, recordcreatedby, 'Purchase Order Rejected', message)
                }
                else {

					var subject = '';
					var message = '';

					if (action == 'request') {
						
						subject = 'Purchase Order Approval Request';
	                    var message = 'I created a purchase order (<a href=\"' + recordURL + '\">' + tranid + '</a>) that needs your approval.';
	                }
	                else {

	                	subject = 'Purchase Order Needs Approval';
	                    var message = 'I approved a purchase order (<a href=\"' + recordURL + '\">' + tranid + '</a>) that now needs your approval.';
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

            log.error('Purchase Order',e);
        }    
    }

    function addNextApprover(form, id) {

		var field = form.addField({
		    id: 'custpage_nextapprover',
		    type: serverWidget.FieldType.SELECT,
		    label: 'Next Approver'
		});

		field.updateLayoutType({
		    layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE
		});

		field.updateBreakType({
		    breakType: serverWidget.FieldBreakType.STARTROW
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
    		            values: id
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

	    	if (approver) {
	    		
		    	field.addSelectOption({
		    	    value: approver,
		    	    text: approvername,
		    	    isSelected: true
		    	});
	    	}

	    	if (supervisor && supervisor != approver) {
	    		
		    	field.addSelectOption({
		    	    value: supervisor,
		    	    text: supervisorname,
		    	    isSelected: (approver == null)
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
		    	    text: name
		    	});
	    	}

	        return true;
	    });
    }

    function getNextApprover(poId) {

    	var s = search.create({
	        type: record.Type.PURCHASE_ORDER,
	        columns: ['createdby','nextapprover'],
	        filters: [
  	                search.createFilter({
	                	name: 'internalid',
    		            operator: search.Operator.IS,
    		            values: poId
    		        }),
	        ],
	    });

    	var cb = 0;
    	var id = 0;
    	
    	s.run().each(function(result) {

	    	cb = result.getValue('createdby');
	    	id = result.getValue('nextapprover');

	        return false;
	    });

    	log.debug({
    	    title: 'nextapprover',
    	    details: id
    	});

    	var approver = null;
    	
	    var empSearch = getEmployeeSearch(id);

    	empSearch.run().each(function(result) {

	    	var supervisor = result.getValue('supervisor');
	    	approver = result.getValue('purchaseorderapprover');

	    	if (!approver) approver = supervisor;
	    	if (!approver) approver = id; // if no approver or supervisor
	    	if (!approver) approver = cb;

	        return false;
	    });
    	
    	return approver;
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

    function approve(poid, eid) {

    	var approved = false;
    	
	    var empSearch = getEmployeeSearch(eid);

    	empSearch.run().each(function(result) {

	    	var supervisor = result.getValue('supervisor');
	    	var approvalimit = result.getValue('purchaseorderapprovallimit');
        	
    		var objRecord = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: poid
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
                    recordType: record.Type.PURCHASE_ORDER,
                    recordId: poid,
                    isEditMode: false
                });

        		var recordcreatedby = objRecord.getValue({
        		    fieldId: 'recordcreatedby'
        		});

                var message = 'A purchase order (<a href=\"' + recordURL + '\">' + tranid + '</a>) that you created has been approved.';

                sendEmail(eid, recordcreatedby, 'Purchase Order Approved', message);

                redirect.redirect({
                	url: recordURL
                });
        	}
        	
	        return false;
	    });
    }
    
    function sendEmail(a, r, s, m) {

    	log.debug({
    	    title: 'Send Email',
    	    details: 'Author: ' + a + ', Recipients: ' + r + ', Subject: ' + s
    	});

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
