/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log','N/ui/message','N/search'],

function(log,message,search) {

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

        if (context.type == context.UserEventType.VIEW) {
        	
        	provisionalItems(context);
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

	}

    function provisionalItems(context) {

    	var id = context.newRecord.getValue({
		    fieldId: 'id'
		});

	    var s = search.create({
	        type: 'customrecord_ccm_provisionalitem',
	        columns: [
						search.createColumn({
						    name: 'custrecord_ccm_pi_itemid',
					        summary: search.Summary.COUNT
						}),
						search.createColumn({
		                	name: 'formulanumeric',
					        summary: search.Summary.COUNT,
	    	  	          	formula: "{custrecord_ccm_pi_approved} == 1",
						}),
			],
	        filters: [
		  	            search.createFilter({
			            	name: 'custrecord_ccm_pi_project',
			                operator: search.Operator.IS,
			                values: id
			            }),
		    ]
	    });
	    
	    var count = 0;
	    var approved = 0;
	    
	    s.run().each(function(result) {

        	count = parseFloat(result.getValue(result.columns[0]));
        	approved = parseFloat(result.getValue(result.columns[1]));

    		if (!count) count = 0;
    		if (!approved) approved = 0;

	        return false;
	    });

	    if (approved) {
	    	
	    	var sublist = context.form.getSublist({
	    	    id: 'recmachcustrecord_ccm_pi_project'
	    	});

	    	if (sublist) {
	    		
	        	sublist.addButton({
	                id: 'custpage_ccm_importitemsprovisional',
	                label: 'Import Items',
	                functionName: 'importItemsProvisional'
	        	});
	        }
	    }

	    if (count) {
	    	
	    	var msg = 'This project has ' + count + ' provisional item' + (count > 1 ? 's' : '') + '.  ';
	    	
	    	if (approved) {
	    		
	    		msg += approved + ' ' + (approved > 1 ? 'are' : 'is') + ' approved.  Use the Import Items button on the sublist to add ' + (approved > 1 ? 'them' : 'it') + ' to a record.';
		    	
		    	msg += (count > approved ? '  The rest may be added once they are approved.' : '');
	    	}
	    	else {
	    		
		    	msg += (count > 1 ? 'They' : 'It') + ' may be added once ' + (count > 1 ? 'they are' : 'it is') + ' approved.';
	    	}
	    	
			context.form.addPageInitMessage({
		        title: 'Provisional Items',
		        message: msg,
		        type: message.Type.INFORMATION,
				duration: 10000
			});
	    }
    }


    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit/*,
        afterSubmit: afterSubmit*/
    };
});
