/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/search', 'N/redirect', 'N/ui/serverWidget', 'N/url'],
/**
 * @param {log} log
 * @param {record} record
 * @param {search} search
 */
function(log, record, search, redirect, serverWidget, url) {
   
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
                
        context.form.clientScriptModulePath = '../ClientScript/SubItem.js';

    	var quantity = 0;
    	var received = 0;
	    
    	var poid = context.newRecord.getValue({
    		fieldId: 'custrecord_ccm_si_purchaseorder'
    	});

    	if (context.newRecord.id) {
    
        	var item = context.newRecord.getValue({
        		fieldId: 'custrecord_ccm_si_item'
        	});

        	quantity = subItemQuantity(poid, item);

        	received = subItemReceived(poid, context.newRecord.id);
    	}
    	else {

    		context.form.getField({
    		    id: 'custrecord_ccm_si_item'
    		}).updateDisplayType({
    		    displayType: serverWidget.FieldDisplayType.HIDDEN
    		});
    		
    		var field = context.form.addField({
    		    id: 'custpage_item',
    		    type: serverWidget.FieldType.SELECT,
    		    label: 'Item',
    		    container: 'primaryinformation'
    		});
    		
    		context.form.insertField({
    		    field: field,
    		    nextfield: 'custrecord_ccm_si_item'
    		});

    		var items = getItems(poid);
    		
    		for (var i = 0; i < items.length; i++) {

    			field.addSelectOption({
    			    value: items[i].id,
    			    text: items[i].txt
    			});
    		}
    	}
	    
    	var itemquantity = context.newRecord.getValue({
    		fieldId: 'custrecord_ccm_si_itemquantity'
    	});

    	context.newRecord.setValue({
    		fieldId: 'custrecord_ccm_si_quantity',
    		value: '' + (itemquantity * quantity)
    	});
	    
    	context.newRecord.setValue({
    		fieldId: 'custrecord_ccm_si_received',
    		value: '' + received
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
	    
    	var poid = context.newRecord.getValue({
    		fieldId: 'custrecord_ccm_si_purchaseorder'
    	});

        var recordURL = url.resolveRecord({
            recordType: record.Type.PURCHASE_ORDER,
            recordId: poid
        });

        redirect.redirect({
        	url: recordURL
        });
    }
    
    function getItems(poid) {

	    var s = search.create({
	        type: record.Type.PURCHASE_ORDER,
	        columns: [
						search.createColumn({
			            	name: 'formulanumeric',
			            	formula: '{item.internalid}',
						}),
						search.createColumn({
			            	name: 'formulatext',
			            	formula: '{item.name}',
						}),
	        ],
	        filters: [
		  	            search.createFilter({
			            	name: 'internalid',
			                operator: search.Operator.IS,
			                values: poid
			            }),
		  	            search.createFilter({
			            	name: 'formulanumeric',
			            	formula: '{item.internalid}',
			                operator: search.Operator.GREATERTHAN,
			                values: 0
			            }),
		    ]
	    });
	    
	    var items = [];
	    
	    s.run().each(function(result) {

	    	var item = {};
	    	
	    	item.id = parseInt(result.getValue(result.columns[0]));
	    	item.txt = result.getValue(result.columns[1]);

    		items.push(item);

	        return true;
	    });

	    return items;
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

    return {
        beforeLoad: beforeLoad,
        //beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
