;(function (ns) {

    var isPageLoaded = false;

    attachOnLoadEvents();

    function pageLoaded() {
        
        if (!isPageLoaded) {
            isPageLoaded = true;
            ns.app = ns.ExampleApp.instance();
        }
    }

    function attachOnLoadEvents() {
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", pageLoaded, false);
            window.addEventListener("load", pageLoaded, false);
        } else if (window.attachEvent) {
            window.attachEvent("onload", pageLoaded);
        }

        //Check if document already complete
        if (document.readyState === "complete") {
            pageLoaded();
        }
    }

}(window.dropdown || (window.dropdown = {})));

