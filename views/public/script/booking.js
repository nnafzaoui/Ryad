
$(document).ready(function() {
    $("select.form-control").change(function(){
      var SelectedRooms =  $(this).children("option:selected").val();
      var total = <%= selectedRiad[0].price %> * SelectedRooms;
      document.getElementById('price').innerHTML = total;
      $('input[name=Sprice]').val(total);
      $('input[name=Srooms]').val(SelectedRooms);
    });
  });