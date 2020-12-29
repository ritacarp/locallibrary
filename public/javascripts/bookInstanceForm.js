$(function () {

    $('#due_back_dp').datepicker(
        {
                format: 'mm/dd/yyyy',
                theme: 'blue',
                autoclose: true,
                todayHighlight: true,
                clearBtn: true,
                showWeekDays: true,
                startDate: new Date(),
});

$('.statusRadio').on("click", function() {
    var thisID = $(this).attr("id" )
    //alert("ID = " + thisID + "; value = " + $(this).val())
    if (thisID != "Available") {
        $("#dueBackDiv").attr("style", "visibility:visible")
    } else {
        $("#dueBackDiv").attr("style", "visibility:hidden")
        $("#due_back").val("")
    }
})

//alert("the form is loaded, the value of status is " +  $("input[name='status']:checked").val() )

if ($("input[name='status']:checked").val() != "Available") {
    $("#dueBackDiv").attr("style.", "visibility:visible")
}
else {
    $("#dueBackDiv").attr("style", "visibility:hidden")
    $("#due_back").val("")
    }



} ) // function ()