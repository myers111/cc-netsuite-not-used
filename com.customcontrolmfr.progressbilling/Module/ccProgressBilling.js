/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 */
define(['N/log','N/ui/message','N/record','N/search','../../com.customcontrolmfr/Module/ccJournalEntry','../../com.customcontrolmfr/Module/ccUtil'],

function(log,message,record,search,ccJournalEntry,ccUtil) {

    // All functions should only recognize inventory items

    function isValid(poId) {
    	
		if (!poId) return false;

	    var s = search.create({
	        type: search.Type.VENDOR_BILL,
	        columns: ['amount'],
	        filters: [
		  		search.createFilter({
					name: 'custbody_ccm_purchaseorder',
					operator: search.Operator.IS,
					values: poId
			    }),
				search.createFilter({
					name: 'mainline',
					operator: search.Operator.IS,
					values: 'T'
				}),
				search.createFilter({
					name: 'formulanumeric',
					formula: "CASE WHEN {approvalstatus} = 'Approved' THEN 1 ELSE 0 END",
					operator: search.Operator.EQUALTO,
					values: 1
				}),
				search.createFilter({
					name: 'trandate',
					operator: search.Operator.ONORBEFORE,
					values: ccUtil.getNSDateFromJSDate(new Date())
				}),
			]
	    });
   
	    var valid = false;
	    
	    s.run().each(function(result) {

	    	valid = true;

	        return false;
	    });

		return valid;
    }

    /**
     * @param {*} poId
     * @param {*} finalPayment
     */
    function execute(options) {
    	
		if (!options.poId) return false;

        var poInfo = getPOInfo(options.poId);
    	
		if (!poInfo) return false;

	    var subClassId = (poInfo.classId == 7 ? 13 : 11); // 7 = Admin | Admin = 7, 11 = Multiple

    	log.debug({
    	    title: 'Progress Billing',
    	    details: 'PO ID: ' + options.poId + ', Project ID: ' + poInfo.projectId + ', Class ID: ' + poInfo.classId + ', Subclass ID: ' + subClassId
    	});

	    var pbAmount = getProgressBillingAmount(options.poId);

		var id = 0;

		if (options.finalPayment) {

			reverseJournalEntries(poInfo.name);

			var poAmount = getPOAmount(options.poId);
	
			log.debug({
				title: 'Final Payment',
				details: 'PO Amount: ' + poAmount + ', Progress Billing Amount: ' + pbAmount
			});
	
			var objBill = record.transform({
				fromType: record.Type.PURCHASE_ORDER,
				fromId: options.poId,
				toType: record.Type.VENDOR_BILL
			});

			id = objBill.save({
				ignoreMandatoryFields: true
			});
	
			if (id) {

				var objCredit = record.transform({
					fromType: record.Type.VENDOR_BILL,
					fromId: id,
					toType: record.Type.VENDOR_CREDIT
				});

				objCredit.setValue({
					fieldId: 'tranid',
					value: 'Final Bill',
					ignoreFieldChange: true
				});
	
				objCredit.setValue({
					fieldId: 'custbody_ccm_purchaseorder',
					value: options.poId,
					ignoreFieldChange: true
				});

				var numLines = objCredit.getLineCount({
					sublistId: 'item'
				});
	
				while (numLines > 0) {
	
					objCredit.removeLine({
						sublistId: 'item',
						line: 0,
						ignoreRecalc: true
					});
	
					numLines = objCredit.getLineCount({
						sublistId: 'item'
					});
				}
	
				objCredit.setSublistValue({
					sublistId: 'item',
					fieldId: 'item',
					line: 0,
					value: 2638, // Progress Payment
				});
				
				objCredit.setSublistValue({
					sublistId: 'item',
					fieldId: 'quantity',
					line: 0,
					value: 1
				});
				
				objCredit.setSublistValue({
					sublistId: 'item',
					fieldId: 'rate',
					line: 0,
					value: pbAmount
				});
							
				objCredit.setSublistValue({
					sublistId: 'item',
					fieldId: 'department',
					line: 0,
					value: 4 //poInfo.departmentId 
				});
							
				objCredit.setSublistValue({
					sublistId: 'item',
					fieldId: 'class',
					line: 0,
					value: poInfo.classId 
				});
				
				objCredit.setSublistValue({
					sublistId: 'item',
					fieldId: 'cseg_ccm_subclass',
					line: 0,
					value: subClassId
				});
	
				objCredit.setSublistValue({
					sublistId: 'item',
					fieldId: 'customer',
					line: 0,
					value: poInfo.projectId
				});

				var id = objCredit.save({
					ignoreMandatoryFields: true
				});
			}
		}
		else {
		
			var recAmount = getReceivedAmount(options.poId);
			var jeAmount = getJournalEntriesAmount(poInfo.name);

			log.debug({
				title: 'Progress Adjustment',
				details: 'Received: $' + recAmount + ', Progress Billing: $' + pbAmount + ', Journal Entries: $' + Math.abs(jeAmount)
			});
	
			var amount = (recAmount > pbAmount ? pbAmount : recAmount);
							
			if (jeAmount != 0 && amount != jeAmount) reverseJournalEntries(poInfo.name);

			if (amount) {

				log.debug({
					title: 'WIP Progress Adjustment',
					details: 'Amount: $' + amount
				});
		
				var opt = {
					memo: poInfo.name,
					lines: []
				};
		
				// 1494 WIP Project Progress Payments
		
				opt.lines.push({
					accountId: 866,
					credit: amount,
					debit: 0,
					memo: 'WIP Progress Adjustment',
					projectId: poInfo.projectId,
					departmentId: poInfo.departmentId,
					classId: poInfo.classId,
					subClassId: subClassId,
					locationId: poInfo.locationId
				});
		
				// Accrued Purchases
		
				opt.lines.push({
					accountId: 112,
					credit: 0,
					debit: amount,
					memo: 'Accrued Purchases Adjustment',
					projectId: poInfo.projectId,
					departmentId: poInfo.departmentId,
					classId: poInfo.classId,
					subClassId: subClassId,
					locationId: poInfo.locationId
				});
			
				log.debug({
					title: 'Journal Entry Options',
					details: opt
				});
	
				id = ccJournalEntry.create(opt);
			}
		}

		return (id != null);
    }
    
    function isFinalPayment(options) {

		if (!options.poId) return false;

		var s1 = search.create({
			type: search.Type.PURCHASE_ORDER,
			columns: ['amount'],
			filters: [
						  search.createFilter({
							name: 'internalid',
							operator: search.Operator.IS,
							values: options.poId
						}),
						  search.createFilter({
							name: 'mainline',
							operator: search.Operator.IS,
							values: 'T'
						}),
			]
		});
   
		var poAmount = 0;
		
		s1.run().each(function(result) {

			poAmount = parseFloat(result.getValue('amount'));

			if (!poAmount) poAmount = 0;

			return false;
		});

		var s2 = search.create({
			type: 'transaction',
			columns: [
					search.createColumn({
						name: 'formulacurrency',
						summary: search.Summary.SUM,
						formula: '{amount}'
					}),
			],
			filters: [
					search.createFilter({
						name: 'custbody_ccm_purchaseorder',
						operator: search.Operator.IS,
						values: options.poId
					}),
					  search.createFilter({
						name: 'formulanumeric',
						formula: '{account.id}',
						operator: search.Operator.EQUALTO,
						values: 866 // 1494 WIP Project Progress Payments
					}),
					  search.createFilter({
						name: 'formulanumeric',
						formula: "CASE WHEN {type} = 'Bill' THEN CASE WHEN {approvalstatus} = 'Approved' THEN 1 ELSE 0 END ELSE 1 END",
						operator: search.Operator.EQUALTO,
						values: 1
					}),
					  search.createFilter({
						name: 'trandate',
						operator: search.Operator.ONORBEFORE,
						values: ccUtil.getNSDateFromJSDate(new Date())
					}),
			]
		});

		var amount = 0;
		
		s2.run().each(function(result) {

			amount = parseFloat(result.getValue(result.columns[0]));

			if (!amount) amount = 0;
			
			return false;
		});
//alert(poAmount + ' - ' + amount + ' - ' + options.amount + ' - ' + options.billId);
		var newAmount = amount + (options.billId ? 0 : options.amount); // amt might include freight, but should be close enough for a comparison
		
		var balance = poAmount - newAmount;

    	return (balance == 0);
    }

    function getMessage(options) {

		var msg = {
			title: 'Progress Payments',
			message: '',
			type: message.Type.INFORMATION,
			duration: 10000
		};

		for (var key in options.parameters) {

			if (options.parameters.hasOwnProperty(key)) {

				if (key == 'pb') {

					switch (options.parameters[key]) {
						case '1':
							msg.message = 'There was a progress billing error for this transaction. Please notify the accounting department.';
							break;
						default:
					}

					msg.type = message.Type.ERROR;

					return msg;
				}
			}
		}

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////

    	if (options.status == 'Fully Billed') return null;

	    var s = search.create({
	        type: 'transaction',
	        columns: [
				search.createColumn({
				    name: 'formulacurrency',
				    summary: search.Summary.SUM,
				    formula: '{amount}'
				}),
				search.createColumn({
					name: 'formulanumeric',
					summary: search.Summary.SUM,
					formula: "CASE WHEN {type} = 'Bill' THEN 1 ELSE 0 END"
				}),
			],
	        filters: [
		  	    search.createFilter({
		        	name: 'custbody_ccm_purchaseorder',
	                operator: search.Operator.IS,
	                values: options.poId
	            }),
				search.createFilter({
					name: 'formulanumeric',
					formula: '{account.id}',
					operator: search.Operator.EQUALTO,
					values: 866 // 1494 WIP Project Progress Payments
			}),
				  search.createFilter({
					name: 'formulanumeric',
					formula: "CASE WHEN {type} = 'Bill' THEN CASE WHEN {approvalstatus} = 'Approved' THEN 1 ELSE 0 END ELSE 1 END",
					operator: search.Operator.EQUALTO,
					values: 1
				}),
				  search.createFilter({
					name: 'trandate',
					operator: search.Operator.ONORBEFORE,
					values: ccUtil.getNSDateFromJSDate(new Date())
				}),
			]
	    });
	    
	    var amount = 0;
	    var count = 0;
	    
	    s.run().each(function(result) {

        	amount = parseFloat(result.getValue(result.columns[0]));
        	count = parseInt(result.getValue(result.columns[1]));

    		if (!amount) amount = 0;
    		if (!count) count = 0;

	        return false;
	    });

    	if (amount > 0) {
    		
    		msg.message = 'This purchase order has ' + count + ' progess payment' + (count > 1 ? 's' : '') + ' applied to it for a total of $' + amount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '.';
        	
    		return msg;
    	}
    	
    	return null;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function getPOInfo(poId) {

		if (!poId) return null;

	    var s = search.create({
	        type: search.Type.PURCHASE_ORDER,
	        columns: [
				search.createColumn({
				    name: 'formulatext',
				    formula: '{number}'
				}),
				search.createColumn({
				    name: 'formulanumeric',
				    formula: '{customer.internalid}'
				}),
				search.createColumn({
				    name: 'formulanumeric',
				    formula: '{department.internalid}'
				}),
				search.createColumn({
				    name: 'formulanumeric',
				    formula: '{class.internalid}'
				}),
				search.createColumn({
				    name: 'formulanumeric',
				    formula: '{location.internalid}'
				}),
	        ],
	        filters: [
	  	        search.createFilter({
		           	name: 'formulanumeric',
	    	  	   	formula: '{internalid}',
	    		    operator: search.Operator.EQUALTO,
	    		    values: poId
	            }),
				search.createFilter({
					name: 'mainline',
					operator: search.Operator.IS,
					values: 'F'
			  }),
			]
	    });

		var info = {};
	    
	    s.run().each(function(result) {

	    	info.name = result.getValue(result.columns[0]);

	    	var projectId = result.getValue(result.columns[1]);
	    	var departmentId = result.getValue(result.columns[2]);
	    	var classId = result.getValue(result.columns[3]);
	    	var locationId = result.getValue(result.columns[4]);

	    	if (projectId) info.projectId = parseInt(projectId);
	    	if (departmentId) info.departmentId = parseInt(departmentId);
	    	if (classId) info.classId = parseInt(classId);
	    	if (locationId) info.locationId = parseInt(locationId);

	        return (!projectId);
	    });
	    
		log.debug({
			title: 'poInfo',
			details: JSON.stringify(info)
		});

		if (!info.name || !info.projectId || !info.classId || !info.locationId || !info.departmentId) return null;

	    return info;
    }

    function getPOAmount(poId) {
    	
	    var s = search.create({
	        type: search.Type.PURCHASE_ORDER,
	        columns: ['amount'],
	        filters: [
		  	            search.createFilter({
			            	name: 'internalid',
			                operator: search.Operator.IS,
			                values: poId
			            }),
		  	            search.createFilter({
			            	name: 'mainline',
			                operator: search.Operator.IS,
			                values: 'T'
			            }),
		    ]
	    });
   
	    var poAmount = 0;
	    
	    s.run().each(function(result) {

	    	poAmount = parseFloat(result.getValue('amount'));

    		if (!poAmount) poAmount = 0;

	        return false;
	    });
	    
	    return poAmount;
    }

    function getReceivedAmount(poId) {

	    var s = search.create({
	        type: search.Type.PURCHASE_ORDER,
	        columns: [
				search.createColumn({
					name: 'formulacurrency',
					summary: search.Summary.SUM,
					formula: '{quantityshiprecv}*{rate}'
				}),
			],
	        filters: [
	  	        search.createFilter({
		        	name: 'formulanumeric',
	  	          	formula: '{internalid}',
	    		    operator: search.Operator.EQUALTO,
	    	        values: poId
		        }),
				search.createFilter({
					name: 'mainline',
					operator: search.Operator.IS,
					values: 'F'
				}),
				search.createFilter({
					name: 'formulatext',
					formula: '{item.type}',
					operator: search.Operator.IS,
					values: 'Inventory Item'
				}),
			]
	    });
	    
	    var amount = 0;
	    
	    s.run().each(function(result) {

        	amount = parseFloat(result.getValue(result.columns[0]));

    		if (!amount) amount = 0;

	        return false;
	    });
	    
	    return amount;
    }

    function getProgressBillingAmount(poId) {

	    var s = search.create({
	        type: 'transaction',
	        columns: [
				search.createColumn({
				    name: 'formulacurrency',
			        summary: search.Summary.SUM,
					formula: '{amount}'
				}),
			],
	        filters: [
		  	    search.createFilter({
					name: 'custbody_ccm_purchaseorder',
					operator: search.Operator.IS,
					values: poId
			    }),
				search.createFilter({
					name: 'formulanumeric',
					formula: '{account.id}',
					operator: search.Operator.EQUALTO,
					values: 866 // 1494 WIP Project Progress Payments
			}),
				search.createFilter({
					name: 'formulanumeric',
					formula: "CASE WHEN {type} = 'Bill' THEN CASE WHEN {approvalstatus} = 'Approved' THEN 1 ELSE 0 END ELSE 1 END",
					operator: search.Operator.EQUALTO,
					values: 1
				}),
				search.createFilter({
					name: 'trandate',
					operator: search.Operator.ONORBEFORE,
					values: ccUtil.getNSDateFromJSDate(new Date())
				}),
	]
	    });
	    
	    var amount = 0;
	    
	    s.run().each(function(result) {

        	amount = parseFloat(result.getValue(result.columns[0]));

    		if (!amount) amount = 0;

	        return false;
	    });
	    
	    return amount;
    }

    function getJournalEntriesAmount(poName) {

	    var s = search.create({
	        type: search.Type.JOURNAL_ENTRY,
	        columns: [
				search.createColumn({
				    name: 'formulacurrency',
			        summary: search.Summary.SUM,
					formula: '{amount}'
				}),
			],
	        filters: [
		  	    search.createFilter({
			    	name: 'memomain',
	                operator: search.Operator.IS,
			        values: poName
			    }),
				search.createFilter({
					name: 'formulanumeric',
					formula: '{account.id}',
					operator: search.Operator.EQUALTO,
					values: 866 // 1494 WIP Project Progress Payments
			}),
	            search.createFilter({
	            	name: 'isreversal',
    		        operator: search.Operator.IS,
    		        values: 'F'
    		    }),
	            search.createFilter({
	            	name: 'reversaldate',
    		        operator: search.Operator.ISEMPTY
    		    }),
			]
	    });
	    
	    var amount = 0;
	    
	    s.run().each(function(result) {

        	amount = parseFloat(result.getValue(result.columns[0]));

    		if (!amount) amount = 0;

	        return false;
	    });
	    
	    return amount;
    }

    function reverseJournalEntries(poName) {

		log.debug({
			title: 'Reverse Journal Entries',
			details: 'Reverse Journal Entries for PO ' + poName
		});

		var s = search.create({
			type: search.Type.JOURNAL_ENTRY,
			columns: ['internalid'],
			filters: [
				search.createFilter({
					name: 'memomain',
					operator: search.Operator.IS,
					values: poName
				}),
				search.createFilter({
					name: 'formulanumeric',
					formula: '{account.id}',
					operator: search.Operator.EQUALTO,
					values: 866 // 1494 WIP Project Progress Payments
				}),
	            search.createFilter({
	            	name: 'isreversal',
    		        operator: search.Operator.IS,
    		        values: 'F'
    		    }),
	            search.createFilter({
	            	name: 'reversaldate',
    		        operator: search.Operator.ISEMPTY
    		    }),
			]
		});

		s.run().each(function(result) {

			var internalid = parseInt(result.getValue('internalid'));

			var objRecord = record.load({
				type: record.Type.JOURNAL_ENTRY,
				id: internalid,
				isDynamic: true,
			});

			objRecord.setText({
				fieldId: 'reversaldate',
				text: ccUtil.getNSDateFromJSDate(new Date())
			});

			objRecord.save();

			return true;
		});
    }

    return {
        isValid: isValid,
        execute: execute,
		isFinalPayment: isFinalPayment,
		getMessage: getMessage
    };   
});
