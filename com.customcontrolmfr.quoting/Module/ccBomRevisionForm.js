/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 */
define(['N/record','N/search','N/ui/serverWidget','../Module/ccQuote'],

function(record,search,serverWidget,ccQuote) {

    function addFields(form, editMode) {

        form.addSubmitButton({
            label: (editMode ? 'Save' : 'Edit')
        });

        form.addButton({
            id: 'custpage_cancel',
            label: (editMode ? 'Cancel' : 'Back'),
            functionName: 'onCancel'
        });

        form.addField({
            id: 'custpage_defaultmarkup',
            type: serverWidget.FieldType.PERCENT,
            label: ' ',
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });

        form.addField({
            id: 'custpage_quantity',
            type: serverWidget.FieldType.INTEGER,
            label: 'Quantity',
        }).isMandatory = true;

        form.addField({
            id: 'custpage_quote',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Quote',
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        form.addField({
            id: 'custpage_extquote',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Ext. Quote',
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
    }

    function loadBom(revisionId, form, editMode) {

        var data = ccQuote.getRevision(revisionId);

        form.getField({
            id: 'custpage_defaultmarkup'
        }).defaultValue = data.defaultMarkup;

        form.getField({
            id: 'custpage_quantity'
        }).defaultValue = data.quantity;

        form.getField({
            id: 'custpage_quote'
        }).defaultValue = data.quote;

        form.getField({
            id: 'custpage_extquote'
        }).defaultValue = data.quantity * data.quote;

        var sublist = ccBomRevisionForm.getBomSublist(form, editMode);

        for (var i = 0; i < data.items.length; i++) {

            var item = data.items[i];

            sublist.setSublistValue({
                id: 'custpage_itemssublist_lineid',
                line: i,
                value: item.lineId
            });

            sublist.setSublistValue({
                id: 'custpage_itemssublist_item',
                line: i,
                value: item.itemId
            });

            if (parseInt(item.itemId) == NEW_ITEM) {

                if (item.newItem) {

                    sublist.setSublistValue({
                        id: 'custpage_itemssublist_newitem',
                        line: i,
                        value: item.newItem
                    });
                }

                if (item.newDescription) {

                    sublist.setSublistValue({
                        id: 'custpage_itemssublist_description',
                        line: i,
                        value: item.newDescription
                    });
                }
            }
            else {

                if (item.description) {

                    sublist.setSublistValue({
                        id: 'custpage_itemssublist_description',
                        line: i,
                        value: item.description
                    });
                }
            }

            if (item.quantity != null) {

                sublist.setSublistValue({
                    id: 'custpage_itemssublist_quantity',
                    line: i,
                    value: item.quantity
                });
            }    

            var unitsId = (item.item.units ? ccItem.getUnitsIdFromServer(item.units) : 1);

            sublist.setSublistValue({
                id: 'custpage_itemssublist_units',
                line: i,
                value: unitsId
            });

            if (item.price) {

                sublist.setSublistValue({
                    id: 'custpage_itemssublist_price',
                    line: i,
                    value: item.price
                });
            }

            if (item.vendorId) {

                sublist.setSublistValue({
                    id: 'custpage_itemssublist_vendor',
                    line: i,
                    value: item.vendorId
                });
            }

            if (item.newVendor) {

                sublist.setSublistValue({
                    id: 'custpage_itemssublist_newvendor',
                    line: i,
                    value: item.newVendor
                });
            }

            if (item.manufacturer) {

                sublist.setSublistValue({
                    id: 'custpage_itemssublist_manufacturer',
                    line: i,
                    value: item.manufacturer
                });
            }

            if (item.markup) {

                sublist.setSublistValue({
                    id: 'custpage_itemssublist_markup',
                    line: i,
                    value: item.markup
                });
            }

            sublist.setSublistValue({
                id: 'custpage_itemssublist_quote',
                line: i,
                value: 0
            });
        }
    }

    function loadLabor(revisionId, form, editMode) {

        var data = ccQuote.getRevisionLabor(revisionId);

        var sublists = ccBomRevisionForm.getLaborSublists(form, editMode);

        for (var i = 0; i < data.length; i++) {
    
            var labor = data[i];

            var groupId = data[i].groupId;

            var sublist = sublists['ID' + groupId];

            var sublistId = 'custpage_laborsublist_' + groupId;

            sublist.setSublistValue({
                id: sublistId + '_role',
                line: i,
                value: labor.roleId
            });

            sublist.setSublistValue({
                id: sublistId + '_quantity',
                line: i,
                value: labor.quantity
            });

            sublist.setSublistValue({
                id: sublistId + '_cost',
                line: i,
                value: labor.cost
            });

            sublist.setSublistValue({
                id: sublistId + '_extcost',
                line: i,
                value: labor.quantity * labor.cost
            });

            sublist.setSublistValue({
                id: sublistId + '_quote',
                line: i,
                value: labor.quote
            });
        }
    }

    function loadExpenses(revisionId, form, editMode) {

        var data = ccQuote.getRevisionExpenses(revisionId);

        var sublist = ccBomRevisionForm.getExpensesSublist(form, editMode);

        for (var i = 0; i < data.length; i++) {

            var exp = data[i];

            sublist.setSublistValue({
                id: 'custpage_exp_item',
                line: i,
                value: exp.itemId
            });

            sublist.setSublistValue({
                id: 'custpage_exp_quantity',
                line: i,
                value: exp.quantity
            });

            sublist.setSublistValue({
                id: 'custpage_exp_cost',
                line: i,
                value: exp.cost
            });

            sublist.setSublistValue({
                id: 'custpage_exp_extcost',
                line: i,
                value: exp.quantity * exp.cost
            });

            sublist.setSublistValue({
                id: 'custpage_exp_quote',
                line: i,
                value: exp.quote
            });
        }
    }

    function getBomSublist(form, editMode) {

        var tabId = 'custpage_itemstab';

        form.addTab({
            id: tabId,
            label: 'Items'
        });

        var sublist = form.addSublist({
            id: 'custpage_itemssublist',
            type: (editMode ? serverWidget.SublistType.INLINEEDITOR : serverWidget.SublistType.LIST),
            label: 'Items',
            tab: tabId
        });

        sublist.addField({
            id: 'custpage_itemssublist_lineid',
            type: serverWidget.FieldType.INTEGER,
            label: ' '
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });

        sublist.addField({
            id: 'custpage_itemssublist_item',
            type: serverWidget.FieldType.SELECT,
            label: 'Item',
            source: 'item'
        }).updateDisplayType({
            displayType: (editMode ? serverWidget.FieldDisplayType.NORMAL : serverWidget.FieldDisplayType.INLINE)
        });

        sublist.addField({
            id: 'custpage_itemssublist_newitem',
            type: serverWidget.FieldType.TEXT,
            label: 'New Item'
        });

        sublist.addField({
            id: 'custpage_itemssublist_description',
            type: serverWidget.FieldType.TEXT,
            label: 'Description'
        });

        sublist.addField({
            id: 'custpage_itemssublist_quantity',
            type: serverWidget.FieldType.INTEGER,
            label: 'Quantity'
        });

        sublist.addField({
            id: 'custpage_itemssublist_units',
            type: serverWidget.FieldType.SELECT,
            label: 'Units',
            source: '-221'
        }).updateDisplayType({
            displayType: (editMode ? serverWidget.FieldDisplayType.NORMAL : serverWidget.FieldDisplayType.INLINE)
        });

        sublist.addField({
            id: 'custpage_itemssublist_price',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Price'
        });

        sublist.addField({
            id: 'custpage_itemssublist_vendor',
            type: serverWidget.FieldType.SELECT,
            label: 'Vendor',
            source: 'vendor'
        }).updateDisplayType({
            displayType: (editMode ? serverWidget.FieldDisplayType.NORMAL : serverWidget.FieldDisplayType.INLINE)
        });

        sublist.addField({
            id: 'custpage_itemssublist_newvendor',
            type: serverWidget.FieldType.TEXT,
            label: 'New Vendor'
        });

        sublist.addField({
            id: 'custpage_itemssublist_manufacturer',
            type: serverWidget.FieldType.TEXT,
            label: 'Manufacturer'
        });

        sublist.addField({
            id: 'custpage_itemssublist_markup',
            type: serverWidget.FieldType.PERCENT,
            label: 'MU %'
        });

        sublist.addField({
            id: 'custpage_itemssublist_quote',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Quote'
        });

        return sublist;
    }

    function getLaborSublists(form, editMode) {

        var data = ccQuote.getDefaultLabor();

        var tabId = 'custpage_labortab';

        form.addTab({
            id: tabId,
            label: 'Labor'
        });

        var sublists = {};

        var groupId = 0;

        for (var i = 0; i < data.length; i++) {

            if (groupId == data[i].groupId) continue;

            groupId = data[i].groupId;

            var sublistId = 'custpage_laborsublist_' + groupId;

            var sublist = form.addSublist({
                id: sublistId,
                type: (editMode ? serverWidget.SublistType.INLINEEDITOR : serverWidget.SublistType.LIST),
                label: data[i].groupName,
                tab: tabId
            });

            setLaborSublist(editMode, sublist, sublistId);

            sublists['ID' + groupId] = sublist;
        }

        return sublists;
    }

    function setLaborSublist(editMode, sublist, sublistId) {

        sublist.addField({
            id: sublistId + '_role',
            type: serverWidget.FieldType.SELECT,
            label: 'Role',
            source: 'customrecord_ccm_quotelaborrole'
        }).updateDisplayType({
            displayType: (editMode ? serverWidget.FieldDisplayType.NORMAL : serverWidget.FieldDisplayType.INLINE)
        }).isMandatory = true;

        sublist.addField({
            id: sublistId + '_quantity',
            type: serverWidget.FieldType.INTEGER,
            label: 'Quantity'
        }).isMandatory = true;

        sublist.addField({
            id: sublistId + '_cost',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Cost',
        }).isMandatory = true;

        sublist.addField({
            id: sublistId + '_extcost',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Ext. Cost',
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        sublist.addField({
            id: sublistId + '_quote',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Quote',
        }).isMandatory = true;
   
        return sublist;
    }

    function getExpensesSublist(form, editMode) {

        var tabId = 'custpage_exptab';

        form.addTab({
            id: tabId,
            label: 'Expenses'
        });

        var sublist = form.addSublist({
            id: 'custpage_expsublist',
            type: (editMode ? serverWidget.SublistType.INLINEEDITOR : serverWidget.SublistType.LIST),
            label: 'Expenses',
            tab: tabId
        });

        sublist.addField({
            id: 'custpage_expsublist_id',
            type: serverWidget.FieldType.INTEGER,
            label: 'ID'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });

        sublist.addField({
            id: 'custpage_expsublist_item',
            type: serverWidget.FieldType.TEXT,
            label: 'Item',
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        sublist.addField({
            id: 'custpage_expsublist_quantity',
            type: serverWidget.FieldType.INTEGER,
            label: 'Quantity'
        });//.isMandatory = true;

        sublist.addField({
            id: 'custpage_expsublist_cost',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Cost',
        });//.isMandatory = true;

        sublist.addField({
            id: 'custpage_expsublist_extcost',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Ext. Cost',
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        sublist.addField({
            id: 'custpage_expsublist_quote',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Quote',
        });//.isMandatory = true;

        var data = ccQuote.getDefaultExpenses();

        for (var i = 0; i < data.length; i++) {

            var exp = data[i];

            var numLines = sublist.lineCount < 0 ? 0 : sublist.lineCount;

            sublist.setSublistValue({
                id: 'custpage_expsublist_id',
                line: numLines,
                value: exp.id
            });
    
            sublist.setSublistValue({
                id: 'custpage_expsublist_item',
                line: numLines,
                value: exp.name
            });0
    
            sublist.setSublistValue({
                id: 'custpage_expsublist_cost',
                line: numLines,
                value: exp.cost
            });
        }

        return sublist;
    }
    
    return {
        getBomSublist: getBomSublist,
        getLaborSublists: getLaborSublists,
        getExpensesSublist: getExpensesSublist
    };   
});
