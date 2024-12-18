/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/query','N/runtime'], 
    
function(query,runtime) {

    function onAction(context){

        var currentScript = runtime.getCurrentScript();

        var json = JSON.parse(currentScript.getParameter({
            name: 'custscript_ccm_pb_totaljournaled_ws'
        }));

        var strQuery = "SELECT SUM(TAL.debit) ";
        strQuery += "FROM transaction T ";
        strQuery += "INNER JOIN transactionaccountingline TAL ON TAL.transaction = T.id ";
        strQuery += "WHERE TAL.account = 866 "; // 1494 WIP Project Progress Payments
        strQuery += "AND CASE WHEN T.type = 'Bill' THEN CASE WHEN T.approvalstatus = 'Approved' THEN 1 ELSE 0 END ELSE 1 END = 1 ";
        strQuery += "AND T.trandate <= TO_DATE(CURRENT_TIMESTAMP) ";
        strQuery += "AND T.custbody_ccm_purchaseorder = " + json.poId;

        var rs = query.runSuiteQL({
            query: strQuery
        });

    	log.debug({
    	    title: 'Results',
    	    details: JSON.stringify(rs.results)
    	});

        return rs.results[0].values[0];
    }

    return {
        onAction: onAction
    }
});