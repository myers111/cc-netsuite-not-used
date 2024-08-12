/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/search'],
/**
 * @param {log} log
 * @param {record} record
 * @param {search} search
 */
function(log, record, search) {

    const REQUEST = {
        Departments: 1,
        Employees: 2,
        Projects: 3,
        Classes: 4,
        SubClasses: 5,
        Tasks: 6,
        ServiceItems: 7,
        Hours: 8,
    };

    /**
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) {

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
return;
    	switch (requestBody.id) {
            case REQUEST.Departments:
                return getDepartments(requestBody.param);
            case REQUEST.Employees:
                return getEmployees();
            case REQUEST.Projects:
                return getProjects();
            case REQUEST.Tasks:
    		    return getTasks(requestBody.param);
            case REQUEST.ServiceItems:
                return getServiceItems(requestBody.param);
            case REQUEST.Hours:
                return setHours(requestBody);
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

    function getDepartments(options) {

        var departments = [];

	    var s = search.create({
            type: 'departments',
            columns: ['internalid','name'],
            filters: [
                search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.ANYOF,
                    values: options.departments
                }),
                search.createFilter({
	            	name: 'formulatext',
                    formula: '{isinactive}',
	                operator: search.Operator.IS,
	                values: 'F'
	            }),
            ],
	    });

	    s.run().each(function(result) {

            var id = result.getValue({name: 'internalid'});
            var name = result.getValue({name: 'name'});
	        
            departments.push({
                id: id,
                name: name
            });

	        return true;
	    });    	
    	
    	return departments;
    }

    function getEmployees(departments) {

    	var employees = [];
    	    	
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
	            search.createFilter({
	            	name: 'formulatext',
                    formula: '{isjobresource}',
	                operator: search.Operator.IS,
	                values: 'T'
	            }),
	            search.createFilter({
	            	name: 'formulanumeric',
                    formula: '{department}',
	                operator: search.Operator.ANYOF,
	                values: departments
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
    	
    	return employees;
    }

    function getProjects() {

    	var projects = [];

        projects.push({
            id: '0',
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
    	
	    return projects;
    }

    function getClass(projectId) {

    	var classId = 0;
    	    	
	    var s = search.create({
            type: record.Type.JOB,
            columns: ['custentity_ccm_class'],
            filters: [
                      search.createFilter({
                      name: 'internalid',
                      operator: search.Operator.IS,
                      values: projectId
                  })
            ],
	    });

	    s.run().each(function(result) {
            
            classId = result.getValue({name: 'custentity_ccm_class'});
	        
	        return false;
	    });    	
    	
    	return classId;
    }

    function getSubClasses(classId) {
	
        var subClasses = [];

	    var s = search.create({
            type: 'customrecord_cseg_ccm_subclass',
	        columns: ['internalid','entityid'],
            filters: [
                      search.createFilter({
                      name: 'internalid',
                      operator: search.Operator.IS,
                      values: projectId
                  })
            ],
	    });

	    s.run().each(function(result) {

            var id = result.getValue({name: 'internalid'});
            var name = result.getValue({name: 'name'});
	        
	        subClasses.push({
	        	id: id,
	        	name: name
	        });
	        
	        return true;
	    });    	
    	
    	return subClasses;
    }

    function getTasks(projectId) {

    	var tasks = [];

	    var s = search.create({
	        type: search.Type.PROJECT_TASK,
            columns: [
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{internalid}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: "SUBSTR({title}, INSTR({title}, ':') + 1)"
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
                    name: 'formulatext',
                    formula: '{status}',
                    operator: search.Operator.ISNOT,
                    values: 'Completed'
                }),
                search.createFilter({
                    name: 'formulanumeric',
                    formula: "CASE {projecttaskassignment.serviceitem} WHEN 'Fabrication' THEN 1 WHEN 'Assembly' THEN 1 WHEN 'Ship/Receive' THEN 1 WHEN 'Warehouse' THEN 1 WHEN 'Engraving' THEN 1 ELSE 0 END",
                    operator: search.Operator.EQUALTO,
                    values: 1
                }),
/*                search.createFilter({
                    name: 'formulatext',
                    formula: '{projecttaskassignment.serviceitem}',
                    operator: search.Operator.ISNOTEMPTY
                }),
                search.createFilter({
                    name: 'formulatext',
                    formula: '{job.entityid}',
                    operator: search.Operator.ISNOTEMPTY
                }),
*/            ],
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
    	
	    return tasks;
    }

    function getServiceItems(taskId) {

    	var serviceItems = [];

        if (taskId > 0) {

            var s = search.create({
                type: search.Type.PROJECT_TASK,
                columns: [
                    search.createColumn({
                        name: 'formulanumeric',
                        formula: '{projecttaskassignment.serviceitem.id}'
                    }),
                    search.createColumn({
                        name: 'formulatext',
                        formula: '{projecttaskassignment.serviceitem}'
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
                
                var id = result.getValue(result.columns[0]);
                var name = result.getValue(result.columns[1]);
                
                serviceItems.push({
                    id: id,
                    name: name
                });
                
                return true;
            });    	
        }
        else {

            var s = search.create({
                type: search.Type.SERVICE_ITEM,
                columns: [
                    search.createColumn({
                        name: 'formulanumeric',
                        formula: '{internalid}'
                    }),
                    search.createColumn({
                        name: 'formulatext',
                        formula: "SUBSTR({name}, INSTR({name}, ':') + 1)"
                    })
                ],
                filters: [
                    search.createFilter({
                        name: 'formulanumeric',
                        formula: "CASE WHEN INSTR({name} , ':') > 0 THEN CASE WHEN SUBSTR({name}, 0, 4) = 'Engg' THEN 0 ELSE 1 END ELSE 0 END",
                        operator: search.Operator.EQUALTO,
                        values: 1
                    }),
                    search.createFilter({
                        name: 'formulatext',
                        formula: "{name}",
                        operator: search.Operator.ISNOT,
                        values: 'SG&A : Selling'
                    }),
                ],
            });

            s.run().each(function(result) {

                var id = result.getValue(result.columns[0]);
                var name = result.getValue(result.columns[1]);

                serviceItems.push({
                    id: id,
                    name: name
                });
                
                return true;
            });    	
        }

	    return serviceItems;
    }

    function setHours(params) {

        var locationId = 5;
        
        var objRecord = record.create({
            type: record.Type.TIME_BILL
        });

        objRecord.setText({
            fieldId: 'trandate',
            text: params.date
        });

        objRecord.setValue({
            fieldId: 'location',
            value: locationId
        });

        objRecord.setValue({
            fieldId: 'department',
            value: params.departmentId
        });

        objRecord.setValue({
            fieldId: 'employee',
            value: params.employeeId
        });

        if (params.projectId > 0) {

            objRecord.setValue({
                fieldId: 'customer',
                value: params.projectId
            });
        }

        if (params.taskId > 0) {
            
            objRecord.setValue({
                fieldId: 'casetaskevent.id',
                value: params.taskId
            });
        }

        objRecord.setValue({
            fieldId: 'item',
            value: params.serviceItemId
        });

        if (params.hours > 0) {

            objRecord.setValue({
                fieldId: 'hours',
                value: params.hours
            });
        }

        objRecord.save();

	    return true;
    }

    return {
        'get': doGet,
        put: doPut,
        post: doPost,
        'delete': doDelete
    };  
});
