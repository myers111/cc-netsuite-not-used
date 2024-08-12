/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define([
    'N/redirect','N/search','N/ui/serverWidget','N/url','../Module/ccQuote','../Module/ccBomRevisionForm','../../com.customcontrolmfr/Module/ccForm','../../com.customcontrolmfr/Module/ccItem'],

function(redirect,search,serverWidget,url,ccQuote,ccBomRevisionForm,ccForm,ccItem) {

    var NEW_ITEM = 3757;

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
    
                var editMode = (context.request.parameters.em ? true : false);

                var revisionId = context.request.parameters.rid;
                revisionId = 6;

            	var form = serverWidget.createForm({
                    title: "BOM Revision " + getName(revisionId),
                });

            	form.clientScriptModulePath = '../ClientScript/BomRevision.js';

                addFields(form, editMode);

                loadBom(revisionId, form, editMode);

                loadLabor(revisionId, form, editMode);

                loadExpenses(revisionId, form, editMode);

            	if (editMode) ccForm.addHiddenField(form, 'custpage_em', 'T');
            	ccForm.addHiddenField(form, 'custpage_rid', revisionId);
            	ccForm.addHiddenField(form, 'custpage_referer', (context.request.parameters.referer == null ? context.request.headers.referer : context.request.parameters.referer));

                context.response.writePage(form);
        	}
        	else if (context.request.method === 'POST') {

        		var revisionId = parseInt(context.request.parameters.custpage_rid);
        		var referer = context.request.parameters.custpage_referer;

                if (context.request.parameters.custpage_em == 'T') {

                    var numLines = context.request.getLineCount({
                        group: 'custpage_sublist'
                    });
                    
                    numLines = numLines < 0 ? 0 : numLines;
    
                    log.debug({
                        title: 'Posted Items',
                        details: numLines
                    });
    
                    var data = {
                        items: []
                    };

                    data.quantity = context.request.getValue({
                        name: 'custpage_quantity'
                    });
        
                    data.cost = context.request.getValue({
                        name: 'custpage_cost'
                    });
        
                    data.quote = context.request.getValue({
                        name: 'custpage_quote'
                    });

                    for (var i = 0; i < numLines; i++) {
    
                        var item = {};
    
                        item.itemId = context.request.getSublistValue({
                            group: 'custpage_sublist',
                            name: 'custpage_item',
                            line: i
                        });
    
                        item.newItem = context.request.getSublistValue({
                            group: 'custpage_sublist',
                            name: 'custpage_newitem',
                            line: i
                        });
    
                        item.description = context.request.getSublistValue({
                            group: 'custpage_sublist',
                            name: 'custpage_description',
                            line: i
                        });
    
                        item.quantity = context.request.getSublistValue({
                            group: 'custpage_sublist',
                            name: 'custpage_quantity',
                            line: i
                        });
    
                        item.units = context.request.getSublistValue({
                            group: 'custpage_sublist',
                            name: 'custpage_units',
                            line: i
                        });
    
                        item.price = context.request.getSublistValue({
                            group: 'custpage_sublist',
                            name: 'custpage_price',
                            line: i
                        });
    
                        item.vendorId = context.request.getSublistValue({
                            group: 'custpage_sublist',
                            name: 'custpage_vendor',
                            line: i
                        });
    
                        item.newVendor = context.request.getSublistValue({
                            group: 'custpage_sublist',
                            name: 'custpage_newvendor',
                            line: i
                        });
    
                        data.items.push(item);
                    }
                    
                    ccQuote.setRevision(revisionId, data);
    
                    redirect.redirect({
                        url: referer
                    });
                }
                else {

                    var scriptURL = url.resolveScript({
                        scriptId: 'customscript_ccm_qte_bomrev_su',
                        deploymentId: 'customdeploy_ccm_qte_bomrev_su',
                        returnExternalUrl: false,
                        params: {
                            'rid': parseInt(revisionId),
                            'referer': referer,
                            'em': 'T'
                        }
                    });

                    redirect.redirect({
                        url: scriptURL
                    });
                }
        	}
        }
        catch(e) {
        	  
            log.error('BOM Revision',e);
		}    
    }

    function getName(revisionId) {

        var name = '';

        search.create({
            type: search.Type.BOM_REVISION,
            columns: ['name'],
            filters: [
                search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.IS,
                    values: parseInt(revisionId)
                })
            ],
        }).run().each(function(result) {

            name = result.getValue('name');

            return false;
        });

        return name;
    }

    return {
        onRequest: onRequest
    };
});
