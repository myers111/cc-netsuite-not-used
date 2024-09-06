/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/message','N/query','N/record'],

function(message,query,record) {

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
        
        if (context.type != context.UserEventType.VIEW) return;

        var scheduleSublist = context.form.getSublist({
            id: 'projecttasks'
        });
        
        if (scheduleSublist) {
        	
        	scheduleSublist.addButton({
                id: 'custpage_ccm_importschedule',
                label: 'Import Schedule',
                functionName: 'importSchedule'
        	});
        	
        	scheduleSublist.addButton({
                id: 'custpage_ccm_addpanel',
                label: 'Add Panel',
                functionName: 'addPanel'
        	});
        	
        	scheduleSublist.addButton({
                id: 'custpage_ccm_addprogramming',
                label: 'Add Programming',
                functionName: 'addProgramming'
        	});
        	
        	scheduleSublist.addButton({
                id: 'custpage_ccm_addfieldservice',
                label: 'Add Field Service',
                functionName: 'addFieldService'
        	});

            scheduleSublist.addButton({
                id: 'custpage_ccm_addbuilding',
                label: 'Add Building',
                functionName: 'addBuilding'
            });

            var status = context.newRecord.getValue({
                fieldId: 'entitystatus'
            });
    
            if (status != QUOTE && status != BUDGETARY) {

                if (commit(context)) {
                                
                    scheduleSublist.addButton({
                        id: 'custpage_ccm_commitschedule',
                        label: 'Commit Schedule',
                        functionName: 'commitSchedule'
                    });
                
                    context.form.addPageInitMessage({
                        title: 'Commit Schedule',
                        message: "This project has invoicing tasks that have not been committed. Please use the 'Commit Schedule' button to update the Sales Order invoice dates. If you don't, it will be done automatically overnight.",
                        type: message.Type.INFORMATION,
                        duration: 10000
                    });
                }
            }
        }

		context.form.clientScriptModulePath = '../ClientScript/Project.js';
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

    function commit(context) {

        try {

            var strQuery = "WITH PT AS (SELECT ";
            strQuery += "TO_NUMBER(SUBSTR(custevent_ccm_salesorderlineid, 0, INSTR(custevent_ccm_salesorderlineid, '_') - 1)) AS soid, ";
            strQuery += "TO_NUMBER(SUBSTR(custevent_ccm_salesorderlineid, INSTR(custevent_ccm_salesorderlineid, '_') + 1)) AS lineid, ";
            strQuery += "TO_DATE(startdatetime + (1 / 12)) AS startdate, "; // startdatetime(PT) + 2 hours
            strQuery += "title ";
            strQuery += 'FROM projecttask ';
            strQuery += "WHERE custevent_ccm_salesorderlineid IS NOT NULL";
            strQuery += (context.newRecord.id ? ' AND project = ' + context.newRecord.id : '');
            strQuery += ') ';
            strQuery += 'SELECT PT.soid, PT.lineid, PT.startdate ';
            strQuery += "FROM transactionline SO ";
            strQuery += 'INNER JOIN PT ON PT.soid = SO.transaction AND PT.lineid = SO.id ';
            strQuery += "WHERE PT.startdate <> SO.custcol_ccm_invoicedate OR PT.title <> SO.memo";
    
            var rs = query.runSuiteQL({
                query: strQuery
            });

            log.debug({
                title: 'Commit Data',
                details: JSON.stringify(rs.results)
            });
    
            return (rs.results.length > 0);
        }
        catch (e) {

            log.error({
                title: 'Commit Data',
                details: JSON.stringify(e)
            });

            context.form.addPageInitMessage({
                title: 'Commit Schedule',
                message: 'This project has invoicing tasks that are corrupted.',
                type: message.Type.ERROR,
                duration: 10000
            });

            return false;
        }
    }

    return {
        beforeLoad: beforeLoad,
        //beforeSubmit: beforeSubmit,
        //afterSubmit: afterSubmit
    };
});
