/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/search', 'N/ui/serverWidget', '../../com.customcontrolmfr/Module/ccForm'],

function(log, record, search, serverWidget, ccForm) {

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

                form.addSubmitButton({
                    label: 'Submit'
                });
        
                var field = form.addField({
                    id: 'custpage_prefix',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Name'
                });
                
                field.defaultValue = context.request.parameters.prefix;

                field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                form.addField({
                    id: 'custpage_name',
                    type: serverWidget.FieldType.TEXT,
                    label: ' '
                });

                ccForm.addHiddenField(form, 'custpage_line', context.request.parameters.line);

                ccForm.addHiddenField(form, 'custpage_p1', context.request.parameters.p1);

                context.response.writePage(form);
        	}
        	else if (context.request.method === 'POST') {
        		
        		var prefix = context.request.parameters.custpage_prefix;
        		var name = context.request.parameters.custpage_name;
        		var line = context.request.parameters.custpage_line;
        		var clientScript = context.request.parameters.custpage_p1;

                var id = getBomId(prefix + name);

                var html = '<html><body><script language=\"javascript\">';

                html += 'if (window.opener) {';

                html += 'window.opener.require([\"/SuiteScripts/com.customcontrolmfr.quoting/ClientScript/' + clientScript + '\"], function(module) {';
                
                html += 'module.setBOMRevision(' + id + ',' + line + ');';

                html += '})';

                html += '}';

                html += 'window.close();';

                html += '</script></body></html>';

                context.response.write(html);
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
