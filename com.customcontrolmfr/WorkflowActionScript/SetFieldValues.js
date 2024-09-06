/**createItem
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/record','N/runtime'], 

function(record,runtime) {

    function onAction(context){
    
        var recordValues = runtime.getCurrentScript().getParameter({name: 'custscript_ccm_recordvalues'});

        var values = JSON.parse(recordValues);

        log.debug({
            title: 'recordValues',
            details: recordValues
        });

        if (context.newRecord.id) {

            var options = {
                type: context.newRecord.type,
                id: context.newRecord.id,
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            };
        
            options['values'] = values;

            record.submitFields(options);
        }
        else {

            for (const key in values) {
                
                if (values.hasOwnProperty(key)) {

                    context.newRecord.setValue({
                        fieldId: key,
                        value: values[key]
                    });
                }
            }
        }
    }

    return {
        onAction: onAction
    }
});