$(function () {
    $.service = function () {
        var base = '/api';

        if (arguments.length === 0)
            return base;

        return base + $.map(arguments, function (prop) { return prop; }).join('/');
    };

    $.crud = function (url, type, obj, async) {
        return $.ajax({
            url: url,
            type: type || 'get',
            data: obj ? JSON.stringify(obj) : null,
            contentType: 'application/json; charset=utf-8',
            processData: false,
            dataType: 'json',
            async: (typeof async === "boolean") ? async : true
        });
    };
});