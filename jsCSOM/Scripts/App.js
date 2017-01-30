
$(document).ready(function () {

    $("#btnUploadDocument").click(function () {
        if (!window.FileReader) {
            alert("HTML5 unavailable");
            return;
        }
        var context = SP.ClientContext.get_current();
        var web = context.get_web();

        var upload = document.getElementById("btnUploadFile");
        var file = upload.files[0];
        var path = file;



        var reader = new FileReader();
     
        reader.onload=function (e) {
            //save to list
            var buffer = e.target.result;
            var bytes = new Uint8Array(buffer);
            var content = new SP.Base64EncodedByteArray();
            for (var b = 0; b < bytes.length; b++) {
                content.append(bytes[b]);    
            }
            var fci = new SP.FileCreationInformation();
            fci.set_content(content);
            fci.set_overwrite(true);
            fci.set_url(file.name);
            var uploadedFile=web.get_lists().getByTitle("ProjectDocuments").get_rootFolder().get_files().add(fci);
            var newFile=uploadedFile.get_listItemAllFields();
            newFile.set_item("Year", 2018);
            newFile.set_item("Coordinator", web.get_currentUser());
            newFile.update();
            context.executeQueryAsync(function () {
                $("#message").html("<p>File successfully uploaded</p>");
            },
            function (sender, args) {
                $("#message").html("<p class='error'>File successfully uploaded: "+args.get_message()+"</p>");
            });

        }

        reader.onerror=function (e) {
            alert("Error reading the file: "+e.target.error);

        }




        reader.readAsArrayBuffer(file);


        
     
    });

    $("#btnCreateLibrary").click(function () {
        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var lci = new SP.ListCreationInformation();
        lci.set_title("ProjectDocuments");
        lci.set_templateType(SP.ListTemplateType.documentLibrary);
        var lib = web.get_lists().add(lci);

        lib.get_fields().addFieldAsXml("<Field Type=\"Number\" DisplayName=\"Year\" Min=\"2000\" Max=\"2100\" Decimals=\"0\" StaticName=\"Year\" Name=\"Year\" />", true, SP.AddFieldOptions.defaultValue);
        lib.get_fields().addFieldAsXml("<Field Type=\"User\" DisplayName=\"Coordinator\" List=\"UserInfo\" ShowField=\"ImnName\" UserSelectionMode=\"PeopleOnly\" UserSelectionScope=\"0\" StaticName=\"Coordinator\" Name=\"Coordinator\" />");

        context.executeQueryAsync(success, fail);
        function success() {
            var html = "Library sucessfully created";
            $("#message").html(html);
        }
        function fail(sender, args) {
            $("#message").html(args.get_message());
        }

    });


    $("#btnWebProxy").click(function () {

        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var request = new SP.WebRequestInfo();
        request.set_url("http://services.odata.org/V4/Northwind/Northwind.svc/Categories");
        request.set_method("GET");
        var response = SP.WebProxy.invoke(context, request);
        
        context.executeQueryAsync(success, fail);

        function success() {
            var html = '';
            if (response.get_statusCode() == "200") {
                var data = JSON.parse(response.get_body());
                for (i = 0; i < data.value.length;i++){
                    html+="<li>"+data.value[i].CategoryName+"</li>"; 
                }
                $("#message").html("<ul>" + html + "</ul>").fadeOut().fadeIn(2000,function(){});

            }
            else {
                alert(response.get_body());
            }
        }

        function fail() {

        }
             

    });


    $("#btnUpdateItem").click(function () {
        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var list = web.get_lists().getByTitle("my list");
        var query = new SP.CamlQuery();
        query.set_viewXml("<View><RowLimit>1</RowLimit></View>");
        var items = list.getItems(query);
        context.load(items);
        context.executeQueryAsync(success, fail);      


        function success() {
            var item = items.get_item(0);            
            item.set_item("Title", "Modified");
            item.set_item("PercentComplete", "0.03");
            var date = new Date();
            date.setDate(date.getDate() + 7);
            item.set_item("DueDate", date);
            item.update();
            context.executeQueryAsync(success1, fail);
            function success1() {
                var html = "List item sucessfully modified";
                $("#message").html(html);
            }
        }
        function fail(sender, args) {
            $("#message").html(args.get_message());
        }

    });
    $("#btnAddItem").click(function () {
        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var list=web.get_lists().getByTitle("my list");
        
        var lci = new SP.ListItemCreationInformation();
        var addedItem = list.addItem(lci);
        addedItem.set_item("Title", "Item");
        addedItem.set_item("PercentComplete", "10");
        addedItem.update();

        context.executeQueryAsync(success, fail);
        function success() {
            var html = "List item sucessfully created";
            $("#message").html(html);
        }
        function fail(sender, args) {
            $("#message").html(args.get_message());
        }

    });

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