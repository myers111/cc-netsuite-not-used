/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/https', 'N/log', 'N/record', 'N/redirect', 'N/search', 'N/ui/serverWidget'],

function(file, https, log, record, redirect, search, serverWidget) {
   
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

        	if (context.request.method == 'GET') {
        		
            	var form = serverWidget.createForm({
                    title: 'Saved Search',
                });
                
                form.addSubmitButton({
                    label: 'Submit'
                });

                form.addButton({
                    id : 'buttonid',
                    label : 'Test',
                    functionName: 'aaaaaaaaa'
                });

            	form.clientScriptModulePath = '../ClientScript/SavedSearch.js';

                var fgSearches = form.addFieldGroup({
                    id: 'searchinfo',
                    label: 'Search Information'
                });

                fgSearches.isCollapsible = true;

                var search1 = getSavedSearchList(form, 'custpage_search1', 'Saved Search #1');
        
                form.addField({
                    id: 'custpage_join1',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Join Field #1',
                    container: 'searchinfo'
                }).isMandatory = true;

                var search2 = getSavedSearchList(form, 'custpage_search2', 'Saved Search #2');
        
                form.addField({
                    id: 'custpage_join2',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Join Field #2',
                    container: 'searchinfo'
                }).isMandatory = true;

                var joinType = form.addField({
                    id: 'custpage_jointype',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Join Type',
                    container: 'searchinfo'
                });

                joinType.isMandatory = true;

                joinType.addSelectOption({value: 'Left', text: 'Left', isSelected: true});
                joinType.addSelectOption({value: 'Right', text: 'Right'});
                joinType.addSelectOption({value: 'Inner', text: 'Inner'});

                var fld = form.addField({
                    id: 'custpage_htmlfield',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: ' '
                });
                
                //fld.defaultValue = '<iframe style="border:none;" srcdoc="<script>context.response.writePage(getList());</script>"></iframe>';

                var html = '';

                html += '<html>';

                html += '<script>';

                html += 'window.aaa = function(ppp) {alert(ppp);context.response.writePage(getList());}';

                html += '</script>';

                html += 'bbbbbbbbbbb</html>';
                
                fld.defaultValue = '<iframe id="listframe" width="100%" height="100%" srcdoc="' + html + '"></iframe>';

                context.response.writePage(form);

                //context.response.writePage(getList());
        	}
        	else if (context.request.method === 'POST') {

                var search1 = search.load({
                    id: context.request.parameters.custpage_search1
                });
        		
                var records1 = {columns: search1.columns, data: []};

                search1.run().each(function(result) {

                    var record = [];

                    for (var i = 0; i < result.columns.length; i++) {

                        record.push(result.getValue(result.columns[i]));
                    }
            
                    records1.data.push(record);

                    return true;
                });

                var search2 = search.load({
                    id: context.request.parameters.custpage_search2
                });
        		
                var records2 = {columns: search2.columns, data: []};

                search2.run().each(function(result) {

                    var record = [];

                    for (var i = 0; i < result.columns.length; i++) {

                        record.push(result.getValue(result.columns[i]));
                    }
            
                    records2.data.push(record);

                    return true;
                });

                var join1 = context.request.parameters.custpage_join1;
                var join2 = context.request.parameters.custpage_join2;

                switch (context.request.parameters.custpage_jointype) {
                    case 'Left':
                        joinLeft(records1, records2, join1, join2);
                        break;
                    case 'Right':
                        joinRight(records1, records2, join1, join2);
                        break;
                    default:
                        joinInner(records1, records2, join1, join2);
                        break;
                }
            }
        }
        catch(e) {
        	  
            log.error('Saved Search',e);
        }    
    }

    function getSavedSearchList(form, id, label) {

        var fld = form.addField({
            id: id,
            type: serverWidget.FieldType.SELECT,
            label: label,
            container: 'searchinfo'
        });

	    var s = search.create({
	        type: search.Type.SAVED_SEARCH,
	        columns: [
                search.createColumn({
                    name: 'id'
                }),
                search.createColumn({
                    name: 'title'
                }),
            ],
	        filters: [
	  	        search.createFilter({
		            name: 'formulatext',
                    formula: '{title}',
	    		    operator: search.Operator.STARTSWITH,
	    		    values: 'CCM'
	    		}),
		    ]
	    });
  
        var selected = true;

	    s.run().each(function(result) {

        	var id = result.getValue(result.columns[0]);
        	var title = result.getValue(result.columns[1]);

    		if (id && title) {

                fld.addSelectOption({
                    value: id,
                    text: title,
                    isSelected: selected
                });

                selected = false;
            }

	        return true;
	    });

        fld.isMandatory = true;

        return fld;
    }

    function joinLeft(records1, records2, join1, join2) {

        joinOuter(records1, records2, join1, join2);
    }

    function joinRight(records1, records2, join1, join2) {

        joinOuter(records2, records1, join2, join1);
    }

    function joinOuter(records1, records2, join1, join2) {
        
        var list = {columns: records1.columns, columnsJoin: records2.columns, data: []};

        for (var i = 0; i < records1.data.length; i++) {

            var record1 = records1.data[i];

            var joined = false;

            for (var j = 0; j < records2.data.length; j++) {

                var record2 = records2.data[j];

                if (record1[join1] == record2[join2]) {
                    
                    joined = true;

                    var record = record1;

                    for (var k = 0; k < record2.length; k++) {

                        record.push(record2[k]);
                    }

                    list.data.push(record);
                }
            }
    
            if (!joined) {

                list.data.push(record1);
            }
        }
    }

    function joinInner(records1, records2, join1, join2) {

        for (var i = 0; i < records.columns.length; i++) {

            if (records.columns[i].name != join) list.columns.push(records.columns[i]);
        }

        for (var i = 0; i < list.data.length; i++) {

            if (records2.columns[i].name != join) list.data.push(records2.columns[i]);
        }
    }

    function getList() {

    	var list = serverWidget.createList({
            title: 'Simple List'
        });

        list.addColumn({
            id: 'columnid1',
            type: serverWidget.FieldType.TEXT,
            label: 'Text1',
            align: serverWidget.LayoutJustification.RIGHT
        });

        list.addColumn({
            id: 'columnid2',
            type: serverWidget.FieldType.TEXT,
            label: 'Text2',
            align: serverWidget.LayoutJustification.RIGHT
        });

        list.addRows({
            rows : [{columnid1 : 'value1', columnid2 : 'value2'},
                {columnid1 : 'value2', columnid2 : 'value3'}]
        });

        return list;
    }

    function addHiddenField(form, id, dflt) {
    	
        var field = form.addField({
    	    id : id,
    	    type : serverWidget.FieldType.TEXT,
    	    label : ' '
    	});
        
        field.defaultValue = dflt;

        field.updateDisplayType({
    	    displayType: serverWidget.FieldDisplayType.HIDDEN
    	});
    }
    
    return {
        onRequest: onRequest
    };   
});
