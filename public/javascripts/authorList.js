 $(function () {

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

 
 })
