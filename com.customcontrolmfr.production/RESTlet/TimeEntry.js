/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/search', '../../com.customcontrolmfr/Module/ccUtil'],
/**
 * @param {log} log
 * @param {record} record
 * @param {search} search
 */
function(log, record, search, ccUtil) {

    /**
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) {

    	log.debug({
    	    title: 'doGet',
    	    details: JSON.stringify(requestParams)
    	});

    	switch (requestParams.path) {
            case 'employees':
                return getEmployees();
            case 'employee':
                return getEmployee(requestParams.id);
            case 'logins':
                return getLogins();
            case 'projects':
                return getProjects();
            case 'tasks':
                return getTasks(requestParams.projectId);
        }
    }

    /**
     * Function called upon sending a PUT request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPut(requestBody) {

    }

    /**
     * Function called upon sending a POST request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) {

    	log.debug({
    	    title: 'doPost',
    	    details: JSON.stringify(requestBody)
    	});

    	switch (requestBody.path) {
            case 'login':
                return login(requestBody);
            case 'startmisc':
                return startMisc(requestBody);
            case 'endday':
                return endDay(requestBody);
            case 'starttask':
                return startTask(requestBody);
        }
    }

    /**
     * Function called upon sending a DELETE request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doDelete(requestParams) {

    }

    // GET ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function getEmployees() {

    	var employees = [];
    	    	
        employees.push({
            id: 0,
            name: ''
        });

	    var s = search.create({
	        type: search.Type.EMPLOYEE,
	        columns: ['internalid','entityid'],
	        filters: [
	            search.createFilter({
	            	name: 'formulatext',
                    formula: '{isinactive}',
	                operator: search.Operator.IS,
	                values: 'F'
	            }),
/*	            search.createFilter({
	            	name: 'formulatext',
                    formula: '{isjobresource}',
	                operator: search.Operator.IS,
	                values: 'T'
	            }),
*/	            search.createFilter({
	            	name: 'formulatext',
                    formula: '{department}',
	                operator: search.Operator.CONTAINS,
	                values: 'Operations'
	            }),
	        ],
	    });

	    s.run().each(function(result) {
	    	
	        var id = result.getValue({name: 'internalid'});
	        var name = result.getValue({name: 'entityid'});

            employees.push({
	        	id: id,
	        	name: name
	        });
	        
	        return true;
	    });    	

    	return JSON.stringify(employees);
    }

    function getEmployee(employeeId) {

    	var employee = {};
    	    	
	    var s = search.create({
	        type: search.Type.EMPLOYEE,
	        columns: [
                search.createColumn({
                    name: 'formulatext',
                    formula: "{firstname}"
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: "{lastname}"
                }),
                search.createColumn({
                    name: 'department'
                }),
                search.createColumn({
                    name: 'location'
                }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: "NVL({custentity_ccm_activeproject.id},0)"
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: "CASE WHEN {custentity_ccm_activeproject} IS NULL THEN '' ELSE CONCAT({custentity_ccm_activeproject.entityid},CONCAT(' ',{custentity_ccm_activeproject.jobname})) END"
                }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: "NVL({custentity_ccm_activeserviceitem.id},0)"
                    //formula: "NVL({custentity_ccm_activetask.id},0)"
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: "CASE WHEN {custentity_ccm_activeproject} IS NULL THEN 'Miscellaneous' ELSE REPLACE({custentity_ccm_activeserviceitem.itemid}, 'Prod : ') END"
                    //formula: "CASE WHEN {custentity_ccm_activeproject} IS NULL THEN 'Miscellaneous' ELSE {custentity_ccm_activetask.title} END"
                }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: "NVL({custentity_ccm_activeminutes},0)"
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: "CASE WHEN {custentity_ccm_activetime} IS NULL THEN NULL ELSE TO_CHAR({custentity_ccm_activetime}, 'yyyy-mm-dd hh24:mi:ss') END"
                }),
            ],
	        filters: [
	            search.createFilter({
	            	name: 'formulanumeric',
                    formula: '{internalid}',
	                operator: search.Operator.EQUALTO,
	                values: employeeId
	            }),
	        ],
	    });

	    s.run().each(function(result) {
	    	
	        employee.id = employeeId;
	        employee.firstName = result.getValue(result.columns[0]);
	        employee.lastName = result.getValue(result.columns[1]);

            if (employee.firstName && employee.lastName) {

                var departmentId = result.getValue(result.columns[2]);
                var locationId = result.getValue(result.columns[3]);
                var projectId = result.getValue(result.columns[4]);
                var project = result.getValue(result.columns[5]);
                var taskId = result.getValue(result.columns[6]);
                var task = result.getValue(result.columns[7]);
                var minutes = result.getValue(result.columns[8]);
                var time = result.getValue(result.columns[9]);
    
                if (!minutes) minutes = 0;

                employee.departmentId = departmentId;
                employee.locationId = locationId;
                employee.projectId = projectId;
                employee.project = project;
                employee.taskId = taskId;
                employee.task = task;
                employee.minutes = minutes;
                employee.time = time;
            }
	        
	        return false;
	    });    	

    	return JSON.stringify(employee);
    }

    function getProjects() {

    	var projects = [];

        projects.push({
            id: 0,
            name: ''
        });

	    var s = search.create({
	        type: search.Type.JOB,
	        columns: ['internalid','entityid'],
	        filters: [
                search.createFilter({
                    name: 'formulatext',
                    formula: '{isinactive}',
                    operator: search.Operator.IS,
                    values: 'F'
                }),
                search.createFilter({
                    name: 'status',
                    operator: search.Operator.NONEOF,
                    values: [1,3,23,24,25,26,27]
                }),
                search.createFilter({
                    name: 'formulatext',
                    formula: "{custentity_ccm_prodsubclass}",
                    operator: search.Operator.ISNOTEMPTY
                }),
            ],
        });
        
	    s.run().each(function(result) {
	    	
	        var id = result.getValue({name: 'internalid'});
	        var name = result.getValue({name: 'entityid'});
	        
	        projects.push({
	        	id: id,
	        	name: name
	        });
	        
	        return true;
	    });    	
    	
	    return JSON.stringify(projects);
    }

    function getTasks(projectId) {

    	var tasks = [];

        tasks.push({
            id: '0',
            name: ''
        });

        tasks.push({
            id: '25',
            name: 'Assembly'
        });

        tasks.push({
            id: '38',
            name: 'Engraving'
        });

        tasks.push({
            id: '26',
            name: 'Fabrication'
        });

        // We're just using Service Items for now
/*
	    var s = search.create({
	        type: search.Type.PROJECT_TASK,
            columns: [
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{internalid}'
                }),
                search.createColumn({
                    name: 'title'
                })
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
                    formula: "CASE {projecttaskassignment.serviceitem} WHEN 'Fabrication' THEN 1 WHEN 'Assembly' THEN 1 WHEN 'Ship/Receive' THEN 1 WHEN 'Warehouse' THEN 1 WHEN 'Engraving' THEN 1 ELSE 0 END",
                    operator: search.Operator.EQUALTO,
                    values: 1
                }),
                search.createFilter({
                    name: 'formulatext',
                    formula: '{projecttaskassignment.serviceitem}',
                    operator: search.Operator.ISNOTEMPTY
                }),
                search.createFilter({
                    name: 'formulatext',
                    formula: '{job.entityid}',
                    operator: search.Operator.ISNOTEMPTY
                }),
                search.createFilter({
                    name: 'formulatext',
                    formula: '{status}',
                    operator: search.Operator.ISNOT,
                    values: 'Completed'
                }),
            ],
        });

	    s.run().each(function(result) {
	    	
            var id = result.getValue(result.columns[0]);
            var name = result.getValue(result.columns[1]);
        
	        tasks.push({
	        	id: id,
	        	name: name
	        });
	        
	        return true;
	    });    	
*/
	    return JSON.stringify(tasks);
    }

    function getLogins() {

    	var logins = [];
    	    	
	    var s = search.create({
	        type: search.Type.EMPLOYEE,
	        columns: [
                search.createColumn({
                    name: 'formulatext',
                    formula: "CONCAT({firstname},CONCAT(' ',{lastname}))"
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: "CASE WHEN {custentity_ccm_activeproject} IS NULL THEN '' ELSE CONCAT({custentity_ccm_activeproject.entityid},CONCAT(' ',{custentity_ccm_activeproject.jobname})) END"
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: "CASE WHEN {custentity_ccm_activeproject} IS NULL THEN 'Miscellaneous' ELSE REPLACE({custentity_ccm_activeserviceitem.itemid}, 'Prod : ') END"
                    //formula: "CASE WHEN {custentity_ccm_activeproject} IS NULL THEN 'Miscellaneous' ELSE {custentity_ccm_activetask.title} END"
                }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: "NVL({custentity_ccm_activeminutes},0) + ROUND((CAST(CURRENT_DATE AS DATE) - CAST({custentity_ccm_activetime} AS DATE))*24*60)"
                }),
            ],
	        filters: [
	            search.createFilter({
	            	name: 'formulatext',
                    formula: '{isinactive}',
	                operator: search.Operator.IS,
	                values: 'F'
	            }),
	            search.createFilter({
	            	name: 'formulatext',
                    formula: '{isjobresource}',
	                operator: search.Operator.IS,
	                values: 'T'
	            }),
	            search.createFilter({
	            	name: 'formulatext',
                    formula: '{department}',
	                operator: search.Operator.CONTAINS,
	                values: 'Operations'
	            }),
	            search.createFilter({
	            	name: 'formulatext',
                    formula: '{custentity_ccm_active}',
	                operator: search.Operator.IS,
	                values: 'T'
	            }),
	        ],
	    });

	    s.run().each(function(result) {
	    	
	        var name = result.getValue(result.columns[0]);
	        var project = result.getValue(result.columns[1]);
	        var task = result.getValue(result.columns[2]);
	        var time = result.getValue(result.columns[3]);

            if (!time) time = 0;

            if (name && task) {

                var h = Math.floor(time / 60);
                var m = Math.floor(time - (h * 60));
    	
                var lgs = {
                    name: name,
                    project: project,
                    task: task,
                    time: (h + ':' + (m > 9 ? m : '0' + m))
                };

                logins.push(lgs);
            }
	        
	        return true;
	    });    	

    	return JSON.stringify(logins);
    }

    // POST /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function login(options) {

    	var success = false;
    	    	
	    var s = search.create({
	        type: search.Type.EMPLOYEE,
	        columns: ['internalid'],
	        filters: [
	            search.createFilter({
	            	name: 'formulanumeric',
                    formula: '{internalid}',
	                operator: search.Operator.EQUALTO,
	                values: options.id
	            }),
	        ],
	    });

	    s.run().each(function(result) {
	    	
	        success = true;
	        
	        return false;
	    });    	

    	return success;
    }

    function startMisc(options) {

    	return setEmployee({
            id: options.employeeId,
            active: true,
            projectId: 0,
            taskId: 0
        });
    }

    function endDay(options) {

    	return setEmployee({
            id: options.employeeId,
            active: false,
            projectId: 0,
            taskId: 0
        });
    }

    function startTask(options) {

    	return setEmployee({
            id: options.employeeId,
            active: true,
            projectId: options.projectId,
            taskId: options.taskId
        });
    }

    function setEmployee(options) {

        if (!setEmployeeHours(options.id)) return false;

    	var success = 'false';

        var objRecord = record.load({
            type: record.Type.EMPLOYEE,
            id: options.id,
            isDynamic: true,
        });
    	
        if (objRecord) {

            if (options.active != null) {
                
                objRecord.setValue({
                    fieldId: 'custentity_ccm_active',
                    value: options.active
                });
            }

            if (options.projectId != null) {

                objRecord.setValue({
                    fieldId: 'custentity_ccm_activeproject',
                    value: (options.projectId ? options.projectId : '')
                });
            }

            if (options.taskId != null) {
                
                objRecord.setValue({
                    fieldId: 'custentity_ccm_activeserviceitem',
                    //fieldId: 'custentity_ccm_activetask',
                    value: (options.taskId ? options.taskId : '')
                });
            }
                
            objRecord.setValue({
                fieldId: 'custentity_ccm_activehours',
                value: 0
            });

            objRecord.setValue({
                fieldId: 'custentity_ccm_activetime',
                value: (options.active != null && options.active == false ? '' : new Date())
            });

            objRecord.save();
                
            success = 'true';
        }

    	return success;
    }

    function setEmployeeHours(employeeId) {

        if (!employeeId) return;

    	log.debug({
    	    title: 'setEmployeeHours Begin',
    	    details: 'Employee Id: ' + employeeId
    	});

        var e = getEmployee(employeeId); // returns JSON string

        if (!e) return;

        var employee = JSON.parse(e);

        var minutes = parseFloat(employee.minutes ? employee.minutes : 0);

        if (employee.time) {

            var dtStart = ccUtil.getJSDateFromNSDateTime(employee.time);
    
            //var dNow = new Date();
            var dtNow = new Date(Date.now() + 2 * (60 * 60 * 1000) ); // must add 2 hours because new Date() returns PT instead of CT

            var min = (dtNow - dtStart) / 1000 / 60;
/*
            var minBreak = 30;

            if (min >= minBreak){

                var dtBreakEnd = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 12, 0, 0);

                if (dtNow >= dtBreakEnd && dtBreakEnd >= dtStart) min -= minBreak; // Subtract break
            }
*/
            // Instead of the break logic above, just subtract 5 min. for every 30 mins worked

            var seg = Math.floor(min / 30);

            minutes += (min - seg * 5);
        }

        if (minutes <= 0) return true;

        var objRecord = getTimeBill(employee);

        var hours = 0;

        if (objRecord) {
            
            hours = objRecord.getValue({
                fieldId: 'hours'
            });
        }
        else {
            
            objRecord = record.create({
                type: record.Type.TIME_BILL,
                isDynamic: true
            });

            objRecord.setValue({
                fieldId: 'employee',
                value: employee.id
            });

            var project = getProject(employee.projectId);

            if (project) {

                objRecord.setValue({
                    fieldId: 'customer',
                    value: employee.projectId
                });
    
                objRecord.setValue({
                    fieldId: 'item',
                    value: employee.taskId
                });
    /*
                objRecord.setValue({
                    fieldId: 'casetaskevent',
                    value: employee.taskId
                });
    
                objRecord.setValue({
                    fieldId: 'item',
                    value: getServiceItem(employee.taskId)
                });
    */
                objRecord.setValue({
                    fieldId: 'class',
                    value: project.classId
                });
        
                objRecord.setValue({
                    fieldId: 'cseg_ccm_subclass',
                    value: project.subclassId
                });
            }
            else {
    
                objRecord.setValue({
                    fieldId: 'item',
                    value: 28 // Prod : Miscellaneous
                });
    
                objRecord.setValue({
                    fieldId: 'class',
                    value: 7 // Admin
                });
        
                objRecord.setValue({
                    fieldId: 'cseg_ccm_subclass',
                    value: 13 // Admin
                });
            }
    
            objRecord.setValue({
                fieldId: 'department',
                value: employee.departmentId
            });
    
            objRecord.setValue({
                fieldId: 'location',
                value: employee.locationId
            });
        }

        hours = (parseFloat(hours ? hours : 0) + (Math.round(minutes / 60 * 4) / 4)).toFixed(2);

        objRecord.setValue({
            fieldId: 'hours',
            value: hours
        });

        var id = objRecord.save();

    	log.debug({
    	    title: 'setEmployeeHours End',
    	    details: 'Time Bill Id: ' + id
    	});

    	return (id > 0);
    }

    function getTimeBill(employee) {

    	log.debug({
    	    title: 'getTimeBill Begin',
    	    details: 'Employee: ' + employee
    	});

        var objRecord = null;

        if (employee) {
    
            var s = search.create({
                type: search.Type.TIME_BILL,
                columns: ['internalid'],
                filters: [
                    search.createFilter({
                        name: 'formulanumeric',
                        formula: '{employee.id}',
                        operator: search.Operator.EQUALTO,
                        values: employee.id
                    }),
                    search.createFilter({
                        name: 'formuladate',
                        formula: '{date}',
                        operator: search.Operator.ON,
                        values: ccUtil.getNSDateFromJSDate(new Date())
                    }),
                ],
            });

            if (employee.projectId > 0 && employee.taskId > 0) {

                var projectFilter = search.createFilter({
                    name: 'formulanumeric',
                    formula: '{customer.id}',
                    operator: search.Operator.EQUALTO,
                    values: employee.projectId
                });
/*
                var taskFilter = search.createFilter({
                    name: 'casetaskevent',
                    operator: search.Operator.EQUALTO,
                    values: employee.taskId
                });
*/
                var taskFilter = search.createFilter({
                    name: 'formulanumeric',
                    formula: '{item.internalid}',
                    operator: search.Operator.EQUALTO,
                    values: employee.taskId
                });

                s.filters.push(projectFilter);
                s.filters.push(taskFilter);
            }
            else {

                var miscFilter = search.createFilter({
                    name: 'formulanumeric',
                    formula: '{item.internalid}',
                    operator: search.Operator.EQUALTO,
                    values: 28 // Prod : Miscellaneous
                });

                s.filters.push(miscFilter);
            }

            s.run().each(function(result) {

                objRecord = record.load({
                    type: record.Type.TIME_BILL,
                    id: result.getValue('internalid'),
                    isDynamic: true
                });

                return false;
            });    	
        }

    	log.debug({
    	    title: 'getTimeBill End',
    	    details: 'Time Bill Id: ' + (objRecord ? objRecord.id : 0)
    	});

    	return objRecord;
    }

    function getProject(projectId) {

        var project = null;

        if (projectId) {
    
            var s = search.create({
                type: search.Type.JOB,
                columns: ['custentity_ccm_class','custentity_ccm_prodsubclass'],
                filters: [
                    search.createFilter({
                        name: 'formulanumeric',
                        formula: '{internalid}',
                        operator: search.Operator.EQUALTO,
                        values: projectId
                    }),
                ],
            });
    
            s.run().each(function(result) {
                
                project = {};

                project.classId = result.getValue('custentity_ccm_class');
                project.subclassId = result.getValue('custentity_ccm_prodsubclass');
                
                return false;
            });    	
        }

    	return project;
    }

    function getServiceItem(taskId) {

        var itemId = null;

        if (taskId) {
    
            var s = search.create({
                type: search.Type.PROJECT_TASK,
	            columns: [
	  	  			search.createColumn({
					    name: 'formulanumeric',
				        formula: '{projecttaskassignment.serviceitem.id}'
					})
			    ],
                filters: [
                    search.createFilter({
                        name: 'formulanumeric',
                        formula: '{internalid}',
                        operator: search.Operator.EQUALTO,
                        values: taskId
                    }),
                ],
            });
    
            s.run().each(function(result) {
                
                itemId = parseFloat(result.getValue(result.columns[0]));
                
                return false;
            });    	
        }

    	return itemId;
    }

    return {
        'get': doGet,
        put: doPut,
        post: doPost,
        'delete': doDelete
    };  
});
