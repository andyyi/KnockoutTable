using System.Web;
using System.Web.Optimization;

namespace KnockoutTable
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-1.9.0.js",
                        "~/Scripts/jquery.validate.js",
                        "~/Scripts/jquery.helpers.js",
                        "~/Scripts/nprogress.js",
                        "~/Scripts/ajax.js",
                        "~/Scripts/bootstrap-multiselect.js",
                        "~/Scripts/tableExport.js",
                        "~/Scripts/knockout-3.4.1.js",
                        "~/Scripts/knockout.mapping-latest.js",
                        "~/Scripts/bootstrap.js",
                        "~/Scripts/jQueryExtensions.js",
                        "~/Scripts/Knockout-Extension.js",
                        "~/Scripts/Misc.js",
                        "~/Scripts/bootstrap-datetimepicker.js",
                        "~/Scripts/Knockout_Table.js",
                        "~/Scripts/confirm_bootstrap.js",
                        "~/Scripts/toastr.js",
                        "~/Scripts/messaging.js",
                        "~/Scripts/moment.js",
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js",
                      "~/Scripts/respond.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/site.css"));
        }
    }
}
