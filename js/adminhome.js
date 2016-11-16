console.log("adminHome");

$.get( "/api/getgarnishes", function( data ) {
   console.log(JSON.parse(data));
});

// Select all tabs
$('.nav-tabs a').click(function(){
    $(this).tab('show');
})