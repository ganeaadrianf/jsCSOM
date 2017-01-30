<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <meta name="WebPartPageExpansion" content="full" />

    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="../Scripts/App.js"></script>
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Page Title
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
    <style>
    .error {
        font-weight:bold;
        color:#c00;
    }
    </style>
    <div>
        <p id="message">

        </p>
        <input type="button" id="btnSelectFields" value="select fields" />
        <br />
        <input type="button" id="btnNestedIncludes" value="nested includes" />
        <br />
        <input type="button" id="btnCAMLQuery" value="CAML query" />
        <br />
        <input type="button" id="btnAddList" value="add a list" />
        <br />
        <input type="button" id="btnBatchExceptionHandling" value="Batch exception handling" />
        <br />
        <input type="button" id="btnAddItem" value="Add an item" />
        <br /> 
        <input type="button" id="btnUpdateItem" value="update first item" />
        <br />
        <input type="button" id="btnWebProxy" value="Web Proxy" />
        <br />
        <input type="button" id="btnCreateLibrary" value="Create Custom Library" />
        <br />
        <input type="button" id="btnUploadDocument" value="Upload document to library" />
        <input type="file" id="btnUploadFile" />
        <br />


        <a href="../Lists/Categories">Categories</a>|
        <a href="../Lists/Products">Products</a>|
         <a href="../ProjectDocuments">ProjectDocuments</a>
        <br />
    </div>

</asp:Content>
