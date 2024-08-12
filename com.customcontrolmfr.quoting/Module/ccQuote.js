/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['N/record','N/search'],

function(record,search) {

    function getRevision(revisionId) {

        var data = {
            quantity: 1,
            quote: 0,
            defaultMarkup: 0.20,
            items: []
        };

        if (!revisionId) return data;

        search.create({
            type: search.Type.BOM_REVISION,
            columns: [
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{component.lineid}'
                }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{component.item.id}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: '{component.item}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: '{component.custrecord_ccm_newitem}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: '{component.description}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: '{component.custrecord_ccm_description}'
                }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{component.quantity}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: 'CASE WHEN {component.units} IS NULL THEN {component.custrecord_ccm_units} ELSE {component.units} END'
                }),
                search.createColumn({
                    name: 'formulacurrency',
                    formula: '{component.custrecord_ccm_price}'
                }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{component.custrecord_ccm_vendor.id}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: '{component.custrecord_ccm_vendor}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: '{component.custrecord_ccm_newvendor}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: '{component.custrecord_ccm_manufacturer}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: '{component.custrecord_ccm_mpn}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: '{component.custrecord_ccm_markup}'
                }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{custrecord_ccm_bomrev_quantity}'
                }),
                search.createColumn({
                    name: 'formulacurrency',
                    formula: '{custrecord_ccm_bomrev_cost}'
                }),
                search.createColumn({
                    name: 'formulacurrency',
                    formula: '{custrecord_ccm_bomrev_quote}'
                }),
            ],
            filters: [
                search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.IS,
                    values: parseInt(revisionId)
                })
            ],
        }).run().each(function(result) {

            if (!data.quantity) {

                data.quantity = result.getValue(result.columns[15]);
                data.cost = result.getValue(result.columns[16]);
                data.quote = result.getValue(result.columns[17]);
                data.defaultMarkup = .20;
            }

            data.items.push({
                lineId: result.getValue(result.columns[0]),
                itemId: result.getValue(result.columns[1]),
                item: result.getValue(result.columns[2]),
                newItem: result.getValue(result.columns[3]),
                description: result.getValue(result.columns[4]),
                newDescription: result.getValue(result.columns[5]),
                quantity: result.getValue(result.columns[6]),
                units: result.getValue(result.columns[7]),
                price: result.getValue(result.columns[8]),
                vendorId: result.getValue(result.columns[9]),
                vendor: result.getValue(result.columns[10]),
                newVendor: result.getValue(result.columns[11]),
                manufacturer: result.getValue(result.columns[12]),
                mpn: result.getValue(result.columns[13]),
                markup: result.getValue(result.columns[14])
            });

            return true;
        });

        return data;
    }

    function getRevisionLabor(revisionId) {

        var data = [];

        if (!revisionId) return data;

        search.create({
            type: 'customrecord_ccm_bomlabor',
            columns: [
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{custrecord_ccm_pbomlabor_role.id}'
                }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{custrecord_ccm_pbomlabor_group.id}'
                }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{custrecord_ccm_pbomlabor_quantity}'
                }),
                search.createColumn({
                    name: 'formulacurrency',
                    formula: '{custrecord_ccm_pbomlabor_cost}'
                }),
                search.createColumn({
                    name: 'formulacurrency',
                    formula: '{custrecord_ccm_pbomlabor_quote}'
                }),
            ],
            filters: [
                search.createFilter({
                    name: 'formulanumeric',
                    formula: '{custrecord_ccm_pbomlabor_bomrev.id}',
                    operator: search.Operator.IS,
                    values: parseInt(revisionId)
                })
            ],
        }).run().each(function(result) {

            data.push({
                roleId: parseInt(result.getValue(result.columns[0])),
                groupId: parseInt(result.getValue(result.columns[1])),
                quantity: parseInt(result.getValue(result.columns[2])),
                cost: parseFloat(result.getValue(result.columns[3])),
                quote: parseFloat(result.getValue(result.columns[4]))
            });

            return true;
        });

        return data;
    }

    function getRevisionExpenses(revisionId) {

        var data = [];

        if (!revisionId) return data;

        search.create({
            type: 'customrecord_ccm_bomexpense',
            columns: [
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{custrecord_ccm_pbomexp_item.id}'
                }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{custrecord_ccm_pbomexp_quantity}'
                }),
                search.createColumn({
                    name: 'formulacurrency',
                    formula: '{custrecord_ccm_pbomexp_cost}'
                }),
                search.createColumn({
                    name: 'formulacurrency',
                    formula: '{custrecord_ccm_pbomexp_quote}'
                }),
            ],
            filters: [
                search.createFilter({
                    name: 'formulanumeric',
                    formula: '{custrecord_ccm_pbomexp_bomrev.id}',
                    operator: search.Operator.IS,
                    values: parseInt(revisionId)
                })
            ],
        }).run().each(function(result) {

            data.push({
                itemId: parseInt(result.getValue(result.columns[0])),
                quantity: parseInt(result.getValue(result.columns[1])),
                cost: parseFloat(result.getValue(result.columns[2])),
                quote: parseFloat(result.getValue(result.columns[3]))
            });

            return true;
        });

        return data;
    }

    function getDefaultLabor() {

        var data = [];

        search.create({
            type: 'customrecord_ccm_quotelaborrole',
            columns: [
                search.createColumn({
                    name: 'formulatext',
                    formula: '{custrecord_ccm_laborrolegroup.name}',
                    sort: search.Sort.ASC
                }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{internalid}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: '{custrecord_ccm_name}'
                }),
                search.createColumn({
                    name: 'formulacurrency',
                    formula: '{custrecord_ccm_laborcost}'
                }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{custrecord_ccm_laborrolegroup.internalid}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: "SUBSTR({custrecord_ccm_laborrolegroup.name}, INSTR({custrecord_ccm_laborrolegroup.name}, ':') + 2)"
                }),
            ],
            filters: [
                search.createFilter({
                    name: 'formulatext',
                    formula: '{custrecord_ccm_laborrolegroup}',
                    operator: search.Operator.ISNOTEMPTY
                }),
                search.createFilter({
                    name: 'formulatext',
                    formula: '{isinactive}',
                    operator: search.Operator.IS,
                    values: 'F'
                })
            ],
        }).run().each(function(result) {

            data.push({
                id: parseInt(result.getValue(result.columns[1])),
                name: result.getValue(result.columns[2]),
                cost: result.getValue(result.columns[3]),
                groupId: parseInt(result.getValue(result.columns[4])),
                groupName: result.getValue(result.columns[5]),
            });

            return true;
        });

        return data;
    }

    function getDefaultExpenses() {

        var data = [];

        search.create({
            type: 'customrecord_ccm_quoteexpense',
            columns: [
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{internalid}'
                }),
                search.createColumn({
                    name: 'formulatext',
                    formula: '{custrecord_ccm_expenseitem}',
                    sort: search.Sort.ASC
                }),
                search.createColumn({
                    name: 'formulacurrency',
                    formula: '{custrecord_ccm_expensecost}'
                }),
            ],
            filters: [
                search.createFilter({
                    name: 'formulatext',
                    formula: '{isinactive}',
                    operator: search.Operator.IS,
                    values: 'F'
                })
            ],
        }).run().each(function(result) {

            data.push({
                id: parseInt(result.getValue(result.columns[0])),
                name: result.getValue(result.columns[1]),
                cost: result.getValue(result.columns[2])
            });

            return true;
        });

        return data;
    }

    function setRevision(revisionId, data) {

        log.debug({
            title: 'setRevision',
            details: JSON.stringify(data)
        });

        var objRecord = record.load({
            type: record.Type.BOM_REVISION,
            id: revisionId,
            isDynamic: false,
        });

        objRecord.setValue({
            fieldId: 'custrecord_ccm_bomrev_quantity',
            value: data.quantity
        });

        objRecord.setValue({
            fieldId: 'custrecord_ccm_bomrev_cost',
            value: data.cost
        });

        objRecord.setValue({
            fieldId: 'custrecord_ccm_bomrev_quote',
            value: data.quote
        });

        var numLines = objRecord.getLineCount({
            sublistId: 'component'
        });

        for (var i = numLines - 1; i >= 0; i--) {

            var lineId = objRecord.getSublistValue({
                sublistId: 'component',
                fieldId: 'lineid',
                line: i
            });

            var remove = true;

            for (var j = 0; j < data.items.length; j++) {

                if (lineId == data.items[j].lineId) {
                    
                    updateRecord(objRecord, i, data.items[j]);
                    
                    remove = false;

                    break;
                }
            }
    
            log.debug({
                title: 'Remove',
                details: 'Line ' + i + ': ' + remove
            });

            if (remove) {
                
                objRecord.removeLine({
                    sublistId: 'component',
                    line: i,
                    ignoreRecalc: true
                });
            }
        }

        for (var i = 0; i < data.items.length; i++) {
            
            if (!data.items[i].lineId) updateRecord(objRecord, null, data.items[i]);
        }

        objRecord.save();
    }

    function updateRecord(objRecord, line, item) {

        log.debug({
            title: 'updateRecord',
            details: 'Line ' + line + ': ' + JSON.stringify(item)
        });

        if (!line) {

            line = objRecord.getLineCount({
                sublistId: 'component'
            });

            item.itemId = NEW_ITEM;
        }

        objRecord.setSublistValue({
            sublistId: 'component',
            fieldId: 'item',
            line: line,
            value: item.itemId
        });

        if (parseInt(item.itemId) == NEW_ITEM) {

            if (item.newItem) {

                objRecord.setSublistValue({
                    sublistId: 'component',
                    fieldId: 'custrecord_ccm_newitem',
                    line: line,
                    value: item.newItem
                });
            }

            if (item.description) {

                objRecord.setSublistValue({
                    sublistId: 'component',
                    fieldId: 'custrecord_ccm_description',
                    line: line,
                    value: item.description
                });
            }
        }

        if (item.quantity != null) {

            objRecord.setSublistValue({
                sublistId: 'component',
                fieldId: 'quantity',
                line: line,
                value: item.quantity
            });
        }

        var unitsId = (item.units ? ccItem.getUnitsIdFromServer(item.units) : 1);

        objRecord.setSublistValue({
            sublistId: 'component',
            fieldId: 'custrecord_ccm_units',
            line: line,
            value: unitsId
        });

        if (item.price) {

            objRecord.setSublistValue({
                sublistId: 'component',
                fieldId: 'custrecord_ccm_price',
                line: line,
                value: item.price
            });
        }

        if (item.vendorId) {

            objRecord.setSublistValue({
                sublistId: 'component',
                fieldId: 'custrecord_ccm_vendor',
                line: line,
                value: item.vendorId
            });
        }

        if (item.newVendor) {

            objRecord.setSublistValue({
                sublistId: 'component',
                fieldId: 'custrecord_ccm_newvendor',
                line: line,
                value: item.newVendor
            });
        }

        if (item.manufacturer) {

            objRecord.setSublistValue({
                sublistId: 'component',
                fieldId: 'custrecord_ccm_manufacturer',
                line: line,
                value: item.manufacturer
            });
        }

        if (item.mpn) {

            objRecord.setSublistValue({
                sublistId: 'component',
                fieldId: 'custrecord_ccm_mpn',
                line: line,
                value: item.mpn
            });
        }

        if (item.markup) {

            objRecord.setSublistValue({
                sublistId: 'component',
                fieldId: 'custrecord_ccm_markup',
                line: line,
                value: item.markup
            });
        }
    }
    
    return {
        getRevision: getRevision,
        getRevisionLabor: getRevisionLabor,
        getRevisionExpenses: getRevisionExpenses,
        getDefaultLabor: getDefaultLabor,
        getDefaultExpenses: getDefaultExpenses,
        setRevision: setRevision
    };   
});
