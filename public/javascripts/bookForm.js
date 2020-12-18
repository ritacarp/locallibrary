$(function () {

    // Material Select Initialization
    $(document).ready(function() {

        
        $('#authorSelect').multiselect();

        
        $('form input').on('keypress', function(e) {
            return e.which !== 13;
        });
       

        $('form').on("submit", function() {
            $('#authorIDs').val( $("#authorSelect").val() )
 
            var checkArray = "";
            $('input[type=checkbox]').each(function() {
                if (this.checked) { 
                    if (checkArray) checkArray = checkArray + "," 
                    checkArray= checkArray + this.id 
                }
            })
            $('#genreIDs').val( checkArray )
            


        })

        

        

    });

    
    

})

