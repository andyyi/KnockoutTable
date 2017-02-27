$(function () {
    $(document)
    .ajaxStart(function () {
        $('html').addClass('busy');
        NProgress && NProgress.start();
    })
    .ajaxStop(function () {
        $('html').removeClass('busy');
        NProgress && NProgress.done();
    });

    $.ajaxSetup({ cache: false });

    NProgress && NProgress.configure({ showSpinner: false });
});



