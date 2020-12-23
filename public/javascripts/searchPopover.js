    
      $('.popover-dismiss').popover({
        trigger: "manual",
        container: 'body',
        html: true,
        placement: 'left',
        sanitize: false,
        content: 
    `<script>
    function doSearch() {
        var val = $("#searchText").val()
        var url=""
        url = url +  $('.paging').attr("data-route") 
        url = url + "?col=" + $('.paging').attr("data-col")
        url = url + "&sort=-1"
        url = url + "&page=1"
        url = url + "&limit=" + $("#itemsOnPage").attr("data-value")
        url = url + "&search=" + val
        url = encodeURI(url)
        $(".popover-dismiss").popover("toggle");  
        //alert("url = " + url)
        //alert(val)
        window.location.assign(url);
    }

    $('#searchText').on('keypress', function(e) {
        if (e.which === 13) { doSearch()}
    });

    </script>
    
    <div id="PopoverContent"   >
      <div class="input-group" >

        <input id="searchText" type="text" class="form-control link-text" placeholder="Search"
             aria-label="Search" aria-describedby="button-addon1"  style="margin-right:5px;>

        <div class="input-group-append" id="button-addon1" >

          <button id="popoverSearchButton" class="btn btn-outline-primary btn-sm" onclick="doSearch()" >
            <i class="glyphicon glyphicon-search fa fa-search"></i>
          </button>

        </div>
      </div>
    </div>`
    });
    
    $('.popover-dismiss').on({
        "shown.bs.popover": function(){
            //var input = $(".popover input.link-text");
            //input.focus();
        },
        "hide.bs.popover": function(){
            $(this).blur();    
        },
        "click": function(){
            $(this).popover("toggle");    
        }
    });

    

