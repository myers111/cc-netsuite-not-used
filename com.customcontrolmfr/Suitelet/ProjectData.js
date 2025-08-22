/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/query','N/record','N/search','N/ui/serverWidget','N/url'],
/**
 * @param {log} log
 * @param {record} record
 * @param {search} search
 * @param {serverWidget} serverWidget
 * @param {url} url
 */
function(query,record,search,serverWidget,url) {

    var MILESTONE_PAYMENT = 34;
    var CC99999 = 3662;

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {

        try {
            
        	var form = serverWidget.createForm({
                title: 'Project Data',
            });

            var projectFilterId = (context.request.parameters.custpage_projectfilter ? context.request.parameters.custpage_projectfilter : null);

            var projectId = (projectFilterId ? projectFilterId : (context.request.parameters.pid ? context.request.parameters.pid : null));
    /*
            if (projectFilterId || !projectId) {

                form.addSubmitButton({
                    label: 'Submit'
                });

                var field = form.addField({
                    id: 'custpage_projectfilter',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Project'
                });
            
                field.addSelectOption({
                    value: '',
                    text: ''
                });

                var projects = getProjects(projectId);
                //var uniqueProjects = [...new Set(projects)];

                for (var i = 0; i < projects.length; i++) {
            
                    field.addSelectOption({
                        value: projects[i].id,
                        text: projects[i].name,
                        isSelected: (projectId == projects[i].id)
                    });
                } 
            }
*/
            form.addTab({
                id: 'custpage_materialtab',
                label: 'Material'   
            });
    
            materialQuantityDifferences(form, 'custpage_materialtab', projectId);
            materialNotOrdered(form, 'custpage_materialtab', projectId);
            materialNotAssigned(form, 'custpage_materialtab', projectId);

            context.response.writePage(form);
        }
        catch(e) {
        	  
            log.error('Project Data',e);
        }    
    }

    function materialQuantityDifferences(form, tabId, projectId) {

        var strQuery = getSubQuery(projectId);
        strQuery += "SELECT SOWO.projectId, P.entitytitle, SOWO.itemId, I.itemid, SOWO.memo, SOWO.quantity AS sowoQuantity, PO.quantity AS poQuantity ";
        strQuery += "FROM SOWO ";
        strQuery += "INNER JOIN PO ON SOWO.projectId = PO.projectId AND SOWO.itemId = PO.itemId ";
        strQuery += "INNER JOIN job AS P ON PO.projectId = P.id ";
        strQuery += "INNER JOIN item AS I ON PO.itemId = I.id ";
        strQuery += "WHERE SOWO.quantity IS NOT NULL AND PO.quantity IS NOT NULL AND SOWO.quantity != PO.quantity AND P.entitystatus != 1 "; // P.entitystatus (Closed = 1)
        strQuery += "ORDER BY P.entitytitle, I.itemid";

    	var data = getData(projectId, strQuery);

    	addSublist(form, tabId, 'custpage_materialquantitydifferences', 'Quantity Differences', data);
    }

    function materialNotOrdered(form, tabId, projectId) {

        var strQuery = getSubQuery(projectId);
        strQuery += "SELECT SOWO.projectId, P.entitytitle, SOWO.itemId, I.itemid, SOWO.memo, SOWO.quantity AS sowoQuantity, PO.quantity AS poQuantity ";
        strQuery += "FROM SOWO ";
        strQuery += "LEFT JOIN PO ON SOWO.projectId = PO.projectId AND SOWO.itemId = PO.itemId ";
        strQuery += "LEFT JOIN job AS P ON SOWO.projectId = P.id ";
        strQuery += "LEFT JOIN item AS I ON SOWO.itemId = I.id ";
        strQuery += "WHERE SOWO.quantity > 0 AND PO.quantity IS NULL AND P.entitystatus != 1 "; // P.entitystatus (Closed = 1)
        strQuery += "ORDER BY P.entitytitle, I.itemid";

    	var data = getData(projectId, strQuery);

    	addSublist(form, tabId, 'custpage_materialnotordered', 'Not Ordered', data);
    }

    function materialNotAssigned(form, tabId, projectId) {

        var strQuery = getSubQuery(projectId);
        strQuery += "SELECT PO.projectId, P.entitytitle, PO.itemId, I.itemid, PO.memo, SOWO.quantity AS sowoQuantity, PO.quantity AS poQuantity ";
        strQuery += "FROM PO ";
        strQuery += "LEFT JOIN SOWO ON SOWO.projectId = PO.projectId AND SOWO.itemId = PO.itemId ";
        strQuery += "LEFT JOIN job AS P ON PO.projectId = P.id ";
        strQuery += "LEFT JOIN item AS I ON PO.itemId = I.id ";
        strQuery += "WHERE PO.quantity > 0 AND SOWO.quantity IS NULL AND P.entitystatus != 1 "; // P.entitystatus (Closed = 1)
        strQuery += "ORDER BY P.entitytitle, I.itemid";

    	var data = getData(projectId, strQuery);

    	addSublist(form, tabId, 'custpage_materialnotassigned', 'Not Assigned', data);
    }

    function getProjects(projectId) {

        var strQuery = getSubQuery(projectId);
        //strQuery += "SELECT PL.projectId, FROM ";
        //strQuery += "(";
        strQuery += ", UN AS (";
        strQuery += "SELECT SOWO.projectId FROM SOWO ";
        strQuery += "LEFT JOIN PO ON SOWO.projectId = PO.projectId AND SOWO.itemId = PO.itemId ";
        //strQuery += "WHERE SOWO.quantity != PO.quantity ";
        strQuery += "UNION ALL ";
        strQuery += "SELECT PO.projectId FROM PO ";
        strQuery += "LEFT JOIN SOWO ON SOWO.projectId = PO.projectId AND SOWO.itemId = PO.itemId";
        strQuery += ") ";
        strQuery += "SELECT projectId FROM UN ";
        //strQuery += "WHERE SOWO.quantity != PO.quantity";
        //strQuery += ") PL ";
        //strQuery += "INNER JOIN job AS P ON PL.projectId = P.id ";
        //strQuery += "ORDER BY P.entitytitle";

        var rs = query.runSuiteQL({
            query: strQuery
        });

        log.debug({
            title: '000000000000',
            details: JSON.stringify(rs.results)
        });

        var projects = [];

        for (var i = 0; i < rs.results.length; i++) {
            
            var values = rs.results[i].values;

            projects.push({
                id: values[0],
                name: values[1]
            });
        }

        return projects;
    }

    function getSubQuery(projectId) {

        var strQuery = "WITH SOWO AS (";
        strQuery += "SELECT TL.entity AS projectId, TL.item AS itemId, MAX(SUBSTR(TL.memo, 0, 300)) AS memo, SUM(-1 * TL.quantity) AS quantity ";
        strQuery += "FROM transaction T ";
        strQuery += "JOIN transactionline TL ON T.id = TL.transaction ";
        strQuery += "WHERE TL.mainline = 'F' AND (T.type = 'SalesOrd' OR T.type = 'WorkOrd') AND TL.isclosed = 'F' ";
        strQuery += "AND TL.item != " + MILESTONE_PAYMENT + " AND TL.item != " + CC99999 + " ";
        strQuery += "AND (TL.itemtype = 'InvtPart' OR TL.itemtype = 'NonInvtPart') ";
        strQuery += (projectId ? " AND TL.entity = " + projectId + " " : '');
        strQuery += "GROUP BY TL.entity, TL.item";
        strQuery += "), ";
        strQuery += "PO AS (";
        strQuery += "SELECT TL.entity AS projectId, TL.item AS itemId, MAX(SUBSTR(TL.memo, 0, 300)) AS memo, SUM(TL.quantity) AS quantity ";
        strQuery += "FROM transaction T ";
        strQuery += "JOIN transactionline TL ON T.id = TL.transaction ";
        strQuery += "WHERE TL.mainline = 'F' AND T.type = 'PurchOrd' AND TL.isclosed = 'F' ";
        strQuery += "AND TL.item != " + CC99999 + " ";
        strQuery += "AND (TL.itemtype = 'InvtPart' OR TL.itemtype = 'NonInvtPart') ";
        strQuery += (projectId ? " AND TL.entity = " + projectId + " " : '');
        strQuery += "GROUP BY TL.entity, TL.item";
        strQuery += ") ";

    	return strQuery;
    }

    function getData(projectId, strQuery) {
	    
    	var data = {
            projectVisible: (projectId == null),
            projects: []
        };

        var rsData = query.runSuiteQL({
            query: strQuery
        });

        log.debug({
            title: 'getData',
            details: JSON.stringify(rsData.results)
        });

        var projectId = 0;

        for (var i = 0; i < rsData.results.length; i++) {
            
            var values = rsData.results[i].values;

            if (projectId != values[0]) {

                projectId = values[0];

                data.projects.push({
                    id: values[0],
                    name: values[1],
                    items: []
                });
            }

            data.projects[data.projects.length - 1].items.push({
                id: values[2],
                name: values[3],
                desc: values[4],
                sowoQuantity: values[5],
                poQuantity: values[6]
            });
        } 

    	return data;
    }

    function addSublist(form, tabId, sublistId, label, data) {

        log.debug({
            title: label,
            details: JSON.stringify(data)
        });

        var sublist = form.addSublist({
            id: sublistId,
            type: 'list',
            label: label,
            tab: tabId
        });

        if (data.projectVisible) {

            sublist.addField({
                id: 'custpage_project',
                type: serverWidget.FieldType.TEXT,
                label: 'Project'
            });
        }

        sublist.addField({
            id: 'custpage_item',
            type: serverWidget.FieldType.TEXT,
            label: 'Item'
        });

        sublist.addField({
            id: 'custpage_itemdesc',
            type: serverWidget.FieldType.TEXT,
            label: 'Description'
        });

        sublist.addField({
            id: 'custpage_sowoquantity',
            type: serverWidget.FieldType.TEXT,
            label: 'SO/WO Quantity'
        });

        sublist.addField({
            id: 'custpage_poquantity',
            type: serverWidget.FieldType.TEXT,
            label: 'PO Quantity'
        });

	    for (var i = 0; i < data.projects.length; i++) {

            var project = data.projects[i]

            for (var j = 0; j < project.items.length; j++) {

                var item = project.items[j];

                var line = sublist.lineCount < 0 ? 0 : sublist.lineCount;

                if (data.projectVisible) {
    
                    sublist.setSublistValue({
                        id: 'custpage_project',
                        line: line,
                        value: "<a href='https://system.netsuite.com/app/accounting/project/project.nl?id=" + project.id + "'>" + project.name + "</a>"
                    });
                }
                    
                sublist.setSublistValue({
                    id: 'custpage_item',
                    line: line,
                    value: "<a href='https://system.netsuite.com/app/common/item/item.nl?id=" + item.id + "'>" + item.name + "</a>"
                });
                    
                sublist.setSublistValue({
                    id: 'custpage_itemdesc',
                    line: line,
                    value: item.desc
                });

                if (item.sowoQuantity) {

                    sublist.setSublistValue({
                        id: 'custpage_sowoquantity',
                        line: line,
                        value: item.sowoQuantity.toFixed(0)
                    });
                }

                if (item.poQuantity) {

                    sublist.setSublistValue({
                        id: 'custpage_poquantity',
                        line: line,
                        value: item.poQuantity.toFixed(0)
                    });
                }
            }
        }
    }

    return {
        onRequest: onRequest
    };
    
});
