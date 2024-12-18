/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/query','N/runtime'], 
    
function(query,runtime) {

    function onAction(context){

        var currentScript = runtime.getCurrentScript();

        var json = JSON.parse(currentScript.getParameter({
            name: 'custscript_ccm_pb_totalreceived_ws'
        }));

        var strQuery = "SELECT SUM(TL.quantityshiprecv*TL.rate) ";
        strQuery += "FROM transaction T ";
        strQuery += "INNER JOIN transactionline TL ON TL.transaction = T.id ";
        strQuery += "INNER JOIN item I ON TL.item = I.id ";
        strQuery += "WHERE I.type = 'InvtPart' ";
        strQuery += "AND TL.mainline = 'F' ";
        strQuery += "AND T.id = " + json.poId;

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