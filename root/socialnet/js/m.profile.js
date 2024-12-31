/**
 * @preserve phpBB Social Network 0.7.2 - Profile Page module
 * (c) 2010-2012 Kamahl & Culprit & Senky http://phpbbsocialnetwork.com
 * http://opensource.org/licenses/gpl-license.php GNU Public License
 * (Updated to jQuery 3.7+ and implemented no-conflict mode, integramod.com, December 2024)
 */
 
/**
 * Declaration for phpBB Social Network Profile module
 * @param {function} $ jQuery in no-conflict mode
 * @param {object} $sn socialNetwork
 * @returns {void}
 */
(function($, $sn) {
    // Use jQuery.noConflict() to avoid conflicts with other libraries
    $ = jQuery.noConflict(true);
 
    $sn.up = {
        url: '{U_UP_TAB_WALL}',
        urlAJAX: '{U_UP_AJAXURL}',
        urlSelectFriends: '{U_SELECT_FRIENDS}',
        spinner: '<em>Loading&#8230;</em>',
        nextText: '{L_NEXT}',
        prevText: '{L_PREVIOUS}',
        dateFormat: 'd. MM yy',
        dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        dayNamesShort: ['{L_SN_UP_SUNDAY_MIN}', '{L_SN_UP_MONDAY_MIN}', '{L_SN_UP_TUESDAY_MIN}', '{L_SN_UP_WEDNESDAY_MIN}', '{L_SN_UP_THURSDAY_MIN}', '{L_SN_UP_FRIDAY_MIN}', '{L_SN_UP_SATURDAY_MIN}'],
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        _inited: false,
        tabReportUser: -1,
        tabShowFullPage: 'false',
        menuPosition: {
            my: "right top",
            at: "right bottom"
        },
        init: function(opts) {
            if (!$sn._inited) {
                return false;
            }
            if ($sn.enableModules.up == undefined || !$sn.enableModules.up) {
                return false;
            }
            var self = this;
            $sn._settings(this, opts);
 
            if ($('#sn-up-profileTabs').length > 0) {
                var par_URL = $sn.parseURL(window.location);
                var c_url = $('#sn-up-profileTabs li:first a').attr('href');
                if (par_URL.hash == 'socialnet_us' && par_URL.params.status_id != null) {
                    $sn.setCookie('sn_up_profileTab', 0);
                    $('#sn-up-profileTabs li:first a').attr('href', $sn.us.url + '?smode=status_one&status=' + par_URL.params.status_id + '&wall=' + par_URL.params.u);
                }
                self.url = self.url.replace(/&amp;/, '&');
 
                $('#sn-up-profileTabs').on('mousedown', function(event) {
                    self.tabShowFullPage = (event.which == 3) ? 'true' : 'false';
                    if (event.which == 3)
                        return false;
                }).tabs({
                    ajaxOptions: {
                        cache: false,
                        async: false,
                        data: {
                            fullPage: self.tabShowFullPage
                        }
                    },
                    cache: false,
                    spinner: self.spinner,
                    cookie: {
                        name: $sn.cookie.name + 'sn_up_profileTab',
                        path: $sn.cookie.path,
                        domain: $sn.cookie.domain,
                        secure: $sn.cookie.secure
                    },
                    create: function(e, ui) {
                        if ($sn.getCookie('sn-up-profileTab') == 0) {
                            return false;
                        }
                    },
                    beforeActivate: function(e, ui) {
                        $(ui.newPanel).html(self.spinner);
                    },
                    load: function(e, ui) {
                        if (!$sn.isOutdatedBrowser) {
                            $('textarea.sn-us-mention').mentionsInput({
                                templates: {
                                    wrapper: _.template('<div class="sn-us-mentions-input-box"></div>'),
                                    autocompleteList: _.template('<div class="sn-us-mentions-autocomplete-list"></div>'),
                                    mentionsOverlay: _.template('<div class="sn-us-mentions"><div></div></div>')
                                },
                                onDataRequest: function(mode, query, callback) {
                                    $.getJSON($sn.us.url, {
                                        smode: 'get_mention',
                                        uname: query
                                    }, function(data) {
                                        data = _.filter(data, function(item) {
                                            return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
                                        });
                                        callback.call(this, data);
                                    });
                                }
                            });
                        }
 
                        $('.sn-up-editable').snEditable({
                            datePicker: {
                                isRTL: $sn.rtl,
                                dateFormat: self.dateFormat,
                                monthNames: self.monthNames,
                                monthNamesShort: self.monthNamesShort
                            },
                            ajaxOptions: {
                                url: self.urlAJAX,
                                cache: false
                            }
                        });
 
                        $sn.comments.waterMark();
 
                        $("#sn-us-wallInput").watermark($sn.us.watermark, {
                            useNative: false,
                            className: 'sn-us-watermark'
                        }).elastic({
                            parentElement: '.sn-us-share',
                            submitElement: '.sn-us-wallButton, .sn-us-fetchButton'
                        }).trigger('blur');
                        $sn._resize();
                        $sn._textExpander();
 
                    }
                })
                .removeAttr('style');
 
                $('#sn-up-profileTabs li:first a').attr('href', c_url);
            }
 
            if ($('.sn-up-reportUser a').length > 0 && $('#sn-up-profileTabs').length > 0) {
                $('.sn-up-reportUser a').on('click', function() {
                    self.tabCurrent = $('#sn-up-profileTabs').tabs('option', 'active');
                    if (self.tabReportUser != -1) {
                        $('#sn-up-profileTabs').tabs('option', 'active', self.tabReportUser);
                        return false;
                    }
                    self.tabReportUser = $('#sn-up-profileTabs').tabs('length');
                    var tabTitle = $(this).text();
                    $('#sn-up-profileTabs').tabs('add', '#sn-up-profileTabs-reportUser', tabTitle).tabs('option', 'url', self.tabReportUser, $(this).attr('href')).tabs('option', 'active', self.tabReportUser);
                    var tabReportUser = $('#sn-up-profileTabs .ui-tabs-nav li a[href$=reportUser]');
                    tabReportUser.find('span').css({
                        'float': $sn.rtl ? 'right' : 'left'
                    });
                    tabReportUser.prepend('<span class="ui-icon ui-icon-alert">' + tabTitle + '</span>');
                    tabReportUser.append('<span class="ui-icon ui-icon-secondary ui-icon-close sn-action-tabClose"></span>');
                    $('#sn-up-profileTabs').tabs('option', 'active', self.tabReportUser);
                    tabReportUser.prev('.ui-icon.ui-icon-close').css('cursor', 'pointer').on('click', function() {
                        $('#sn-up-reportUser input[name=cancel]').trigger('click');
                    });
                    return false;
                });
            }
 
            $(document).on('click', '#sn-up-profileTabs .ui-tabs-nav li a[href$=reportUser] .sn-action-tabClose', function() {
                $('#sn-up-profileTabs').tabs('option', 'active', self.tabCurrent).tabs('remove', self.tabReportUser);
                self.tabReportUser = -1;
                return false;
            });
 
            $('.sn-up-viewAllFriends .ui-button a').on('click', function() {
                $('html, body').animate({
                    scrollTop: 0
                }, 'fast');
                $("#sn-up-profileTabs").tabs('option', 'active', '#sn-up-profileTabs-friends');
                return false;
            });
 
            this._ucpProfile();
            this._ucpRelations();
            this._upMenu.init();
            this._emotes();
            $sn._resize();
        },
        // ... (rest of the code remains the same)
    };
}(jQuery, socialNetwork));