/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/email', 'N/log', 'N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url'],
/**
 * @param {log} log
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(email, log, record, redirect, runtime, search, serverWidget, url) {

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

    	var user = runtime.getCurrentUser();
/*
    	log.debug({
    	    title: 'Provisional Item',
    	    details: 'User ID: ' + user.id
    	});
*/
		context.newRecord.setValue({
		    fieldId: 'custrecord_ccm_pi_employee',
		    value: user.id
		});
		
		var approver = getApprover();

		if (approver.indexOf(user.id) >= 0) {
			
	    	log.debug({
	    	    title: 'Provisional Item',
	    	    details: 'User is approver'
	    	});
		}
		else {
        	
	    	context.form.getField({
	    	    id: 'custrecord_ccm_pi_approved'
	    	}).updateDisplayType({
	    	    displayType : serverWidget.FieldDisplayType.DISABLED
	    	});
	    	
	    	context.form.getField({
	    	    id: 'custrecord_ccm_pi_preferredvendor'
	    	}).updateDisplayType({
	    	    displayType : serverWidget.FieldDisplayType.DISABLED
	    	});
		}
    	
    	context.form.getField({
    	    id: 'custrecord_ccm_pi_quantity'
    	}).updateDisplayType({
    	    displayType : serverWidget.FieldDisplayType.HIDDEN
    	});
                
        context.form.clientScriptModulePath = '../ClientScript/ProvisionalItem.js';
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

    	if (context.oldRecord) {

    		var oldRecordApproved = context.oldRecord.getValue({
    		    fieldId: 'custrecord_ccm_pi_approved'
    		});

    		var newRecordApproved = context.newRecord.getValue({
    		    fieldId: 'custrecord_ccm_pi_approved'
    		});

    		if (newRecordApproved && !oldRecordApproved) {
    	        
    	    	log.debug({
    	    	    title: 'Provisional Item',
    	    	    details: 'Create vendor if necessary'
    	    	});
    	    	
    			try {
   		        
    	    		var vendorId = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_vendor'
    	    		});
    		        
    	    		if (!vendorId) {

    		    		var newvendor = context.newRecord.getValue({
    		    		    fieldId: 'custrecord_ccm_pi_newvendor'
    		    		});

    	    			vendorId = getVendorId(newvendor);
    	    			
    	    			if (vendorId == 0) {
    	    				
        		            var vendorRecord = record.create({
        		                type: record.Type.VENDOR,
        		                isDynamic: true
        		            });
        			        
        		    		vendorRecord.setValue({
        		    		    fieldId: 'companyname',
        		    		    value: newvendor
        		    		});
        		    		
        		    		vendorId = vendorRecord.save({
        			            enableSourcing: true,
        			            ignoreMandatoryFields: true
        			        });
    	    			}
    	   		        
        	    		context.newRecord.setValue({
        	    		    fieldId: 'custrecord_ccm_pi_vendor',
        	    		    value: vendorId
        	    		});
    	   		        
        	    		context.newRecord.setValue({
        	    		    fieldId: 'custrecord_ccm_pi_newvendor',
        	    		    value: ''
        	    		});
    	    		}
    	        }
    			catch(e) {
    	      	  
    	            log.error('Provisional Item',e);
    			}
    		}
    	}
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
		return;
    	var user = runtime.getCurrentUser();

        var recordURL = url.resolveRecord({
            recordType: 'customrecord_ccm_provisionalitem',
            recordId: context.newRecord.id,
            isEditMode: false
        });

		var itemid = context.newRecord.getValue({
		    fieldId: 'custrecord_ccm_pi_itemid'
		});

    	if (context.oldRecord) {

    		var oldRecordApproved = context.oldRecord.getValue({
    		    fieldId: 'custrecord_ccm_pi_approved'
    		});

    		var newRecordApproved = context.newRecord.getValue({
    		    fieldId: 'custrecord_ccm_pi_approved'
    		});

    		if (newRecordApproved && !oldRecordApproved) {
    	        
    	    	log.debug({
    	    	    title: 'Provisional Item',
    	    	    details: 'Approved'
    	    	});
    	    	
    			try {

    	            var itemRecord = record.create({
    	                type: record.Type.INVENTORY_ITEM,
    	                isDynamic: true
    	            });

    		        itemRecord.setText({
    		            fieldId: 'itemid',
    		            text: itemid
    		        });

    	    		var salesdescription = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_salesdescription'
    	    		});

    	            itemRecord.setText({
    	                fieldId: 'salesdescription',
    	                text: salesdescription
    	            });

    	    		var purchasedescription = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_purchasedescription'
    	    		});

    	            itemRecord.setText({
    	                fieldId: 'purchasedescription',
    	                text: (purchasedescription.length > 0 ? purchasedescription : salesdescription)
    	            });

    	    		var displayname = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_displayname'
    	    		});

    	            itemRecord.setText({
    	                fieldId: 'displayname',
    	                text: displayname
    	            });

    	    		var vendorname = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_vendorname'
    	    		});

    	            itemRecord.setText({
    	                fieldId: 'vendorname',
    	                text: vendorname
    	            });

    	    		var unitstype = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_unitstype'
    	    		});

    	            itemRecord.setValue({
    	    	        fieldId: 'unitstype',
    	    	        value: unitstype
    	    	    });

    	    		var stockunit = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_stockunit'
    	    		});

    	            itemRecord.setValue({
    	    	        fieldId: 'stockunit',
    	    	        value: stockunit
    	    	    });

    	    		var purchaseunit = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_purchaseunit'
    	    		});

    	            itemRecord.setValue({
    	    	        fieldId: 'purchaseunit',
    	    	        value: purchaseunit
    	    	    });

    	    		var saleunit = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_saleunit'
    	    		});

    	            itemRecord.setValue({
    	    	        fieldId: 'saleunit',
    	    	        value: saleunit
    	    	    });

    	    		var consumptionunit = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_consumptionunit'
    	    		});

    	            itemRecord.setValue({
    	    	        fieldId: 'consumptionunit',
    	    	        value: consumptionunit
    	    	    });

    	    		var manufacturer = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_manufacturer'
    	    		});

    	            itemRecord.setValue({
    	    	        fieldId: 'manufacturer',
    	    	        value: manufacturer
    	    	    });

    	    		var mpn = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_mpn'
    	    		});

    	            itemRecord.setValue({
    	    	        fieldId: 'mpn',
    	    	        value: mpn
    	    	    });

    	    		var rate = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_rate'
    	    		});

    	            itemRecord.setValue({
    	    	        fieldId: 'rate',
    	    	        value: rate
    	    	    });

    	            itemRecord.setValue({
    	    	        fieldId: 'preferredlocation',
    	    	        value: 1
    	    	    });

    		        itemRecord.setValue({
    			        fieldId: 'taxschedule',
    			        value: 1
    			    });
    		        
    	    		var vendorId = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_vendor'
    	    		});

    	        	itemRecord.selectNewLine({
    	                sublistId: 'itemvendor'
    	            });

    	            itemRecord.setCurrentSublistValue({
    	                sublistId: 'itemvendor',
    	                fieldId: 'vendor',
    	                value: vendorId
    	            });

    	    		var purchaseprice = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_purchaseprice'
    	    		});

    	            itemRecord.setCurrentSublistValue({
    	                sublistId: 'itemvendor',
    	                fieldId: 'purchaseprice',
    	                value: purchaseprice
    	            });

    	    		var preferredvendor = context.newRecord.getValue({
    	    		    fieldId: 'custrecord_ccm_pi_preferredvendor'
    	    		});

    	            itemRecord.setCurrentSublistValue({
    	                sublistId: 'itemvendor',
    	                fieldId: 'preferredvendor',
    	                value: preferredvendor
    	            });

    	            itemRecord.commitLine({
    	                sublistId: 'itemvendor'
    	            });

    		        itemRecord.save({
    		            enableSourcing: true,
    		            ignoreMandatoryFields: true
    		        });
    		        
    		        var owner = context.newRecord.getValue({
		    		    fieldId: 'ownerid'
		    		});

    	    		var message = 'I approved a provisional item (' + itemid + ') that you created.  It is now an item in NetSuite.<br><br>';
    		        
    		        sendEmail(user.id, owner, message);
    	        }
    			catch(e) {
    	      	  
    	            log.error('Provisional Item',e);
    			}
    		}
    	}
    	else {
    		
    		var approver = getApprover();

    		var message = 'I created a provisional item (<a href=\"' + recordURL + '\">' + itemid + '</a>) that needs your approval.<br><br>';
    		
    		sendEmail(user.id, approver, message);
    	}
    }

    function getApprover() {

    	var approver = [];
    	
	    var s = search.create({
	        type: record.Type.EMPLOYEE,
	        columns: ['internalid'],
	        filters: [
	              search.createFilter({
	                  name: 'custentity_ccm_provisionalitemapprover',
	                  operator: search.Operator.IS,
	                  values: 'T'
	              })
	         ],
	    });
	    
	    s.run().each(function(result) {
	        
	        var id = result.getValue({
	            name: 'internalid'
	        });
	        
	        approver.push(parseInt(id));
	    	
	        return true;
	    });

	    return approver;
    }

    function getVendorId(vendor) {
    	
	    var s = search.create({
	        type: record.Type.VENDOR,
	        columns: ['internalid'],
	        filters: [
	              search.createFilter({
	                  name: 'entityid',
	                  operator: search.Operator.IS,
	                  values: vendor
	              })
	         ],
	    });
	    
	    var id = 0;
	    
	    s.run().each(function(result) {
	        
	        id = result.getValue({
	            name: 'internalid'
	        });
	    	
	        return false;
	    });

	    return id;
    }
    
    function sendEmail(a, r, m) {
return;
		email.send({
	        author: a,
	        recipients: r,
	        subject: 'New Provisional Item',
	        body: m
	    });  	
    }
    
    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
