$(document).ready(function() {

    //$('#main').append("inside jquery...");


    var ENTER_KEY = 13;
    var ESC_KEY = 27;


    $(document).ajaxError(function(event, request){
        var message = null;

        if (request.responseJSON && request.responseJSON.hasOwnProperty('message')){
            message = request.responseJSON.message;
        }else if (request.responseText){
            var IS_JSON = true;
            try{
                var data = JSON.parse(request.responseText);
            }catch(err){
                IS_JSON = false;
            }

            if (IS_JSON && data != undefined && data.hasOwnProperty('message')){
                message = JSON.parse(request.responseText).message;
            }else{
                message = default_error_message;
            }
        }else{
            message = default_error_message;
        }
        //output the message to the screen here
    });

    //set some default values
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader('X-CSRFToken', csrf_token);
            }
        }
    });


    //for page changes
    $(window).on('hashchange', function(){
        var hash = window.location.hash.replace('#','');
        var url = null;
        if(hash === 'login'){
            url = login_url;
        }else if(hash === 'index'){
            url = index_page_url;
        }else{
            url = intro_page_url;
        }


        $.ajax({
            type: 'GET',
            url: url,
            success: function(data){
                $('#main').hide().html(data).fadeIn(100);
            }
        });

    });


    //append hash value when first load the page
    if (window.location.hash == ''){
        window.location.hash = '#intro';
    }else{
        //for situation of refreshing the page
        $(window).trigger('hashchange');
    }


    function register(){
        $.ajax({
            type: 'GET',
            url: register_url,
            success: function(data){
                $('#input-username').val(data.username);
                $('#input-password').val(data.password);
                alert("generated new account...");
            }
        })
    }

    $(document).on('click', '#btn-register', register);


    function toggle_password(){
        var password_input = document.getElementById('input-password');
        if(password_input.type === 'password'){
            password_input.type = 'text';
        }else{
            password_input.type = 'password';
        }
    }

    $(document).on('click', '#btn-toggle-password',toggle_password)


    function login_user(){
        var username = $('#input-username').val();
        var password = $('#input-password').val();
        if (!username || !password){
            return;
        }

        var data = {
            'username': username,
            'password': password
        };


        $.ajax({
            type: 'POST',
            url: login_url,
            data: JSON.stringify(data),
            contentType: 'application/json;charset=UTF-8',
            success: function(data){
                if(window.location.hash === '#index' || window.location.hash === 'index'){
                    $(window).trigger('hashchange');
                }else{
                    window.location.hash = '#index';
                }
            }
        });
    }

    $(document).on('click', '#btn-login', login_user);
    $(document).on('keyup', '.input-login', function(e){
        if(e.which === ENTER_KEY){
            login_user();
        }
    });


    //test
    $(document).on('click','.checkbox-task', function(){
        var status = $(this).prop('checked');
        //alert("status: " + status);


        //$input = $('#input-task');
        //$input.focus();

        var $this = $(this);
        var $task = $(this).parent().parent();

        if($task.data('done')){
            $.ajax({
                type: 'PATCH',
                url: $this.data('href'),
                success: function(data){
                    $this.parent().prev().removeClass('task-done');
                    $this.parent().prev().addClass('task-not-done');
                    $task.data('done', false);
                    $this.prop('checked', false);
                    refresh_count();
                }
            });
        }else{
            $.ajax({
                type: 'PATCH',
                url: $this.data('href'),
                success: function(data){
                    $this.parent().prev().removeClass('task-not-done');
                    $this.parent().prev().addClass('task-done');
                    $task.data('done', true);
                    $this.prop('checked', true);
                    refresh_count();
                }
            })
        }
    });

    function refresh_count(){
        var $tasks = $('.task');
        var count_all = $tasks.length;
        var count_active = $tasks.filter(function(){
            return $(this).data('done') === false;
        }).length;
        var count_completed = $tasks.filter(function(){
            return $(this).data('done') === true;
        }).length;

        $('#count-all').html(count_all);
        $('#count-active').html(count_active);
        $('#count-completed').html(count_completed);
    }

    function task_new(e){
        if(e.which !== ENTER_KEY){
            return;
        }

        var $input = $('#input-task');
        var value = $input.val().trim();
        if(!value){
            return;
        }

        $input.focus().val('');
        $.ajax({
            type: 'POST',
            url: task_new_url,
            data: JSON.stringify({'body': value}),
            contentType: 'application/json;charset=UTF-8',
            success: function(data){
                $('.tasks').append(data.html);
                refresh_count();
            }
        })

    };

    $(document).on('keyup', '#input-task', task_new.bind(this));


    $(document).on('mouseenter', '.task', function(){
        $(this).find('.task-edit').removeClass('hide');
    });
    $(document).on('mouseleave', '.task', function(){
        $(this).find('.task-edit').addClass('hide');
    });


    function remove_input_edit(){
        var $input_edit = $('#input-edit');
        var $input = $('#input-task');

        $input_edit.parent().prev().show();
        $input_edit.parent().remove();
        //$input.focus();
    }

    $(document).on('click', '.btn-edit', function(){
        var $task = $(this).parent().parent();
        var task_id = $task.data('id');
        var task_body = $('#body'+task_id).text();
        $task.hide();
        $task.after("<div><input id='input-edit' type='text' value='"+task_body+"', autocomplete='off' autofocus required> </div> ");
        var $input_edit = $('#input-edit');

        var str_len = $input_edit.val().length * 2;

        $input_edit.focus();
        $input_edit[0].setSelectionRange(str_len, str_len);

        $(document).on('keydown', function(e){
            if(e.keyCode === ESC_KEY){
                remove_input_edit();
            }
        });

        $input_edit.on('focusout', function(){
            remove_input_edit();
        });

    });

    $(document).on('keyup', '#input-edit', function(e){
        if(e.keyCode !== ENTER_KEY){
            return;
        }
        $input_edit = $('#input-edit');
        var value = $input_edit.val().trim();
        if (!value){
            return;
        }
        $input_edit.val('');

        var url = $input_edit.parent().prev().data('href');
        var id = $input_edit.parent().prev().data('id');

        $.ajax({
            type: 'PUT',
            url: url,
            data: JSON.stringify({'body': value}),
            contentType: 'application/json;charset=UTF-8',
            success: function(data){
                $('#body'+id).html(value);
                $input_edit.parent().prev().data('body', value);
                remove_input_edit();
            }
        })
    });

    $(document).on('click', '.btn-delete', function(){
        var $input = $('#input-task');
        var $task = $(this).parent().parent();

        $input.focus();
        $.ajax({
            type: 'DELETE',
            url: $(this).data('href'),
            success: function(data){
                $task.remove();
                refresh_count();
            }
        });
    });









});