; window.Knockout_Table = (function (window, App, $, toastr) {
    'use strict';
    App = App || {};
    var Messaging = (App.Messaging = App.Messaging || {});

    var makeRedirectOptions = function (options) {
        var opts = { reload: false, replace: false, url: null };

        if ($.isString(options)) {
            $.extend(opts, { url: options });
        } else {
            $.extend(opts, options);
        }

        var opt = {};
        if (opts.url || opts.reload) {
            opt.onHidden = function () {
                if (opts.reload) {
                    window.location.reload();
                } else if (opts.replace) {
                    window.location.replace(opts.url);
                } else {
                    window.location = opts.url;
                }
            };
        }
        return opt;
    };

    Messaging.Error = function (message, title, redirectUrl, container, options) {
        $(container).append('<div id="toast-container" ></div>');
        var opts = $.extend({}, makeRedirectOptions(redirectUrl), { timeOut: 10000 }, options);
        toastr.error(message, title, opts);
    };

    Messaging.Info = function (message, title, redirectUrl, container, options) {
        $(container).append('<div id="toast-container" ></div>');
        var opts = $.extend({}, makeRedirectOptions(redirectUrl), options);
        toastr.info(message, title, opts);
    };

    Messaging.Success = function (message, title, redirectUrl, container, options) {
        $(container).append('<div id="toast-container" ></div>');
        var opts = $.extend({}, makeRedirectOptions(redirectUrl), options);
        toastr.success(message, title, opts);
    };

    Messaging.Warning = function (message, title, redirectUrl, container, options) {
        $(container).append('<div id="toast-container" ></div>');
        var opts = $.extend({}, makeRedirectOptions(redirectUrl), options);
        toastr.warning(message, title, opts);
    };

    toastr.options = {
        closeButton: true,
        closeHtml: '<button type="button"><span class="fa fa-fw fa-times"></span></button>',
        debug: false,
        extendedTimeOut: 1000,
        hideDuration: 1000,
        hideEasing: 'linear',
        hideMethod: 'fadeOut',
        onclick: null,
        positionClass: 'toast-top-right',
        progressBar: true,
        showDuration: 300,
        showEasing: 'swing',
        showMethod: 'fadeIn',
        timeOut: 3000,
    };

    return App;
}(window, window.Knockout_Table, window.jQuery, window.toastr));
