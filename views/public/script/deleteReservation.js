$(function() {
    $("#resultButton").on("click", function () {
    let row = $(this).closest('tr');
    let id = row.find('.id').val();
    $.ajax({
    type: 'POST',
    url: '/reservations/delete',
    data: {id:id}
    
  });
});
});