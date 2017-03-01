# KnockoutTable

## Background

The problem I'm facing is that I'm trying to use Knockout.JS to bind all kinds of data and show them in table. While I have to write lots of duplicate code for pagination, sort, data formatting, actions, initialization, and so on. So this JS plug-in is is mainly focusing on resolve the table data-binding via Knockout.js. It provider all kinds of features as below:

* Basic Data showing in table
* Sorting
* Search
* Web API binding for data CRUD
* Data formatting
* Customized Filter
* ... ...

Here are some screenshots for you to have general ideas of what this JS-Plug-in is.

![2017-02-27_0856](https://cloud.githubusercontent.com/assets/5318516/23345530/b1b5aa7a-fcca-11e6-90c0-3b1d87acaf32.png)

![2017-03-01_1151](https://cloud.githubusercontent.com/assets/5318516/23445312/805850a2-fe75-11e6-88c0-6d809fb4801d.png)

## How to use it?

Here is one very simple example.You have to take the following two steps (I create one asp.net MVC project as one demo)

1. Add the partial view "_Knockout-Table" in your view file.
2. Add the configuration options as below:

```javascript
    var options = {
        uniqueId: "Id",
        defaultSortColumn: "Name",
        columns: [
            { field: "selected", type: "boolean", visible: true },
            {
                field: "action", title: "Action", type: "", visible: true, style: 'style="width: 60px; text-align: center; vertical-align: middle;"',
                actions: [
                        { title: "edit", icon: "glyphicon glyphicon-edit", action: "$root.act_editItem" },
                        { title: "delete", icon: "glyphicon glyphicon-trash", action: "$root.act_deleteItems" }
                ]
            },
            { field: "Id", title: "", type: "number", visible: false, sortable: false },
            {
                field: "Name", title: "Name", type: "string", searchable: true, html: true, style: 'style="width: 200px; vertical-align: middle;"',
                formatter: function (field) {
                    return "'<a onclick=&quot;viewModel.act_showdetails(' + Id() +')&quot; style=&quot;text-decoration: underline;cursor: pointer;&quot;>' + " + field + "() + '</a>'";
                }
            },
            { field: "Introduction", title: "Introduction", type: "string", searchable: false },
            { field: "URL", title: "Url", type: "string", searchable: false, visible: false },
            {
                field: "Owner.EnglishName", title: "Owner", type: "string", searchable: false, style: 'style="width: 120px"', html: true,
                formatter: function (field) {
                    return "Owner.Id() == 0 ? '': '<a href=&quot;/employee/details/' + Owner.Id() +'&quot; style=&quot;text-decoration: underline; cursor: pointer;&quot;>' + Owner.EnglishName() + '</a>'";
                }
            },
            {
                field: "StartDateUtc", title: "Start Date", type: "datetime", visible: true, style: 'style="width: 120px;"',
                formatter: function (field) {
                    return "moment(" + field + "()).format('MMM-DD-YYYY')";
                }
            },
            {
                field: "EndDateUtc", title: "End Date", type: "datetime", visible: true, style: 'style="width: 120px;"',
                formatter: function (field) {
                    return field + "().length == 0 ? '' : moment(" + field + "()).format('MMM-DD-YYYY')";
                }
            },
            {
                field: "Status", title: "Status", type: "", sortable: true, html: true, style: 'style="width: 60px; vertical-align: middle;"',
                formatter: function (field) {
                    return "$root.showStatus(" + field + "())";
                }
            },
            {
                field: "Active", title: "Active", type: "boolean", visible: false
            }
        ],
        rowStyles: [
            {
                css: "highlighactive", field: "Active", action: "common_compareBoolean(!value)"
            }
        ],
        newObj: {
            Id: 0, Name: "", Introduction: "", OwnerId: 0, URL: "", Status: 0, Owner: { Id: 0, EnglishName: "" }, StartDateUtc: "", EndDateUtc: "", Active: true
        },
        apiURL: {
            del: "/project/delete",
            get: "/project/getprojects",
            update: "/project/update",
            add: "/project/create"
        },
        filterOptions: [
            {
                filterField: "Status", title: "Status", type: "select", ignoredValue: -1, currentValue: ko.observable(-1), hidden: ko.observable(false),
                staticOption: true, optionsFrom: "Status",
                options: ko.observableArray([{ text: "Status", value: -1 }])
            }
        ],
        staticOptions: {
            Status: [
                { text: "New", value: 0 },
                { text: "Complete", value: 1 },
                { text: "Going", value: 2 },
                { text: "Pending", value: 3 },
                { text: "Cancelled", value: 4 }
            ]
        },
        topActionButtons: [
            { name: 'create' }
        ],
        bottomActionButtons: [
            { name: "delete" }
        ]
    };

    viewModel = new Knockout_Table(options);

    viewModel.showStatus = function (status) {
        var html,
            cssClasses = [
                    { className: "label-default", value: 0, text: "New" },
                    { className: "label-success ", value: 1, text: "Complete" },
                    { className: "label-warning", value: 2, text: "Going" },
                    { className: "label-info", value: 3, text: "Pending" },
                    { className: "label-danger", value: 4, text: "Cancelled" }
            ];

        cssClasses.forEach(function (item) {
            if (item.value == status) {
                html = '<span class="label ' + item.className + '">' + item.text + '</span>';
            }
        })

        return html;
    };

    ko.applyBindings(viewModel, $(".knockout-table").get(0));
    ko.applyBindings(viewModel, $("#createNewDialogue").get(0));
    viewModel.initSelectFilterSelector();

    viewModel.loadData([
        { Id: 1, Name: "MMS 1.4", Introduction: "", OwnerId: 0, URL: "", Status: 0, Owner: { Id: 0, EnglishName: "Andy" }, StartDateUtc: moment().format("YYYY-MM-DD"), EndDateUtc: "", Active: true },
        { Id: 2, Name: "DNN 8.0", Introduction: "", OwnerId: 0, URL: "", Status: 1, Owner: { Id: 0, EnglishName: "" }, StartDateUtc: "", EndDateUtc: "", Active: true },
        { Id: 3, Name: "CareLane", Introduction: "", OwnerId: 0, URL: "", Status: 2, Owner: { Id: 0, EnglishName: "" }, StartDateUtc: "", EndDateUtc: "", Active: true },
        { Id: 4, Name: "JQuery Data Bining 2.0", Introduction: "", OwnerId: 0, URL: "", Status: 3, Owner: { Id: 0, EnglishName: "" }, StartDateUtc: "", EndDateUtc: "", Active: true },
        { Id: 5, Name: "Perfect Class Dring System", Introduction: "", OwnerId: 0, URL: "", Status: 4, Owner: { Id: 0, EnglishName: "" }, StartDateUtc: "", EndDateUtc: "", Active: true },
        { Id: 6, Name: "VR 1.0 TS", Introduction: "", OwnerId: 0, URL: "", Status: 0, Owner: { Id: 0, EnglishName: "" }, StartDateUtc: "", EndDateUtc: "", Active: true }
    ]);

    var viewAction = {

        initDatepicker: function () {
            $('#createNewDialogue').on('shown.bs.modal', function () {
                $('.form_date').datetimepicker({
                    format: 'mm/dd/yyyy',
                    weekStart: 1,
                    todayBtn: 'linked',
                    autoclose: true,
                    todayHighlight: 1,
                    startView: 2,
                    minView: 2,
                    forceParse: 0
                });
            });
        }
    }

    viewAction.initDatepicker();
```

Here are some key points when you defind the columns.

* Any property you would used in the knockout-table, please defind it in the options. If you would NOT show it, please set it visible: false.
* Generally, you are asked to defind the type of the column. That is because search and sort need to know the column type.
* For the action icon, you are allow to use any other fonts, such as fontawesome, etc. The property "icon" is just for add the related class into the "a" elements.
* You are recommend to user Web API to retrieve data from server. We are expecting to get one array of object, such as 

![2017-02-27_1050](https://cloud.githubusercontent.com/assets/5318516/23347074/84353ed4-fcda-11e6-9792-a085ab0d6f70.png)

To set the Web API, please go to the apiURL property as below:

```javascript

    apiURL: {
        del: "/project/delete",         //POST
        get: "/project/getprojects",    //Get
        update: "/project/update",      //PUT
        add: "/project/create"          //POST
    }
    
```

* We are asked to make each row unique, so please set the uniqueId column. For example, if your data is unique by ID, then please use "ID" here, else if it is "Name", then please "Name", this property can not be NULL or undefined.

* For "newObj", it is mainly for crateing new object. If you would like to create new object throught click "Create", then please defind this property. It is mainly for initinalizing the new object in dialogue window.

* For the "select" element in your page, you are allow to bind the select options with options defined in the table options. We have two kinds of options: "staticOptions" and "dynamicOptions". I show two example regarding how to defind them:


```javascript

    filterOptions: [
            {
                filterField: "Status", title: "Status", type: "select", ignoredValue: -1, currentValue: ko.observable(-1), hidden: ko.observable(false),
                staticOption: true, optionsFrom: "Status",
                options: ko.observableArray([{ text: "Status", value: -1 }])
            }
        ]
    
```

```javascript

    dynamicOptions: {
            Teams: { apiUrl: "/team/getteams", selectOptions: ko.observableArray([]), textName: "Name", valueName: "Id" },
            Titles: { apiUrl: "/title/gettitles", selectOptions: ko.observableArray([]), textName: "Name", valueName: "Id" }
        }
    
```

* For the viewModel, we recommend you to create your own functions if you need to more. Such as the other actions you defined, for example, you would like to show the equipments and license for the selected items. You can definded the actions in actions property as below:

```javascript
    {
        field: "action", title: "Action", type: "", visible: true, style: 'style="width: 90px; text-align: center;"',
        actions: [
            { title: "edit", icon: "fa fa-edit", action: "$root.act_editItem", visibleDataBind: "$data.Active" },
            { title: "equipments", icon: "fa fa-print", action: "$root.act_showEquipments", visibleDataBind: "$data.Active && $data.HasEquipments()" },
            { title: "licenses", icon: "fa fa-file", action: "$root.act_showLicenses", visibleDataBind: "$data.Active && $data.HasLicenses()" },
            { title: "delete", icon: "fa fa-trash", action: "$root.act_deleteItems", visibleDataBind: "$data.Active" }
        ]
    }
```

By the way, you need to implement the actions as below in your viewModel.

```javascript
    viewModel.act_showEquipments = function () {
        self.location = "/Settings/OfficeStuff/" + this.Id() + "/equipments";
    };

    viewModel.act_showLicenses = function () {
        self.location = "/Settings/OfficeStuff/" + this.Id() + "/licenses";
    };

```


Knockout-Table Options:

* uniqueId - The column name which to identify the unique of the row in table (default value: "Id")

* selector - The CSS selector for binding ko view model to DOM  (NOT allow to NULL)

* createNewDialogueId - The CSS selector for you to select the diglogue for edit/create new items. For example:

```javascript
<div id="createNewDialogue" class="modal fade" tabindex="-1" data-bind="with: selectedItem">
    <div class="modal-dialog">
        <div class="modal-content">
            <form>
                <div class="modal-header">
                    <h4 class="modal-title" data-bind="text: (Id() > 0 ? 'Edit' : 'Create New') + ' Title'"></h4>
                </div>
                <div class="modal-body">
                    <div class="form-group row">
                        <label class="col-md-3 control-label">Name:</label>
                        <div class="col-md-9">
                            <input class="form-control" name="name" type="text" data-bind="value: Name" minlength="2" maxlength="100" placeholder="Name" required />
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary" >Save changes</button>
                </div>
            </form>
        </div>
    </div>
</div>

```

* defaultSortColumn - The default sort column when the table render completes. You have to make sure this column is defined in  "column", else it would NOT working

* showSearchField - Show the search field and cancel button, or not. (Default value: true)

* columns - Defined all columns you would like to involved in your view model lists. It has the following options:

  - field - Field name in your object retrieved from server or defined in your JS code.
  
  - type - The type of the column, currently we support "string", "int", "bool", "date", and so on.
  
  - visible - "true" or "false" (Default value: true)
  
  - sortable - "true" or "false" (Default value: true)
  
  - searchable - "true" or "false" (Default value: false)
  
  - style - CSS style. This would be applied in the specfied column.
  
  - actions - This is only for "action" column. You are suggest to use the format as below, else it would error out in the data-bindings.
  
```javascript  
    {
        field: "action", title: "Action", type: "", visible: true, style: 'style="width: 60px; text-align: center; vertical-align: middle;"',
        actions: [
            { title: "edit", icon: "glyphicon glyphicon-edit", action: "$root.act_editItem" },
            { title: "delete", icon: "glyphicon glyphicon-trash", action: "$root.act_deleteItems" }
        ]
    }
            
```
  
  - html - "true" or "false". For some column, we would like to show html content instead of text. (Default value: false)

* rowStyles - The style of specified row. You are recommended to use the following format.
 
 ```javascript 
    rowStyles: [
        {
            css: "highlighactive", field: "Active", action: "common_compareBoolean(!value)"
        }
    ]   
```




* apiURL - API urls for CRUD data. 

```javascript
    apiURL: {
        del: "/project/delete",
        get: "/project/getprojects",
        update: "/project/update",
        add: "/project/create"
    }
```

* newObj - You are recommended to defined newObj if you would like to edit and create new object. We are user ko.mapping.fromJS method to create new object and format some properties if they are not NULL or undefined in your data list.

* pageSize: Page size of each page (Default value: 5)

* includeDeletedItems - For some special purpose, we would like to still show the deleted items (not hard delete in DB) with some flags (for example active = false). (Default value: true)

* showDetailInPopover - If you would like to show the detail info in popover window when you hover the mouse on the row, then set this to true. (Default value: false)

![2017-03-01_1227](https://cloud.githubusercontent.com/assets/5318516/23445982/85614478-fe7a-11e6-9074-b32ac2b35f3d.png)

* showTopPaginationBar - Show the top pagination or not (Default value: true)

* filterOptions - All items in this property would be list in the filter multi-select control and also showing at the top bar. For example:

![2017-03-01_1230](https://cloud.githubusercontent.com/assets/5318516/23446036/e76b3bba-fe7a-11e6-86b9-9d91d324bd44.png)

```javascript
    filterOptions: [
        {
            filterField: "ReviewSchedule.Id", title: "Review Schedule", type: "select", ignoredValue: -1, defaultValue: (reviewScheduleId ? reviewScheduleId : - 1), currentValue: ko.observable(reviewScheduleId ? reviewScheduleId : - 1), hidden: ko.observable(false),
            staticOption: false, optionsFrom: "ReviewSchedules",
            options: ko.observableArray([{ text: "Review Schedule", value: -1 }])
        },
        {
            filterField: "Status", title: "Status", type: "select", ignoredValue: -1, currentValue: ko.observable(-1), hidden: ko.observable(false),
            staticOption: true, optionsFrom: "Status",
            options: ko.observableArray([{ text: "Status", value: -1 }])
        },
        {
            filterField: "Score", title: "Score", type: "select", ignoredValue: -1, currentValue: ko.observable(-1), hidden: ko.observable(true),
            staticOption: true, optionsFrom: "Scores",
            options: ko.observableArray([{ text: "Rating Score", value: -1 }])
        },
        {
            filterField: "Active", title: "Active?", type: "checkbox", ignoredValue: false, currentValue: ko.observable(true), hidden: ko.observable(true),
        }
    ],

```

* topActionButtons - Define the top actions, for example:

        {
            name: 'Create New', title: "Create New", visible: true, disabled: false,
            action: function () {
                self.location = '/home/createnews';
            }
        }

* bottomActionButtons - Define the bottom actions, for example:

        {
            name: 'changesalary', title: "Change Salary", visible: document.hasAdminPermission, disabled: false,
            action: function () {

                var obj = {
                    employeeId: document.employeeId,
                    reviewScheduleId: "",
                    current: "",
                    comment: ""
                };

                viewModel.changeSalaryViewModel(ko.mapping.fromJS(obj));

                $("#createnewsalarydialogue").modal('show');
            }
        }

* staticOptions - Option data is static and can be defined directly.

        staticOptions: {
            Status: [
                    { text: "New", value: 0 },
                    { text: "Self Review", value: 1 },
                    { text: "Team Review", value: 2 },
                    { text: "Meeting Review", value: 3 },
                    { text: "Finished", value: 4 }
            ],
            Scores: [
                    { text: "Not Evaluated", value: 0 },
                    { text: "Unsatisfied", value: 1 },
                    { text: "Below Expectation", value: 2 },
                    { text: "Meet Expectation", value: 3 },
                    { text: "Above Expectation", value: 4 },
                    { text: "Outstanding", value: 5 }
            ]
        },

* dynamicOptions - Option data need to retrieved from remote server. For example:

        dynamicOptions: {
            Facilities: { apiUrl: "/facility/getfacilities", selectOptions: ko.observableArray([]), textName: "Name", valueName: "Id" },
            ReviewSchedules: { apiUrl: "/reviewschedule/getreviewschedules", selectOptions: ko.observableArray([]), textName: "Title", valueName: "Id" }
        }


## Properties and methods you probably need

* listItems - All data items in the whole table.

* selectedItem - When you edit or create one item, the current edit showing in the dialogue is the selectedItem

* selectedItems - All selected items at this moment

* initSelectFilterSelector - This method should be called after your bind the view model to DOM. Its purpose is to initialize the multiple select control at the top left of table.

* loadData - You need to call this method to load the data either via web api method or your can pass one data (array).


## Notice

This JS plug-in is mainly for the people who is familiar with Knockout.JS. Since the basic design is to build the HTML and then make the data binding. So some code is a little difficult to understanding when you configure the options. I list some of the examples as below. At this moment, I have no much time to make optimization, but if someone else is really intested in optimizing the code, please make one pull request.

MIT License

## Copyright (c) 2017 Andy

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
