/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/ui/serverWidget', 'N/search', 'N/runtime'],

function(record, serverWidget, search, runtime) {

    function onAction(context){
        
        var recordcreatedby = context.newRecord.getValue({
            fieldId: 'recordcreatedby'
        });

        if (!recordcreatedby) recordcreatedby = runtime.getCurrentUser().id;
    	
		var field = context.form.addField({
		    id: 'custpage_nextapprover',
		    type: serverWidget.FieldType.SELECT,
		    label: 'Next Approver'
		});
		
		context.form.insertField({
		    field: field,
		    nextfield: 'nextapprover'
		});	

    	var s1 = search.create({
	        type: record.Type.EMPLOYEE,
	        columns: [
	                  'supervisor',
	                  'purchaseorderapprover',
	                  search.createColumn({
	                	  name: 'formulatext',
					      formula: '{supervisor}'
	                  }),
	                  search.createColumn({
	                	  name: 'formulatext',
					      formula: '{purchaseorderapprover}'
	                  }),
	        ],
	        filters: [
  	                search.createFilter({
	                	name: 'internalid',
    		            operator: search.Operator.IS,
    		            values: recordcreatedby
    		        }),
	        ],
	    });

    	var supervisor = null;
    	var approver = null;

    	s1.run().each(function(result) {

	    	supervisor = result.getValue('supervisor');
	    	approver = result.getValue('purchaseorderapprover');
	    	var supervisorname = result.getValue(result.columns[2]);
	    	var approvername = result.getValue(result.columns[3]);

	    	if (supervisor) {
	    		
		    	field.addSelectOption({
		    	    value: supervisor,
		    	    text: supervisorname
		    	});
	    	}

	    	if (approver && approver != supervisor) {
	    		
		    	field.addSelectOption({
		    	    value: approver,
		    	    text: approvername
		    	});
	    	}

	        return false;
	    });

    	var s2 = search.create({
	        type: record.Type.EMPLOYEE,
	        columns: ['internalid','entityid'],
	        filters: [
  	                search.createFilter({
	                	name: 'isjobmanager',
    		            operator: search.Operator.IS,
    		            values: true
    		        }),
	        ],
	    });

    	s2.run().each(function(result) {

	    	var id = result.getValue('internalid');
	    	var name = result.getValue('entityid');

	    	if (id != supervisor && id != approver) {
	    		
		    	field.addSelectOption({
		    	    value: id,
		    	    text: name
		    	});
	    	}

	        return true;
	    });
    }

    return {
        onAction: onAction
    }
});