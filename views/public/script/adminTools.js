$(function() {
    $("#allryads").on("click", function () {
    $.ajax({
      type: 'GET',
      url: '/Admin/all',
      success: function(all) {
        var html = '';
        for (var i = 0; i< all.length; i++) {
            html += '<tr>' + '<td class="id" style="display:none;" data-field="id">' + all[i].ryadid +'</td>'+' <td data-field="name">' + all[i].name + '</td>' + '<td data-field="city">'+ all[i].city + '</td>'  + '<td data-field="rooms"> ' + all[i].rooms + '</td>'  + '<td data-field="address"> ' + all[i].address + '</td>'+ '<td data-field="price"> ' + all[i].price + '</td>' 
                + '<td>'
                      +'<button  id="resultButton"  class="update-button">Update</button>'+
                      '<button class="delete-button" id="resultButton" type="submit">Delete</button>' + 
                      '</td></tr>';
                      
        }
        $('#target').html(html);
      }
    });
  });


  $('table').on('click', '.delete-button', function() {
      let row = $(this).closest('tr');
      let id = row.find('.id').text();
      $(this).closest("tr").remove();
      $.ajax({
        url: `Admin/${id}`,
        method: 'DELETE',
        success: function (response) {
            
        }
      });
    });
});
// VALIDATION OF THE ADDRYAD FORM
$(function() {
  $("form[name='addryad']").validate({
    rules: {
      name: "required",
      city: "required",
      price: {
        required: true,
        number: true
      },
      rooms: "required",
      address: "required",
      img: "required",
    },
    messages: {
        name: "Please enterthe ryad name",
      city: "Please enter the city",
      price: {
        required: "Please provide the price",
      },
      rooms: "Please specify how many available rooms",
      address: "Don't forget the address",
      img: "Please select an Image",
    },
    submitHandler: function(form) {
      form.submit();
    }
  });
});
//UPDATE A RYAD
$('table').on('click', '.update-button', function(){
    $(this).closest("tr").editable({
        keyboard: true,
        dblclick: true,
        button: true,
        buttonSelector: ".edit",
        dropdowns: {},
        maintainWidth: true,
        edit: function(values) {},
        save: function(values) {},
        cancel: function(values) {},
       
        save: function(values) {
            var id = $(this).data('.id');
            $.ajax({
                    type: "POST",
                    url: `Admin/update/`,
                    contentType: 'application/json',
                    data: JSON.stringify(values),
                    success: function (response) {
                        console.log(values);
                }
                    }); 
        }
        });
    });