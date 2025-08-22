/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record','N/search','N/ui/serverWidget','N/url','../../com.customcontrolmfr.accounting/Module/ccAccounting'],
/**
 * @param {log} log
 * @param {record} record
 * @param {search} search
 * @param {serverWidget} serverWidget
 * @param {url} url
 */
function(record,search,serverWidget,url,ccAccounting) {

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
                title: 'Project Actuals',
            });

            var data = ccAccounting.getEquityDetailData({
                projectId: context.request.parameters.pid
            });
    
            var tabId = form.addTab({
                id: 'custpage_tab',
                label: ' '
            });

            var sublist = form.addSublist({
                id: 'custpage_list',
                type: 'list',
                label: ' ',
                tab: tabId
            });
    
            sublist.addField({
                id: 'custpage_date',
                type: 'text',
                label: 'Date'
            });
    
            sublist.addField({
                id: 'custpage_document',
                type: 'text',
                label: 'Document'
            });
    
            sublist.addField({
                id: 'custpage_item',
                type: 'text',
                label: 'Item'
            });
    
            sublist.addField({
                id: 'custpage_quantity',
                type: 'text',
                label: 'Quantity'
            });

            sublist.addField({
                id: 'custpage_amount',
                type: 'currency',
                label: 'Amount'
            });
    
            for (var i = 0; i < data.length; i++) {
    
                if (data[i].date) {
                    
                    sublist.setSublistValue({
                        id: 'custpage_date',
                        line: i,
                        value: data[i].date
                    });
                }

                if (data[i].id) {
                        
                    var recordURL = url.resolveRecord({
                        recordType: type,
                        recordId: data[i].id,
                        isEditMode: false
                    });

                    sublist.setSublistValue({
                        id: 'custpage_document',
                        line: i,
                        value: '<a href=\"' + recordURL +'\">' + data[i].name + '</a>'
                    });
                }
    
                if (data[i].item) {
                    
                    sublist.setSublistValue({
                        id: 'custpage_item',
                        line: i,
                        value: data[i].item
                    });
                }
    
                sublist.setSublistValue({
                    id: 'custpage_quantity',
                    line: i,
                    value: data[i].qty
                });
    
                sublist.setSublistValue({
                    id: 'custpage_amount',
                    line: i,
                    value: data[i].amt
                });
            }
    
            context.response.writePage(form);
        }
        catch(e) {
        	  
            log.error('Project Actuals',e);
        }    
    }

    return {
        onRequest: onRequest
    };
    
});
