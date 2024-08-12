/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/redirect', 'N/search'],
/**
 * @param {record} record
 * @param {redirect} redirect
 * @param {search} search
 */
function(log, record, redirect, search) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {

	    var daSearch = search.create({
	        type: record.Type.TIME_BILL,
	        columns: [
	  				search.createColumn({
					    name: 'formulanumeric',
				        summary: search.Summary.SUM,
				        formula: "CASE WHEN {Department} = 'Aviation' THEN {durationdecimal}*{employee.laborcost} ELSE 0 END"
					}),
					search.createColumn({
					    name: 'formulanumeric',
				        summary: search.Summary.SUM,
				        formula: "CASE WHEN {Department} = 'Buildings' THEN {durationdecimal}*{employee.laborcost} ELSE 0 END"
					}),
					search.createColumn({
					    name: 'formulanumeric',
				        summary: search.Summary.SUM,
				        formula: "CASE WHEN {Department} = 'Systems' THEN {durationdecimal}*{employee.laborcost} ELSE 0 END"
					}),
			],
	        filters: [
	  	            search.createFilter({
		            	name: 'department',
		                operator: search.Operator.ANYOF,
		                values: [7,8,5]
		            }),
		            search.createFilter({
		            	name: 'type',
		                operator: search.Operator.IS,
		                values: 'A'
		            })
	        ],
	    });

	    var adSearch = search.create({
	        type: record.Type.TIME_BILL,
	        columns: [
	  				search.createColumn({
					    name: 'formulanumeric',
				        summary: search.Summary.SUM,
				        formula: "{durationdecimal}*{employee.laborcost}*(CASE {Employee} WHEN 'Heiniger, Richard W' THEN 1 WHEN 'Myers, Raymond I' THEN .2 WHEN 'Myers, Robert C' THEN .2 WHEN 'Myers, Richard D' THEN .2 WHEN 'Myers, Jennifer L' THEN 1 WHEN 'Sanders, Lewis' THEN .1 WHEN 'Hess, Tyge A' THEN .1 WHEN 'Huff, Jeremy J' THEN .1 WHEN 'Krug, Austin' THEN .2 ELSE 0 END)"
					}),
			],
	        filters: [
	  	            search.createFilter({
		            	name: 'department',
		                operator: search.Operator.ANYOF,
		                values: [4]
		            }),
		            search.createFilter({
		            	name: 'employee',
		                operator: search.Operator.ANYOF,
		                values: [229,231,226,2723,2686,-5,10,9,216] // RH, TH, JH, AK, JM, RM, RM, RM, LS
		            }),
		            search.createFilter({
		            	name: 'type',
		                operator: search.Operator.IS,
		                values: 'A'
		            })

	        ],
	    });

	    var peSearch = search.create({
	        type: 'transaction',
	        columns: [
	  				search.createColumn({
					    name: 'amount',
				        summary: search.Summary.SUM
					}) 
			],
	        filters: [
	            search.createFilter({
	            	name: 'account',
	                operator: search.Operator.ANYOF,
	                values: [58,344,345,346,347,348,349,350,857,359] // 6110,6120,6130,6131,6132,6133,6134,6135,6240
	            })
	        ],
	    });

	    var jnlSearch = search.create({
	        type: record.Type.JOURNAL_ENTRY,
	        columns: ['internalid'],
	        filters: [
	            search.createFilter({
	            	name: 'memomain',
	                operator: search.Operator.IS,
	                values: 'CONTRIBUTION'
	            })
	        ],
	    });

	    var periods = getPeriods();

	    for (var i = 0; i < periods.length; i++) {
	    	
	    	setPeriod(periods[i], daSearch, adSearch, peSearch, jnlSearch);
	    }
    	
    	redirect.redirect({
    	    url: 'https://632005.app.netsuite.com/app/reporting/reportrunner.nl?cr=377&reload=T&whence='
    	});
    }

    function getPeriods() {

    	var periods = [];
  	
    	// Create an invoice, and capture the posting periods available

		var invRecord = record.create({
			type: record.Type.INVOICE,
			isDynamic: true
		});

		var options = invRecord.getField({
		    fieldId: 'postingperiod'
		}).getSelectOptions();

		for (var i = 0; i < options.length; i++) {
			
			var prdRecord = record.load({
				type: record.Type.ACCOUNTING_PERIOD,
				id: options[i].value,
				isDynamic: true
			});
			
			var startdate = prdRecord.getText({
			    fieldId: 'startdate'
			});

			var start = new Date(startdate);
			
			var startyear = start.getFullYear();
			
			if (startyear < 2021) continue;

		    var d = new Date();
			
			if (start < d) {

				var enddate = prdRecord.getText({
				    fieldId: 'enddate'
				});

				var period = {
					'id': options[i].value,
					'name': options[i].text,
					'startdate': startdate,
					'enddate': enddate
				};
		    	
				periods.push(period);
			}
		}
    	
    	return periods;
    }

    function setPeriod(period, daSearch, adSearch, peSearch, jnlSearch) {
    	
    	log.debug({
    	    title: 'Contribution Date Range',
    	    details: 'Start: ' + period.startdate + ', End: ' + period.enddate
    	});

    	var filter1 = search.createFilter({
    	    name: 'date',
    	    operator: search.Operator.WITHIN,
    	    values: [period.startdate,period.enddate]
    	});

    	var filter2 = search.createFilter({
    	    name: 'trandate',
    	    operator: search.Operator.WITHIN,
    	    values: [period.startdate,period.enddate]
    	});

    	if (daSearch.filters.length > 2) daSearch.filters.pop();
    	if (adSearch.filters.length > 3) adSearch.filters.pop();
    	if (peSearch.filters.length > 1) peSearch.filters.pop();
    	if (jnlSearch.filters.length > 1) jnlSearch.filters.pop();

    	daSearch.filters.push(filter1);
    	adSearch.filters.push(filter1);
    	peSearch.filters.push(filter2);
    	jnlSearch.filters.push(filter2);

    	updateContribution(period, daSearch, adSearch, peSearch, jnlSearch);
    }

    function updateContribution(period, daSearch, adSearch, peSearch, jnlSearch) {

    	var da = {};
    	
    	var x = false;
    	
    	daSearch.run().each(function(result) {

        	var a = parseFloat(result.getValue(result.columns[0]));
        	var b = parseFloat(result.getValue(result.columns[1]));
        	var s = parseFloat(result.getValue(result.columns[2]));
        	
    		if (!a) a = 0;
    		if (!b) b = 0;
    		if (!s) s = 0;

        	log.debug({
        	    title: 'Contribution Allocation $',
        	    details: 'Aviation: $' + a + ', Buildings: $' + b + ', Systems: $' + s
        	});

        	var t = a + b + s;
        	
        	if (t == 0) {
        	
        		x = true;
        	}
        	else {
        		
            	da['a'] = a / t;
            	da['b'] = b / t;
            	da['s'] = s / t;
        	}
     	
	        return false;
	    });
    	
    	if (x) return;
    	
    	log.debug({
    	    title: 'Contribution Allocation %',
    	    details: 'Aviation: ' + da.a + ', Buildings: ' + da.b + ', Systems: ' + da.s
    	});

    	var ad = 0;

    	adSearch.run().each(function(result) {
	    	
    		ad = parseFloat(result.getValue(result.columns[0]));

    		if (!ad) ad = 0;

	        return false;
	    });

    	var pe = 0;

    	peSearch.run().each(function(result) {
	    	
    		pe = parseFloat(result.getValue(result.columns[0]));

    		if (!pe) pe = 0;
    		
	        return false;
	    });
    	
    	var jnlRecord = null;
    	
    	jnlSearch.run().each(function(result) {
	        
	        var id = result.getValue(result.columns[0])

    		jnlRecord = record.load({
    		    type: record.Type.JOURNAL_ENTRY,
    		    id: id,
    		    isDynamic: true,
    		});
	     	
			var numLines = jnlRecord.getLineCount({
			    sublistId: 'line'
			});

			for (var i = numLines - 1; i >= 0; i--) {
		    	
		    	jnlRecord.selectLine({
					sublistId: 'line',
				    line: i,
				});
		    	
				var department = jnlRecord.getCurrentSublistValue({
				    sublistId: 'line',
				    fieldId: 'department'
				});

				if (department == 4) { // If Admin, then add credit to personnel expense
					
					var credit = jnlRecord.getCurrentSublistValue({
					    sublistId: 'line',
					    fieldId: 'credit'
					});
					
					pe += credit;
				}

				jnlRecord.removeLine({
				    sublistId: 'line',
				    line: i,
				    ignoreRecalc: true
				});
			}

	        return false;
	    });

    	log.debug({
    	    title: 'Personnel Expense',
    	    details: 'Expense: $' + pe + ', Deduction: $' + ad
    	});
    	
    	if (pe < ad) return;

    	pe -= ad; // Subtract admin deduction from personnel expenses

    	updateJournal(jnlRecord, period, da, pe);
    }

    function updateJournal(jnlRecord, period, da, pe) {
    	
    	if (jnlRecord) {
        	
        	log.debug({
        	    title: 'Journal Entry for ' + period.name,
        	    details: 'Found & Loaded ID: ' + jnlRecord.id
        	});
    	}
    	else {

    		jnlRecord = record.create({
    			type: record.Type.JOURNAL_ENTRY,
    			isDynamic: true
    		});
        	
        	log.debug({
        	    title: 'Journal Entry for ' + period.name,
        	    details: 'Created'
        	});
    	}

    	jnlRecord.setText({
            fieldId: 'trandate',
            text: period.enddate
        });

    	jnlRecord.setText({
            fieldId: 'memo',
            text: 'CONTRIBUTION'
        });

		var p = Math.round(pe * 100) / 100; // Round to 2 decimals
		var a = Math.round(pe * da.a * 100) / 100; // Round to 2 decimals
		var b = Math.round(pe * da.b * 100) / 100; // Round to 2 decimals
		var s = Math.round((p - a - b) * 100) / 100; // Round to 2 decimals
		
		addLine(jnlRecord, 856, p, 0, 4); // Admin
		addLine(jnlRecord, 856, 0, a, 7); // Aviation
		addLine(jnlRecord, 856, 0, b, 8); // Buildings
		addLine(jnlRecord, 856, 0, s, 5); // Systems
    	
    	log.debug({
    	    title: 'Contribution Allocation',
    	    details: 'Expense: $' + p + ', Aviation: $' + a + ', Buildings: $' + b + ', Systems: $' + s
    	});

    	jnlRecord.save();
    }

    function addLine(jnlRecord, accountId, credit, debit, department) {

		var numLines = jnlRecord.getLineCount({
		    sublistId: 'line'
		});
    	
    	jnlRecord.insertLine({
			sublistId: 'line',
		    line: numLines,
		});
		
    	jnlRecord.setCurrentSublistValue({
		    sublistId: 'line',
		    fieldId: 'account',
		    value: accountId
		});

    	if (credit != 0) {
    		
        	jnlRecord.setCurrentSublistValue({
    		    sublistId: 'line',
    		    fieldId: 'credit',
    		    value: credit
    		});
    	}

    	if (debit != 0) {
    		
        	jnlRecord.setCurrentSublistValue({
    		    sublistId: 'line',
    		    fieldId: 'debit',
    		    value: debit
    		});
    	}

    	jnlRecord.setCurrentSublistValue({
		    sublistId: 'line',
		    fieldId: 'department',
		    value: department
		});

    	jnlRecord.setCurrentSublistValue({
		    sublistId: 'line',
		    fieldId: 'location',
		    value: 1
		});
    	
		jnlRecord.commitLine({
			sublistId: 'line'
		});
    }

    return {
        onRequest: onRequest
    };
});
