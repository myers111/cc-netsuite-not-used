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
                    title: "Import Schedule",
                });

            	form.clientScriptModulePath = '../ClientScript/ScheduleImport.js';

            	var pid = context.request.parameters.iid;
            	
            	addHiddenField(form, 'custpage_id', pid);
            	 
            	addHiddenField(form, 'custpage_referer', (context.request.parameters.referer == null ? context.request.headers.referer : context.request.parameters.referer));
                
                form.addSubmitButton({
                    label: 'Submit'
                });
                
                form.addButton({
                    id: 'custpage_cancel',
                    label: 'Cancel',
                    functionName: 'onCancel'
                });

                var itemsTab = form.addTab({
                    id: 'custpage_tasks',
                    label: 'Tasks'
                });

                var taskSublist = form.addSublist({
                    id: 'custpage_tasklist',
                    type: 'list',
                    label: 'Tasks',
                    tab: 'custpage_tasks'
                });

                taskSublist.addField({
                    id: 'custpage_task_cb',
                    type: 'checkbox',
                    label: 'Select'
                }).defaultValue = 'T';

                taskSublist.addMarkAllButtons();

                var count = loadFromFile(context.request.parameters.fid, taskSublist);

            	if (count == 0) {

                    var recordURL = url.resolveRecord({
                        recordType: record.Type.JOB,
                        recordId: pid,
                        isEditMode: true
                    });

                    form.addField({
                        id: 'custpage_ccm_nodata',
                        type: 'inlinehtml',
                        label: ' ',
                    }).defaultValue = 'No data to display.  Click <a href=\"' + recordURL +'\">here</a> to return.';
                }

                context.response.writePage(form);
        	}
        	else if (context.request.method === 'POST') {
        		
        		var projectId = context.request.parameters.custpage_id;

        		var numLines = context.request.getLineCount({
        		    group: 'custpage_tasklist'
        		});
                
            	log.debug({
            	    title: 'Posted Tasks',
            	    details: 'Task count: ' + numLines
            	});

        		for (var i = 0; i < numLines; i++) {
        			
        			var sel = context.request.getSublistValue({
        			    group: 'custpage_tasklist',
        			    name: 'custpage_task_cb',
        			    line: i
        			});
        			
        			if (sel == 'T') {
                    	
        				var name = context.request.getSublistValue({
        				    group: 'custpage_tasklist',
        				    name: 'custpage_task_name',
        				    line: i
        				});

        				var serviceItem = context.request.getSublistValue({
        				    group: 'custpage_tasklist',
        				    name: 'custpage_task_serviceitem',
        				    line: i
        				});

        				var hours = context.request.getSublistValue({
        				    group: 'custpage_tasklist',
        				    name: 'custpage_task_hours',
        				    line: i
        				});

        				var startDate = context.request.getSublistValue({
        				    group: 'custpage_tasklist',
        				    name: 'custpage_task_startdate',
        				    line: i
        				});

        				var endDate = context.request.getSublistValue({
        				    group: 'custpage_tasklist',
        				    name: 'custpage_task_enddate',
        				    line: i
        				});

        				var material = context.request.getSublistValue({
        				    group: 'custpage_tasklist',
        				    name: 'custpage_task_materialamount',
        				    line: i
        				});

        				addTask(projectId, name, getResourceId(serviceItem), getServiceItemId(serviceItem), hours, startDate, endDate, material);
        			}
        		}
        		
            	log.debug({
            	    title: 'Schedule Import Complete',
            	    details: 'Redirect to project id: ' + projectId
            	});

                var recordURL = url.resolveRecord({
                    recordType: record.Type.JOB,
                    recordId: projectId
                });

                redirect.redirect({
                	url: recordURL
                });
        	}
        }
        catch(e) {
        	  
            log.error('Schedule Import',e);
        }    
    }
    
    function getFieldId(name) {
    	
	    return ('custpage_task_' + name.replace(" ", "").toLowerCase());
    }

    function loadFromFile(fileid, sublist) {
    	
        var objFile = file.load({
            id: fileid
        });
        
        var fileContents = objFile.getContents();

        var rows = fileContents.split(/\r?\n|\r/);
		
    	log.debug({
    	    title: 'rows',
    	    details: rows
    	});

        if (rows.length > 1) {

            var headers = null;
            
            for (var row = 0; row < rows.length; row++) {

            	if (row == 0) {
            		
                	headers = rows[row].split(',');

    	    		sublist.addField({
                        id: getFieldId(headers[0]),
                        type: 'text',
                        label: headers[0]
                    });

    	    		sublist.addField({
                        id: getFieldId(headers[1]),
                        type: 'text',
                        label: headers[1]
                    });

    	    		sublist.addField({
                        id: getFieldId(headers[2]),
                        type: 'float',
                        label: headers[2]
                    });

    	    		sublist.addField({
                        id: getFieldId(headers[3]),
                        type: 'date',
                        label: headers[3]
                    });

    	    		sublist.addField({
                        id: getFieldId(headers[4]),
                        type: 'date',
                        label: headers[4]
                    });

    	    		sublist.addField({
                        id: getFieldId(headers[5]),
                        type: 'currency',
                        label: headers[5]
                    });

                	continue;
            	}
    	    	
            	if (rows[row].length == 0) continue;

            	var fields = rows[row].split(',');
    	    	
            	if (fields[0].length == 0) continue;
    	    	
            	if (!isValid(fields[2], fields[3], fields[4])) continue;

        		var numLines = sublist.lineCount < 0 ? 0 : sublist.lineCount;

		    	sublist.setSublistValue({
		    	    id: getFieldId(headers[0]),
		    	    line: numLines,
		    	    value: fields[0]
		    	});

		    	sublist.setSublistValue({
		    	    id: getFieldId(headers[1]),
		    	    line: numLines,
		    	    value: (fields[1].length == 0 ? fields[0] : fields[1])
		    	});

		    	sublist.setSublistValue({
		    	    id: getFieldId(headers[2]),
		    	    line: numLines,
		    	    value: fields[2]
		    	});

		    	if (fields[3].length) {
		    		
		    		var d = new Date(fields[3]);
		    		
			    	sublist.setSublistValue({
			    	    id: getFieldId(headers[3]),
			    	    line: numLines,
			    	    value: getNSDateFromJSDate(d)
			    	});
		    	}

		    	if (fields[4].length) {
		    		
		    		var d = new Date(fields[4]);
		    		
			    	sublist.setSublistValue({
			    	    id: getFieldId(headers[4]),
			    	    line: numLines,
			    	    value: getNSDateFromJSDate(d)
			    	});
		    	}

		    	if (fields[5].length) {
		    		
		    		var f = parseFloat(fields[5]);
		    		
			    	sublist.setSublistValue({
			    	    id: getFieldId(headers[5]),
			    	    line: numLines,
			    	    value: f
			    	});
		    	}
            }
        }
        
        return rows;
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

    function isValid(hours, start, end) {
    	
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
    
    function addTask(projectId, name, resourceId, serviceItemId, hours, startDate, endDate, material) {

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
