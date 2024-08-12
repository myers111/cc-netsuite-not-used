/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/redirect', 'N/url'],
/**
 * @param {log} log
 * @param {record} record
 * @param {serverWidget} serverWidget
 */
function(log, record, search, serverWidget, redirect, url) {
   
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
                
        context.form.clientScriptModulePath = '../ClientScript/SubItemReceipt.js';

    	var poid = context.newRecord.getValue({
    	    fieldId: 'custrecord_ccm_sir_purchaseorder'
    	});

        var itemsTab = context.form.addTab({
            id: 'custpage_subitems',
            label: 'SubItems'
        });

        var sublist = context.form.addSublist({
            id: 'custpage_subitemslist',
            type: 'list',
            label: 'SubItems',
            tab: 'custpage_subitems'
        });

        sublist.addField({
            id: 'custpage_id',
            type: 'integer',
            label: 'ID'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });

    	if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {

            sublist.addField({
                id: 'custpage_cb',
                type: 'checkbox',
                label: 'Reveive'
            });
    	}

        sublist.addField({
            id: 'custpage_name',
            type: 'text',
            label: 'SubItem'
        });

        sublist.addField({
            id: 'custpage_description',
            type: 'text',
            label: 'Description'
        });

        sublist.addField({
            id: 'custpage_onhand',
            type: 'integer',
            label: 'On Hand'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.READONLY
        });

        sublist.addField({
            id: 'custpage_remaining',
            type: 'integer',
            label: 'Remaining'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.READONLY
        });

        sublist.addField({
            id: 'custpage_quantity',
            type: 'integer',
            label: 'Quantity'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.ENTRY
        });

        sublist.addMarkAllButtons();

        var s = null;
        
    	if (context.type == context.UserEventType.CREATE) {

    	    s = search.create({
    	        type: 'customrecord_ccm_subitem',
    	        columns: ['internalid','altname','custrecord_ccm_si_description','custrecord_ccm_si_itemquantity','custrecord_ccm_si_item'],
    	        filters: [
    	                  search.createFilter({
    		                	name: 'custrecord_ccm_si_purchaseorder',
    	    		            operator: search.Operator.IS,
    	    		            values: poid
    	    		      }),
    	         ],
    	    });
    	}
    	else {

    	    s = search.create({
    	        type: 'customrecord_ccm_subitemreceiptitem',
    	        columns: ['internalid','custrecord_ccm_siri_subitem',
    	                  search.createColumn({
    	                	  name: 'altname',
    	                	  join: 'custrecord_ccm_siri_subitem'
    	                  }),
    	                  search.createColumn({
    	                	  name: 'custrecord_ccm_si_description',
    	                	  join: 'custrecord_ccm_siri_subitem'
    	                  }),
    	                  search.createColumn({
    	                	  name: 'custrecord_ccm_si_itemquantity',
    	                	  join: 'custrecord_ccm_siri_subitem'
    	                  }),
    	                  search.createColumn({
    	                	  name: 'custrecord_ccm_si_item',
    	                	  join: 'custrecord_ccm_siri_subitem'
    	                  }),
    	                  'custrecord_ccm_siri_quantity',
    			],
    	        filters: [
    		  	            search.createFilter({
    			            	name: 'custrecord_ccm_siri_subitemreceipt',
    			                operator: search.Operator.IS,
    			                values: context.newRecord.id
    			            }),
    		    ]
    	    });
    	}
	   
	    s.run().each(function(result) {

	    	var id = 0;
	        var siid = 0;
	        var name = '';
	        var description = '';
	        var itemquantity = 0;
	        var item = 0;
	        var quantity = 0;
  
	    	if (context.type == context.UserEventType.CREATE) {

		        siid = result.getValue({name: 'internalid'});
		        name = result.getValue({name: 'altname'});
		        description = result.getValue({name: 'custrecord_ccm_si_description'});
		        itemquantity = result.getValue({name: 'custrecord_ccm_si_itemquantity'});
		        item = result.getValue({name: 'custrecord_ccm_si_item'});
	    	}
	    	else {
	    		
		        id = result.getValue({name: 'internalid'});
		        siid = result.getValue({name: 'custrecord_ccm_siri_subitem'});
	        	name = result.getValue({join: 'custrecord_ccm_siri_subitem', name: 'altname'});
	        	description = result.getValue({join: 'custrecord_ccm_siri_subitem', name: 'custrecord_ccm_si_description'});
		        itemquantity = result.getValue({join: 'custrecord_ccm_siri_subitem', name: 'custrecord_ccm_si_itemquantity'});
		        item = result.getValue({join: 'custrecord_ccm_siri_subitem', name: 'custrecord_ccm_si_item'});
		        quantity = result.getValue({name: 'custrecord_ccm_siri_quantity'});
	    	}
	        
	        var poQuantity = subItemQuantity(poid, item);

	        var received = subItemReceived(poid, siid);
	        
	        var remaining = (poQuantity * itemquantity) - received;
            
	        if (context.type == context.UserEventType.CREATE && remaining == 0) return true;

	        if (quantity == 0) quantity = remaining;
	        
    		var numLines = sublist.lineCount < 0 ? 0 : sublist.lineCount;

			sublist.setSublistValue({
			    id: 'custpage_id',
			    line: numLines,
			    value: '' + id
			});

			sublist.setSublistValue({
			    id: 'custpage_cb',
			    line: numLines,
			    value: 'T'
			});

			sublist.setSublistValue({
			    id: 'custpage_name',
			    line: numLines,
			    value: name
			});

			if (description) {
				
    			sublist.setSublistValue({
    			    id: 'custpage_description',
    			    line: numLines,
    			    value: description
    			});
			}

			sublist.setSublistValue({
			    id: 'custpage_onhand',
			    line: numLines,
			    value: ('' + received)
			});

			sublist.setSublistValue({
			    id: 'custpage_remaining',
			    line: numLines,
			    value: ('' + remaining)
			});

			sublist.setSublistValue({
			    id: 'custpage_quantity',
			    line: numLines,
			    value: ('' + quantity)
			});

	        return true;
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
    function beforeSubmit(context) {

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
   	
		var numLines = context.newRecord.getLineCount({
			sublistId: 'custpage_subitemslist'
		});

		for (var i = 0; i < numLines; i++) {

			var sel = context.newRecord.getSublistValue({
				sublistId: 'custpage_subitemslist',
			    fieldId: 'custpage_cb',
			    line: i
			});

			var id = context.newRecord.getSublistValue({
				sublistId: 'custpage_subitemslist',
				fieldId: 'custpage_id',
			    line: i
			});
			
			if (sel == 'T') {

				var quantity = context.newRecord.getSublistValue({
				    sublistId: 'custpage_subitemslist',
				    fieldId: 'custpage_quantity',
				    line: i
				});

				var objRecord = null;
				
				if (id == 0) {
					
					objRecord = record.create({
					    type: 'customrecord_ccm_subitemreceiptitem',
					    isDynamic: true
					});

					var name = context.newRecord.getSublistValue({
						sublistId: 'custpage_subitemslist',
						fieldId: 'custpage_name',
					    line: i
					});

					var siid = getSubItemId(name);
					
					objRecord.setValue({
					    fieldId: 'custrecord_ccm_siri_subitemreceipt',
					    value: context.newRecord.id
					});
					
					objRecord.setValue({
					    fieldId: 'custrecord_ccm_siri_subitem',
					    value: siid
					});
				}
				else {
					
					objRecord = record.load({
					    type: 'customrecord_ccm_subitemreceiptitem',
					    id: id,
					    isDynamic: true
					});
				}
			
				objRecord.setValue({
				    fieldId: 'custrecord_ccm_siri_quantity',
				    value: ('' + quantity)
				});
				
				objRecord.save();
			}
			else {
				
				if (id > 0) {
					
					record.delete({
						type: 'customrecord_ccm_subitemreceiptitem',
					    id: id
					});
				}
			}
		}
	    
		//checkReceiveItems(context.newRecord);
		
    	var poid = context.newRecord.getValue({
    		fieldId: 'custrecord_ccm_sir_purchaseorder'
    	});

        var recordURL = url.resolveRecord({
            recordType: record.Type.PURCHASE_ORDER,
            recordId: poid
        });

        redirect.redirect({
        	url: recordURL
        });
    }
    
    function subItemQuantity(poid, id) {

	    var s = search.create({
	        type: record.Type.PURCHASE_ORDER,
	        columns: ['quantity'],
	        filters: [
		  	            search.createFilter({
			            	name: 'internalid',
			                operator: search.Operator.IS,
			                values: poid
			            }),
		  	            search.createFilter({
			            	name: 'formulanumeric',
			            	formula: '{item.internalid}',
			                operator: search.Operator.EQUALTO,
			                values: id
			            }),
		    ]
	    });
	    
	    var quantity = 0;
	    
	    s.run().each(function(result) {

	    	quantity = result.getValue('quantity');

    		if (!quantity) quantity = 0;

	        return false;
	    });

	    return parseInt(quantity);
    }

    function subItemReceived(poid, id) {

	    var s = search.create({
	        type: 'customrecord_ccm_subitemreceiptitem',
	        columns: [
						search.createColumn({
						    name: 'custrecord_ccm_siri_quantity',
					        summary: search.Summary.SUM
						}),
			],
	        filters: [
		  	            search.createFilter({
			            	name: 'custrecord_ccm_sir_purchaseorder',
							join: 'custrecord_ccm_siri_subitemreceipt',
			                operator: search.Operator.IS,
			                values: poid
			            }),
		  	            search.createFilter({
			            	name: 'custrecord_ccm_siri_subitem',
			                operator: search.Operator.IS,
			                values: id
			            }),
		    ]
	    });
	    
	    var quantity = 0;
	    
	    s.run().each(function(result) {

	    	quantity = result.getValue(result.columns[0]);

    		if (!quantity) quantity = 0;

	        return false;
	    });

	    return parseInt(quantity);
    }

    function getSubItemId(name) {

	    var s = search.create({
	        type: 'customrecord_ccm_subitem',
	        columns: ['internalid'],
	        filters: [
	                  search.createFilter({
		                	name: 'name',
	    		            operator: search.Operator.IS,
	    		            values: name
	    		      }),
	        ],
	    });

	    var id = 0;
	    
	    s.run().each(function(result) {

	    	id = result.getValue('internalid');

	    	if (!id) id = 0;

	        return false;
	    });

	    return id;
    }
    
    function checkReceiveItems(objRecord) {

		var poId = objRecord.getValue({
			fieldId: 'custrecord_ccm_si_purchaseorder'
		});

	    var s1 = search.create({
	        type: 'customrecord_ccm_subitem',
	        columns: ['internalid','custrecord_ccm_si_item','custrecord_ccm_si_itemquantity'],
	        filters: [
	                  search.createFilter({
		                	name: 'custrecord_ccm_si_purchaseorder',
	    		            operator: search.Operator.IS,
	    		            values: poId
	    		      }),
	         ],
	    });
	   
	    var items = [];
	    
	    s1.run().each(function(result) {
    		
	        var subItemId = result.getValue({name: 'internalid'});
	        var itemId = result.getValue({name: 'custrecord_ccm_si_item'});
	        var itemQuantity = result.getValue({name: 'custrecord_ccm_si_itemquantity'});

	        var received = subItemReceived(poId, subItemId);
	        var quantity = Math.floor(received / itemquantity);

	    	if (!items.length || (items.length && items[items.length - 1].id != itemId)) items.push({id: itemId});

	    	if (!items[items.length - 1].qty || (items[items.length - 1].qty && quantity < items[items.length - 1].qty)) items[items.length - 1].qty = quantity;
	        
	        return true;
	    });
        
    	log.debug({
    	    title: 'poId',
    	    details: poId
    	});
        
    	log.debug({
    	    title: 'items',
    	    details: items
    	});

	    var s2 = search.create({
	        type: record.Type.PURCHASE_ORDER,
	        columns: [
	                  search.createColumn({
	                	  name: 'formulanumeric',
	                	  formula: '{item.internalid}'
	                  }),
	                  search.createColumn({
	                	  name: 'formulanumeric',
	                	  formula: '{quantityshiprecv}'
	                  }),
	        ],
	        filters: [
		  	            search.createFilter({
			            	name: 'internalid',
			                operator: search.Operator.IS,
			                values: poId
			            }),
		  	            search.createFilter({
			            	name: 'formulanumeric',
			            	formula: '{item.internalid}',
			                operator: search.Operator.GREATERTHAN,
			                values: 0
			            }),
		    ]
	    });

	    var objRecord = null;
	    
	    s2.run().each(function(result) {

	    	var itemId = result.getValue(result.columns[0]);
	    	var received = result.getValue(result.columns[1]);
	        
	    	log.debug({
	    	    title: '000000000',
	    	    details: 'itemId: ' + itemId + ', received: ' + received
	    	});

	    	for (var i = 0; i < items.length; i++) {
	    		
	    		if (items[i].id != itemId) continue;
		        
		    	log.debug({
		    	    title: '111111111',
		    	    details: 'items[i].qty: ' + items[i].qty +  ', received: ' + received
		    	});

	    		if (items[i].qty > received) {
	    			
	    			if (!objRecord) {
	    				
	    				var objRecord = record.transform({
	    				    fromType: record.Type.PURCHASE_ORDER,
	    				    fromId: poId,
	    				    toType: record.Type.ITEM_RECEIPT,
	    				    isDynamic: true,
	    				});
	    			}
	    		}
	    	}
	    	
	        return false;
	    });
	    
	    if (objRecord) objRecord.save();
    }
    
    return {
        beforeLoad: beforeLoad,
        //beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
