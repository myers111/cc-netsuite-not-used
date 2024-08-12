/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/format', 'N/record', 'N/ui/serverWidget', 'N/ui/message', 'N/search', 'N/url'],
/**
 * @param {log} log
 * @param {record} record
 */
function(log, format, record, serverWidget, message, search, url) {

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

    	if (context.type != context.UserEventType.PRINT) {

			if (context.type == context.UserEventType.VIEW) {
        		
            	subItemCount = subitemReceive(context);
        	}

            var subItemsTab = context.form.addTab({
                id: 'custpage_subitems',
                label: 'SubItems'
            });
            
            context.form.insertTab({
                tab: subItemsTab,
                nexttab:'shipping'
            });
            
            subItemsSublistCreate(context, 'custpage_subitems');

        	if (subItemCount) subItemReceiptsSublistCreate(context, 'custpage_subitems');
                
            context.form.clientScriptModulePath = '../ClientScript/PurchaseOrder.js';
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

	}
    
    function subItemsSublistCreate(context, tabId) {

        var sublist = context.form.addSublist({
            id: 'custpage_subitemslist',
            type: 'staticlist',
            label: 'SubItems',
            tab: tabId
        });
 		
	    sublist.addButton({
            id: 'custpage_subitemnew',
            label: 'New SubItem',
            functionName: 'subitemNew'
    	});
 		
	    sublist.addButton({
            id: 'custpage_subitemreceive',
            label: 'Receive',
            functionName: 'subitemReceive'
    	});

	    sublist.addField({
            id: 'custpage_name',
            type: 'inlinehtml',
            label: 'Name'
        });
       
        sublist.addField({
            id: 'custpage_description',
            type: 'text',
            label: 'Description'
        });
        
        sublist.addField({
            id: 'custpage_received',
            type: 'integer',
            label: 'Received'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
        
        sublist.addField({
            id: 'custpage_quantity',
            type: 'integer',
            label: 'Quantity'
        });
        
        sublist.addField({
            id: 'custpage_item',
            type: 'text',
            label: 'Item'
        });
        
        //subItemAddItemField(context, sublist);

		if (!context.newRecord.id) return;

	    var s = search.create({
	        type: 'customrecord_ccm_subitem',
	        columns: ['internalid','altname','custrecord_ccm_si_description','custrecord_ccm_si_itemquantity','custrecord_ccm_si_item','custrecord_ccm_si_item.name'
/*	                  search.createColumn({
	                	  name: 'formulatext',
	                	  formula: '{custrecord_ccm_si_item.name}'
	                  }),
*/	        ],
	        filters: [
	                  search.createFilter({
	                	  name: 'custrecord_ccm_si_purchaseorder',
			              operator: search.Operator.IS,
			              values: context.newRecord.id
			          }),
		    ]
	    });

	    s.run().each(function(result) {

        	var id = result.getValue('internalid');
        	var name = result.getValue('altname');
        	var description = result.getValue('custrecord_ccm_si_description');
        	var itemquantity = result.getValue('custrecord_ccm_si_itemquantity');
        	var itemId = result.getValue('custrecord_ccm_si_item');
        	var item = result.getValue('custrecord_ccm_si_item.name');
        	//var item = result.getText(result.columns[5]);
            
        	log.debug({
        	    title: 'item',
        	    details: item
        	});

    		if (!itemquantity) itemquantity = 0;
    		if (!itemId) itemId = 0;

    		if (itemquantity == 0 || itemId == 0) return true;

    		var quantity = itemquantity * subItemQuantity(context.newRecord.id, itemId);

    		var received = subItemReceived(context.newRecord.id, id);
    		
    		var numLines = sublist.lineCount < 0 ? 0 : sublist.lineCount;
			
			var linkURL = url.resolveRecord({
			    recordType: 'customrecord_ccm_subitem',
			    recordId: id
			});

    		sublist.setSublistValue({
			    id: 'custpage_name',
			    line: numLines,
			    value: ('<a href="' + linkURL + '" class="dottedlink">' + name + '</a>')
			});

    		if (description) {
    			
        		sublist.setSublistValue({
    			    id: 'custpage_description',
    			    line: numLines,
    			    value: description
    			});
    		}
            
    		sublist.setSublistValue({
			    id: 'custpage_quantity',
			    line: numLines,
			    value: '' + quantity
			});
    		
    		sublist.setSublistValue({
			    id: 'custpage_received',
			    line: numLines,
			    value: '' + received
			});
    		
    		sublist.setSublistValue({
			    id: 'custpage_item',
			    line: numLines,
			    value: item
			});

	        return true;
	    });
    }
    
    function subItemAddItemField(context, sublist) {
        
        var fld = sublist.addField({
            id: 'custpage_item',
            type: serverWidget.FieldType.SELECT,
            label: 'Item'
        });
		
        if (context.type == context.UserEventType.VIEW) {
        	
        	fld.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.INLINE
            });
        }
        
    	var numLines = context.newRecord.getLineCount({
    	    sublistId: 'item'
    	});
    	
    	if (numLines <= 0) return;

		for (var i = 0; i < numLines; i++) {

			var id = context.newRecord.getSublistValue({
			    sublistId: 'item',
			    fieldId: 'item',
			    line: i
			});

			var name = context.newRecord.getSublistValue({
			    sublistId: 'item',
			    fieldId: 'item',
			    line: i
			});

	        fld.addSelectOption({
	            value: id,
	            text: name
	        });
		}
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
    
    function subitemLink(context) {
		
    	var numLines = context.newRecord.getLineCount({
    	    sublistId: 'item'
    	});
    	
    	if (numLines <= 0) return;

		for (var i = 0; i < numLines; i++) {

			var id = context.newRecord.getSublistValue({
			    sublistId: 'item',
			    fieldId: 'item',
			    line: i
			});

			var quantity = context.newRecord.getSublistValue({
			    sublistId: 'item',
			    fieldId: 'quantity',
			    line: i
			});

			var quantityreceived = context.newRecord.getSublistValue({
			    sublistId: 'item',
			    fieldId: 'quantityreceived',
			    line: i
			});

			if (id && quantity && (quantity != quantityreceived)) {
				
				var linkURL = url.resolveRecord({
				    recordType: 'customrecord_ccm_subitem',
				    isEditMode: true,
				    params:{
				    	'record.custrecord_ccm_si_purchaseorder': context.newRecord.id,
				    	'record.custrecord_ccm_si_item': id
				    }
				});

				context.newRecord.setSublistValue({
				    sublistId: 'item',
				    fieldId: 'custcol_ccm_subitem',
				    line: i,
				    value: ('<a href="' + linkURL + '" class="dottedlink">New</a>')
				});
			}
		}
    }
    
    function subitemReceive(context) {

		if (!context.newRecord.id) return 0;

	    var s = search.create({
	        type: 'customrecord_ccm_subitem',
	        columns: [
						search.createColumn({
						    name: 'formulanumeric',
					        summary: search.Summary.COUNT,
					        formula: '{internalid}'
						}),
			],
	        filters: [
		  	            search.createFilter({
			            	name: 'custrecord_ccm_si_purchaseorder',
			                operator: search.Operator.IS,
			                values: context.newRecord.id
			            }),
		    ]
	    });

	    var count = 0;
	    
	    s.run().each(function(result) {

        	count = parseInt(result.getValue(result.columns[0]));

    		if (!count) count = 0;

	        return false;
	    });

    	if (count > 0) {

    		context.form.addPageInitMessage({
    	        title: 'Sub Items',
    	        message: 'This Purchase Order has ' + count + ' sub item' + (count > 1 ? 's' : '') + '. Use the "Receive" button on the "SubItems" sublist to receieve.',
    	        type: message.Type.INFORMATION,
    			duration: 11000
    		});
    	}

    	return count;
    }
    
    function subItemReceiptsSublistCreate(context, tabId) {

        var sublist = context.form.addSublist({
            id: 'custpage_subitemreceiptslist',
            type: 'staticlist',
            label: 'Receipts',
            tab: tabId
        });

        sublist.addField({
            id: 'custpage_date',
            type: 'inlinehtml',
            label: 'Date'
        });

        sublist.addField({
            id: 'custpage_type',
            type: 'inlinehtml',
            label: 'Type'
        });

        sublist.addField({
            id: 'custpage_number',
            type: 'inlinehtml',
            label: 'Number'
        });

	    var s = search.create({
	        type: 'customrecord_ccm_subitemreceipt',
	        columns: ['internalid','name','custrecord_ccm_sir_date'],
	        filters: [
	                  search.createFilter({
	                	  name: 'custrecord_ccm_sir_purchaseorder',
			              operator: search.Operator.IS,
			              values: context.newRecord.id
			          }),
		    ]
	    });

	    s.run().each(function(result) {

        	var id = result.getValue('internalid');
        	var name = result.getValue('name');
        	var date = result.getValue('custrecord_ccm_sir_date');

    		var numLines = sublist.lineCount < 0 ? 0 : sublist.lineCount;
			
			var linkURL = url.resolveRecord({
			    recordType: 'customrecord_ccm_subitemreceipt',
			    recordId: id
			});

    		sublist.setSublistValue({
			    id: 'custpage_date',
			    line: numLines,
			    value: ('<a href="' + linkURL + '" class="dottedlink">' + date + '</a>')
			});

    		sublist.setSublistValue({
			    id: 'custpage_type',
			    line: numLines,
			    value: 'SubItem Receipt'
			});

    		sublist.setSublistValue({
			    id: 'custpage_number',
			    line: numLines,
			    value: name
			});

	        return true;
	    });
    }

    function getPOName(poId) {

	    var s = search.create({
	        type: search.Type.PURCHASE_ORDER,
	        columns: ['tranid'],
	        filters: [
	  	                search.createFilter({
		                	name: 'formulanumeric',
	    	  	          	formula: '{internalid}',
	    		            operator: search.Operator.EQUALTO,
	    		            values: poId
	    		        }),
		    ]
	    });
	    
	    var tranid = '';
	    
	    s.run().each(function(result) {

	    	tranid = result.getValue('tranid');

	        return false;
	    });
	    
	    return tranid;
    }

    function getNSDateFromJSDate(date) {

    	return format.format({
			value: date,
			type: format.Type.DATE
		});
    }

    return {
        beforeLoad: beforeLoad,
        //beforeSubmit: beforeSubmit,
        //afterSubmit: afterSubmit
    };
});
