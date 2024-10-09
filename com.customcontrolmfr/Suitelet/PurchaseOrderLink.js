/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/redirect', 'N/search', 'N/ui/serverWidget', 'N/url'],
/**
 * @param {log} log
 * @param {record} record
 * @param {redirect} redirect
 * @param {search} search
 * @param {serverWidget} dialog
 * @param {url} url
 */
function(log, record, redirect, search, serverWidget, url) {
   
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

            	var form = serverWidget.createForm({
                    title: "Purchase Order Link",
                });

            	form.clientScriptModulePath = '../ClientScript/PurchaseOrderLink.js';

            	var docId = context.request.parameters.did;
            	var docType = context.request.parameters.dt;
            	var linekey = context.request.parameters.key;
            	var projectId = context.request.parameters.prid;
            	var itemId = context.request.parameters.iid;
            	var itemQty = context.request.parameters.qty;
                
            	if (!projectId) {

    				var objRecord = record.load({
    				    type: docType,
    				    id: docId
    				});

            		var numLines = objRecord.getLineCount({
            			sublistId: 'item'
            		});

            		for (var i = 0; i < numLines; i++) {

        				var key = objRecord.getSublistValue({
        				    sublistId: 'item',
        				    fieldId: 'lineuniquekey',
        				    line: i
        				});

        				if (key == linekey) {

            				objRecord.setSublistValue({
            				    sublistId: 'item',
            				    fieldId: 'custcol_ccm_polinkid',
            				    line: i,
            				    value: ''
            				});

            				objRecord.save();

                            redirect.redirect({
                            	url: getURL(docId, docType)
                            });
        				}
            		}
            	}
            	
            	addHiddenField(form, 'custpage_did', docId);
            	addHiddenField(form, 'custpage_dt', docType);
            	addHiddenField(form, 'custpage_key', linekey);
            	addHiddenField(form, 'custpage_prid', projectId);
            	addHiddenField(form, 'custpage_iid', itemId);
            	addHiddenField(form, 'custpage_qty', itemQty);
            	addHiddenField(form, 'custpage_referer', (context.request.parameters.referer == null ? context.request.headers.referer : context.request.parameters.referer));
                
                form.addSubmitButton({
                    label: 'Submit'
                });
                
                form.addButton({
                    id: 'custpage_cancel',
                    label: 'Cancel',
                    functionName: 'onCancel'
                });

                form.addField({
                    id: 'custpage_msg',
                    type: 'inlinehtml',
                    label: ' '
                }).defaultValue = 'Select the Purchase Order you want to link to.  This will not adjust quantities.';
            	
                var itemsTab = form.addTab({
                    id: 'custpage_purchaseorders',
                    label: 'Purchase Orders'
                });

                var sublist = form.addSublist({
                    id: 'item',
                    type: 'list',
                    label: 'Purchase Orders',
                    tab: 'custpage_purchaseorders'
                });

                sublist.addField({
                    id: 'custpage_id',
                    type: 'integer',
                    label: ' '
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                sublist.addField({
                    id: 'custpage_key',
                    type: 'integer',
                    label: ' '
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                sublist.addField({
                    id: 'custpage_cb',
                    type: 'checkbox',
                    label: 'Select'
                });

                sublist.addField({
                    id: 'custpage_tranid',
                    type: 'text',
                    label: 'Purchase Order'
                });

                sublist.addField({
                    id: 'custpage_createdfrom',
                    type: 'text',
                    label: 'Created From'
                });

                sublist.addField({
                    id: 'custpage_item',
                    type: 'text',
                    label: 'Item'
                });

                sublist.addField({
                    id: 'custpage_qty',
                    type: 'integer',
                    label: 'Quantity'
                });
/*
                sublist.addField({
                    id: 'custpage_newqty',
                    type: 'integer',
                    label: 'New Quantity'
                });
*/
    		    var s = search.create({
    		        type: record.Type.PURCHASE_ORDER,
    		        columns: ['internalid','lineuniquekey','tranid','quantity','createdfrom',
    		                  search.createColumn({
          		                  name: 'formulatext',
        	    	  	          formula: '{createdfrom.number}',
    		                  }),
    		                  search.createColumn({
          		                  name: 'formulatext',
        	    	  	          formula: '{createdfrom.type}',
    		                  }),
    		                  search.createColumn({
          		                  name: 'formulanumeric',
        	    	  	          formula: '{item.internalid}',
    		                  }),
    		                  search.createColumn({
          		                  name: 'formulatext',
        	    	  	          formula: "{item.name}",
    		                  }),
    		        ],
    		        filters: [
        		              search.createFilter({
        		                  name: 'formulanumeric',
        	    	  	          formula: '{job.internalid}',
        		                  operator: search.Operator.EQUALTO,
        		                  values: projectId
        		              }),
        		              search.createFilter({
        		                  name: 'formulanumeric',
        	    	  	          formula: '{item.internalid}',
        		                  operator: search.Operator.EQUALTO,
        		                  values: itemId
        		              }),
/*        		              		search.createFilter({
        		                  name: 'formulanumeric',
        	    	  	          formula: '{quantity}',
        		                  operator: search.Operator.GREATERTHAN,
        		                  values: 0
        		              }),
*/		    		        ],
    		    });
            	
            	var numLines = 0;

            	var poName = '';
            	
    		    s.run().each(function(result) {

    		    	var internalid = result.getValue('internalid');
    		    	var lineuniquekey = result.getValue('lineuniquekey');
    		    	var tranid = result.getValue('tranid');
    		    	var quantity = result.getValue('quantity');
    		    	var createdfrom = result.getValue('createdfrom');
    		    	var createdfromname = result.getValue(result.columns[5]);
    		    	var createdfromtype = result.getValue(result.columns[6]);
    		    	var itemid = result.getValue(result.columns[7]);
    		    	var itemname = result.getValue(result.columns[8]);

            		numLines = sublist.lineCount < 0 ? 0 : sublist.lineCount;
/*
            		if (poName != tranid) {
            			
            			poName = tranid;
            			
        		    	sublist.setSublistValue({
        		    	    id: 'custpage_tranid',
        		    	    line: numLines,
        		    	    value: tranid
        		    	});

                		if (createdfrom) {
                			
                			var recordURL = url.resolveRecord({
                	            recordType: createdfromtype.replace(' ', ''),
                	            recordId: createdfrom,
                	            isEditMode: false
                	        });

            		    	sublist.setSublistValue({
            		    	    id: 'custpage_createdfrom',
            		    	    line: numLines,
            		    	    value: '<a href=\"' + recordURL + '\" class="dottedlink">' + createdfromname + '</a>'
            		    	});
                		}

        		    	sublist.setSublistValue({
        		    	    id: 'custpage_newqty',
        		    	    line: numLines,
        		    	    value: itemQty
        		    	});

        		    	numLines++;
            		}

            		if (itemid == itemId) {
*/
	    		    	sublist.setSublistValue({
	    		    	    id: 'custpage_id',
	    		    	    line: numLines,
	    		    	    value: internalid
	    		    	});
	        			
	    		    	sublist.setSublistValue({
	    		    	    id: 'custpage_key',
	    		    	    line: numLines,
	    		    	    value: lineuniquekey
	    		    	});
	        			
	    		    	sublist.setSublistValue({
	    		    	    id: 'custpage_tranid',
	    		    	    line: numLines,
	    		    	    value: tranid
	    		    	});
            			
                		if (createdfrom) {
                			
                			var recordURL = url.resolveRecord({
                	            recordType: createdfromtype.replace(' ', ''),
                	            recordId: createdfrom,
                	            isEditMode: false
                	        });

            		    	sublist.setSublistValue({
            		    	    id: 'custpage_createdfrom',
            		    	    line: numLines,
            		    	    value: '<a href=\"' + recordURL + '\" class="dottedlink">' + createdfromname + '</a>'
            		    	});
                		}

        		    	sublist.setSublistValue({
        		    	    id: 'custpage_item',
        		    	    line: numLines,
        		    	    value: itemname
        		    	});

        		    	sublist.setSublistValue({
        		    	    id: 'custpage_qty',
        		    	    line: numLines,
        		    	    value: quantity
        		    	});
/*
        		    	sublist.setSublistValue({
        		    	    id: 'custpage_newqty',
        		    	    line: numLines,
        		    	    value: quantity + itemQty
        		    	});
            		}
*/
    		        return true;
    		    });

                context.response.writePage(form);
        	}
        	else if (context.request.method === 'POST') {

        		var projectId = context.request.parameters.custpage_prid;
        		var docId = context.request.parameters.custpage_did;
        		var docType = context.request.parameters.custpage_dt;
          		var linekey = context.request.parameters.custpage_key;
        		var itemId = context.request.parameters.custpage_iid;
          		var itemQty = context.request.parameters.custpage_qty;

        		var numLines = context.request.getLineCount({
        		    group: 'item'
        		});

        		for (var i = 0; i < numLines; i++) {
        			
        			var sel = context.request.getSublistValue({
        			    group: 'item',
        			    name: 'custpage_cb',
        			    line: i
        			});
        			
        			if (sel != 'T') continue;

    				var objRecord = record.load({
    				    type: docType,
    				    id: docId
    				});

            		if (objRecord) {

        				var tranid = context.request.getSublistValue({
        				    group: 'item',
        				    name: 'custpage_tranid',
        				    line: i
        				});

        				var id = context.request.getSublistValue({
        				    group: 'item',
        				    name: 'custpage_id',
        				    line: i
        				});

        				var key = context.request.getSublistValue({
        				    group: 'item',
        				    name: 'custpage_key',
        				    line: i
        				});

                		var lines = objRecord.getLineCount({
                			sublistId: 'item'
                		});

                		for (var j = 0; j < lines; j++) {
            				
            				var key = objRecord.getSublistValue({
            				    sublistId: 'item',
            				    fieldId: 'lineuniquekey',
            				    line: j
            				});
                            
                        	log.debug({
                        	    title: '000000000000',
                        	    details: 'key ' + key + ', linekey ' + linekey
                        	});

            				if (key == linekey) {

                				var polinkid = tranid + '|' + id + '|' + key;
                                
                            	log.debug({
                            	    title: '000000000000',
                            	    details: polinkid
                            	});

                				objRecord.setSublistValue({
                				    sublistId: 'item',
                				    fieldId: 'custcol_ccm_polinkid',
                				    line: j,
                				    value: polinkid
                				});

                				objRecord.save();

                				break;
            				}
                		}
            		}

            		break;
        		}

            	log.debug({
            	    title: 'Update Complete',
            	    details: 'Redirect to id: ' + docId
            	});

                redirect.redirect({
                	url: getURL(docId, docType)
                });
        	}
        }
        catch(e) {
        	  
            log.error('Purchase Order Link',e);
        }    
    }

    function getURL(docId, docType) {
    	
        return url.resolveRecord({
            recordType: docType,
            recordId: docId
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
