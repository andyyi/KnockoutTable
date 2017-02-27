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



## Notice

This JS plug-in is mainly for the people who is familiar with Knockout.JS. Since the basic design is to build the HTML and then make the data binding. So some code is a little difficult to understanding when you configure the options. I list some of the examples as below. At this moment, I have no much time to make optimization, but if someone else is really intested in optimizing the code, please make one pull request.
