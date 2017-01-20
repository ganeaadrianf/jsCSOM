
$(document).ready(function () {
    

    $("#btnBatchExceptionHandling").click(function () {
        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var list;
        var scope = new SP.ExceptionHandlingScope(context);
        var startScope=scope.startScope();
        var startTry = scope.startTry();
        list = web.get_lists().getByTitle("my list1");
        context.load(list);
        startTry.dispose();
        var startCatch = scope.startCatch();
        var lci = new SP.ListCreationInformation();
        lci.set_title("my list1");
        lci.set_quickLaunchOption(SP.QuickLaunchOptions.on);
        lci.set_templateType(SP.ListTemplateType.tasks);
        web.get_lists().add(lci);
        startCatch.dispose();
        startScope.dispose();       
        context.executeQueryAsync(success, fail);
        
        function success() {
            var html = "List sucessfully loaded";
            if (scope.get_hasException()) {
                html = "List sucessfully created";
            }
            $("#message").html(html);
        }
        function fail(sender, args) {
            $("#message").html(args.get_message());
        }

    });

    $("#btnAddList").click(function () {
        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var lci = new SP.ListCreationInformation();
        lci.set_title("my list");
        lci.set_quickLaunchOption(SP.QuickLaunchOptions.on);
        lci.set_templateType(SP.ListTemplateType.tasks);
        web.get_lists().add(lci);
        context.executeQueryAsync(success, fail);
        function success() {
            var html = "List sucessfully created";
            $("#message").html(html);
        }
        function fail(sender, args) {
            $("#message").html(args.get_message());
        }

    });

    $("#btnCAMLQuery").click(function () {
        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var list = web.get_lists().getByTitle("Categories");
        var query = new SP.CamlQuery();
        query.set_viewXml = "<View/>";
        var items = list.getItems(query);
        //context.load(web);
        context.load(list, "Title");
        context.load(items, "Include(Title,Description)")
        context.executeQueryAsync(success, fail);

        function success() {
            var html = "";
            var ienum = items.getEnumerator();
            while (ienum.moveNext()) {
                html += "<li>(" + ienum.get_current().get_item("Description") + ")" + ienum.get_current().get_item("Title") + "</li>";
            }
            $("#message").html("<ul>" + html + "</ul>");
        }
        function fail(sender, args) {
            $("#message").html(args.get_message());
        }

    });
    $("#btnNestedIncludes").click(function () {
        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var lists = web.get_lists();
        context.load(web);
        context.load(lists, "Include(Title,Fields.Include(Title))");
        context.executeQueryAsync(success, fail);

        function success() {
            var html = "";
            var lenum = lists.getEnumerator();
            while (lenum.moveNext()) {
                html += "<li>" + lenum.get_current().get_title() + "</li>";
                var fenum = lenum.get_current().get_fields().getEnumerator();
                var i = 0;
                while (fenum.moveNext()) {
                    if (!(i++ > 5)) {
                        html += "<li>&nbsp;&nbsp;&nbsp;&nbsp;" + fenum.get_current().get_title() + "</li>";
                    }
                }

            }
            $("#message").html("<ul>" + html + "</ul>");
        }
        function fail(sender, args) {
            $("#message").html(args.get_message());
        }

    });

    $("#btnSelectFields").click(function () {
        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var lists = web.get_lists();
        context.load(web);
        context.load(lists, "Include(Title)", "Include(Description)");

        context.executeQueryAsync(success, fail);
        function success() {
            var html = "";
            var lenum = lists.getEnumerator();
            while (lenum.moveNext()) {
                html += "<li>" + lenum.get_current().get_description() + "</li>";

            }
            $("#message").html("<ul>" + html + "</ul>");
        }
        function fail() {
            alert("error");
        }

    });
    $("#btnLoadLists").click(function () {
        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var lists = web.get_lists();
        context.load(web);
        context.load(lists);

        context.executeQueryAsync(success, fail);
        function success() {
            var html = "";
            for (i = 0; i < lists.get_count() ; i++) {
                html += "<li>" + lists.getItemAtIndex(i).get_title();
            }
            $("#message").html("<ul>" + html + "</ul>");
        }
        function fail() {
            alert("error");
        }

    });

});