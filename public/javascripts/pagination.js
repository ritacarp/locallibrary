
    $('#light-pagination').pagination({

        // Total number of items that will be used to calculate the pages.
        items: $("#itemCount").attr("data-value"), 
      
        // Number of items displayed on each page.
        itemsOnPage: $("#itemsOnPage").attr("data-value"),
      
        // If specified, items and itemsOnPage will not be used to calculate the number of pages.
        //pages: 5, 
      
        // How many page numbers should be visible while navigating. Minimum allowed: 3 (previous, current & next)
        displayedPages: 3, 
      
        // How many page numbers are visible at the beginning/ending of the pagination.
        edges: 2,
      
        // Enables start/end edge
        useStartEdge : true,
        useEndEdge : true,
      
        // Which page will be selected immediately after init.
        currentPage: 0, 
      
        // Uses anchor links or spans
        useAnchors: true,
      
        // A string used to build the href attribute, added before the page number.
        hrefTextPrefix: "#page=", 
      
        // Another string used to build the href attribute, added after the page number.
        hrefTextSuffix: '', 
      
        // Text to be display on the previous button.
        prevText: "Prev", 
      
        // Text to be display on the next button.
        nextText: "Next", 
      
        // Ellipse Character
        ellipseText: '&hellip;',
        ellipsePageSet: true,
      
        // list style
        listStyle: '',
      
        // The class of the CSS theme:
        // "light-theme", "compact-theme", and "dark-theme"
        cssStyle: "light-theme", 
      
        // Set to false if you don't want to select the page immediately after click.
        selectOnClick: true,
      
        // Next button at front.
        nextAtFront: false,
      
        // Inverts page order
        invertPageOrder: false,

        onInit:function(){
            
            pageNumber = $("#currentPage").attr("data-value") 
            itemCount = $("#itemCount").attr("data-value") 
            $("#light-pagination").pagination('drawPage', pageNumber);
        },

        onPageClick:function(pageNumber, event) {

            //alert("onPageClick: page number = " + pageNumber)

            var url=""
            url = url +  $('.paging').attr("data-route") 
            url = url + "?col=" + $('.paging').attr("data-col")
            url = url + "&sort=" + $('.paging').attr("data-sortOrder") 
            url = url + "&page=" + pageNumber
            url = url + "&limit=" + $("#itemsOnPage").attr("data-value")
            var searchStr = $("#searchString").attr("data-value")
            if (searchStr) { url = url + "&search=" + searchStr }
            //alert("url = " + url)
            window.location.assign(url);

           
        }

      
    });
    