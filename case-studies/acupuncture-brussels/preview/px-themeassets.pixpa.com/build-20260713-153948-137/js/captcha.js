window.Captcha = {
  
}

Captcha.MessageSent = function (){
  if(window.location.href.match('message=MessageSent.')){
    $('.js-submit-form-msg').addClass('display-inline-b').removeClass('display-none');
    setTimeout(function() {
      $('.js-submit-form-msg').addClass('display-none').removeClass('display-inline-b');
    }, 5000);
  };
}

Captcha.blogPostCommentsSuccess = function(data){
  $("#comment-input").val('');
  $("#name-input").val('');
  $("#email-input").val('');

  if (data.comment.approved == 1) {
    $(".js-no-comments").hide();
    $("#blog-comment-count").html('(' + data.comment_count + ')');
    var temp = $("#pixpacommenting-template").html();
     temp = $(temp)[0];
    $(temp).find('.user-name').find('span').text(data.comment.name);
    $(temp).find('.date-posted').text(data.comment.added_on);
    $(temp).find('.blog-post-comment').text(data.comment.comment);
    $(temp).find('.user-avataar').html(data.comment.image);
    $("#blog-comment-text").prepend(temp);
  }
  
  $("#comment-ack").show();
  setTimeout(function() {
    $("#comment-ack").hide();
  }, 4000);
}

Captcha.tokenAjaxbtn = function(sitekey){
  var token_xhr;
  $('.jspixpa_token_ajaxbtn').unbind('click');
  $('.jspixpa_token_ajaxbtn').on('click', function(event){
    event.preventDefault();
    var pagename = $(this).attr('data-pagename')
    var hideform = $(this).attr('data-hideform');
    grecaptcha.enterprise.ready(function() {
      grecaptcha.enterprise.execute(''+sitekey+'', {
        action: 'submit'
      }).then(function(token) {
        $('.js-csrf-form-field').find('#g_captcha_token').val(token);
      }).then(()=> {
        $.ajax({
          url: '/refresh-token',
          method: 'post',
          headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
          }
        }).then(function (response) {
          $('.js-csrf-form-field').find('input[name="_token"]').remove();
          if (response.token != null) {
            $('meta[name="csrf-token"]').attr('content', response.token);
            var input = $("<input>").attr("type", "hidden").attr("name", "_token").val(response.token);
            $('.js-csrf-form-field').append(input);
            var form = $('.js-csrf-form-field')[0];
            var formdata = new FormData(form);
            var input = $("<input>").attr("type", "hidden").attr("name", "_token").val(response.token);
            formdata.append('_token', response.token);
            if (pagename == 'blogpostdetails') {
              var path = window.location.pathname;
              if (path.endsWith('/')) {
                path = path.slice(0, -1);
              }
              var formurl = path + '/add-blog-comment';

              var input = $("#comment-input").val()
              var name = $("#name-input").val()
              var email = $("#email-input").val()
              var emailcheck = $("#email-check").val()
              var namecheck = $("#name-check").val()
              formdata.append('comment', input)
              formdata.append('name', name)
              formdata.append('email', email)
              formdata.append('emailcheck', emailcheck)
              formdata.append('namecheck', namecheck)
            } else {
              var formurl = $('.js-csrf-form-field').attr('action');
            }
            token_xhr = $.ajax({
              type: $('.js-csrf-form-field').attr('method'),
              url: formurl,
              data: formdata,
              contentType: false,
              cache: false,
              processData:false,
            });
            token_xhr.done(function(data, status, jqXhr){   
              $('.js-submit-form-msg').removeClass('display-none');
              $('.js-submit-form-error-msg').addClass('display-none');
              setTimeout(function() {
                if(hideform == 'yes'){
                  $('.js-hidesubmitform').hide();
                  $('.js-close-calendar').click();
                }
              }, 2000);
              if (pagename == 'blogpostdetails') {
                Captcha.blogPostCommentsSuccess(data);
                //empty the form
                form.reset();
              } else {
                $('.js-csrf-form-field').hide();
              }
            });
            token_xhr.fail(function(jqXhr, textStatus, errorMessage){
              $('.js-submit-form-error-msg').removeClass('display-none');
              setTimeout(function() {
                if(hideform == 'yes'){
                  $('.js-hidesubmitform').hide();
                  $('.js-close-calendar').click();
                }
              }, 100);
            });
          } else{
            var form = $('.js-csrf-form-field')[0];
            var formdata = new FormData(form);
            var tokenval = $('meta[name="csrf-token"]').attr('content')
            var input = $("<input>").attr("type", "hidden").attr("name", "_token").val(tokenval);
            formdata.append('_token', tokenval)
            token_xhr = $.ajax({
              type: $('.js-csrf-form-field').attr('method'),
              url: $('.js-csrf-form-field').attr('action'),
              data: formdata,
              contentType: false,
              cache: false,
              processData:false,
            });
            token_xhr.done(function(data, status, jqXhr){
              $('.js-submit-form-msg').removeClass('display-none');
              $('.js-submit-form-error-msg').addClass('display-none');
              setTimeout(function() {
                if(hideform == 'yes'){
                  $('.js-hidesubmitform').hide();
                  $('.js-close-calendar').click();
                  $('.js-csrf-form-field').hide();
                } else{
                  $('.js-csrf-form-field').hide();
                }
              }, 2000);
            });
            token_xhr.fail(function(jqXhr, textStatus, errorMessage){
              $('.js-submit-form-error-msg').removeClass('display-none');
              setTimeout(function() {
                if(hideform == 'yes'){
                  $('.js-hidesubmitform').hide();
                  $('.js-close-calendar').click();
                }
              }, 100);
            });
          }
        });
      });
    });
  });
}

Captcha.pixpatokenbtn = function() {
  $('#jspixpa_token_btn').click(function () {
    // $(this).find('')
    showLoader();
    $.ajax({
      url: '/refresh-token',
      method: 'post',
      headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
      }
    }).then(function (response) {
      $('.js-csrf-form-field').find('input[name="_token"]').remove();
      if (response.token != null) {
        $('meta[name="csrf-token"]').attr('content', response.token);
        var input = $("<input>").attr("type", "hidden").attr("name", "_token").val(response.token);
        $('.js-csrf-form-field').append($(input));
        setTimeout(function() {
          // $('.js-csrf-form-field').submit();
          $('.js-submit-form').click();
        }, 10);
      } else {
        $('.js-csrf-form-field').find('input[name="_token"]').remove();
        var input = $("<input>").attr("type", "hidden").attr("name", "_token").val($('meta[name="csrf-token"]').attr('content'));
        $('.js-csrf-form-field').append($(input));
        setTimeout(function() {
          // $('.js-csrf-form-field').submit();
          $('.js-submit-form').click();
        }, 10);
      }
    });
  });

  function showLoader() {
    // Show the loader and circle loader
    $('#jspixpa_token_btn').prop('disabled', true); // Disable the button to prevent multiple submissions
    $('.js-submit-loader').show();
    $('.circle-loader').show();
  }
}


Captcha.Init = function () {
  Captcha.pixpatokenbtn();
  Captcha.MessageSent();
}