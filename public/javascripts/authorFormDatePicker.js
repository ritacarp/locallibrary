

$(function () {

        $('#date_of_birth_dp').datepicker(
                {
                        format: 'mm/dd/yyyy',
                        theme: 'blue',
                        autoclose: true,
                        todayHighlight: true,
                        clearBtn: true,
                        showWeekDays: false,
                        startDate: -Infinity,
        }).on('hide', function(e) {
                validateDateRange(e)
        });
        

        $('#date_of_death_dp').datepicker(
                {
                        format: 'mm/dd/yyyy',
                        theme: 'blue',
                        autoclose: true,
                        todayHighlight: true,
                        clearBtn: true,
                        showWeekDays: false,
                        endDate: Infinity,
        }).on('hide', function(e) {
                validateDateRange(e)
        });

 
 

        $('#date_of_birth').on('change', function (e) {
                validateDateRange(e)
        })


        
        $('#date_of_death').on('change', function (e) {
                validateDateRange(e)
        })

        function validateDateRange(e) {
                //alert("1) validateDateRange: The event type is " + e.type + " The target is  " + e.target.id )
                

                var dateOfBirth = ""
                var dateOfDeath = ""
                if ($('#date_of_birth').val()) {
                        var dateOfBirth =  new Date($('#date_of_birth').val())
                }
                if ( $('#date_of_death').val()) {
                        dateOfDeath = new Date($('#date_of_death').val())
                }

                //alert("DOB = " + $('#date_of_birth').val())
                //alert("DOD = " + $('#date_of_death').val())



                try {
                        if(!isNaN(dateOfBirth.getTime())) {
                                //alert("DOB = " + $('#date_of_birth').val())
                        } else {
                                //alert("DOB is not a date")
                                dateOfBirth = ""
                                $('#date_of_birth').val("")
                                $('#date_of_birth_dp').datepicker('setStartDate', -Infinity)
                                $('#date_of_birth_dp').datepicker('setEndDate', Infinity)
                        }
                } catch(err) {
                        //alert("DOB is not a date")
                        dateOfBirth = ""
                        $('#date_of_birth').val("")
                        $('#date_of_birth_dp').datepicker('setStartDate', -Infinity)
                        $('#date_of_birth_dp').datepicker('setEndDate', Infinity)
                }

                try {
                        if(!isNaN(dateOfDeath.getTime())) {
                                //alert("DOD = " + $('#date_of_death').val())
                        } else {
                                //alert("DOD is not a date")
                                dateOfDeath  = ""
                                $('#date_of_death').val("")
                                $('#date_of_death_dp').datepicker('setStartDate',-Infinity)
                                $('#date_of_death_dp').datepicker('setEndDate', Infinity)
                        }
                } catch(err) {
                        //alert("DOD is not a date")
                        dateOfDeath  = ""
                        $('#date_of_death').val("")
                        $('#date_of_death_dp').datepicker('setStartDate',-Infinity)
                        $('#date_of_death_dp').datepicker('setEndDate', Infinity)
                }


                if (!dateOfBirth && !dateOfDeath) {
                        
                        $('#date_of_birth_dp').datepicker('setStartDate', -Infinity)
                        $('#date_of_birth_dp').datepicker('setEndDate', Infinity)
                        $('#date_of_death_dp').datepicker('setStartDate',-Infinity)
                        $('#date_of_birth_dp').datepicker('setEndDate', Infinity)
                        return
                }


                if (dateOfBirth || dateOfDeath) {
                        //alert("2) Hurray! DOB = " + $('#date_of_birth').val() + "; DOD = " + $('#date_of_death').val())
                        if (dateOfBirth && dateOfDeath) 
                                if (dateOfBirth > dateOfDeath) {
                                        
                                        dateOfDeath  = ""
                                        $('#date_of_death').val("")
                                        $('#date_of_death_dp').datepicker('setStartDate',dateOfBirth)
                                        //alert("This is 1a")
                                } else {
                                        $('#date_of_death_dp').datepicker('setStartDate',dateOfBirth) 
                                }

                                if (dateOfBirth && !dateOfDeath) {
                                        $('#date_of_death_dp').datepicker('setStartDate',dateOfBirth)
                                        //alert("This is 1b")
                                }

                                
                                if (!dateOfBirth && dateOfDeath) {
                                        $('#date_of_birth_dp').datepicker('setEndDate',dateOfDeath)
                                        //alert("This is 1b")
                                }



                }

        }

       
       $('#saveDuplicate').on("click", function() {
               $('#createDupe').val(1)
               //alert("save duplicate button clicked, the value of createDupe is "  + $('#createDupe').val())
               $("form").submit()
       })
 
});     


console.log("The datepicker is initialized")


