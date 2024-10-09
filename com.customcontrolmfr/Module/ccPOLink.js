/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/search', 'N/url'],

function(log, record, search, url) {

    function set(objRecord) {

    	var itemInfo = getItemInfo(objRecord);

		var projectId = objRecord.getValue({
		    fieldId: 'job'
		});
	
    	var numLines = objRecord.getLineCount({
    	    sublistId: 'item'
    	});

    	for (var line = 0; line < numLines; line++) {

    		var html = null;

    		var id = objRecord.getSublistValue({
    		    sublistId: 'item',
    		    fieldId: 'custcol_ccm_polinkid',
    		    line: line
    		});
    		
    		if (id) {

    			var link = id.split('|');

    			if (link.length != 3) return;
    			
    			var recordURL = url.resolveRecord({
    	            recordType: record.Type.PURCHASE_ORDER,
    	            recordId: link[1],
    	            isEditMode: false
    	        });

    	        var suiteletURL = url.resolveScript({
    	            scriptId: 'customscript_ccm_polink_su',
    	            deploymentId: 'customdeploy_ccm_polink_su',
    	            returnExternalUrl: false,
    				params: {
    					'did': objRecord.id,
    					'dt': objRecord.type,
    					'key': link[2]
    				}
    	        });

    			html = '<a href=\"' + recordURL + '\" class="dottedlink">' + link[0] + '</a><br><a href=\"' + suiteletURL + '\" class="dottedlink">Reset</a>';
    		}
    		else {

        		var itemsource = objRecord.getSublistValue({
        		    sublistId: 'item',
        		    fieldId: 'itemsource',
        		    line: line
        		});

        		var createpo = objRecord.getSublistValue({
        		    sublistId: 'item',
        		    fieldId: 'itemsourcetransaction',
        		    line: line
        		});

            	if (itemsource == 'PURCHASE_ORDER') {

                	if (createpo && createpo.substring(0,2) != 'PO') {

                		var key = objRecord.getSublistValue({
                		    sublistId: 'item',
                		    fieldId: 'lineuniquekey',
                		    line: line
                		});

                		var qty = objRecord.getSublistValue({
                		    sublistId: 'item',
                		    fieldId: 'quantity',
                		    line: line
                		});

                		for (var i = 0; i < itemInfo.length; i++) {
                			
                			if (itemInfo[i].key != key) continue;

                	        var suiteletURL = url.resolveScript({
                	            scriptId: 'customscript_ccm_polink_su',
                	            deploymentId: 'customdeploy_ccm_polink_su',
                	            returnExternalUrl: false,
                				params: {
                					'did': objRecord.id,
                					'dt': objRecord.type,
                					'prid': projectId,
                					'iid': itemInfo[i].id,
                					'key': key,
                					'qty': qty
                				}
                	        });
                	        
                	        html = '<a href=\"' + suiteletURL + '\" class="dottedlink">Create Link</a>';
                	        
                	        break;
                		}
                	}
            	}
    		}

    		if (html) {

    			objRecord.setSublistValue({
    			    sublistId: 'item',
    			    fieldId: 'custcol_ccm_polink',
    			    line: line,
    			    value: html
    			});
    		}
    	}
    }

    function getItemInfo(objRecord) {

    	var info = [];
    	
    	if (objRecord.id) {
    		
    	    var s = search.create({
    	        type: search.Type.WORK_ORDER,
    	        columns: [
    						search.createColumn({
    		                	name: 'formulanumeric',
    	    	  	          	formula: '{item.internalid}',
    						}),
    						search.createColumn({
    		                	name: 'formulanumeric',
    	    	  	          	formula: '{lineuniquekey}',
    						}),
    	        ],
    	        filters: [
    	  	                search.createFilter({
    		                	name: 'formulanumeric',
    	    	  	          	formula: '{internalid}',
    	    		            operator: search.Operator.EQUALTO,
    	    		            values: objRecord.id
    	    		        }),
    	  	                search.createFilter({
    		                	name: 'formulatext',
    	    	  	          	formula: '{item.type}',
    	    		            operator: search.Operator.CONTAINS,
    	    		            values: 'Inventory'
    	    		        }),
    		    ]
    	    });

    	    s.run().each(function(result) {

    	    	var item = {};
    	    	
    	    	item.id = result.getValue(result.columns[0]);
    	    	item.key = result.getValue(result.columns[1]);

    	    	info.push(item);
    	    	
    	        return true;
    	    });
    	}
	    
	    return info;
    }

    return {
        set: set
    };   
});
