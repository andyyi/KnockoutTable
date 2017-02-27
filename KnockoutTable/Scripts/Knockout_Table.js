var Knockout_Table;
$(function () {
    var $recordtable = $('.knockout-table .table'),
        $filterSlector = $("#selectedFilters"),
        $deleteItemsButton = $('#deletebtn');

    Knockout_Table = function(options) {
        var misc = this;

        misc.defaulTableOptions = {
            uniqueId: "Id",
            selector: "",
            createNewDialogueId: "#createNewDialogue",
            defaultSortColumn: "",
            showSearchField: true,
            columns: [],
            rowStyles: [],
            newObj: {},
            pageSize: 5,
            apiURL: {
                add: "",
                del: "",
                get: "",
                update: "",
                copy: ""
            },
            includeDeletedItems: true,
            showDetailInPopover: false,
            showTopPaginationBar: true,
            filterOptions: [],
            topActionButtons: [],
            bottomActionButtons: [],
            staticOptions: {},
            dynamicOptions: {},
            permissions: {
                read: true,
                write: true,
                update: true,
                del: true
            }
        };

        misc.defaultColumnOptions = {
            field: "",
            type: "",
            visible: true,
            sortable: true,
            searchable: false,
            style: '',
            actions: [],
            html: false
        };

        misc.options = $.extend(true, {}, misc.defaulTableOptions, options);

        $.each(options.columns, function (i, column) {
            if (column.field == "selected") {
                column = { field: "selected", type: "boolean", visible: column.visible, sortable: false, searchable: false, style: 'style="width: 40px; text-align: center; vertical-align: middle;"' };
            } else if (column.field == "action") {
                var _column = { field: "action", title: "Action", type: "", visible: column.visible, sortable: false, searchable: false, style: column.style, actions: [] };
                $.each(column.actions, function (index, action) {
                    if (action.name == 'edit') {
                        _column.actions.push({ name: "edit", title: "edit", icon: "glyphicon glyphicon-edit", actionName: "$root.act_editItem", visible: true });
                    } else if (action.name == 'delete') {
                        _column.actions.push({ name: "delete", title: "delete", icon: "glyphicon glyphicon-remove", actionName: "$root.act_deleteItems", visible: true });
                    } else if (action.name == 'copy') {
                        _column.actions.push({ name: "copy", title: "copy", icon: "glyphicon glyphicon-duplicate", actionName: "$root.act_copyItems", visible: true });
                    } else {
                        _column.actions.push($.extend( {}, { visible: true }, action));
                    }
                });
                column = _column;
            } else {
                column = $.extend(true, {}, misc.defaultColumnOptions, column);
            }

            misc.options.columns[i] = column;
        });

        misc.listItems = ko.observableArray([]);
        misc.selectedItem = ko.observable();
        misc.selectedItems = ko.observableArray([]);
        misc.pageSize = ko.observable(5);
        misc.pageIndex = ko.observable(0);
        misc.currrentSearchValue = ko.observable();
        misc.currentSortColumn = ko.observable(options.defaultSortColumn);
        misc.currentSortDescending = ko.observable(true);
        misc.pageSizes = [
                            { Text: "All", Value: 0 },
                            { Text: "5", Value: 5 },
                            { Text: "10", Value: 10 },
                            { Text: "50", Value: 50 },
                            { Text: "100", Value: 100 }
        ];

        //Show all unhidden filter options in multi-select control.
        misc.selectedFilterOptioins = misc.options.filterOptions.filter(function (item) {
            return !item.hidden();
        }).map(function (item) {
            return item.filterField;
        });

        misc.filteredListItems = ko.computed(function () {
            var list = misc.listItems();

            if (!misc.currrentSearchValue() == "") {
                list = ko.utils.arrayFilter(misc.listItems(), function (obj) {
                    var existed = false;
                    misc.options.columns.forEach(function (item) {
                        if (item.searchable && !existed) {
                            existed = misc.common_getFieldValue(obj, item.field.split(".")).toString().toLowerCase().indexOf(misc.currrentSearchValue().trim().toLowerCase()) > -1;
                        }
                    });

                    return existed;
                });
            }

            misc.options.filterOptions.forEach(function (filterOption) {
                misc.options.columns.forEach(function (column) {
                    if (filterOption.filterField == column.field) {
                        list = ko.utils.arrayFilter(list, function (obj) {
                            if (filterOption.currentValue() != undefined && filterOption.currentValue() != filterOption.ignoredValue) {
                                if (filterOption.compareFunction) {
                                    return filterOption.compareFunction(misc.common_getFieldValue(obj, column.field.split(".")), filterOption.currentValue());
                                } else {
                                    return misc.common_getFieldValue(obj, column.field.split(".")) == filterOption.currentValue();
                                }
                            } else {
                                return true;
                            }
                        });
                    }
                });
            });

            misc.options.columns.forEach(function (item) {
                if (item.title == misc.currentSortColumn() && item.sortable) {
                    var fields = item.field.split(".");
                    list = list.sort(function (leftItem, rightItem) {
                        return misc.common_sort(misc.common_getFieldValue(leftItem, fields), misc.common_getFieldValue(rightItem, fields), item.type);
                    });
                }
            });

            return list;
        }, misc);

        misc.selectAll = ko.pureComputed({
            read: function () {
                return misc.pagedRows().length > 0 && misc.selectedItems().length >= misc.pagedRows().length;
            },
            write: function (value) {
                if (value) {
                    var pagedRows = misc.pagedRows().map(function (obj) {
                        return obj;
                    });

                    misc.selectedItems(pagedRows);
                    return;
                }
                misc.selectedItems([]);
            },
            owner: misc
        });

        misc.maxPageIndex = ko.dependentObservable(function () {
            return misc.pageSize() == 0 ? 0 : Math.ceil(misc.filteredListItems().length / misc.pageSize()) - 1;
        }, misc);

        misc.pagedRows = ko.dependentObservable(function () {
            var size = misc.pageSize() == 0 ? misc.filteredListItems().length : misc.pageSize();
            var start = misc.pageIndex() * size;
            return misc.filteredListItems().slice(start, start + size);
        }, misc);

        misc.pages = ko.dependentObservable(function () {
            var pages = ko.utils.range(0, misc.maxPageIndex());
            if (pages[pages.length - 1] < misc.pageIndex()) {
                misc.pageIndex(0);
            }
            misc.selectedItems([]);
            return pages;
        }, misc);

        misc.selectedItems.subscribe(function () {
            if (misc.selectedItems().length > 0) {
                $deleteItemsButton.attr('disabled', false);
            } else {
                $deleteItemsButton.attr('disabled', true);
            }
        });

        misc.showStatus = function (status) {
            var activeLable = '<span class="label label-success">ACTIVE</span>';
            var inactiveLabel = '<span class="label label-default">INACTIVE</span>';

            return status ? activeLable : inactiveLabel;
        };

        //Actions.
        misc.act_previousPageClick = function () {
            misc.pageIndex(misc.pageIndex() - 1);
        };

        misc.act_nextPageClick = function () {
            misc.pageIndex(misc.pageIndex() + 1);
        };

        misc.act_showPageNumber = function (data) {
            return (misc.pageIndex() == data ||
                   (misc.pageIndex() + 3 >= data && data > misc.pageIndex()) ||
                   (misc.maxPageIndex() - 3 <= data) && data < misc.pageIndex());
        };

        misc.act_downloadItems = function () {
            var defaults = {
                outputMode: 'file',
                tbodySelector: 'tr',
                theadSelector: 'tr',
                csvSeparator: ',',
                type: 'csv',
                ignoreRow: [],
                ignoreColumn: [0, 1],
                fileName: 'Download'
            };

            var currentPageSize = misc.pageSize();

            if (misc.selectedItems().length > 0) {
                var allRows = $recordtable.find('tbody').first().find('tr');
                defaults.ignoreRow = $.map(allRows, function (row, index) {
                    if ($(row).find('input[type=checkbox]:checked').length == 0) {
                        return index + 1;
                    };
                });
            } else {
                misc.pageSize(0);
            }

            $recordtable.tableExport(defaults);

            if (misc.pageSize() != currentPageSize) {
                misc.pageSize(currentPageSize);
            };
        };

        misc.updateItem = function (item, selectedItem) {
            for (var property in item) {
                if (selectedItem[property] != undefined || selectedItem[property] != null) {
                    if (typeof (selectedItem[property]) == 'object') {
                        misc.updateItem(item[property], selectedItem[property]);
                    } else {
                        item[property](typeof (selectedItem[property]) == 'function' ? selectedItem[property]() : selectedItem[property]);
                    }
                }
            }
        };

        misc.act_createItem = function () {

            misc.selectedItem(ko.mapping.fromJS(misc.options.newObj));

            $(misc.options.createNewDialogueId).modal('show');
        };

        misc.act_editItem = function (obj) {

            misc.selectedItem(ko.mapping.fromJS(misc.options.newObj));
            misc.updateItem(misc.selectedItem(), ko.mapping.toJS(obj));

            $(misc.options.createNewDialogueId).modal('show');
        };

        misc.act_showdetails = function (id) {
            var item = undefined;

            misc.listItems().forEach(function (_item) {
                if (_item[misc.options.uniqueId]() == id) {
                    item = ko.mapping.toJS(_item);
                }
            });

            if (item) {
                misc.selectedItem(ko.mapping.fromJS(misc.options.newObj));
                misc.updateItem(misc.selectedItem(), ko.mapping.toJS(item));

                $(misc.options.createNewDialogueId).modal('show');
            } else {
                Knockout_Table.Messaging.Error("Fails to review this item's details.");
            }
        };

        misc.initFormValidate = function () {

            $(misc.options.createNewDialogueId + ' form').validate({
                errorClass: 'error',
                validClass: 'success',
                errorElement: 'i',
                errorPlacement: function (error, element) {
                    error.css("color", "red");

                    if (element.attr('name').indexOf('date') > -1) {
                        error.insertAfter(element.parent());
                        return;
                    }

                    error.insertAfter(element);
                },
                rules: {},
                submitHandler: function (form) {

                    var id = misc.selectedItem()[misc.options.uniqueId](),
                        savedObj = ko.mapping.toJS(misc.selectedItem());

                    if (id == 0) {
                        $.crud($.service(misc.options.apiURL.add), 'POST', savedObj)
                            .done(function (data) {
                                if (data[misc.options.uniqueId] > 0) {

                                    //Initialize some undefined properties with the new object.
                                    misc.updateUndefinedProperty(data, misc.options.newObj);

                                    misc.listItems.push(ko.mapping.fromJS(data));

                                    Knockout_Table.Messaging.Success("Create item successfully");
                                    $(misc.options.createNewDialogueId).modal('hide');

                                    misc.selectedItem(undefined);
                                } else {
                                    Knockout_Table.Messaging.Error("Failed to create item");
                                }
                            });
                    } else {
                        $.crud($.service(misc.options.apiURL.update + "/" + id), 'PUT', savedObj)
                            .done(function (data) {
                                misc.listItems().forEach(function (item) {
                                    if (item[misc.options.uniqueId]() == id) {
                                        misc.updateUndefinedProperty(data, misc.options.newObj);

                                        misc.updateItem(item, data);
                                    }
                                });

                                Knockout_Table.Messaging.Success("Update item successfully");
                                $(misc.options.createNewDialogueId).modal('hide');

                                misc.selectedItem(undefined);
                            });
                    }

                    return false;
                }
            });           
        }

        misc.act_copyItems = function (row) {
            var ids = [], selectionTitle = "Copy Item(s)", noSelectionMessage = "No records selected to copy!",
                confirmedMessage = "Are you sure you want to copy the selected item(s)?";

            if (row[misc.options.uniqueId] != undefined) {
                ids.push(row[misc.options.uniqueId]());
            } else {
                ids = jQuery.map(misc.selectedItems(), function (index) {
                    return index.Id();
                });
                var titleText = "Copy Record(s)";
                var noCheckedMsg = "please check at least one record";
            }

            if (ids.length > 0) {
                var callback = function () {
                    if (misc.options.apiURL.copy) {
                        $.crud($.service(misc.options.apiURL.copy), 'POST', ids)
                         .done(function (data) {
                             data.forEach(function (item) {
                                 misc.listItems.push(ko.mapping.fromJS($.extend(true, misc.options.newObj, item)));
                             });

                             Knockout_Table.Messaging.Success("Copy items successfully.");
                         });
                    } else {
                        Knockout_Table.Messaging.Warning("NOT implemented yet");
                    }

                };
                misc.confirmDialogue(selectionTitle, confirmedMessage, callback);
            } else {
                misc.noSelectionWarningDialogue(selectionTitle, noSelectionMessage);
            }
        };

        misc.act_deleteItems = function (row) {
            var ids = [], selectionTitle = "Delete Item(s)", noSelectionMessage = "No records selected to delete!",
                confirmedMessage = "Are you sure you want to delete the selected item(s)?";

            if (row[misc.options.uniqueId] != undefined) {
                ids.push(row[misc.options.uniqueId]());
            } else {
                ids = jQuery.map(misc.selectedItems(), function (index) {
                    return index.Id();
                });
                var titleText = "Delete Record(s)";
                var noCheckedMsg = "please check at least one record";
            }

            if (ids.length > 0) {
                var callback = function () {

                    function deleteItems(ids) {
                        ids.forEach(function (id) {
                            //var index = misc.listItems().map(function (item) {
                            //    return item[misc.options.uniqueId]();
                            //}).indexOf(id);

                            //if (index > -1) {
                            //    misc.listItems.splice(index, 1);
                            //}

                            misc.listItems.remove(function (item) {
                                return item[misc.options.uniqueId]() == id;
                            });
                        });

                        misc.selectedItems([]);

                        Knockout_Table.Messaging.Success("Delete items successfully.");
                    }

                    if (misc.options.apiURL.del) {
                        $.crud($.service(misc.options.apiURL.del), 'POST', ids)
                         .done(function (data) {
                             //For some features, we would like to keep the inactive (soft deleted) records in table, since we have "show active" flag to see them under some purpose.
                             if (misc.options.includeDeletedItems) {
                                 data.forEach(function (record) {

                                     //misc.updateUndefinedProperty(record, misc.options.newObj);

                                     //misc.listItems().forEach(function (item) {
                                     //    if (item[misc.options.uniqueId]() == record[misc.options.uniqueId]) {
                                     //        misc.updateItem(item, record);
                                     //    }
                                     //});

                                     var index = -1;
                                     var searched = ko.utils.arrayFirst(misc.listItems(), function (item, _index) {
                                         index = _index;
                                         return item[misc.options.uniqueId]() == record[misc.options.uniqueId];
                                     });

                                     if (searched) {
                                         misc.listItems.remove(searched);
                                         misc.listItems.splice(index, 0, ko.mapping.fromJS(record));
                                     }
                                 });

                                 misc.selectedItems([]);
                                 Knockout_Table.Messaging.Success("Delete items successfully.");
                             } else {
                                 deleteItems(data.map(function (item) {
                                     return item[misc.options.uniqueId];
                                 }));
                             }
                         });
                    } else {
                        deleteItems(ids);
                    }
                };
                misc.confirmDialogue(selectionTitle, confirmedMessage, callback);
            } else {
                misc.noSelectionWarningDialogue(selectionTitle, noSelectionMessage);
            }
        };

        misc.act_search = function () {
            var filterValue = misc.currrentSearchValue();
            if (filterValue != undefined) {
                misc.currrentSearchValue(filterValue);
            }
        };

        misc.act_sort = function (column) {

            var find = misc.options.columns.filter(function (item) {
                return item.sortable && item.title == column;
            });

            if (find.length == 0) {
                return;
            }

            misc.currentSortColumn(column);
            misc.act_sortDescending(column);
        };

        misc.updateUndefinedProperty = function (obj, newObj) {
            for (var property in obj) {
                if (obj[property] == null || obj[property] === undefined) {
                    obj[property] = misc.options.newObj[property];
                } else {
                    if (typeof (obj[property]) == 'object' && newObj[property]) {
                        misc.updateUndefinedProperty(obj[property], newObj[property]);
                    }
                }
            }
        };

        misc.act_sortDescending = function (column) {
            $('th').each(function () {
                $(this).find('span').removeClass('glyphicon glyphicon-chevron-up').removeClass('glyphicon glyphicon-chevron-down');
            });
            var th = $('th:contains("' + column + '")');
            var sortDescending = (th.data('sort') == 'desc') ? true : false;
            if (sortDescending) {
                th.data('sort', 'asc');
                th.find('span').addClass('glyphicon glyphicon-chevron-down');
            } else {
                th.data('sort', 'desc');
                th.find('span').addClass('glyphicon glyphicon-chevron-up');
            }

            this.currentSortDescending(sortDescending);
        };

        misc.common_sort = function (leftItem, rightItem, type) {
            var _leftItem, _rightItem;

            switch (type) {
                case 'string':
                    _leftItem = leftItem.trim().toLowerCase();
                    _rightItem = rightItem.trim().toLowerCase();

                    break;

                case 'date':
                    _leftItem = new Date(leftItem);
                    _rightItem = new Date(rightItem);

                    break;

                default:
                    _leftItem = leftItem;
                    _rightItem = rightItem;

                    break;
            }

            return (misc.currentSortDescending())
                            ? _leftItem == _rightItem ? 0 : (_leftItem < _rightItem ? -1 : 1)
                            : _leftItem == _rightItem ? 0 : (_leftItem > _rightItem ? -1 : 1);
        };

        misc.common_compareBoolean = function (value) {
            return value;
        };

        misc.common_compareNumberInRange = function (value, range) {
            return value >= range.min && value <= range.max;
        };

        misc.common_compareStringInArray = function (value, lists) {
            return lists.filter(function (item) {
                return item == value;
            }).length > 0;
        };

        misc.common_getFieldValue = function (value, fields) {
            if (fields.length == 1) {
                if (value[fields[0]] instanceof Array) {
                    return value[fields[0]];
                }

                return typeof (value[fields[0]]) == 'object' ? value[fields[0]] : (typeof (value[fields[0]]) == 'function' ? value[fields[0]]() : value[fields[0]]);
            } else {
                var _value = value[fields[0]];
                var _fields = [];

                for (index in fields) {
                    if (index > 0) {
                        _fields.push(fields[index]);
                    }
                };

                return misc.common_getFieldValue(_value, _fields);
            }
        };

        misc.confirmDialogue = function (title, message, callback) {
            var confirmModal = $('<a id="confirmDialogue" href="#" class="btn confirModal" hidden >Confirm</a>');

            confirmModal.confirmModal({
                confirmTitle: title,
                confirmMessage: message,
                confirmOk: 'Yes',
                confirmCancel: 'Cancel',
                confirmDirection: 'rtl',
                confirmStyle: 'primary',
                confirmCallback: callback,
                confirmDismiss: true,
                confirmAutoOpen: false
            });

            confirmModal.click();
        };

        misc.noSelectionWarningDialogue = function (title, message) {
            var confirmModal = $('<a id="confirmDialogue" href="#" class="btn confirModal" hidden >Confirm</a>');

            confirmModal.confirmModal({
                confirmTitle: title,
                confirmMessage: message,
                confirmNoCancelBtn: true,
                confirmDirection: 'rtl',
                confirmStyle: 'primary',
                confirmDismiss: true,
                confirmAutoOpen: false
            });

            confirmModal.click();
        };

        //Initial multi-select default options and event.
        misc.initSelectFilterSelector = function () {
            //Method to hide/show specified element.
            function hiddenFilterOption(selectedField, hidden) {
                for (var index = 0; index < misc.options.filterOptions.length; index++) {
                    if (selectedField == misc.options.filterOptions[index].filterField) {
                        misc.options.filterOptions[index].hidden(hidden);
                        misc.options.filterOptions[index].currentValue(misc.options.filterOptions[index].ignoredValue);
                    }
                }
            }

            $filterSlector.multiselect({
                enableHTML: true,
                multiselect: true,
                buttonText: function () {
                    return '<span class="glyphicon glyphicon-filter" aria-hidden="true"></span>';
                },
                buttonTitle: function () { return "Filter"; },
                onChange: function (option, checked) {                   //Hide/show the selected options in multi-select control.
                    if (checked) {
                        hiddenFilterOption($(option).val(), false);     //The selected option's value is the field name.
                    }
                    else {
                        hiddenFilterOption($(option).val(), true);
                    }
                }
            });

            $(misc.options.createNewDialogueId).on('shown.bs.modal', function () {
                misc.initFormValidate();
            });
        };

        //Initial the filter control (Dropdown list). Here we can 
        misc.initialStaticSelectItems = function () {
            for (var index = 0; index < misc.options.filterOptions.length; index++) {
                var filterOption = misc.options.filterOptions[index];

                if (filterOption.type == 'select') {
                    if (filterOption.staticOption) {
                        if (misc.options.staticOptions[filterOption.optionsFrom] != undefined) {
                            misc.options.staticOptions[filterOption.optionsFrom].forEach(function (option) {
                                filterOption.options.push(option);

                                //Set the current value with default value (Actually the current value already been reset in the bootstrap first data-bindings, so we have to reset it back to default value)
                                if (filterOption.defaultValue != undefined) {
                                    filterOption.currentValue(filterOption.defaultValue);
                                }
                            })
                        }
                    }
                }
            };
        };

        //Initial the filter control (Dropdown list). 
        misc.initialDynamicSelectItems = function (property) {
            for (var index = 0; index < misc.options.filterOptions.length; index++) {
                var filterOption = misc.options.filterOptions[index];

                if (filterOption.type == 'select') {
                    if (!filterOption.staticOption && filterOption.optionsFrom == property) {
                        if (misc.options.dynamicOptions[filterOption.optionsFrom] != undefined) {
                            misc.options.dynamicOptions[filterOption.optionsFrom].selectOptions().forEach(function (option) {
                                filterOption.options.push(option);

                                //Set the current value with default value (Actually the current value already been reset in the bootstrap first data-bindings, so we have to reset it back to default value)
                                if (filterOption.defaultValue != undefined) {
                                    filterOption.currentValue(filterOption.defaultValue);
                                }
                            })
                        }
                    }
                }
            };
        };

        misc.setTopActionButtons = function (actionButtons) {
            $.each(actionButtons, function (index, button) {
                if (button.name == 'create') {
                    misc.options.topActionButtons.push({ name: 'create', title: "Create", visible: true, action: misc.act_createItem });
                } else {
                    misc.options.topActionButtons.push(button);
                }
            });
        };

        misc.setbottomActionButtons = function (actionButtons) {
            $.each(actionButtons, function (index, button) {
                if (button.name == 'delete') {
                    misc.options.bottomActionButtons.push({
                        name: 'delete', title: "Delete", visible: true, disabled: false, action: misc.act_deleteItems
                    });
                } else if (button.name == 'copy') {
                    misc.options.bottomActionButtons.push({
                        name: 'copy', title: "Copy", visible: true, disabled: false, action: misc.act_copyItems
                    });
                } else if (button.name == 'download') {
                    misc.options.bottomActionButtons.push({
                        name: 'download', title: "Download", visible: true, disabled: false, action: misc.act_downloadItems
                    });
                } else {
                    misc.options.bottomActionButtons.push(button);
                }
            });
        };

        //We can re-write the afterrendercallback method in real view model.
        misc.afterRenderCallBack = function () {
            if (misc.options.showDetailInPopover) {
                $('[data-toggle="popover"]').popover({
                    placement: function (tip, element) {
                        return $(element).offset().top - window.scrollY - 400 <= 0 ? 'bottom' : 'top';
                    }
                });
            }
        };

        misc.getRecordDetail = function (obj) {

            function getValue(_obj) {
                var _popoverContent = [];

                for (property in _obj) {
                    if (typeof (_obj[property]) == 'function') {
                        _popoverContent.push('<tr><td style="width: 30%;">' + property + ': </td><td style="width: 70%;">' + _obj[property]() + '</td></tr>');
                    } else {
                        _popoverContent.push(getValue(obj[property]));
                    }
                }
                return _popoverContent.join('');
            }

            var popoverContent = ['<table class="table table-condensed small">', getValue(obj), '</table>'];

            return popoverContent.join('');
        }

        misc.initialBootstrapTableHtml = function () {

            //I: Set up HTML and data-bidings;
            var table = $(misc.options.selector + ' .knockout-table .table');
            var html = ['<thead>',
                        '<tr>'
            ];

            misc.options.columns.forEach(function (item) {
                var style = (item.style != undefined ? item.style : '');
                if (item.field == "selected") {
                    if (item.visible) {
                        html.push('<th ' + style + '>',
                                     '<input type="checkbox" data-bind="checked: selectAll, attr: {disabled: pagedRows().length == 0}" />',
                                  '</th>');
                    }
                } else {
                    html.push('<th ' + (item.sortable ? 'class="sortable" ' + (misc.currentSortColumn() == item.title ? 'data-sort="asc" ' : 'data-sort="desc" ') : '') + (item.visible ? '' : 'hidden') + ' data-bind="click: act_sort.bind($data, \'' + item.title + '\')"' + style + '>' + item.title,
                                item.sortable ? '<span class="pull-right' + (misc.currentSortColumn() == item.title ? ' icon glyphicon glyphicon-chevron-down' : '') + '"></span>' : '',
                             '</th>');
                }
            });

            html.push('</tr>',
                '</thead>',
                '<tbody data-bind="foreach: {data: pagedRows, afterRender: afterRenderCallBack }">',
                '<tr',
                misc.options.showDetailInPopover ? ' data-html="true" data-title="Details" data-container="body" data-trigger="hover" data-toggle="popover"' : '',
                (misc.options.showDetailInPopover || misc.options.rowStyles.length > 0) ? ' data-bind="' : '',
                misc.options.showDetailInPopover ? ' attr: { \'data-content\': $root.getRecordDetail($data) }' : ''
            );

            if (misc.options.rowStyles.length > 0) {
                html.push((misc.options.showDetailInPopover ? ',' : '') + ' css: {');
                for (var index = 0; index < misc.options.rowStyles.length; index++) {
                    var item = misc.options.rowStyles[index];
                    html.push('\'' + item.css + '\': $root.' + item.action.replace('value', '$data.' + item.field + '()'));
                    if (index < misc.options.rowStyles.length - 1) {
                        html.push(',');
                    }
                };
                html.push('}');
            }

            html.push('">');

            misc.options.columns.forEach(function (item) {
                var style = (item.style != undefined ? item.style : '');
                if (item.field == "selected") {
                    if (item.visible) {
                        html.push('<td ' + style + '>',
                                     '<input type="checkbox" data-bind="checkedValue: $data, checked: $parent.selectedItems" />',
                                  '</td>');
                    }
                } else if (item.field == "action") {
                    if (item.visible) {
                        html.push('<td ' + style + ' >');
                        item.actions.forEach(function (action) {
                            if (action.visible) {
                                if (action.formatter) {
                                    html.push(action.formatter());
                                } else {
                                    html.push('<a class="itemaction ' + action.title + '" href="javascript:void(0)" title="' + action.title + '" data-bind="click: ' + action.action + (action.visibleDataBind ? (', visible: ' + action.visibleDataBind) : '') + '" >',
                                                '<i class="' + action.icon + '">',
                                                '</i>',
                                              '</a>');
                                }

                            }
                        })

                        html.push('</td>');
                    }
                } else {
                    var field = '';
                    var properties = item.field.split('.');

                    if (properties.length >= 1) {
                        field = properties[0];

                        for (var index = 1; index < properties.length; index++) {
                            field += '.' + properties[index];
                        }
                    }

                    html.push('<td ' + style + ' ' + (item.visible ? '' : 'hidden') + ' data-bind="' + (item.html ? 'html: ' : 'text: ') + (item.formatter != undefined ? item.formatter(field) : field) + '"></td>');
                }
            });

            html.push(['</tr>', '</tbody>']);

            $(table).html(html.join(''));
        };

        //Fill data into tables.
        misc.loadData = function (data) {
            if (data != undefined) {

                //Initialize some undefined or null properties for retrieved data from server.
                if (misc.options.newObj) {
                    data.forEach(function (item) {
                        misc.updateUndefinedProperty(item, misc.options.newObj);
                    });
                }

                data.forEach(function (item) {
                    misc.listItems.push(ko.mapping.fromJS(item));
                });

                //III: We probably need to collect the options after the listitems get initialized.
                misc.initialStaticSelectItems();
            } else {
                $.crud($.service(misc.options.apiURL.get), 'GET')
                 .done(function (items) {

                     if (misc.options.newObj) {
                         items.forEach(function (item) {
                             misc.updateUndefinedProperty(item, misc.options.newObj);
                         });
                     }

                     items.forEach(function (item) {
                         misc.listItems.push(ko.mapping.fromJS(item));
                     });

                     //III: We probably need to collect the options after the listitems get initialized.
                     misc.initialStaticSelectItems();
                 })
                .fail(function (data) {
                    console.log(data);
                });
            }

            //Load the dynamic data for select options
            for (var property in misc.options.dynamicOptions) {
                function loadOption(_property) {
                    $.crud($.service(misc.options.dynamicOptions[_property].apiUrl), 'GET')
                     .done(function (data) {
                         misc.options.dynamicOptions[_property].selectOptions(data.map(function (item) {
                             return {
                                 text: misc.common_getFieldValue(item, misc.options.dynamicOptions[_property].textName.split(".")), value: item[misc.options.dynamicOptions[_property].valueName]
                             };
                         }));

                         misc.initialDynamicSelectItems(_property);
                     });
                }

                loadOption(property);
            }
        }

        //I: Initial the knockout data-biding on HTML.
        misc.initialBootstrapTableHtml();
    };
});