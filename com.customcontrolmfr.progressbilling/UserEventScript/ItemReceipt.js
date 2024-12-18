/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/redirect', 'N/search', 'N/ui/message', 'N/url', '../Module/ccProgressBilling'],
/**
 * @param {log} log
 * @param {record} record
 * @param {redirect} redirect
 * @param {search} search
 * @param {message} message
 * @param {url} url
 * @param {ccProgressBilling} ccProgressBilling
 */
function(log, record, redirect, search, message, url, ccProgressBilling) {

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

    	if (context.type == context.UserEventType.VIEW) return;

        var poId = context.newRecord.getValue({
            fieldId: 'createdfrom'
        });

		if (!ccProgressBilling.isValid(poId)) return;

		var success = ccProgressBilling.execute({
			poId: poId
		});

		var recordURL = url.resolveRecord({
			recordType: record.Type.PURCHASE_ORDER,
			recordId: poId,
			isEditMode: false
		});

		if (!success) recordURL += '&pb=1';

		redirect.redirect({
			url: recordURL
		});
    }
/*
    function reverseJournalEntries(poName) {

		log.debug({
			title: 'Reverse Journal Entries',
			details: 'Reverse Journal Entries for PO ' + poName
		});

		var s = search.create({
			type: search.Type.JOURNAL_ENTRY,
			columns: ['internalid'],
			filters: [
				search.createFilter({
					name: 'memomain',
					operator: search.Operator.IS,
					values: poName
				}),
				search.createFilter({
					name: 'formulanumeric',
					formula: '{account.id}',
					operator: search.Operator.EQUALTO,
					values: 866 // 1494 WIP Project Progress Payments
				}),
	            search.createFilter({
	            	name: 'isreversal',
    		        operator: search.Operator.IS,
    		        values: 'F'
    		    }),
	            search.createFilter({
	            	name: 'reversaldate',
    		        operator: search.Operator.ISEMPTY
    		    }),
			]
		});

		s.run().each(function(result) {

			var internalid = parseInt(result.getValue('internalid'));

			var objRecord = record.load({
				type: record.Type.JOURNAL_ENTRY,
				id: internalid,
				isDynamic: true,
			});

			objRecord.setText({
				fieldId: 'reversaldate',
				text: ccUtil.getNSDateFromJSDate(new Date())
			});

			objRecord.save();

			return true;
		});
    }
*/
    return {
        //beforeLoad: beforeLoad,
        //beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
