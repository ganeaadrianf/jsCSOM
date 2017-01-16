
$(document).ready(function () {
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