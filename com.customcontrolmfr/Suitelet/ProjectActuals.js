/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/url'],
/**
 * @param {log} log
 * @param {record} record
 * @param {search} search
 * @param {serverWidget} serverWidget
 * @param {url} url
 */
function(log, record, search, serverWidget, url) {

	var fmAccountsCost = "CASE {accounttype} WHEN 'Cost of Goods Sold' THEN CASE WHEN {account} = '5080 Cost of Goods Sold : Over / (Under) Billings COGS' THEN 0 ELSE 1 END WHEN 'Expense' THEN 1 WHEN 'Other Expense' THEN 1 ELSE 0 END";
	var fmAccountsRevenue = "CASE {accounttype} WHEN 'Income' THEN 1 WHEN 'Other Income' THEN 1 ELSE 0 END";

	var fmItemTypes = "CASE {item.type} WHEN 'Assembly Item' THEN 1 WHEN 'Inventory Item' THEN 1 WHEN 'Non-inventory Item' THEN 1  WHEN 'Discount' THEN 1 ELSE 0 END";
	var fmInvalidTypes = "CASE {type} WHEN 'Purchase Order' THEN 1 WHEN 'Sales Order' THEN 1 WHEN 'Quote' THEN 1 WHEN 'Work Order' THEN 1 WHEN 'Return Authorization' THEN 1 WHEN 'Vendor Return Authorization' THEN 1 WHEN 'Requisition' THEN 1 ELSE 0 END";
	var fmIsExpense = "CASE WHEN {expensecategory} is not null THEN 1 ELSE 0 END";

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
            
        	var form = serverWidget.createForm({
                title: 'Project Actuals',
            });

        	var projectId = context.request.parameters.prid;

            var tab = form.addTab({
                id: 'custpage_tab',
                label: 'Actual Values'
            });

            addInvoiceSublist(form, 'custpage_tab', projectId);
            addMaterialSublist(form, 'custpage_tab', projectId)
            addLaborSublist(form, 'custpage_tab', projectId)
            addWIPSublist(form, 'custpage_tab', projectId)
            addWIPProgressSublist(form, 'custpage_tab', projectId)

            context.response.writePage(form);
        }
        catch(e) {
        	  
            log.error('Project Actuals',e);
        }    
    }

    function addInvoiceSublist(form, tabId, projectId) {
	    
    	var data = [];
    	
	    var actRevenueMaterialSearch = search.create({
	        type: 'transaction',
	        columns: ['internalid','tranid','trandate','type','item','amount'],
	        filters: [
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: '{jobmain.internalid}',
    		            operator: search.Operator.EQUALTO,
    		            values: [projectId]
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmAccountsRevenue,
    		            operator: search.Operator.EQUALTO,
    		            values: 1
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmItemTypes,
    		            operator: search.Operator.EQUALTO,
    		            values: 1
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmInvalidTypes,
    		            operator: search.Operator.EQUALTO,
    		            values: 0
    		        }),
	        ],
	    });
 
	    actRevenueMaterialSearch.run().each(function(result) {

	    	var d = getData(result);
	    	
	    	if (d.amt) data.push(d);

	        return true;
	    });

	    var actRevenueOtherSearch = search.create({
	        type: 'transaction',
	        columns: ['internalid','tranid','trandate','type','item','amount'],
	        filters: [
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: '{jobmain.internalid}',
    		            operator: search.Operator.EQUALTO,
    		            values: [projectId]
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmAccountsRevenue,
    		            operator: search.Operator.EQUALTO,
    		            values: 1
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmItemTypes,
    		            operator: search.Operator.EQUALTO,
    		            values: 0
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmInvalidTypes,
    		            operator: search.Operator.EQUALTO,
    		            values: 0
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmIsExpense,
    		            operator: search.Operator.EQUALTO,
    		            values: 0
    		        }),
	        ],
	    });

	    actRevenueOtherSearch.run().each(function(result) {

	    	var d = getData(result);

	    	if (d.amt) data.push(d);

	        return true;
	    });

    	addSublist(form, tabId, 'Invoice', data);
    }

    function addMaterialSublist(form, tabId, projectId) {
	    
    	var data = [];
    	
	    var actCostMaterialSearch = search.create({
	        type: 'transaction',
	        columns: ['internalid','tranid','trandate','type','item','amount'],
	        filters: [
  	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: '{customer.internalid}',
    		            operator: search.Operator.EQUALTO,
    		            values: [projectId]
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmAccountsCost,
    		            operator: search.Operator.EQUALTO,
    		            values: 1
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmItemTypes,
    		            operator: search.Operator.EQUALTO,
    		            values: 1
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmInvalidTypes,
    		            operator: search.Operator.EQUALTO,
    		            values: 0
    		        }),
	        ],
	    });
 
	    actCostMaterialSearch.run().each(function(result) {

	    	var d = getData(result);
	    	
	    	if (d.amt) data.push(d);

	        return true;
	    });

	    var actCostExpensesSearch = search.create({
	        type: 'transaction',
	        columns: ['internalid','tranid','trandate','type','item','amount'],
	        filters: [
  	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: '{customer.internalid}',
    		            operator: search.Operator.EQUALTO,
    		            values: [projectId]
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmAccountsCost,
    		            operator: search.Operator.EQUALTO,
    		            values: 1
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmIsExpense,
    		            operator: search.Operator.EQUALTO,
    		            values: 1
    		        }),
	        ],
	    });

	    actCostExpensesSearch.run().each(function(result) {

	    	var d = getData(result);

	    	if (d.amt) data.push(d);

	        return true;
	    });

	    var actCostOtherSearch = search.create({
	        type: 'transaction',
	        columns: ['internalid','tranid','trandate','type','item','amount'],
	        filters: [
  	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: '{customer.internalid}',
    		            operator: search.Operator.EQUALTO,
    		            values: [projectId]
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmAccountsCost,
    		            operator: search.Operator.EQUALTO,
    		            values: 1
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmIsExpense,
    		            operator: search.Operator.EQUALTO,
    		            values: 0
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: fmInvalidTypes,
    		            operator: search.Operator.EQUALTO,
    		            values: 0
    		        }),
	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: "CASE {item.type} WHEN 'Assembly Item' THEN 1 WHEN 'Inventory Item' THEN 1 WHEN 'Non-inventory Item' THEN 1  WHEN 'Discount' THEN 1 WHEN 'Service' THEN 1 ELSE 0 END",
    		            operator: search.Operator.EQUALTO,
    		            values: 0
    		        }),
	        ],
	    });

	    actCostOtherSearch.run().each(function(result) {

	    	var d = getData(result);

	    	if (d.amt) data.push(d);

	        return true;
	    });

    	addSublist(form, tabId, 'Material', data);
    }

    function addLaborSublist(form, tabId, projectId) {
	    
    	var data = [];
    	
	    var actLaborSearch = search.create({
	        type: record.Type.TIME_BILL,
	        columns: [
			  		search.createColumn({
			  			name: 'formulanumeric',
						formula: '{internalid}'
					}),
			  		search.createColumn({
			  			name: 'formuladate',
						formula: '{date}'
					}),
			  		search.createColumn({
			  			name: 'formulatext',
						formula: '{type}'
					}),
			  		search.createColumn({
			  			name: 'formulatext',
						formula: '{item}'
					}),
			  		search.createColumn({
			  			name: 'formulacurrency',
						formula: '{durationdecimal}*{laborcost}'
					}),
			],
	        filters: [
		            search.createFilter({
		            	name: 'customer',
		                operator: search.Operator.IS,
		                values: projectId
		            }),
		            search.createFilter({
		            	name: 'approved',
		                operator: search.Operator.IS,
		                values: 'T'
		            }),
	        ],
	    });
 
	    actLaborSearch.run().each(function(result) {
	    	
	    	var d = {};
	    	
	    	d.id = result.getValue(result.columns[0]);
	    	d.name = result.getValue(result.columns[1]);
	    	d.date = result.getValue(result.columns[1]);
	    	d.type = result.getText(result.columns[2]);
	    	d.item = result.getText(result.columns[3]);
	    	d.amt = parseFloat(result.getValue(result.columns[4]));

	    	if (d.amt) data.push(d);

	        return true;
	    });

    	addSublist(form, tabId, 'Labor', data);
    }

    function addWIPSublist(form, tabId, projectId) {
	    
    	var data = [];
    	
	    var actCostWIPSearch = search.create({
	        type: 'transaction',
	        columns: ['internalid','tranid','trandate','type','item','amount'],
	        filters: [
				search.createFilter({
					name: 'formulanumeric',
					formula: 'CASE WHEN {name.id} = ' + projectId + ' THEN 1 WHEN {appliedtotransaction.name.id} = ' + projectId + ' THEN 1 ELSE 0 END',
					operator: search.Operator.EQUALTO,
					values: 1
				}),
				search.createFilter({
					name: 'formulatext',
					formula: '{posting}',
					operator: search.Operator.IS,
					values: 'T'
				}),
                search.createFilter({
	                name: 'formulatext',
    	  	      	formula: '{account}',
    		        operator: search.Operator.IS,
    	            values: '1491 Inventory & WIP : WIP : Materials'
    	        }),
	        ],
	    });
 
	    actCostWIPSearch.run().each(function(result) {

	    	var d = getData(result);
	    	
	    	if (d.amt) data.push(d);

	        return true;
	    });

	    var actCostWIPFinishedGoodsSearch = search.create({
	        type: 'transaction',
	        columns: ['internalid','tranid','trandate','type','item','amount'],
	        filters: [
  	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: 'NVL({job.internalid},{custbody_ccm_project.internalid})',
    		            operator: search.Operator.EQUALTO,
    		            values: [projectId]
    		        }),
	                search.createFilter({
	                	name: 'formulatext',
    	  	          	formula: '{account}',
    		            operator: search.Operator.IS,
    		            values: '1410 Inventory & WIP : Inventory - Finished Goods'
    		        }),
	        ],
	    });
	    
	    actCostWIPFinishedGoodsSearch.run().each(function(result) {

	    	var d = getData(result);

	    	if (d.amt) data.push(d);

	        return true;
	    });

    	addSublist(form, tabId, 'WIP', data);
    }

    function addWIPProgressSublist(form, tabId, projectId) {
	    
    	var data = [];
    	
	    var actCostWIPProgressSearch = search.create({
	        type: 'transaction',
	        columns: ['internalid','tranid','trandate','type','item','amount'],
	        filters: [
  	                search.createFilter({
	                	name: 'formulanumeric',
    	  	          	formula: '{customer.internalid}',
    		            operator: search.Operator.EQUALTO,
    		            values: [projectId]
    		        }),
	                search.createFilter({
						name: 'formulanumeric',
						formula: '{account.id}',
						operator: search.Operator.EQUALTO,
						values: 866 // 1494 WIP Project Progress Payments
    		        }),
	        ],
	    });
 
	    actCostWIPProgressSearch.run().each(function(result) {

	    	var d = getData(result);
	    	
	    	if (d.amt) data.push(d);

	        return true;
	    });

    	addSublist(form, tabId, 'WIP Progress', data);
    }

    function getData(result) {
    	
    	var data = {};
    	
    	data.id = result.getValue('internalid');
    	data.name = result.getValue('tranid');
    	data.date = result.getValue('trandate');
    	data.type = result.getText('type').replace(' ','');
    	data.item = result.getText('item');
    	data.amt = parseFloat(result.getValue('amount'));

		if (data.type.toLowerCase() == 'billcredit') data.type = 'vendorcredit';
/*
    	log.debug({
    	    title: 'Get Data',
    	    details: 'id: ' + data.id + ', name: ' + data.name + ', date: ' + data.date + ', type: ' + data.type + ', item: ' + data.item + ', amount: ' + data.amt
    	});
*/
    	return data;
    }
    
    function addSublist(form, tabId, label, data) {

        var sublist = form.addSublist({
            id: ('custpage_' + label.replace(" ", "").toLowerCase()),
            type: 'list',
            label: label,
            tab: tabId
        });

        sublist.addField({
            id: 'custpage_date',
            type: 'text',
            label: 'Date'
        });

        sublist.addField({
            id: 'custpage_type',
            type: 'text',
            label: 'Document Type'
        });

        sublist.addField({
            id: 'custpage_document',
            type: 'text',
            label: 'Document'
        });

        sublist.addField({
            id: 'custpage_item',
            type: 'text',
            label: 'Item'
        });

        sublist.addField({
            id: 'custpage_amount',
            type: 'currency',
            label: 'Amount'
        });

        var total = 0;
        
	    for (var i = 0; i < data.length; i++) {

            if (data[i].date) {
            	
    	    	sublist.setSublistValue({
    	    	    id: 'custpage_date',
    	    	    line: i,
    	    	    value: data[i].date
    	    	});
            }

            if (data[i].type) {
            	
    	    	sublist.setSublistValue({
    	    	    id: 'custpage_type',
    	    	    line: i,
    	    	    value: data[i].type
    	    	});
            }

            if (data[i].name) {

            	var type = getRecordType(data[i].type);
            	
                if (type) {
                	
                    var recordURL = url.resolveRecord({
        	            recordType: type,
        	            recordId: data[i].id,
        	            isEditMode: false
        	        });

        	    	sublist.setSublistValue({
        	    	    id: 'custpage_document',
        	    	    line: i,
        	    	    value: '<a href=\"' + recordURL +'\">' + data[i].name + '</a>'
        	    	});
                }
            }

	    	if (data[i].item) {
	    		
		    	sublist.setSublistValue({
		    	    id: 'custpage_item',
		    	    line: i,
		    	    value: data[i].item
		    	});
	    	}

	    	sublist.setSublistValue({
	    	    id: 'custpage_amount',
	    	    line: i,
	    	    value: data[i].amt
	    	});
	    	
	    	total += data[i].amt;
	    	
	    	if (i == data.length - 1) {

	        	sublist.setSublistValue({
	        	    id: 'custpage_document',
	        	    line: data.length,
	        	    value: '<span style=\"font-weight:bold\">Total</span>'
	        	});

	        	sublist.setSublistValue({
	        	    id: 'custpage_amount',
	        	    line: data.length,
	        	    value: total
	        	});
	    	}
	    }
    }
    
    function getRecordType(type) {
    	
    	if (!type) return '';
    	
    	switch (type) {
    	case 'Bill':
    		return 'vendorbill';
    	case 'Bill Credit':
    		return 'vendorcredit';
    	case 'Journal':
    		return 'journalentry';
    	default:
    		return type.replace(' ', '');
    	}
    }
    
    return {
        onRequest: onRequest
    };
    
});
