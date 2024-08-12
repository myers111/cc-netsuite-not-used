/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log','N/record','N/redirect','N/search','N/ui/serverWidget','../../com.customcontrolmfr/Module/ccForm'],

function(log,record,redirect,search,serverWidget,ccForm) {

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
                    title: "Create BOM",
                });

            	form.clientScriptModulePath = '../ClientScript/CreateBom.js';

                form.addSubmitButton({
                    label: 'Submit'
                });
        
                form.addButton({
                    id: 'custpage_cancel',
                    label: 'Cancel',
                    functionName: 'onCancel'
                });
        
                var html = '<p style="font-size:20px;font-weight:bold">' + context.request.parameters.prefix + '</p>';

            	form.addField({
            	    id: 'custpage_htmlfield',
            	    type: serverWidget.FieldType.INLINEHTML,
            	    label: ' '
            	}).defaultValue = html;

                form.addField({
                    id: 'custpage_name',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Name'
                });
            	
            	ccForm.addHiddenField(form, 'custpage_referer', (context.request.parameters.referer == null ? context.request.headers.referer : context.request.parameters.referer));

                ccForm.addHiddenField(form, 'custpage_prefix', context.request.parameters.prefix);

                ccForm.addHiddenField(form, 'custpage_line', context.request.parameters.line);

                ccForm.addHiddenField(form, 'custpage_rid', context.request.parameters.rid);

                ccForm.addHiddenField(form, 'custpage_rtype', context.request.parameters.rtype);

                context.response.writePage(form);
        	}
        	else if (context.request.method === 'POST') {

        		var name = context.request.parameters.custpage_name;
        		var prefix = context.request.parameters.custpage_prefix;
        		var line = context.request.parameters.custpage_line;
        		var rid = context.request.parameters.custpage_rid;
        		var rtype = context.request.parameters.custpage_rtype;

                var objRecord = record.load({
                    type: rtype,
                    id: rid,
                    isDynamic: false,
                });

                objRecord.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_ccm_bom',
                    line: line,
                    value: getBomId(prefix + name)
                });

                objRecord.save();

                redirect.redirect({
                    url: context.request.parameters.custpage_referer
                });
            }
        }
        catch(e) {
        	  
            log.error('Create BOM',e);
		}    
    }

    function getBomId(name) {

        var objRecord = record.create({
            type: record.Type.BOM,
            isDynamic: true
        });

        objRecord.setValue({
            fieldId: 'name',
            value: name
        });
        
        return objRecord.save();
    }

    return {
        onRequest: onRequest
    };
});
