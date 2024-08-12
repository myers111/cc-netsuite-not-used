/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget'],
/**
 * @param {serverWidget} serverWidget
 */
function(serverWidget) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(context) {
return;
    	var f1 = context.form.getField({
    	    id: 'custrecord_ccm_rev_processinghours'
    	});
    	
    	f1.updateLayoutType({
    	    layoutType: serverWidget.FieldLayoutType.OUTSIDE
    	});
    	
    	f1.updateBreakType({
    	    breakType: serverWidget.FieldBreakType.STARTROW
    	});

    	var f2 = context.form.getField({
    	    id: 'custrecord_ccm_rev_processingamount'
    	});
    	
    	f2.updateLayoutType({
    	    layoutType: serverWidget.FieldLayoutType.OUTSIDE
    	});
    	
    	f2.updateBreakType({
    	    breakType: serverWidget.FieldBreakType.STARTCOL
    	});

    	var f3 = context.form.getField({
    	    id: 'custrecord_ccm_rev_engineeringhours'
    	});
    	
    	f3.updateLayoutType({
    	    layoutType: serverWidget.FieldLayoutType.OUTSIDE
    	});
    	
    	f3.updateBreakType({
    	    breakType: serverWidget.FieldBreakType.STARTROW
    	});

    	var f4 = context.form.getField({
    	    id: 'custrecord_ccm_rev_engineeringamount'
    	});
    	
    	f4.updateLayoutType({
    	    layoutType: serverWidget.FieldLayoutType.OUTSIDE
    	});
    	
    	f4.updateBreakType({
    	    breakType: serverWidget.FieldBreakType.STARTCOL
    	});
/*
    	context.form.getField({
    	    id: 'custrecord_ccm_rev_draftinghours'
    	}).updateLayoutType({
    	    layoutType: serverWidget.FieldLayoutType.OUTSIDE
    	});

    	context.form.getField({
    	    id: 'custrecord_ccm_rev_draftingamount'
    	}).updateLayoutType({
    	    layoutType: serverWidget.FieldLayoutType.OUTSIDE
    	});
*/    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    }

    return {
        beforeLoad: beforeLoad/*,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit*/
    };
    
});
