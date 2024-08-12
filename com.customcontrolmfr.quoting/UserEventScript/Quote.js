/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime','N/record','N/search','N/ui/serverWidget','N/url'],

function(runtime,record,search,serverWidget,url) {
	
    var MILESTONE_PAYMENT = 34;

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {string} context.type - Trigger type
     * @param {Form} context.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(context) {

        var sublist = context.form.getSublist({
            id: 'item'
        });

        if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {

            sublist.getField({id: 'custcol_ccm_linkhtml'}).updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
        }
        else {

            sublist.getField({id: 'custcol_ccm_bom'}).updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            sublist.getField({id: 'custcol_ccm_bomrevision'}).updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

            var numLines = context.newRecord.getLineCount({
                sublistId: 'item'
            });
    
            for (var i = 0; i < numLines; i++) {
                        
                var itemId = context.newRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });

                if (itemId != MILESTONE_PAYMENT) continue;

                context.newRecord.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_ccm_linkhtml',
                    line: i,
                    value: getBomLink(i, context.newRecord)
                });
            }
        }

		context.form.clientScriptModulePath = '../ClientScript/Quote.js';
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {Record} context.oldRecord - Old record
     * @param {string} context.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(context) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {Record} context.oldRecord - Old record
     * @param {string} context.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(context) {
    
    }
  
    function getBomLink(line, objRecord) {

        var bomId = objRecord.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_ccm_bom',
            line: line
        });

        if (bomId) {

            var recordURL = url.resolveRecord({
                recordType: record.Type.BOM,
                recordId: bomId,
                isEditMode: false
            });
/*
            var bomName = objRecord.getSublistText({
                sublistId: 'item',
                fieldId: 'custcol_ccm_bom',
                line: line
            });
*/
            return '<a href="' + recordURL + '" target="_blank" class="dottedlink">BOM</a>' + getBomRevisionLink(line, objRecord);
        }
        else {

            var tranid = objRecord.getValue({
                fieldId: 'tranid'
            });
    
            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_ccm_qte_createbom_su',
                deploymentId: 'customdeploy_ccm_qte_createbom_su',
                returnExternalUrl: false,
                params: {
                    'prefix': tranid + '.',
                    'line': line,
                    'rid': objRecord.id,
                    'rtype': record.Type.ESTIMATE
                }
            });
    
            return '<a href="' + suiteletURL + '" target="_blank" class="dottedlink">Create BOM</a>';
        }
    }
  
    function getBomRevisionLink(line, objRecord) {

        var bomRevisionId = objRecord.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_ccm_bomrevision',
            line: line
        });

        var html = '';

        if (bomRevisionId) {

            var recordURL = url.resolveRecord({
                recordType: record.Type.BOM_REVISION,
                recordId: bomRevisionId,
                isEditMode: true
            });
/*
            var bomRevisionName = objRecord.getSublistText({
                sublistId: 'item',
                fieldId: 'custcol_ccm_bomrevision',
                line: line
            });
*/
            var excelUrl = 'https://customcontrolmfr-my.sharepoint.com/personal/' + getOfficeFolder() + '/_layouts/15/doc.aspx?sourcedoc={4b19073e-cdda-4d52-b897-5d8aa1fc6775}&action=edit';

            excelUrl += ('&rid=' + bomRevisionId);

            html = ' | <a href="' + recordURL + '" target="_blank" class="dottedlink">Revision</a> (<a href="' + excelUrl + '" target="_blank" class="dottedlink">Excel<a/>)';
        }

        var tranid = objRecord.getValue({
            fieldId: 'tranid'
        });

        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_ccm_qte_createbomrev_su',
            deploymentId: 'customdeploy_ccm_qte_createbomrev_su',
            returnExternalUrl: false,
            params: {
                'prefix': tranid + '.',
                'line': line,
                'rid': objRecord.id,
                'rtype': record.Type.ESTIMATE
            }
        });

        html += ' | <a href="' + suiteletURL + '" target="_blank" class="dottedlink">Create Revision</a>';

        return html;
    }

    function getOfficeFolder() {

        var userId = runtime.getCurrentUser().id;
    
        folder = '';
        
        search.create({
            type: search.Type.EMPLOYEE,
            columns: ['email'],
            filters: [
                search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.IS,
                    values: userId
                }),
            ],
        }).run().each(function(result) {

            folder = result.getValue('email');

            folder = folder.replace('.', '_');
            folder = folder.replace('@', '_');

            return false;
        });
        
        return folder;
    }

    return {
        beforeLoad: beforeLoad,
        //beforeSubmit: beforeSubmit,
        //afterSubmit: afterSubmit
    };
});
