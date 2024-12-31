/**
 * @preserve phpBB Social Network 0.7.2 - Activity Page module
 * (c) 2010-2012 Kamahl & Culprit & Senky http://phpbbsocialnetwork.com
 * http://opensource.org/licenses/gpl-license.php GNU Public License
 * (Updated to jQuery 3.7+ and implemented no-conflict mode, integramod.com, December 2024)
 */
 
/**
 * (Updated to jQuery 3.7+ and implemented no-conflict mode, integramod.com, December 2024)
 * @param {object} $ jQuery
 * @param {object} $sn socialNetwork
 * @returns {void}
 */
(function($, $sn) {
    // Use jQuery.noConflict() to avoid conflicts with other libraries
    $ = jQuery.noConflict();
 
    $sn.ap = {
        url: './socialnet/activitypage.php',
        urlUsersAutocomplete: '{U_USERS_AUTOCOMPLETE}',
        blockOnlineUsers: false,
        tikTakOnline: 30000,
        tikTakName: 'sn-ap-onlineTicker',
        loadingNews: false,
        loadMoreTime: 4000,
        _isScrollingToLoadMore: false,
 
        init: function(opts) {
            if (!$sn._inited) {
                return false;
            }
            if ($sn.enableModules.ap == undefined || !$sn.enableModules.ap) {
                return false;
            }
            $sn._settings(this, opts);
 
            var self = this;
            if (this.blockOnlineUsers) {
                if ($sn.allow_load) {
                    // Replace deprecated .everyTime() with setInterval()
                    setInterval(function() {
                        self.onlineList();
                    }, self.tikTakOnline);
                }
            }
 
            $('.sn-ap-getMore').on('click', function() {
                if ($('.ui-dialog').is(':visible')) {
                    return;
                }
                if (self._isScrollingToLoadMore == true) {
                    return;
                }
                var o_more = $(this);
                self._isScrollingToLoadMore = true;
                var o_loader = o_more.next('.sn-ap-statusLoader');
                $(o_loader).show();
                var o_prev = o_more.parents('.sn-more');
                var i_obj = $(o_prev).prev('div[id^=sn-ap-entry]');
                var i_lEntry = $sn.getAttr($(i_obj), 't');
 
                $.ajax({
                    url: self.url,
                    data: {
                        mode: 'snApOlderEntries',
                        lEntryTime: i_lEntry
                    },
                    error: function() {
                        $(o_loader).hide();
                        self._isScrollingToLoadMore = false;
                    },
                    success: function(data) {
                        $(o_prev).before(data.content);
                        $sn.comments.waterMark();
                        $('div[id^=sn-ap-entry]:hidden').slideDown('slow');
                        $(o_loader).hide();
                        if (data.more === false) {
                            $(o_more).remove();
                        }
                        $sn._textExpander();
                        self._isScrollingToLoadMore = false;
                    }
                });
            });
 
            $('.sn-ap-search input.inputbox').on('focusin focusout', function() {
                $('.sn-ap-search').toggleClass('sn-inputbox-focus');
            });
 
            self.urlUsersAutocomplete = self.urlUsersAutocomplete.replace(/&amp;/g, '&');
 
            $("#sn-ap-searchUsersAutocomplete").autocomplete({
                source: self.urlUsersAutocomplete,
                minLength: 3,
                appendTo: '#sn-ap-searchAutocompleteContainer',
                delay: 300,
                select: function(event, ui) {
                    $(this).closest('form').find('#sn-ap-searchUsersAutocomplete').val(ui.item.value);
                    $(this).closest('form').submit();
                }
            }).closest('form').on('submit', function(e) {
                if ($('#sn-ap-searchUsersAutocomplete').val() == '') {
                    e.preventDefault();
                }
            });
 
            $('a.sn-ap-loadNews').on('click', function(e) {
                e.preventDefault();
                self.loadNews();
            });
            $sn._textExpander();
        },
 
        /**
         * Load online users
         */
        onlineList: function() {
            $.ajax({
                type: 'post',
                cache: false,
                url: this.url,
                timeout: 1000,
                data: {
                    mode: 'onlineUsers'
                },
                success: function(data) {
                    $('#sn-ap .sn-ap-onlineUsers').html(data.list);
                }
            });
        },
 
        /**
         * Load new entries
         */
        loadNews: function() {
            if ($('.ui-dialog').is(':visible')) {
                return;
            }
            if (this.loadingNews) {
                return;
            }
            this.loadingNews = true;
            var o_next = $('.sn-ap-loadNewsOver');
            var o_lEntry = $('.sn-page-content').find('div[id^=sn-ap-entry]:first');
            var i_lEntry = o_lEntry.length ? $sn.getAttr(o_lEntry, 't') : 0;
 
            $.ajax({
                url: this.url,
                cache: false,
                data: {
                    mode: 'snApNewestEntries',
                    lEntryTime: i_lEntry
                },
                success: function(data) {
                    if ($(data.content).length > 0) {
                        o_next.after(data.content);
                        $(".sn-us-inputComment").watermark($sn.us.watermarkComment, {
                            useNative: false,
                            className: 'sn-us-watermark'
                        }).elastic();
                        var parent = o_next.parent('div');
                        if (parent.children('div:not([id^=sn-ap-entry])[id^=sn-us]').length == 0) {
                            parent.children('div[id^=sn-ap-entry]:hidden').fadeIn('slow').removeAttr('style');
                            parent.children('div:not([id^=sn-ap-entry])[id^=sn-us]').fadeOut('fast').remove();
                        } else {
                            parent.children('div[id^=sn-ap-entry]:hidden').show().removeAttr('style');
                            parent.children('div:not([id^=sn-ap-entry])[id^=sn-us]').remove();
                        }
                    }
 
                    $sn.comments.waterMark();
                    $sn.ap.loadingNews = false;
                }
            });
        },
 
        _scroll: function() {
            if ($('.sn-more').length > 0 && $('.sn-ap-getMore').length > 0 && this._isScrollingToLoadMore == false) {
                if ($(window).scrollTop() >= $('.sn-ap-getMore').offset().top - $(window).height() + $('.sn-ap-getMore').parent().height()) {
                    // Replace deprecated .oneTime() with setTimeout()
                    setTimeout(function() {
                        if ($('.sn-ap-getMore').length == 0 || $sn.ap._isScrollingToLoadMore == true) {
                            return;
                        }
 
                        if ($(window).scrollTop() >= $('.sn-ap-getMore').offset().top - $(window).height() + $('.sn-ap-getMore').parent().height()) {
                            $('.sn-ap-getMore').trigger('click');
                        }
                    }, this.loadMoreTime);
                }
            }
        }
    };
}(jQuery, socialNetwork));