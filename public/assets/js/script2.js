$(document).ready(function() {
        $(“#advt”).click(function() {});
        $(“#closeadvt”).click(function(event) {
                event.stopPropagation();
                $(“#advt”).fadeOut();
        })
});
