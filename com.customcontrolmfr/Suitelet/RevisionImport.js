/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/format', 'N/log', 'N/record', 'N/redirect', 'N/search', 'N/ui/serverWidget', 'N/url'],

function(file, format, log, record, redirect, search, serverWidget, url) {
   
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
                    title: "Import Revision",
                });

            	form.clientScriptModulePath = '../ClientScript/RevisionImport.js';
             	
            	addHiddenField(form, 'custpage_id', context.request.parameters.iid);
             	
            	addHiddenField(form, 'custpage_p1', context.request.parameters.p1);
            	
            	addHiddenField(form, 'custpage_referer', (context.request.parameters.referer == null ? context.request.headers.referer : context.request.parameters.referer));
                
                form.addSubmitButton({
                    label: 'Submit'
                });
                
                form.addButton({
                    id: 'custpage_cancel',
                    label: 'Cancel',
                    functionName: 'onCancel'
                });

                var revisionsTab = form.addTab({
                    id: 'custpage_revisions',
                    label: 'Revisions'
                });

                var contractSublist = form.addSublist({
                    id: 'custpage_contractlist',
                    type: 'list',
                    label: 'Contract',
                    tab: 'custpage_revisions'
                });

                var materialSublist = form.addSublist({
                    id: 'custpage_materiallist',
                    type: 'list',
                    label: 'Material',
                    tab: 'custpage_revisions'
                });

                var laborSublist = form.addSublist({
                    id: 'custpage_laborlist',
                    type: 'list',
                    label: 'Labor',
                    tab: 'custpage_revisions'
                });

                laborSublist.addField({
                    id: 'custpage_labor_cb',
                    type: 'checkbox',
                    label: 'Select'
                }).defaultValue = 'T';

                laborSublist.addMarkAllButtons();

                buildContractSublist(contractSublist);
                buildMaterialSublist(materialSublist);
                buildLaborSublist(laborSublist);
                
                loadFromFile(context.request.parameters.fid, contractSublist, materialSublist, laborSublist);

                context.response.writePage(form);
        	}
        	else if (context.request.method === 'POST') {
            	
                var objRecord = record.load({
                    type: context.request.parameters.custpage_p1,
                    id: context.request.parameters.custpage_id,
                    isDynamic: true
                });

        		saveContractSublist(context, 'custpage_contractlist', objRecord);
        		//saveMaterialSublist(context, 'custpage_materiallist', objRecord);
        		//saveLaborSublist(context, 'custpage_laborlist', objRecord);

        		objRecord.save();
        		
                redirect.redirect({
                	url: context.request.parameters.custpage_referer
                });
        	}
        }
        catch(e) {
        	  
            log.error('Revision Import',e);
        }    
    }

    function loadFromFile(fileid, contractSublist, materialSublist, laborSublist) {
    	
        var objFile = file.load({
            id: fileid
        });
        
        var fileContents = objFile.getContents();

        var rows = fileContents.split(/\r?\n|\r/);
		
    	log.debug({
    	    title: 'rows',
    	    details: rows
    	});
        
    	var sublist = null;
    	
        for (var row = 0; row < rows.length; row++) {

        	var data = rows[row].split(',');
        	
        	if (data[0].length == 0) continue;

        	if (data[0] == 'Contract' || data[0] == 'Material' || data[0] == 'Labor') sublist = data[0];
        	else if (sublist == 'Contract') loadContractSublist(contractSublist, data);
        	else if (sublist == 'Material') loadMaterialSublist(materialSublist, data);
        	else if (sublist == 'Labor') loadLaborSublist(laborSublist, data);
        }
    }

    function buildContractSublist(sublist) {

		sublist.addField({
            id: 'custpage_rev_contractamount',
            type: 'currency',
            label: 'Amount'
        });

		sublist.addField({
            id: 'custpage_rev_contractdate',
            type: 'date',
            label: 'Date'
        });
    }

    function buildMaterialSublist(sublist) {

		sublist.addField({
            id: 'custpage_rev_materialamount',
            type: 'currency',
            label: 'Amount'
        });

		sublist.addField({
            id: 'custpage_rev_materialdate',
            type: 'date',
            label: 'Date'
        });
    }

    function buildLaborSublist(sublist) {

		sublist.addField({
            id: 'custpage_rev_name',
            type: 'text',
            label: 'Name'
        });

		sublist.addField({
            id: 'custpage_rev_serviceitem',
            type: 'text',
            label: 'Service Item'
        });

		sublist.addField({
            id: 'custpage_rev_hours',
            type: 'float',
            label: 'Hours'
        });

		sublist.addField({
            id: 'custpage_rev_rate',
            type: 'float',
            label: 'Rate'
        });

		sublist.addField({
            id: 'custpage_rev_startdate',
            type: 'date',
            label: 'Start Date'
        });

		sublist.addField({
            id: 'custpage_rev_enddate',
            type: 'date',
            label: 'End Date'
        });
    }

    function loadContractSublist(sublist, data) {

		var numLines = sublist.lineCount < 0 ? 0 : sublist.lineCount;

    	if (data[0].length) {
    		
    		var f = parseFloat(data[0]);
    		
	    	sublist.setSublistValue({
	    	    id: 'custpage_rev_contractamount',
	    	    line: numLines,
	    	    value: f
	    	});
    	}

    	if (data[1].length) {
    		
    		var d = new Date(data[1]);
    		
	    	sublist.setSublistValue({
	    	    id: 'custpage_rev_contractdate',
	    	    line: numLines,
	    	    value: getNSDateFromJSDate(d)
	    	});
    	}
    }

    function loadMaterialSublist(sublist, data) {

		var numLines = sublist.lineCount < 0 ? 0 : sublist.lineCount;

    	if (data[0].length) {
    		
    		var f = parseFloat(data[0]);
    		
	    	sublist.setSublistValue({
	    	    id: 'custpage_rev_materialamount',
	    	    line: numLines,
	    	    value: f
	    	});
    	}

    	if (data[1].length) {
    		
    		var d = new Date(data[1]);
    		
	    	sublist.setSublistValue({
	    	    id: 'custpage_rev_materialdate',
	    	    line: numLines,
	    	    value: getNSDateFromJSDate(d)
	    	});
    	}
    }

    function loadLaborSublist(sublist, data) {
    	
    	if (!taskIsValid(data[2], data[4], data[5])) return;

		var numLines = sublist.lineCount < 0 ? 0 : sublist.lineCount;

    	sublist.setSublistValue({
    	    id: 'custpage_rev_name',
    	    line: numLines,
    	    value: data[0]
    	});

    	sublist.setSublistValue({
    	    id: 'custpage_rev_serviceitem',
    	    line: numLines,
    	    value: (data[1].length == 0 ? data[0] : data[1])
    	});

    	sublist.setSublistValue({
    	    id: 'custpage_rev_hours',
    	    line: numLines,
    	    value: data[2]
    	});

    	sublist.setSublistValue({
    	    id: 'custpage_rev_rate',
    	    line: numLines,
    	    value: data[3]
    	});

    	if (data[4].length) {
    		
    		var d = new Date(data[4]);
    		
	    	sublist.setSublistValue({
	    	    id: 'custpage_rev_startdate',
	    	    line: numLines,
	    	    value: getNSDateFromJSDate(d)
	    	});
    	}

    	if (data[5].length) {
    		
    		var d = new Date(data[5]);
    		
	    	sublist.setSublistValue({
	    	    id: 'custpage_rev_enddate',
	    	    line: numLines,
	    	    value: getNSDateFromJSDate(d)
	    	});
    	}
    }

    function saveContractSublist(context, sublistId, objRecord) {
		
		var numLines = context.request.getLineCount({
		    group: sublistId
		});
        
    	log.debug({
    	    title: 'Posted Contract Amount',
    	    details: 'Contract count: ' + numLines
    	});

    	var contract = [];
    	
		for (var i = 0; i < numLines; i++) {

			var cont = context.request.getSublistValue({
			    group: sublistId,
			    name: 'custpage_rev_contractamount',
			    line: i
			});

			var date = context.request.getSublistValue({
			    group: sublistId,
			    name: 'custpage_rev_contractdate',
			    line: i
			});

			contract.push({c: cont, d: date});
		}
		
		addContract(objRecord, contract);
    }

    function saveMaterialSublist(context, sublistId, objRecord) {
		
		var numLines = context.request.getLineCount({
		    group: sublistId
		});
        
    	log.debug({
    	    title: 'Posted Material Amount',
    	    details: 'Material count: ' + numLines
    	});

    	var material = [];

		for (var i = 0; i < numLines; i++) {

			var mat = context.request.getSublistValue({
			    group: sublistId,
			    name: 'custpage_rev_materialamount',
			    line: i
			});

			var date = context.request.getSublistValue({
			    group: sublistId,
			    name: 'custpage_rev_materialdate',
			    line: i
			});

			material.push({m: mat, d: date});
		}

		addMaterial(objRecord, material);
    }

    function saveLaborSublist(context, sublistId, objRecord) {
		
		var numLines = context.request.getLineCount({
		    group: sublistId
		});
        
    	log.debug({
    	    title: 'Posted Labor',
    	    details: 'Labor count: ' + numLines
    	});
		
		var pid = objRecord.getValue({
		    fieldId: 'job'
		});

    	var labor = [];

		for (var i = 0; i < numLines; i++) {
			
			var sel = context.request.getSublistValue({
			    group: 'custpage_laborlist',
			    name: 'custpage_labor_cb',
			    line: i
			});
			
			if (sel == 'T') {
            	
				var name = context.request.getSublistValue({
				    group: 'custpage_laborlist',
				    name: 'custpage_rev_name',
				    line: i
				});

				var serviceItem = context.request.getSublistValue({
				    group: 'custpage_laborlist',
				    name: 'custpage_rev_serviceitem',
				    line: i
				});

				var hours = context.request.getSublistValue({
				    group: 'custpage_laborlist',
				    name: 'custpage_rev_hours',
				    line: i
				});

				var rate = context.request.getSublistValue({
				    group: 'custpage_laborlist',
				    name: 'custpage_rev_rate',
				    line: i
				});

				var startDate = context.request.getSublistValue({
				    group: 'custpage_laborlist',
				    name: 'custpage_rev_startdate',
				    line: i
				});

				var endDate = context.request.getSublistValue({
				    group: 'custpage_laborlist',
				    name: 'custpage_rev_enddate',
				    line: i
				});

				labor.push({pid: pid, n: name, si: serviceItem, h: hours, r: rate, sd: startDate, ed: endDate});
			}

			addLabor(objRecord, labor);
		}
    }
    
    function getResourceId(name) {

    	var s = search.create({
	        type: record.Type.GENERIC_RESOURCE,
	        columns: ['id'],
	        filters: [
  	                search.createFilter({
	                	name: 'entityid',
    		            operator: search.Operator.IS,
    		            values: name
    		        }),
	        ],
	    });

    	var id = 0;
    	
    	s.run().each(function(result) {

	    	id = result.getValue('id');
    		   	
	        return false;
	    });
    	
    	return id;
    }

    function getServiceItemId(serviceItem) {

    	var s = search.create({
	        type: record.Type.SERVICE_ITEM,
	        columns: ['internalid'],
	        filters: [
  	                search.createFilter({
	                	name: 'itemid',
    		            operator: search.Operator.IS,
    		            values: serviceItem
    		        }),
	        ],
	    });

    	var id = 0;

    	s.run().each(function(result) {
    		
	    	id = result.getValue('internalid');

	        return false;
	    });
    	
    	return id;
    }

    function taskIsValid(hours, start, end) {
    	
    	if (hours.length == 0) return false;
    	if (hours == '0') return false;
    	
    	if (start.length) {
    		
        	if (end.length) {
        		
        		var hours = parseFloat(hours);
        		var dStart = new Date(start);
        		var dEnd = new Date(end);
        		
        		var min = hours / 8.0 / 5.0;
        		var max = hours / 8.0 / 0.05;
        		
        		var days = getWeekDays(dStart, dEnd);
        		
        		return (days >= min && days <= max);
        	}
        	else {
        		
        		return true;
        	}
    	}
    	else {
    		
    		return (end.length == 0);
    	}
    }
    
    function addContract(objRecord, contract) {
		
		var numLines = objRecord.getLineCount({
			sublistId: 'item'
		});

		for (var i = 0; i < contract.length; i++) {
			
			objRecord.insertLine({
			    sublistId: 'item',
			    line: i,
			});
			
			objRecord.setCurrentSublistValue({
			    sublistId: 'item',
			    fieldId: 'item',
			    value: 34 // Milestone Payment
			});
			
			objRecord.setCurrentSublistValue({
			    sublistId: 'item',
			    fieldId: 'quantity',
			    value: 1
			});
			
			objRecord.setCurrentSublistValue({
			    sublistId: 'item',
			    fieldId: 'rate',
			    value: contract[i].cont
			});
			
			objRecord.setCurrentSublistValue({
			    sublistId: 'item',
			    fieldId: 'expectedshipdate',
			    value: contract[i].date
			});
			
			objRecord.commitLine({
			    sublistId: 'item'
			});
		}
    }
    
    function addMaterial(trans, material) {

		if (!material.length) return;
		
    	var objRecord = record.create({
    		type: 'customrecord_ccm_quotematerial'
    	});

		for (var i = 0; i < material.length; i++) {

			objRecord.setSublistValue({
				sublistId: 'customrecord_ccm_quotematerial',
			    fieldId: 'custrecord_ccm_qm_transaction',
			    line: i,
			    value: trans.id
			});

			objRecord.setSublistValue({
				sublistId: 'customrecord_ccm_quotematerial',
			    fieldId: 'custrecord_ccm_qm_date',
			    line: i,
			    value: material[i].date
			});

			objRecord.setSublistValue({
				sublistId: 'customrecord_ccm_quotematerial',
			    fieldId: '	custrecord_ccm_qm_amount',
			    line: i,
			    value: material[i].mat
			});
		}
		
		objRecord.save();
    }
    
    function addLabor(trans, labor) {

		if (!labor.length) return;

    	var objRecord = record.create({
    		type: 'customrecord_ccm_quotelabor'
    	});

		for (var i = 0; i < material.length; i++) {

			objRecord.setSublistValue({
				sublistId: 'customrecord_ccm_quotelabor',
			    fieldId: 'custrecord_ccm_ql_transaction',
			    line: i,
			    value: trans.id
			});
			
			objRecord.setSublistValue({
				sublistId: 'customrecord_ccm_quotelabor',
			    fieldId: 'custrecord_ccm_ql_name',
			    line: i,
			    value: labor.n
			});
			
			objRecord.setSublistValue({
				sublistId: 'customrecord_ccm_quotelabor',
			    fieldId: 'custrecord_ccm_ql_serviceitem',
			    line: i,
			    value: getServiceItemId(labor.si)
			});
			
			objRecord.setSublistValue({
				sublistId: 'customrecord_ccm_quotelabor',
			    fieldId: 'custrecord_ccm_ql_hours',
			    line: i,
			    value: labor.h
			});
			
			objRecord.setSublistValue({
				sublistId: 'customrecord_ccm_quotelabor',
			    fieldId: 'custrecord_ccm_ql_rate',
			    line: i,
			    value: trans
			});
			
			objRecord.setSublistValue({
				sublistId: 'customrecord_ccm_quotelabor',
			    fieldId: 'custrecord_ccm_ql_startdate',
			    line: i,
			    value: labor.sd
			});

	    	//addTask(labor.pid, labor.n, getResourceId(labor.si), getServiceItemId(labor.si), labor.h, labor.sd, labor.ed);    	
		}
		
		objRecord.save();
    }
    
    function addTask(projectId, name, resourceId, serviceItemId, hours, startDate, endDate) {

    	if (!resourceId || !serviceItemId) return;

    	var task = updateTask(projectId, name);
    	
    	if (task) {
    		
        	log.debug({
        	    title: 'Task',
        	    details: 'Use existing task "' + name + '" with id: ' + task.id
        	});

			var numLines = task.getLineCount({
			    sublistId: 'assignee'
			});

			for (var i = numLines; i >= 0; i--) {

				task.removeLine({
				    sublistId: 'assignee',
				    line: i,
				    ignoreRecalc: true
				});
			}
    	}
    	else {
    		
        	log.debug({
        	    title: 'Task',
        	    details: 'Create new task "' + name + '"'
        	});
    		
        	task = record.create({
                type: record.Type.PROJECT_TASK
        	});
			  
    		task.setText({
    		    fieldId: 'title',
    		    text: name
    		});
    		  
    		task.setValue({
    		    fieldId: 'company',
    		    value: projectId
    		});
    	}

    	var units = 100.0;
    	
		if (startDate) {

			task.setText({
			    fieldId: 'constrainttype',
			    text: 'Fixed Start'
			});

			task.setText({
			    fieldId: 'startdate',
			    text: startDate
			});
    		
        	log.debug({
        	    title: 'Fixed Start Date',
        	    details: 'Date: ' + startDate
        	});

			if (endDate) {

				var dStart = getJSDateFromNSDate(startDate);
				var dEnd = getJSDateFromNSDate(endDate);
				
				var end = new Date(dStart.getFullYear(), dStart.getMonth(), dStart.getDate());
				
				end = addWorkDays(end, Math.ceil(hours / 8) - 1);

				var currentDays = getWeekDays(dStart, end);
				var proposedDays = getWeekDays(dStart, dEnd);
	    		
	        	log.debug({
	        	    title: 'Fixed End Date',
	        	    details: 'Date: ' + endDate + ', Days: ' + proposedDays + ', Calculated Date: ' + getNSDateFromJSDate(end) + ', Days: ' + currentDays
	        	});

	        	if (currentDays != proposedDays) {
	        		
	    	    	var unitsMultiplier = 1.0 / (proposedDays / currentDays);

	    			units = (units * unitsMultiplier).toFixed(3);
	        	}
			}
		}
		
		var numLines = task.getLineCount({
		    sublistId: 'assignee'
		});

		task.setSublistValue({
		    sublistId: 'assignee',
		    fieldId: 'resource',
		    line: numLines,
		    value: resourceId
		});
		  
		task.setSublistValue({
		    sublistId: 'assignee',
		    fieldId: 'serviceitem',
		    line: numLines,
		    value: serviceItemId
		});
		  
		task.setSublistValue({
		    sublistId: 'assignee',
		    fieldId: 'plannedwork',
		    line: numLines,
		    value: hours
		});

		task.setSublistText({
		    sublistId: 'assignee',
		    fieldId: 'units',
		    line: numLines,
		    text: units
		});

        task.save();
    }

    function updateTask(projectId, name) {

    	var recordObj = null;
    	
    	var s = search.create({
	        type: record.Type.PROJECT_TASK,
	        columns: ['internalid'],
	        filters: [
	  	                search.createFilter({
	  	                	name: 'formulanumeric',
		                	formula: '{job.internalid}',
	    		            operator: search.Operator.EQUALTO,
	    		            values: projectId
	    		        }),
	  	                search.createFilter({
		                	name: 'title',
	    		            operator: search.Operator.IS,
	    		            values: name
	    		        }),
	        ],
	    });

    	s.run().each(function(result) {

	    	var id = result.getValue('internalid');

	    	if (id) {
	    		
		    	recordObj = record.load({
		    		type: record.Type.PROJECT_TASK,
		    	    id: id
		    	});
	    	}
	    	
	        return false;
	    });
    	
    	return recordObj;
    }
    
    function getJSDateFromNSDate(date) {

    	var d = date.split('-');
        
    	return new Date(d[0], d[1] - 1, d[2]);
    }

    function getNSDateFromJSDate(date) {

    	return format.format({
			value: date,
			type: format.Type.DATE
		});
    }

    function getDateStringFromJSDate(date) {

    	var s = getNSDateFromJSDate(date);
    	
    	var d = s.split('-');
 		
    	return (d[1] + '/' + d[2] + '/' + d[0]);
    }

    function getDays(date1, date2) {

    	const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    	const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

    	return Math.floor((utc2 - utc1) / (1000 * 86400)) + 1;
    }

    function getWeekDays(date1, date2) {
   	
    	var days = getDays(date1, date2);
    	
    	// Subtract two weekend days for every week in between
    	var weeks = Math.floor(days / 7);

    	days -= weeks * 2;

    	// Handle special cases
    	var startDay = date1.getDay();
    	var endDay = date2.getDay();

    	// Remove weekend not previously removed.   
    	if (startDay - endDay > 1) days -= 2;

    	// Remove start day if span starts on Sunday but ends before Saturday
    	if (startDay == 0 && endDay != 6)  days--;

    	// Remove end day if span ends on Saturday but starts after Sunday
    	if (endDay == 6 && startDay != 0) days--;

    	return days;
    }

    function addWorkDays(startDate, days) { // Add days to start date (5 days including start date means add 4 days
		
    	log.debug({
    	    title: 'Add Work Days',
    	    details: 'Date: ' + getNSDateFromJSDate(startDate) + ', Days: ' + days
    	});

        if (isNaN(days) || !(startDate instanceof Date)) return;
        
        // Get the day of the week as a number (0 = Sunday, 1 = Monday, .... 6 = Saturday)
        var dow = startDate.getDay();
        
        var daysToAdd = parseInt(days);
        
        // If the current day is Sunday add one day to make (1 = Monday, .... 7 = Sunday)
        if (dow == 0) daysToAdd++;
        
        // If the start date plus the additional days falls on or after the closest Saturday calculate weekends
        if (dow + daysToAdd >= 6) {
        	
            // Subtract days in current working week from work days
            var remainingWorkDays = daysToAdd - (5 - dow);
            
            // Add current working week's weekend
            daysToAdd += 2;
            
            if (remainingWorkDays > 5) {
            	
                // Add two days for each working week by calculating how many weeks are included
                daysToAdd += 2 * Math.floor(remainingWorkDays / 5);
                
                // Exclude final weekend if remainingWorkDays resolves to an exact number of weeks
                if (remainingWorkDays % 5 == 0) daysToAdd -= 2;
            }
        }
        
        startDate.setDate(startDate.getDate() + daysToAdd);
        
        return startDate;
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
