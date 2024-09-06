/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record','N/redirect','N/search','N/ui/serverWidget','N/url','../Module/ccItem'],
/**
 * @param {log} log
 * @param {record} record
 * @param {redirect} redirect
 * @param {url} url
 */
function(record,redirect,search,serverWidget,url,ccItem) {
   
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

				var item = {
					name: context.request.parameters.custpage_name,
					description: context.request.parameters.custpage_type_string,
					vendorId: context.request.parameters.custpage_vendor,
					price: context.request.parameters.custpage_price
				};

        		var id = context.request.parameters.custpage_id;
        		var prj = context.request.parameters.custpage_prj;
        		var cs = context.request.parameters.custpage_cs;
        		var cancel = context.request.parameters.custpage_cancel;
        		var type = context.request.parameters.custpage_type;

            	var pos = prj.indexOf(" ", 4);

            	item.name = getName(type) + '.' + prj.substring(4, pos) + (item.name ? '.' + item.name : '');

				if (cs != 'Requisition') {

					if (item.description == 'Assembly' || item.description == 'Assemblies') {

						item['asmbName'] = item.name;

						item = ccItem.createAssembly(item);
					}
					else {
	
						item['unitsType'] = {id: 1};

						item = ccItem.createInventory(item);
					}
				}

                var html = '<html><body><script language=\"javascript\">';

                html += 'if (window.opener) {';

                html += 'window.opener.require([\"/SuiteScripts/com.customcontrolmfr.items/ClientScript/' + cs + '\"], function(module) {';

				if (cs == 'Requisition') {
 
					html += 'module.handleSpecialItem("' + JSON.stringify(item) + '");';
				}
				else {
 
					html += 'module.handleSpecialItem(' + item.id + ');';
				}
                
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
