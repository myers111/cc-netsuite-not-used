/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/redirect', 'N/search', 'N/ui/serverWidget', 'N/url'],
/**
 * @param {log} log
 * @param {record} record
 * @param {redirect} redirect
 * @param {url} url
 */
function(log, record, redirect, search, serverWidget, url) {
   
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
                    title: 'Special Item',
                });

            	form.clientScriptModulePath = '../ClientScript/SpecialItem.js';
             	
            	addHiddenField(form, 'custpage_id', context.request.parameters.rid);
             	
            	addHiddenField(form, 'custpage_prj', context.request.parameters.prj);
             	
            	addHiddenField(form, 'custpage_cs', context.request.parameters.cs);

            	addHiddenField(form, 'custpage_type_string', '');
                
                form.addSubmitButton({
                    label: 'Save'
                });
                
                form.addButton({
                    id: 'custpage_cancel',
                    label: 'Cancel',
                    functionName: 'onCancel'
                });

                form.addField({
            	    id: 'custpage_type',
            	    type: serverWidget.FieldType.SELECT,
            	    label: 'Type',
            	    source: 'customlist_ccm_special_inventory_item'
            	}).isMandatory = true;

                var fldName = form.addField({
            	    id: 'custpage_name',
            	    type: serverWidget.FieldType.TEXT,
            	    label: 'Name'
            	});

                fldName.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
                });

                fldName.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });

                var fldVendor = form.addField({
            	    id: 'custpage_vendor',
            	    type: serverWidget.FieldType.SELECT,
            	    label: 'Vendor',
                	source: 'vendor'
            	});

                fldVendor.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
                });

                fldVendor.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
                
                var fldPrice = form.addField({
            	    id: 'custpage_price',
            	    type: serverWidget.FieldType.CURRENCY,
            	    label: 'Price'
            	});

                fldPrice.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
                });

                fldPrice.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
                
                context.response.writePage(form);
        	}
        	else if (context.request.method === 'POST') {

        		var id = context.request.parameters.custpage_id;
        		var prj = context.request.parameters.custpage_prj;
        		var cs = context.request.parameters.custpage_cs;
        		var cancel = context.request.parameters.custpage_cancel;
        		var type = context.request.parameters.custpage_type;
        		var type_string = context.request.parameters.custpage_type_string;
        		var name = context.request.parameters.custpage_name;
        		var vendor = context.request.parameters.custpage_vendor;
        		var price = context.request.parameters.custpage_price;

            	var pos = prj.indexOf(" ", 4);

            	var name = getName(type) + '.' + prj.substring(4, pos) + (name ? '.' + name : '');

            	var itemId = getItemId(name);
            	
            	if (itemId == 0) {
            		
                	var item = null;
                   	
                	if (type_string == 'Assembly' || type_string == 'Assemblies') {

                        var item = record.create({
                            type: record.Type.ASSEMBLY_ITEM,
                            isDynamic: true
                        });

                        item.setText({
                            fieldId: 'description',
                            text: type_string
                        });

                        item.setValue({
                	        fieldId: 'assetaccount',
                	        value: 232
                	    });
                	}
                	else {

                        var item = record.create({
                            type: record.Type.INVENTORY_ITEM,
                            isDynamic: true
                        });

                        item.setText({
                            fieldId: 'purchasedescription',
                            text: type_string
                        });

                        item.setText({
                            fieldId: 'salesdescription',
                            text: type_string
                        });

                        item.setText({
                            fieldId: 'displayname',
                            text: ' '
                        });

                        item.setText({
                            fieldId: 'vendorname',
                            text: ' '
                        });
                    	
                        item.setValue({
                	        fieldId: 'unitstype',
                	        value: 1
                	    });

                        item.setValue({
                	        fieldId: 'stockunit',
                	        value: 1
                	    });

                        item.setValue({
                	        fieldId: 'purchaseunit',
                	        value: 1
                	    });
                    	
                        item.setValue({
                	        fieldId: 'consumptionunit',
                	        value: 1
                	    });

                        item.setValue({
                	        fieldId: 'preferredlocation',
                	        value: 1
                	    });

                    	item.selectNewLine({
                            sublistId: 'itemvendor'
                        });

                        item.setCurrentSublistValue({
                            sublistId: 'itemvendor',
                            fieldId: 'vendor',
                            value: vendor
                        });

                        item.setCurrentSublistValue({
                            sublistId: 'itemvendor',
                            fieldId: 'purchaseprice',
                            value: price
                        });

                        item.setCurrentSublistValue({
                            sublistId: 'itemvendor',
                            fieldId: 'preferredvendor',
                            value: true
                        });

                        item.commitLine({
                            sublistId: 'itemvendor'
                        });
                	}

                    item.setText({
                        fieldId: 'itemid',
                        text: name
                    });

                    item.setValue({
            	        fieldId: 'taxschedule',
            	        value: 1
            	    });

                    var itemId = item.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
    		        
    		    	log.debug({
    		    	    title: 'Create Special Item',
    		    	    details: 'Item created with id: ' + itemId
    		    	});
            	}
            	else {

    		    	log.debug({
    		    	    title: 'Special Item Exists',
    		    	    details: 'Item found with id: ' + itemId
    		    	});
            	}

                var html = '<html><body><script language=\"javascript\">';

                html += 'if (window.opener) {';

                html += 'window.opener.require([\"/SuiteScripts/com.customcontrolmfr/ClientScript/' + cs + '\"], function(module) {';
                
                html += 'module.handleSpecialItem(' + itemId + ');';
                
                html += '})';

                html += '}';

                html += 'window.close();';

                html += '</script></body></html>';

                context.response.write(html);
            }
        }
        catch(e) {

            log.error('Special Item',e);

			var scriptURL = url.resolveScript({
				scriptId: 'customscript_ccm_error_su',
				deploymentId: 'customdeploy_ccm_error_su',
				returnExternalUrl: false,
				params: {
					'e': e,
					'title': 'Special Item'
				}
			});

			redirect.redirect({
				url: scriptURL
			});
        }    
    }

    function getItemId(name) {
    	
    	var itemId = 0;
    	
	    var s = search.create({
	        type: record.Type.INVENTORY_ITEM,
	        columns: ['internalid'],
	        filters: [
		              search.createFilter({
		                  name: 'itemid',
		                  operator: search.Operator.IS,
		                  values: name
		              })
	         ]
	    });

	    s.run().each(function(result) {
	    	
	    	itemId = result.getValue({
	            name: 'internalid'
	        });

	        return false;
	    });

	    return itemId;
    }
    
    function getName(itemType) {

    	switch (parseInt(itemType)) {
    	case 1:
    		return 'ACC';
    	case 2:
    		return 'ATS';
    	case 3:
    		return 'CB';
    	case 4:
    		return 'DISC';
    	case 5:
    		return 'FUSE';
    	case 6:
    		return 'GTB';
    	case 7:
    		return 'HRG';
    	case 8:
    		return 'HVAC';
    	case 9:
    		return 'FLTR';
    	case 10:
    		return 'LR';
    	case 11:
    		return 'MTS';
    	case 12:
    		return 'MCC';
    	case 13:
    		return 'MO';
    	case 14:
    		return 'MS';
    	case 15:
    		return 'OF';
    	case 16:
    		return 'PNLB';
    	case 17:
    		return 'SST';
    	case 18:
    		return 'SPP';
    	case 19:
    		return 'SPD';
    	case 21:
    		return 'SWB';
    	case 22:
    		return 'SWGR';
    	case 23:
    		return 'TFMR';
    	case 24:
    		return 'UPS';
    	case 25:
    		return 'VFD';
    	case 26:
    		return 'EQC';
    	case 27:
    		return 'ASMB';
    	case 28:
    		return 'CUST';
    	case 29:
    		return 'RLY';
    	case 30:
    		return 'DWGS';
    	case 31:
    		return 'LCTR';
    	case 32:
    		return 'SURG';
    	case 33:
    		return 'ASMBS';
    	case 34:
    		return 'LOT';
    	default:
    		return 'ERROR';
    	}
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
