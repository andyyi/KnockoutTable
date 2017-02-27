; window.Knockout_Table = (function (window, App, $, ko, moment, undefined) {
    'use strict';
    App = App || {};
    var Misc = App.Misc || {};

    Misc.castKoRecursion = function (object, path) {
        if (typeof object === "function") {
            var result = object();
            if (result instanceof Array) {
                var array = [];
                for (var i = 0; i < result.length; i++) {
                    array[i] = Misc.castKoRecursion(result[i], path + "[" + i + "]");
                }
                return array;
            }
            object = result;

            return object;
        }

        if (object instanceof Array) {
            var result = [];
            for (var index = 0; index < object.length; index++) {
                result[index] = Misc.castKoRecursion(object[index]);
            }

            return result;
        }

        if (typeof object === "object") {
            if (!object) return;
            var result = {};
            for (var prop in object) {
                result[prop] = Misc.castKoRecursion(object[prop], path + "." + prop);
            }
            return result;
        }

        return object;
    };

    Misc.renderKoRecursion = function (object, path) {
        if (typeof object === "string" || typeof object === "number" || typeof object === "boolean") {
            return ko.observable(object);
        }

        if (object instanceof Array) {
            var result = [];
            for (var i = 0; i < object.length; i++) {
                var item = Misc.renderKoRecursion(object[i], path + "[" + i + "]");
                result.push(item);
            }
            return result;
        }

        if (typeof object === "object") {
            if (!object) return;

            var result = {};
            for (var prop in object) {
                result[prop] = Misc.renderKoRecursion(object[prop], path + "." + prop);
            }
            return result;
        }

        if (typeof object === 'function') {
            return object;
        }
    };

    App.Misc = Misc;
    return App;
}(window, window.Knockout_Table, window.jQuery, window.ko, window.moment));
