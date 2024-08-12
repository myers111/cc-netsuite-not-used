/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record'],
/**
 * @param {log} log
 * @param {record} record
 */
function(log, record) {
   
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

    	if (context.type != context.UserEventType.CREATE) return;
    	
    	var bomCount = context.newRecord.getLineCount({
    	    sublistId: 'billofmaterials'
    	});
    	
    	if (bomCount > 0) return;
    	
    	var name = context.newRecord.getValue({
            fieldId: 'itemid'
        });

    	log.debug({
    	    title: 'Create BOM',
    	    details: name
    	});

        var bom = record.create({
            type: record.Type.BOM,
            isDynamic: true
        });

        bom.setValue({
            fieldId: 'name',
            value: name
        });
        
        bom.save();

    	log.debug({
    	    title: 'Create BOM Revision',
    	    details: 'Rev 0'
    	});

        var bomRevision = record.create({
            type : record.Type.BOM_REVISION,
            isDynamic: true
        });

        bomRevision.setValue({
            fieldId: 'name',
            value: "Rev 0"
        });

        bomRevision.setValue({
            fieldId: 'effectivestartdate',
            value: new Date()
        });

        bomRevision.setValue({
            fieldId: 'effectivestartdate',
            value: new Date()
        });

        bomRevision.setValue({
            fieldId: 'billofmaterials',
            value: bom.id
        });
   
        bomRevision.save();

		context.newRecord.setSublistValue({
		    sublistId: 'billofmaterials',
		    fieldId: 'billofmaterials',
		    line: 0,
		    value: bom.id
		});

		context.newRecord.setSublistValue({
		    sublistId: 'billofmaterials',
		    fieldId: 'masterdefault',
		    line: 0,
		    value: true
		});
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

    return {
        //beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit//,
        //afterSubmit: afterSubmit
    };
    
});
