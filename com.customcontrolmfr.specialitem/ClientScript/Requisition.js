/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord','N/url','../Module/ccTransaction','../Module/ccItem','../../com.customcontrolmfr/Module/ccUtil'],
/**
 * @param {log} log
 * @param {record} record
 */
function(currentRecord,url,ccTransaction,ccItem,ccUtil) {

    var NEW_ITEM = 3757;
    var ADMIN_DEPARTMENT = 4;

    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(context) {

    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     * @param {string} context.fieldId - Field name
     * @param {number} context.line - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} context.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(context) {

    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     * @param {string} context.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(context) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(context) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(context) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     * @param {string} context.fieldId - Field name
     * @param {number} context.line - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} context.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(context) {
    	
    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(context) {
        
    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(context) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(context) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(context) {

    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    function addSpecialItem() {

		var objRecord = currentRecord.get();

    	var project = objRecord.getText({
    	    fieldId: 'job'
    	});

    	if (!project) {
    		
    		alert('You need to select a project.');
    		
    		return;
    	}

        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_ccm_items_special_su',
            deploymentId: 'customdeploy_ccm_items_special_su',
            returnExternalUrl: false,
			params: {
				'rid': objRecord.id,
				'prj': project,
				'cs': 'Requisition'
			}
        });
        
        window.open(suiteletURL);
    }

    function handleSpecialItem(jsonItem) {

        var item = JSON.parse(jsonItem);

        item['id'] = 0;
        item['desc'] = item.description;
        item['qty'] = 1;

        var data = {
            unitCount: 1,
            items: [item]
        };

        handleItems(data);
/*
        if (numLines > 25) {

            alert("Your Requisition has more than 25 items. If you did not choose \"Show All\" before you added the item, you'll have to add it manually. It is" + (item.isNew ? "" : " not") + " a new item it's named " + item.name + ".");
        }
*/    }

    function importItems() {

        window.open(ccTransaction.getImportURL('Requisition'));
    }

    function handleItems(data) {
        
		var objRecord = currentRecord.get();

        objRecord.setValue({
            fieldId: 'custpage_importinprogress',
            value: true
        });

        objRecord.setValue({
            fieldId: 'custbody_ccm_unitcount',
            value: data.unitCount
        });

        for (var i = 0; i < data.items.length; i++) {

            var numLines = objRecord.getLineCount({
                sublistId: 'item'
            });

            objRecord.insertLine({
                sublistId: 'item',
                line: numLines
            });

            var item = data.items[i];

            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: (!item.id ? NEW_ITEM : parseInt(item.id)),
                ignoreFieldChange: (!item.id ? true : false),
                fireSlavingSync: true
            });

            if (!item.id) {

                objRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_ccm_newitem',
                    value: item.name,
                    fireSlavingSync: true
                });
            }

            if (!data.departmentId) data.departmentId = ADMIN_DEPARTMENT;

            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'department',
                value: data.departmentId,
                fireSlavingSync: true
            });

            if (item.desc) {

                objRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'description',
                    value: item.desc,
                    fireSlavingSync: true
                });
            }

            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_ccm_quantityavailable',
                value: (item.qtyAvail ? item.qtyAvail : 0),
                ignoreFieldChange: true,
                fireSlavingSync: true
            });

            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_ccm_unitquantity',
                value: item.qty,
                fireSlavingSync: true
            });

            var unitsId = (item.units ? ccItem.getUnitsIdFromClient(item.units) : 1);

            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_ccm_units',
                value: unitsId,
                fireSlavingSync: true
            });

            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: item.price,
                fireSlavingSync: true
            });

            if (item.lastPrice) {

                objRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_ccm_lastpurchaseprice',
                    value: item.lastPrice,
                    fireSlavingSync: true
                });
            }

            if (data.projectId) {

                objRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'customer',
                    value: data.projectId,
                    fireSlavingSync: true
                });
            }

            if (item.vendorId) {

                objRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_ccm_vendor',
                    value: parseInt(item.vendorId),
                    fireSlavingSync: true
                });
            }

            if (!item.vendorId && item.vendor) {

                objRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_ccm_newvendor',
                    value: item.vendor,
                    fireSlavingSync: true
                });
            }

            if (item.manufact) {

                objRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_ccm_manufacturer',
                    value: item.manufact,
                    fireSlavingSync: true
                });
            }

            if (item.mpn) {

                objRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_ccm_mpn',
                    value: item.mpn,
                    fireSlavingSync: true
                });
            }

            var dt = item.receiveBy;

            if (dt && !isNaN(new Date(dt))) {

                objRecord.setCurrentSublistText({
                    sublistId: 'item',
                    fieldId: 'custcol_ccm_expectedreceiptdate',
                    text: ccUtil.getNSDateFromJSDate(new Date(dt)),
                    fireSlavingSync: true
                });
            }

            if (item.bin) {

                objRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_ccm_bin',
                    value: item.bin,
                    fireSlavingSync: true
                });
            }

            objRecord.commitLine({
                sublistId: 'item'
            });
        }

        objRecord.setValue({
            fieldId: 'custpage_importinprogress',
            value: false
        });
    }

    return {
        pageInit: pageInit,/*
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord,*/
        addSpecialItem: addSpecialItem,
        handleSpecialItem: handleSpecialItem,
        importItems: importItems,
        handleItems: handleItems
    };
});
