/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/email', 'N/file', 'N/log', 'N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url'],
/**
 * @param {log} log
 * @param {record} record
 * @param {redirect} redirect
 * @param {search} search
 * @param {serverWidget} serverWidget
 * @param {url} url
 */
function(email, file, log, record, redirect, runtime, search, serverWidget, url) {
   
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
                    title: "Create Assemblies",
                });

            	//form.clientScriptModulePath = '../ClientScript/ItemImport.js';

            	var pid = context.request.parameters.iid;
            	
            	addHiddenField(form, 'custpage_id', pid);
            	
            	addHiddenField(form, 'custpage_referer', (context.request.parameters.referer == null ? context.request.headers.referer : context.request.parameters.referer));
                
                form.addSubmitButton({
                    label: 'Submit'
                });
                
                form.addButton({
                    id: 'custpage_cancel',
                    label: 'Cancel',
                    functionName: 'onCancel'
                });

                addSalesOrderFields(form, pid);

                var itemsTab = form.addTab({
                    id: 'custpage_items',
                    label: 'Assemblies'
                });

                var existingItemsSublist = form.addSublist({
                    id: 'custpage_existingitems',
                    type: 'list',
                    label: 'Existing Items',
                    tab: 'custpage_items'
                });

                existingItemsSublist.addField({
                    id: 'custpage_ei_cb',
                    type: 'checkbox',
                    label: 'Select'
                });

                existingItemsSublist.addMarkAllButtons();

                var vndItemsSublist = form.addSublist({
                    id: 'custpage_vnditems',
                    type: 'list',
                    label: 'Items (Add Vendor)',
                    tab: 'custpage_items'
                });

                vndItemsSublist.addField({
                    id: 'custpage_vi_cb',
                    type: 'checkbox',
                    label: 'Select'
                });

                vndItemsSublist.addMarkAllButtons();

                var newItemsSublist = form.addSublist({
                    id: 'custpage_newitems',
                    type: 'list',
                    label: 'New Items',
                    tab: 'custpage_items'
                });

                newItemsSublist.addField({
                    id: 'custpage_ni_cb',
                    type: 'checkbox',
                    label: 'Select'
                });

                newItemsSublist.addMarkAllButtons();

                var headers = loadFromFile(context.request.parameters.fid, existingItemsSublist, newItemsSublist, vndItemsSublist);
            	
            	addHiddenField(form, 'custpage_headers', headers);

                context.response.writePage(form);
        	}
        	else if (context.request.method === 'POST') {
        		
        		var projectId = context.request.parameters.custpage_id;
            	var salesorderId = context.request.parameters.custpage_salesorder;
            	var workorderId = context.request.parameters.custpage_workorder;
            	var assemblyId = context.request.parameters.custpage_assembly;
            	var headers = context.request.parameters.custpage_headers;

        		var numLines = context.request.getLineCount({
        		    group: 'custpage_newitems'
        		});
                
            	log.debug({
            	    title: 'Posted Items',
            	    details: 'New item count: ' + numLines
            	});
    			
            	var csvData = '';
            	
            	var fldList = headers.split(' ').join('').toLowerCase();
            	var fldArray = fldList.split(',');

        		for (var i = 0; i < numLines; i++) {

        			var sel = context.request.getSublistValue({
        			    group: 'custpage_newitems',
        			    name: 'custpage_ni_cb',
        			    line: i
        			});
                    
        			if (sel == 'T') {

            			if (csvData.length == 0) csvData += (headers + '\n');

        				var line = '';
        				
                		for (var j = 0; j < fldArray.length; j++) {
                			
            				var data = context.request.getSublistValue({
            				    group: 'custpage_newitems',
            				    name: 'custpage_ni_' + fldArray[j],
            				    line: i
            				});

            				if (j > 0) line += ',';

            				line += (data ? data.trim() : '');
                		}

        				csvData += line + '\n';
        			}
        		}

        		sendCSV(csvData);
        		
        		numLines = context.request.getLineCount({
        		    group: 'custpage_existingitems'
        		});
                
            	log.debug({
            	    title: 'Posted Items',
            	    details: 'Existing item count: ' + numLines
            	});

            	var objRecord = null;

        		for (var i = 0; i < numLines; i++) {
        			
        			var sel = context.request.getSublistValue({
        			    group: 'custpage_existingitems',
        			    name: 'custpage_ei_cb',
        			    line: i
        			});
        			
        			if (sel == 'T') {
                    	
                    	if (objRecord == null) {
                    		
                    		objRecord = getRecord(salesorderId, workorderId, assemblyId, projectId);
                    	}

        				var name = context.request.getSublistValue({
        				    group: 'custpage_existingitems',
        				    name: 'custpage_ei_name',
        				    line: i
        				});

        		    	var itemId = getItemId(name);

        				if (itemId == 0) {

        	            	log.error({
        	            	    title: 'Item Import',
        	            	    details: 'Invalid Item ID'
        	            	});
        	            	
        	            	continue;
        				}

        				var purchaseprice = context.request.getSublistValue({
        				    group: 'custpage_existingitems',
        				    name: 'custpage_ei_purchaseprice',
        				    line: i
        				});

        				var salesprice = context.request.getSublistValue({
        				    group: 'custpage_existingitems',
        				    name: 'custpage_ei_salesprice',
        				    line: i
        				});

        				var vendor = context.request.getSublistValue({
        				    group: 'custpage_existingitems',
        				    name: 'custpage_ei_vendor',
        				    line: i
        				});
        				
        				var vendorId = getVendorId(vendor);

        				if (vendorId == 0) {

        	            	log.error({
        	            	    title: 'Item Import',
        	            	    details: 'Vendor ' + vendor + ' does not exist'
        	            	});
        	            	
        	            	continue;
        				}
        				
        				var quantity = context.request.getSublistValue({
        				    group: 'custpage_existingitems',
        				    name: 'custpage_ei_quantity',
        				    line: i
        				});

        				addItemToSelection(objRecord, itemId, quantity, vendorId, purchaseprice, salesprice, projectId);
        			}
        		}

        		if (objRecord) objRecord.save();
        		
            	log.debug({
            	    title: 'Item Import Complete',
            	    details: 'Redirect to project id: ' + projectId
            	});

                var recordURL = url.resolveRecord({
                    recordType: record.Type.JOB,
                    recordId: projectId
                });

                redirect.redirect({
                	url: recordURL
                });
        	}
        }
        catch(e) {
        	  
            log.error('Item Import',e);

			var scriptURL = url.resolveScript({
				scriptId: 'customscript_ccm_error_su',
				deploymentId: 'customdeploy_ccm_error_su',
				returnExternalUrl: false,
				params: {
					'e': e,
					'title': 'Import Items'
				}
			});

			redirect.redirect({
				url: scriptURL
			});
		}    
    }
    
    function addSalesOrderFields(form, pid) {

        var soField = form.addField({
            id: 'custpage_salesorder',
            type: serverWidget.FieldType.SELECT,
            label: 'Sales Order'
        });

	    var s = search.create({
	        type: record.Type.SALES_ORDER,
	        columns: ['internalid','tranid'],
	        filters: [
	                  search.createFilter({
			            	name: 'mainline',
			                operator: search.Operator.IS,
			                values: 'T'
			          }),
	                  search.createFilter({
		                	name: 'formulanumeric',
	    	  	          	formula: '{jobmain.internalid}',
	    		            operator: search.Operator.EQUALTO,
	    		            values: pid
	    		      }),
	         ],
	    });

	    soField.addSelectOption({
            value: 0,
            text: '- New -'
        });

	    s.run().each(function(result) {

	        var id = result.getValue({
	            name: 'internalid'
	        });

	        var tranid = result.getValue({
	            name: 'tranid'
	        });

	        soField.addSelectOption({
	            value: id,
	            text: tranid
	        });

	        return true;
	    });

        form.addField({
            id: 'custpage_workorder',
            type: serverWidget.FieldType.SELECT,
            label: 'Work Order'
        }).updateBreakType({
            breakType : serverWidget.FieldBreakType.STARTCOL
        });
        
        form.addField({
            id: 'custpage_assembly',
            type: serverWidget.FieldType.SELECT,
            label: 'Assembly'
        }).updateBreakType({
            breakType : serverWidget.FieldBreakType.STARTCOL
        });
    }
    
    function getFieldId(prefix, name) {
    	
	    return ('custpage_' + prefix + '_' + name.replace(" ", "").toLowerCase());
    }
    
    function loadFromFile(fileid, existingItemsSublist, newItemsSublist, vndItemsSublist) {
    	
        var objFile = file.load({
            id: fileid
        });
        
        var fileContents = objFile.getContents();

        var rows = fileContents.split(/\r?\n|\r/);

        if (rows.length > 1) {

            var headers = null;
            
            for (var row = 0; row < rows.length; row++) {

            	if (row == 0) {

                	headers = rows[row].split(',');

                	for (var i = 0; i < headers.length; i++) {
                        
        	    		existingItemsSublist.addField({
                            id: getFieldId('ei', headers[i]),
                            type: 'text',
                            label: headers[i]
                        });

            	    	newItemsSublist.addField({
                            id: getFieldId('ni', headers[i]),
                            type: 'text',
                            label: headers[i]
                        });

            	    	vndItemsSublist.addField({
                            id: getFieldId('vi', headers[i]),
                            type: 'text',
                            label: headers[i]
                        });
                	}
                	
                	continue;
            	}

            	var fields = getFields(rows[row], ',', '"', '\\');

            	if (!fields) continue;

            	if (fields[0].length == 0) continue;
    		    
    		    var existing = false;
				var addVendor = true;

    		    var s = search.create({
    		        type: record.Type.INVENTORY_ITEM,
					columns: [
						search.createColumn({
							name: 'formulanumeric',
							formula: '{vendor.internalid}'
					  	}),
		  			],
				  	filters: [
    		              search.createFilter({
    		                  name: 'itemid',
    		                  operator: search.Operator.IS,
    		                  values: getFieldValue(fields[0])
    		              })
    		        ],
    		    });
  		    
				var vendorId = getVendorId(fields[7]);

    		    s.run().each(function(result) {

    		    	existing = true;

	    			var id = parseInt(result.getValue(result.columns[0]));

					if (vendorId == id) addVendor = false;

					if (!addVendor) return false;

    		        return true;
    		    });

            	var numLines = 0;
            	
            	if (existing) {

					if (addVendor) {

						numLines = vndItemsSublist.lineCount < 0 ? 0 : vndItemsSublist.lineCount;
					}
					else {

						numLines = existingItemsSublist.lineCount < 0 ? 0 : existingItemsSublist.lineCount;
					}
            	}
            	else {
            		
            		numLines = newItemsSublist.lineCount < 0 ? 0 : newItemsSublist.lineCount;
            	}

            	for (var i = 0; i < fields.length; i++) {
            		
					if (!fields[i]) continue;
            		
					var data = fields[i];

					if (i == 6 || i == 9) data = data.replace('$', '');

        		    if (existing) {

						if (addVendor) {
								
							vndItemsSublist.setSublistValue({
								id: getFieldId('vi', headers[i]),
								line: numLines,
								value: getFieldValue(data)
							});
						}
						else {

							existingItemsSublist.setSublistValue({
								id: getFieldId('ei', headers[i]),
								line: numLines,
								value: getFieldValue(data)
							});
						}
					}
        		    else {
                    		
						newItemsSublist.setSublistValue({
							id: getFieldId('ni', headers[i]),
							line: numLines,
							value: getFieldValue(data)
						});
					}
            	}
            }
        }
        
        return rows[0];
    }
    
    function getFields(text, splitChar, encapsulatorChar, escapeChar) {
    	
        var start = 0;
        var encapsulated = false;
        var fields = [];
        
        for (var c = 0; c < text.length; c++) {
        	
            var char = text[c];
            
            if (char === splitChar && ! encapsulated) {
            	
                fields.push(text.substring(start, c))
                start = c+1
            }
            
            if (char === encapsulatorChar && (c === 0 || text[c-1] !== escapeChar) ) encapsulated = ! encapsulated;
        }
        
        fields.push(text.substring(start));
        
        return fields;
    }
    
    function getFieldValue(value) {
    	
    	if (!value) return '';
    	if (value.length == 0) return '';
    	if (value.substring(0, 1) == '"') value = value.substring(1);
    	if (value.substring(value.length - 1) == '"') value = value.substring(0, value.length - 1);
    	
    	return value.trim();
    }
    
    function getVendorId(name) { // get vendor id from name
	    
	    if (!name) return 0;

	    var s = search.create({
	        type: record.Type.VENDOR,
	        columns: ['internalid'],
	        filters: [
	              search.createFilter({
	                  name: 'entityid',
	                  operator: search.Operator.STARTSWITH,
	                  values: getFieldValue(name)
	              })
	         ],
	    });
	    
	    var id = 0;
	    
	    s.run().each(function(result) {

	        id = result.getValue({
	            name: 'internalid'
	        });

	        return false;
	    });
	    
	    return id;
    }
    
    function getItemId(name) { // get item id from name
	    
	    if (!name) return 0;

	    var s = search.create({
	        type: record.Type.INVENTORY_ITEM,
	        columns: ['internalid'],
	        filters: [
	              search.createFilter({
	                  name: 'itemid',
	                  operator: search.Operator.IS,
	                  values: getFieldValue(name)
	              })
	         ],
	    });
	    
	    var id = 0;
	    
	    s.run().each(function(result) {
	    	
	        id = result.getValue({
	            name: 'internalid'
	        });
	        
	        return false;
	    });
	    
	    return id;
    }
    
    function getRecord(salesorderId, workorderId, assemblyId, projectId) {

		var objRecord = null;

		if (assemblyId > 0) {

			var bomId = getBOMId(assemblyId);

			var revisionId = getRevisionId(bomId);

			objRecord = record.load({
			    type: record.Type.BOM_REVISION,
			    id: revisionId
			});
		}
		else if (workorderId > 0) {

			objRecord = record.load({
			    type: record.Type.WORK_ORDER,
			    id: workorderId
			});
		}
		else if (salesorderId > 0) {
			
			objRecord = record.load({
			    type: record.Type.SALES_ORDER,
			    id: salesorderId
			});
		}
		else if (salesorderId == 0) {
	    	
		    var s = search.create({
		        type: record.Type.JOB,
		        columns: ['customer','custentity_ccm_class'],
		        filters: [
		  	            search.createFilter({
			            	name: 'internalid',
			                operator: search.Operator.IS,
			                values: projectId
			            }),
		        ],
		    });
		    
		    s.run().each(function(result) {

		    	var customer = result.getValue({name: 'customer'});
		    	var cls = result.getValue({name: 'custentity_ccm_class'});

				objRecord = record.create({
				    type: record.Type.SALES_ORDER
				});

		    	objRecord.setValue({
		    	    fieldId: 'entity',
		    	    value: customer
		    	});

		    	objRecord.setValue({
		    	    fieldId: 'job',
		    	    value: projectId
		    	});

		    	objRecord.setValue({
		    	    fieldId: 'class',
		    	    value: cls
		    	});

				return false;
		    });
		}
		
		return objRecord;
    }

    function getBOMId(assemblyId) {
    	
	    var s = search.create({
	        type: record.Type.ASSEMBLY_ITEM,
	        columns: [
		  			search.createColumn({
						 name: 'formulanumeric',
					     formula: '{assemblyitembillofmaterials.billofmaterialsid}'
					})
	        ],
	        filters: [
	  	            search.createFilter({
		            	name: 'internalid',
		                operator: search.Operator.IS,
		                values: assemblyId
		            }),
	        ],
	    });
	    
	    var id = 0;
	    
	    s.run().each(function(result) {

	    	id = result.getValue(result.columns[0]);

			return false;
	    });
	    
	    return id;
    }

    function getRevisionId(bomId) {
    	
	    var s = search.create({
	        type: record.Type.BOM,
	        columns: [
		  			search.createColumn({
						 name: 'formulanumeric',
					     formula: '{revision.internalid}'
					})
	        ],
	        filters: [
	  	            search.createFilter({
		            	name: 'internalid',
		                operator: search.Operator.IS,
		                values: bomId
		            }),
	        ],
	    });
	    
	    var id = 0;
	    
	    s.run().each(function(result) {

	    	id = result.getValue(result.columns[0]);

			return false;
	    });
	    
	    return id;
    }

    function getCSVIds() {

	    var s = search.create({
	        type: record.Type.EMPLOYEE,
	        columns: [
		  			search.createColumn({
						 name: 'internalid'
					})
	        ],
	        filters: [
	  	            search.createFilter({
		            	name: 'custentity_ccm_newitemimportemail',
		                operator: search.Operator.IS,
		                values: 'T'
		            }),
	        ],
	    });
	    
	    var ids = [];
	    
	    s.run().each(function(result) {

	    	id = result.getValue('internalid');

	    	ids.push(id);
	    	
			return true;
	    });
	    
	    return ids;
    }

    function addItemToSelection(objRecord, itemId, quantity, vendorId, purchaseprice, salesprice, projectId) {

    	var sublistId = (objRecord.type == record.Type.BOM_REVISION ? 'component' : 'item');

		var numLines = objRecord.getLineCount({
			sublistId: sublistId
		});

    	objRecord.setSublistValue({
    	    sublistId: sublistId,
    	    fieldId: 'item',
    	    line: numLines,
    	    value: itemId
    	});

    	objRecord.setSublistValue({
    	    sublistId: sublistId,
    	    fieldId: (objRecord.type == record.Type.BOM_REVISION ? 'bomquantity' : 'quantity'),
    	    line: numLines,
    	    value: quantity
    	});

    	if (objRecord.type == record.Type.SALES_ORDER) {
    		
        	objRecord.setSublistValue({
        	    sublistId: sublistId,
        	    fieldId: 'rate',
        	    line: numLines,
        	    value: salesprice
        	});
    	}

    	if (objRecord.type == record.Type.SALES_ORDER || objRecord.type == record.Type.WORK_ORDER) {
    		        	
        	objRecord.setSublistValue({
        	    sublistId: sublistId,
        	    fieldId: 'povendor',
        	    line: numLines,
        	    value: vendorId
        	});
        	
        	objRecord.setSublistValue({
        	    sublistId: sublistId,
        	    fieldId: 'porate',
        	    line: numLines,
        	    value: purchaseprice
        	});
    	}
    }

    function sendCSV(csvData) {

    	if (!csvData.length) return;
    	
        var fileObj = file.create({
            name: 'NewItems.csv',
            fileType: file.Type.CSV,
            contents: csvData
        });
		
    	var user = runtime.getCurrentUser();
        
        email.send({
            author: user.id,
            recipients: getCSVIds(),
            subject: 'New NetSuite Items',
            body: "The attached file contains items that I would like to use, but they don't exist.  Please update (if necessary) and add them to NetSuite.<br><br>",
            attachments: [fileObj]
        });
    }
    
    function addHiddenField(form, id, dflt) {
    	
        var field = form.addField({
    	    id: id,
    	    type: serverWidget.FieldType.TEXT,
    	    label: ' '
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
