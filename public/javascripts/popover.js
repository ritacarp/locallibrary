$('.popover-dismiss').popover({
            trigger: "manual",
            html: true,
            content: function(){
                return $(".content").html();
            }
        });
        
        $('.popover-dismiss').on({
            "shown.bs.popover": function(){
                var input = $(".popover input.link-text");
                input.focus();
            },
            "hide.bs.popover": function(){
                $(this).blur();    
            },
            "click": function(){
                $(this).popover("toggle");    
            }
        });
        
        $(".privacy-btn").on({
            "click": function(){
                $(".popover-dismiss").popover("hide");  
            }
        });

