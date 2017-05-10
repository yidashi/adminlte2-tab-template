/**
 * Created by yidashi on 16/7/28.
 */
$(document).ajaxError(function(event,xhr,options,exc){
    var message = xhr.responseJSON ? xhr.responseJSON.message : '操作失败';
    if (xhr.status == 403) {
        message = xhr.responseText;
    }
    $.modal.error(message);
});
$.fn.ajaxSubmit = function (options) {
    var $form = this;
    options = $.extend({
        method:$form.attr('method'),
        action:$form.attr('action'),
        refreshPjaxContainer: this.data('refresh-pjax-container') || null,
        refresh: this.data('refresh') || false,
        callback: this.data('callback') || null,
        confirm: this.data('confirm') || null
    }, options);
    var method = options.method,
        action = options.action,
        refreshPjaxContainer = options.refreshPjaxContainer,
        refresh = options.refresh,
        callback = options.callback;
    var fn = function () {
        $.modal.loading();
        $.ajax({
            url: action,
            method: method,
            data: $form.serialize(),
            dataType: 'json',
            success: function (res) {
                if (res.status != undefined && res.status == 0) {
                    $.modal.error(res.message || '操作失败');
                    return;
                }
                if (!res.message) {
                    res.message = '操作成功';
                }
                $.modal.notify(res.message, 'success', function () {
                    $form.trigger('reset');
                    if (refreshPjaxContainer) {
                        $.pjax.reload({container:'#' + refreshPjaxContainer, timeout: 0});
                    }
                    if (refresh) {
                        location.reload();
                    }
                    if (callback) {
                        callback(res);
                    }
                });
            },
            complete: function () {
                $.modal.unloading();
            }
        });
    }
    $form.off('beforeSubmit').on('beforeSubmit', function () {
        if (options.confirm != null) {
            $.modal.confirm(options.confirm, function () {
                fn();
            });
        } else {
            fn();
        }
        return false;
    });
}
$.fn.ajaxLink = function (options) {
    options = $.extend({
        method:this.data('method') || 'get',
        action:this.data('action') || this.attr('href'),
        refreshPjaxContainer: this.data('refresh-pjax-container') || null,
        refresh: this.data('refresh') || false,
        callback: this.data('callback') || null,
        confirm: this.data('confirm') || null,
        data: this.data('params') || {}
    }, options);
    var ele = this;
    var fn = function () {
        ele.addClass('disabled');
        $.ajax({
            url: options.action,
            method: options.method,
            data: options.data,
            dataType: 'json',
            success: function (res) {
                if (res.status != undefined && res.status == 0) {
                    $.modal.error(res.message || '操作失败');
                    return;
                }
                if (!res.message) {
                    res.message = '操作成功';
                }
                $.modal.notify(res.message, 'success', function () {
                    if (options.refreshPjaxContainer) {
                        $.pjax.reload({container:'#' + options.refreshPjaxContainer, timeout: 0});
                    }
                    if (res.redirect) {
                        location.href = res.redirect;
                    } else {
                        if (options.refresh) {
                            location.reload();
                        }
                        if (options.callback) {
                            options.callback(res);
                        }
                    }
                });
            },
            complete: function () {
                ele.removeClass('disabled');
            }
        });
    }
    ele.on('click', function () {
        if (options.confirm != null) {
            $.modal.confirm(options.confirm, function () {
                fn();
            });
        } else {
            fn();
        }
        return false;
    });
}
$(function () {
    $(document).on('click', "a[target='_blank']", function () {
        if ($(this).attr('no-iframe')) {
            return true;
        }
        if (parent != window) {
            parent.admin_tab(this);
            return false;
        }
    });
    $('[data-toggle=popover]').popover();
    $('[data-toggle=tooltip]').tooltip();
    $('a[data-ajax=1]').each(function () {
        $(this).ajaxLink();
    });
    $('form[data-ajax=1]').each(function () {
        $(this).ajaxSubmit();
    });
})
String.prototype.addQueryParams = function(params) {
    var split = '?';
    if (this.indexOf('?') > -1) {
        split = '&';
    }

    var queryParams = '';
    for(var i in params) {
        queryParams += i + '=' + params[i] + '&';
    }
    queryParams = queryParams.substr(0, queryParams.length -1)
    return this + split + queryParams;
}
