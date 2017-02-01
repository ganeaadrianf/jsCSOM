
$(document).ready(function () {
    

    $("#btnUserProfileProperties").click(function () {
       
        var context = SP.ClientContext.get_current();
        var manager = new SP.UserProfiles.PeopleManager(context);
        var properties=manager.getMyProperties();
        context.load(properties,"DisplayName","UserProfileProperties");
       
        context.executeQueryAsync(
            function success() {
                var html = String.format("Profile properties for: {0}" + properties.get_displayName());
                var props= properties.get_userProfileProperties();
                for (var key in props) {
                    if (props[key] !== "") {
                        html += "<br/>" + key + ":" + props[key];
                    }
                }              

                $("#message").html(html);
            },
            function fail(sender, args) {
                $("#message").html(args.get_message());
            }
        );
    });


    $("#btnUserPermissions").click(function () {
        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var list = web.get_lists().getByTitle("Project Documents Taxonomy");

        context.load(list, "EffectiveBasePermissions");

        var mask = new SP.BasePermissions();
        mask.set(SP.PermissionKind.manageLists);
        var manageLists = web.doesUserHavePermissions(mask);


        context.executeQueryAsync(
            function success() {
                var html = String.format("Manage Lists: {0}" + manageLists.get_value());
                var addListItems = list.get_effectiveBasePermissions().has(SP.PermissionKind.addListItems)
                
                html += String.format("<br/>Add list items: {0}" + addListItems);

                $("#message").html(html);
            },
            function fail(sender, args) {
                $("#message").html(args.get_message());
            }
        );
    });

    $("#btnUploadDocumentTax").click(function () {
        if (!window.FileReader) {
            alert("HTML5 unavailable");
            return;
        }
        var context = SP.ClientContext.get_current();
        var web = context.get_web();

        var upload = document.getElementById("btnUploadFileTax");
        var file = upload.files[0];
        var path = file;



        var reader = new FileReader();

        reader.onload = function (e) {
            var session = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
            var store = session.get_termStores().getByName("Managed Metadata Service");
            var group = store.get_groups().getByName("Javascript");
            var termSet = group.get_termSets().getByName("Projects");
            var term = termSet.get_terms().getByName("Lists");

            context.load(term);


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
            var uploadedFile = web.get_lists().getByTitle("Project Documents Taxonomy").get_rootFolder().get_files().add(fci);
            var newFile = uploadedFile.get_listItemAllFields();
            newFile.set_item("Year", 2018);
            newFile.set_item("Coordinator", web.get_currentUser());
            var field = web.get_lists().getByTitle("Project Documents Taxonomy").get_fields().getByInternalNameOrTitle("Project");
            var taxField = context.castTo(field, SP.Taxonomy.TaxonomyField);
            taxField.setFieldValueByTerm(newFile, term, 1033);
            newFile.update();
            context.executeQueryAsync(function () {
                $("#message").html("<p>File successfully uploaded</p>");
            },
            function (sender, args) {
                $("#message").html("<p class='error'>File successfully uploaded: " + args.get_message() + "</p>");
            });

        }

        reader.onerror = function (e) {
            alert("Error reading the file: " + e.target.error);

        }




        reader.readAsArrayBuffer(file);




    });


    $("#btnCreateLibraryTaxField").click(function () {
        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var lci = new SP.ListCreationInformation();
        lci.set_title("Project Documents Taxonomy");
        lci.set_templateType(SP.ListTemplateType.documentLibrary);
        var lib = web.get_lists().add(lci);

        lib.get_fields().addFieldAsXml("<Field Type=\"Number\" DisplayName=\"Year\" Min=\"2000\" Max=\"2100\" Decimals=\"0\" StaticName=\"Year\" Name=\"Year\" />", true, SP.AddFieldOptions.defaultValue);
        lib.get_fields().addFieldAsXml("<Field Type=\"User\" DisplayName=\"Coordinator\" List=\"UserInfo\" ShowField=\"ImnName\" UserSelectionMode=\"PeopleOnly\" UserSelectionScope=\"0\" StaticName=\"Coordinator\" Name=\"Coordinator\" />");

        var taxField = lib.get_fields().addFieldAsXml("<Field Type=\"TaxonomyFieldType\" DisplayName=\"Project\"  ShowField=\"Term1033\" Version=\"1\" Name=\"Project\" />", true, SP.AddFieldOptions.defaultValue);

        var session = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
        var store = session.get_termStores().getByName("Managed Metadata Service");
        var group = store.get_groups().getByName("Javascript");
        var termSet = group.get_termSets().getByName("Projects");


        context.load(taxField);
        context.load(store, "Id");
        context.load(termSet, "Id");
        context.executeQueryAsync(success, fail);
        function success() {
            var taxField2 = context.castTo(taxField, SP.Taxonomy.TaxonomyField);

            taxField2.set_sspId(store.get_id());
            taxField2.set_termSetId(termSet.get_id());
            taxField2.update();
            context.executeQueryAsync(function () {
                var html = "Library(taxonomy field) sucessfully created";
                $("#message").html(html);
            }, fail);

        }
        function fail(sender, args) {
            $("#message").html(args.get_message());
        }

    });


    $("#btnCreateTermSet").click(function () {
        var context = SP.ClientContext.get_current();
        var web = context.get_web();

        var lcid = _spPageContextInfo.currentLanguage;
        var session = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
        var store = session.get_termStores().getByName("Managed Metadata Service");
        var group = store.createGroup("Javascript", "A9BEC98B-F65E-42EE-AAAC-AB5DF035EF65");
        var termSet = group.createTermSet("Projects", "6C25BA76-DA38-42EA-854A-28EE0E34644A", lcid);
        termSet.createTerm("Lists", lcid, "28AE7AAF-6C7E-46B8-B591-8CF07E3AFC34");
        termSet.createTerm("Libraries", lcid, "9FABF404-8F16-4071-92EE-F8A259459E7D");
        termSet.createTerm("MMS", lcid, "F49C804D-153B-44C2-9994-1C14A6C1C662");
        context.executeQueryAsync(
            function success() {
                var html = "TermSet sucessfully added";
                $("#message").html(html);
            },
            function fail(sender, args) {
                $("#message").html(args.get_message());
            }
        );
    });


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

        reader.onload = function (e) {
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
            var uploadedFile = web.get_lists().getByTitle("ProjectDocuments").get_rootFolder().get_files().add(fci);
            var newFile = uploadedFile.get_listItemAllFields();
            newFile.set_item("Year", 2018);
            newFile.set_item("Coordinator", web.get_currentUser());
            newFile.update();
            context.executeQueryAsync(function () {
                $("#message").html("<p>File successfully uploaded</p>");
            },
            function (sender, args) {
                $("#message").html("<p class='error'>File successfully uploaded: " + args.get_message() + "</p>");
            });

        }

        reader.onerror = function (e) {
            alert("Error reading the file: " + e.target.error);

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
                for (i = 0; i < data.value.length; i++) {
                    html += "<li>" + data.value[i].CategoryName + "</li>";
                }
                $("#message").html("<ul>" + html + "</ul>").fadeOut().fadeIn(2000, function () { });

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
        var list = web.get_lists().getByTitle("my list");

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
        var startScope = scope.startScope();
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