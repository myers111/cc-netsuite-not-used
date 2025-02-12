/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/task','N/record','N/runtime','N/ui/serverWidget','N/ui/message','N/format','N/search','../Module/ccProject'],

function(task,record,runtime,serverWidget,message,format,search,ccProject) {

	const QUOTE 	= 18;
	const BUDGETARY = 19;
   
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

    	setProjectOverviewPercent(context.newRecord);
        
        if (context.type == context.UserEventType.VIEW) {
        	
        	context.form.addButton({
                id: 'custpage_ccm_viewactuals',
                label: 'View Actuals',
                functionName: 'viewActuals'
        	});

        	context.form.addButton({
                id: 'custpage_ccm_changecustomer',
                label: 'Change Customer',
                functionName: 'changeCustomer'
        	});

        	context.form.addButton({
                id: 'custpage_ccm_data',
                label: 'Data',
                functionName: 'projectData'
        	});

        	statusClosed(context);
        }

        var user = runtime.getCurrentUser();
        var userPermission = user.getPermission({
            name: 'LIST_ACCOUNT'
        });

        if (userPermission === runtime.Permission.FULL) {

            var financialSublist = context.form.getSublist({
                id: 'recmachcustrecord_ccm_project'
            });
            
            if (financialSublist) {
            	
            	financialSublist.addButton({
                    id: 'custpage_ccm_adjustwip',
                    label: 'Adjust WIP To 0',
                    functionName: 'adjustWIP'
            	});
            }
        }

		context.form.clientScriptModulePath = '../ClientScript/Project.js';

    	// QUOTE FIELDS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    	var status = context.newRecord.getValue({
    	    fieldId: 'entitystatus'
    	});

    	if (status != QUOTE && status != BUDGETARY) {

        	context.form.getField({
        	    id: 'custentity_ccm_probability'
        	}).updateDisplayType({
        	    displayType : serverWidget.FieldDisplayType.DISABLED
        	});
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

		if (!context.newRecord) return;
		if (!context.newRecord.id) return;

		var status = context.newRecord.getValue({
			fieldId: 'entitystatus'
		});

		switch (parseInt(status)) {

			case 2:
			case 5:
			case 20:
			case 21:
				break;
			default:
				return;
		}
/*
		var data = ccProject.getProductionData({
			id: context.newRecord.id
		});

		if (data) {

			context.newRecord.setValue({
				fieldId: 'custentity_ccm_estfabhrs',
				value: data.estFabHours
			});

			context.newRecord.setValue({
				fieldId: 'custentity_ccm_estassemblyhrs',
				value: data.estAssemblyHours
			});

			context.newRecord.setValue({
				fieldId: 'custentity_ccm_estengravinghrs',
				value: data.estEngravingHours
			});

			context.newRecord.setValue({
				fieldId: 'custentity_ccm_actfabhrs',
				value: data.actFabHours
			});

			context.newRecord.setValue({
				fieldId: 'custentity_ccm_actassemblyhrs',
				value: data.actAssemblyHours
			});

			context.newRecord.setValue({
				fieldId: 'custentity_ccm_actengravinghrs',
				value: data.actEngravingHours
			});

			if (data.mfgStartDate) {

				context.newRecord.setText({
					fieldId: 'custentity_ccm_mfgstartdate',
					text: data.mfgStartDate
				});
			}

			if (data.receiveDate) {

				context.newRecord.setText({
					fieldId: 'custentity_ccm_materialrecdate',
					text: data.receiveDate
				});
			}

			if (data.materialPercent) {

				context.newRecord.setValue({
					fieldId: 'custentity_ccm_materialpercent',
					value: data.materialPercent
				});
			}
		}
*/
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    	var update = context.newRecord.getValue({
    		fieldId: 'custentity_ccm_entityupdate'
    	});

    	if (update == 1) projectOverview(context.newRecord);
/*		
		var oldentitystatus = null;
		
		if (context.oldRecord) {
			
	    	oldentitystatus = context.oldRecord.getValue({
	    		fieldId: 'entitystatus'
	    	});
		}

    	var newentitystatus = context.newRecord.getValue({
    		fieldId: 'entitystatus'
    	});
    	
    	if (oldentitystatus != newentitystatus && newentitystatus == 1) {

        	var estcontractamount = context.newRecord.getValue({
        		fieldId: 'custentity_ccm_estcontractamount'
        	});

        	var actinvoiceamount = context.newRecord.getValue({
        		fieldId: 'custentity_ccm_actinvoiceamount'
        	});

        	var estmaterialamount = context.newRecord.getValue({
        		fieldId: 'custentity_ccm_estmaterialamount'
        	});

        	var actmaterialamount = context.newRecord.getValue({
        		fieldId: 'custentity_ccm_actmaterialamount'
        	});

        	var estlaboramount = context.newRecord.getValue({
        		fieldId: 'custentity_ccm_estlaboramount'
        	});
    		
        	var actlaboramount = context.newRecord.getValue({
        		fieldId: 'custentity_ccm_actlaboramount'
        	});

        	var numLines = context.newRecord.getLineCount({
        	    sublistId: 'recmachcustrecord_ccm_project'
        	});
	
        	context.newRecord.setSublistValue({
        	    sublistId: 'recmachcustrecord_ccm_project',
        	    fieldId: 'custrecord_ccm_contractamount',
        	    line: numLines,
        	    value: (actinvoiceamount - estcontractamount)
        	});
        	
        	context.newRecord.setSublistValue({
        	    sublistId: 'recmachcustrecord_ccm_project',
        	    fieldId: 'custrecord_ccm_materialamount',
        	    line: numLines,
        	    value: (actmaterialamount - estmaterialamount)
        	});
        	
        	context.newRecord.setSublistValue({
        	    sublistId: 'recmachcustrecord_ccm_project',
        	    fieldId: 'custrecord_ccm_laboramount',
        	    line: numLines,
        	    value: (actlaboramount - estlaboramount)
        	});
        	
        	context.newRecord.setSublistValue({
        	    sublistId: 'recmachcustrecord_ccm_project',
        	    fieldId: 'custrecord_ccm_memo',
        	    line: numLines,
        	    value: 'Adjust to close'
        	});

    		var d = new Date();

    		var revisionDate = format.format({
    			value: d,
    			type: format.Type.DATE
    		});

        	context.newRecord.setSublistText({
        	    sublistId: 'recmachcustrecord_ccm_project',
        	    fieldId: 'custrecord_ccm_revisiondate',
        	    line: numLines,
        	    text: revisionDate
        	});

        	// Set estimates to actual
        	
        	estcontractamount = actinvoiceamount;
        	estmaterialamount = actmaterialamount;
        	estlaboramount = actlaboramount;
        	
        	context.newRecord.setValue({
        		fieldId: 'custentity_ccm_estcontractamount',
        		value: estcontractamount
        	});

        	context.newRecord.setValue({
        		fieldId: 'custentity_ccm_estmaterialamount',
        		value: estmaterialamount
        	});

        	context.newRecord.setValue({
        		fieldId: 'custentity_ccm_estlaboramount',
        		value: estlaboramount
        	});

        	context.newRecord.setValue({
        		fieldId: 'custentity_ccm_invoiceperccomp',
        		value: (estcontractamount == 0 ? 0 : (actinvoiceamount / estcontractamount * 100)).toFixed(2)
        	});

        	context.newRecord.setValue({
        		fieldId: 'custentity_ccm_materialperccomp',
        		value: (estmaterialamount == 0 ? 0 : (actmaterialamount / estmaterialamount * 100)).toFixed(2)
        	});

        	context.newRecord.setValue({
        		fieldId: 'custentity_ccm_laborperccomp',
        		value: (estlaboramount == 0 ? 0 : (actlaboramount / estlaboramount * 100)).toFixed(2)
        	});
    	}
*/    }

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

    function projectOverview(objRecord) {

		var d = new Date();

		var revisionDate = format.format({
			value: d,
			type: format.Type.DATE
		});

		var data = ccProject.getEquityData({
			id: objRecord.id, 
			revisionDate: revisionDate
		});

    	if (data) setProjectOverview(objRecord, data);
    }
    
    function setProjectOverview(objRecord, data) {

    	objRecord.setValue({
    		fieldId: 'jobprice',
    		value: data.contractamount.toFixed(2)
    	});

    	objRecord.setValue({
    		fieldId: 'custentity_ccm_estcontractamount',
    		value: data.contractamount.toFixed(2)
    	});
    	
    	objRecord.setValue({
    		fieldId: 'custentity_ccm_actinvoiceamount',
    		value: data.actinvoiceamount.toFixed(2)
    	});

    	objRecord.setValue({
    		fieldId: 'custentity_ccm_estmaterialamount',
    		value: data.materialamount.toFixed(2)
    	});

    	objRecord.setValue({
    		fieldId: 'custentity_ccm_actmaterialamount',
    		value: data.actmaterialamount.toFixed(2)
    	});

    	objRecord.setValue({
    		fieldId: 'custentity_ccm_estlaboramount',
    		value: data.laboramount.toFixed(2)
    	});

    	objRecord.setValue({
    		fieldId: 'custentity_ccm_actlaboramount',
    		value: data.actlaboramount.toFixed(2)
    	});

    	objRecord.setValue({
    		fieldId: 'custentity_ccm_wipamount',
    		value: data.actcostwip.toFixed(2)
    	});

    	objRecord.setValue({
    		fieldId: 'custentity_ccm_wipprogressamount',
    		value: data.actcostwipprogress.toFixed(2)
    	});
    }

    function setProjectOverviewPercent(objRecord) {

    	var estcontractamount = objRecord.getValue({
    		fieldId: 'custentity_ccm_estcontractamount'
    	});

    	var actinvoiceamount = objRecord.getValue({
    		fieldId: 'custentity_ccm_actinvoiceamount'
    	});

    	var estmaterialamount = objRecord.getValue({
    		fieldId: 'custentity_ccm_estmaterialamount'
    	});

    	var actmaterialamount = objRecord.getValue({
    		fieldId: 'custentity_ccm_actmaterialamount'
    	}) + objRecord.getValue({
    		fieldId: 'custentity_ccm_wipamount'
    	}) + objRecord.getValue({
    		fieldId: 'custentity_ccm_wipprogressamount'
    	});

    	var estlaboramount = objRecord.getValue({
    		fieldId: 'custentity_ccm_estlaboramount'
    	});
		
    	var actlaboramount = objRecord.getValue({
    		fieldId: 'custentity_ccm_actlaboramount'
    	});

    	objRecord.setValue({
    		fieldId: 'custentity_ccm_invoiceperccomp',
    		value: (estcontractamount == 0 ? (actinvoiceamount == 0 ? 100 : 0) : (actinvoiceamount / estcontractamount * 100)).toFixed(2)
    	});

    	objRecord.setValue({
    		fieldId: 'custentity_ccm_materialperccomp',
    		value: (estmaterialamount == 0 ? (actmaterialamount == 0 ? 100 : 0) : (actmaterialamount / estmaterialamount * 100)).toFixed(2)
    	});

    	objRecord.setValue({
    		fieldId: 'custentity_ccm_laborperccomp',
    		value: (estlaboramount == 0 ? (actlaboramount == 0 ? 100 : 0) : (actlaboramount / estlaboramount * 100)).toFixed(2)
    	});
    }

    function statusClosed(context) {

    	var entitystatus = context.newRecord.getValue({
		    fieldId: 'entitystatus'
		});

    	if (entitystatus != 1) return;

    	var invoiceperccomp = context.newRecord.getValue({
		    fieldId: 'custentity_ccm_invoiceperccomp'
		});

    	var materialperccomp = context.newRecord.getValue({
		    fieldId: 'custentity_ccm_materialperccomp'
		});

    	var laborperccomp = context.newRecord.getValue({
		    fieldId: 'custentity_ccm_laborperccomp'
		});

    	var wipamount = context.newRecord.getValue({
		    fieldId: 'custentity_ccm_wipamount'
		});
    	
    	var msg = '';

	    if (parseFloat(invoiceperccomp) != 100) {
	    	
	    	msg += 'The invoice percent complete is not equal to 100%.  The estimate may need to be adjusted.';
	    }

	    if (parseFloat(materialperccomp) != 100) {
	    	
	    	if (msg.length) msg += ' ';
	    	msg += 'The material percent complete is not equal to 100%.  The estimate may need to be adjusted.';
	    }

	    if (parseFloat(laborperccomp) != 100) {
	    	
	    	if (msg.length) msg += ' ';
	    	msg += 'The labor percent complete is not equal to 100%.  The estimate may need to be adjusted.';
	    }

	    if (wipamount) {
	    	
	    	if (msg.length) msg += ' ';
	    	msg += 'There is still $' + wipamount.toFixed(2) + ' in WIP.  It should be equal to zero.';
	    }

	    if (msg.length) {

	    	msg = 'There are issues with this project.\n' + msg;

			context.form.addPageInitMessage({
		        title: 'Project Status Closed',
		        message: msg,
		        type: message.Type.WARNING,
				duration: 10000
			});
	    }
    }
    
    function getProductionHours(projectId) {

		var s = search.create({
			type: record.Type.PROJECT_TASK,
			columns: [
				search.createColumn({
					name: 'formulanumeric',
					summary: search.Summary.GROUP,
					formula: '{job.internalid}'
				}),
				search.createColumn({
					name: 'formulanumeric',
					summary: search.Summary.SUM,
					formula: "CASE {projecttaskassignment.serviceitem} WHEN 'Fabrication' THEN ROUND({projecttaskassignment.plannedwork}, 2) WHEN 'Assembly' THEN ROUND({projecttaskassignment.plannedwork}, 2) WHEN 'Engraving' THEN ROUND({projecttaskassignment.plannedwork}, 2) ELSE 0 END"
				}),
				search.createColumn({
					name: 'formulanumeric',
					summary: search.Summary.SUM,
					formula: "CASE {projecttaskassignment.serviceitem} WHEN 'Fabrication' THEN ROUND({projecttaskassignment.plannedwork} - {projecttaskassignment.actualwork}, 2) WHEN 'Assembly' THEN ROUND({projecttaskassignment.plannedwork} - {projecttaskassignment.actualwork}, 2) WHEN 'Engraving' THEN ROUND({projecttaskassignment.plannedwork} - {projecttaskassignment.actualwork}, 2) ELSE 0 END"
				}),
			],
			filters: [
				search.createFilter({
					name: 'formulanumeric',
					formula: '{job.internalid}',
					operator: search.Operator.EQUALTO,
					values: projectId
				}),
			],
		});
		
		var hours = null;

		s.run().each(function(result) {

			hours = result.getValue(result.columns[1]);

			return false;
		});
		
		return hours;
    }

    function getReceiptDate(projectId) {

		var s = search.create({
			type: record.Type.PURCHASE_ORDER,
			columns: [
				search.createColumn({
					name: 'formuladate',
					summary: search.Summary.MAX,
					formula: '{expectedreceiptdate}'
				}),
			],
			filters: [
				search.createFilter({
					name: 'mainline',
					operator: search.Operator.IS,
					values: 'F'
				}),
				search.createFilter({
					name: 'closed',
					operator: search.Operator.IS,
					values: 'F'
				}),
				search.createFilter({
					name: 'formulanumeric',
					formula: '{job.internalid}',
					operator: search.Operator.EQUALTO,
					values: projectId
				}),
			],
		});

		var expectedreceiptdate = null;

		s.run().each(function(result) {

			expectedreceiptdate = result.getValue(result.columns[0]);

			return false;
		});
	
		return expectedreceiptdate;
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit/*,
        afterSubmit: afterSubmit*/
    };
});
