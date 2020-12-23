 $(function () {
    // this function controls the buttons to edit a specific book
     $('.action').on('click', function (event) {
        url = this.getAttribute("data-route") 

        if (this.getAttribute("data-ID")) {
            url = url + this.getAttribute("data-ID") 
        }
        if (this.getAttribute("data-action")) {
            url = url + this.getAttribute("data-action")
        }

        if (this.getAttribute("data-qs")) {
            url = url + "?" + this.getAttribute("data-qs")
        }

        //alert("author url is " + url)
        window.location.assign(url);
    })

    $('.paging').on('click', function (event) {
        // this function controls paging
        var searchVal = $("#searchString").attr("data-value")
        var url=""
        url = this.getAttribute("data-route")
        url = url + "?col=" + this.getAttribute("data-col")
        url = url + "&sort=" + this.getAttribute("data-sortOrder") *-1
        url = url + "&page=1"
        url = url + "&limit=" + $("#itemsOnPage").attr("data-value")
        if (searchVal) { url = url + "&search=" + searchVal}
        //alert("the paging url is " + url)
        window.location.assign(url);
    })

    $("#clearSearchIcon").on('click', function (event) {
        // this functions clears search
        url = this.getAttribute("data-route")
        url = url + "?col=" + this.getAttribute("data-col")
        url = url + "&sort=1&page=1"
        url = url + "&limit=" + $("#itemsOnPage").attr("data-value")
        window.location.assign(url)
    });

    $("#selectItemsPerPage").on('change', function (event) {
        // this function controls how many items are viewed on each page
        var limit = $("#selectItemsPerPage").val()
        //alert("items per page = " + limit)
        $("#light-pagination").pagination('updateItemsOnPage', limit);
        $("#itemsOnPage").attr("data-value",limit)

        var searchVal = $("#searchString").attr("data-value")
        var url=""
        url = url +  $('.paging').attr("data-route") 
        url = url + "?col=" + $('.paging').attr("data-col")
        url = url + "&sort=" + $('.paging').attr("data-sortOrder")
        url = url + "&page=1"
        url = url + "&limit=" + limit
        if (searchVal) { url = url + "&search=" + searchVal}
        url = encodeURI(url)
        window.location.assign(url);
   
    });
    

    
 
 })
