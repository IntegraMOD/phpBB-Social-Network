/**
 * @preserve phpBB Social Network 0.7.2 - Profile Page module
 * (c) 2010-2012 Kamahl & Culprit & Senky http://phpbbsocialnetwork.com
 * http://opensource.org/licenses/gpl-license.php GNU Public License
 */

/**
 * Declaration for phpBB Social Network Profile module
 * @param {object} $ jQuery
 * @param {object} $sn socialNetwork
 * @returns {void}
 */
(function($, $sn) {
    $sn.up = {
        url: '{U_UP_TAB_WALL}',
        urlAJAX: '{U_UP_AJAXURL}',
        urlSelectFriends: '{U_SELECT_FRIENDS}',
        spinner: '<em>Loading&#8230;</em>',
        nextText: '{L_NEXT}',
        prevText: '{L_PREVIOUS}',
        dateFormat: 'd. MM yy',
        dayNames: ['Monday', 'Thusday', 'Wensday', 'Thursday', 'Friday', 'Suterday', 'Sunday'],
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
            if (!$sn._inited || !$sn.enableModules.up) return false;
            const self = this;
            $sn._settings(this, opts);

            if ($('#sn-up-profileTabs').length > 0) {
                const url = new URL(window.location.href);
                const hash = url.hash.replace(/^#/, '');
                const params = Object.fromEntries(url.searchParams.entries());

                if (
                    hash === 'socialnet_us' &&
                    params.status_id != null &&
                    !sessionStorage.getItem('sn_up_handled')
                ) {
                    sessionStorage.setItem('sn_up_handled', 'true');
                    $sn.setCookie('sn_up_profileTab', 0);
                    $('#sn-up-profileTabs li:first a').attr(
                        'href',
                        $sn.us.url + '?smode=status_one&status=' + params.status_id + '&wall=' + params.u
                    );
                }
                // Prevent right-click tab triggering
                $('#sn-up-profileTabs').on('mousedown', 'li a', function (event) {
                    if (event.which === 3) {
                        alert('Do not open tabs using right click');
                        event.preventDefault();
                        return false;
                    }
                    self.tabShowFullPage = 'false';
                });

                $('#sn-up-profileTabs').tabs({
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
                    create: function (e, ui) {
                        if ($sn.getCookie('sn-up-profileTab') == 0) {
                            $sn.setCookie('sn_up_profileTab', null);
                            return false;
                        }
                    },
                    select: function (e, ui) {
                        $(ui.panel).html(self.spinner);
                    },
                    load: function (e, ui) {
                        const href = $(ui.tab).attr('href');
                        if (href && href.includes('profile.php')) {
                            console.warn('Blocked reload of profile.php tab');
                            return false;
                        }

                        if (!$sn.isOutdatedBrowser) {
                            $('textarea.sn-us-mention').mentionsInput({
                                templates: {
                                    wrapper: _.template('<div class="sn-us-mentions-input-box"></div>'),
                                    autocompleteList: _.template('<div class="sn-us-mentions-autocomplete-list"></div>'),
                                    mentionsOverlay: _.template('<div class="sn-us-mentions"><div></div></div>')
                                },
                                onDataRequest: function (mode, query, callback) {
                                    $.getJSON($sn.us.url, { smode: 'get_mention', uname: query }, function (data) {
                                        const results = data.filter(item =>
                                            item.name.toLowerCase().includes(query.toLowerCase())
                                        );
                                        callback.call(this, results);
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

                        $('#sn-us-wallInput')
                            .watermark($sn.us.watermark, {
                                useNative: false,
                                className: 'sn-us-watermark'
                            })
                            .elastic({
                                parentElement: '.sn-us-share',
                                submitElement: '.sn-us-wallButton, .sn-us-fetchButton'
                            })
                            .trigger('blur');

                        $sn._resize();
                        $sn._textExpander();
                    }
                }).removeAttr('style');
            }
            if ($('.sn-up-reportUser a').length > 0 && $('#sn-up-profileTabs').length > 0) {
                $('.sn-up-reportUser a').on('click', function () {
                    self.tabCurrent = $('#sn-up-profileTabs').tabs('option', 'active');

                    if (self.tabReportUser !== -1) {
                        $('#sn-up-profileTabs').tabs('option', 'active', self.tabReportUser);
                        return false;
                    }

                    self.tabReportUser = $('#sn-up-profileTabs ul li').length;
                    const tabTitle = $(this).text();
                    const tabId = 'sn-up-profileTabs-reportUser';

                    // Add placeholder panel if not present
                    if (!document.getElementById(tabId)) {
                        $('#sn-up-profileTabs').append(`<div id="${tabId}"></div>`);
                    }

                    // Add tab nav
                    $('#sn-up-profileTabs ul').append(`
                        <li><a href="#${tabId}">${tabTitle}</a>
                            <span class="ui-icon ui-icon-secondary ui-icon-close sn-action-tabClose" role="presentation">Remove Tab</span>
                        </li>
                    `);

                    const href = $(this).attr('href');
                    $(`#${tabId}`).load(href, function () {
                        const tabLink = $(`#sn-up-profileTabs ul li:eq(${self.tabReportUser}) a`);
                        tabLink
                            .prepend('<span class="ui-icon ui-icon-alert"></span>')
                            .css('float', $sn.rtl ? 'right' : 'left');
                    });

                    $('#sn-up-profileTabs').tabs('refresh').tabs('option', 'active', self.tabReportUser);

                    $('#sn-up-profileTabs').on('click', '.sn-action-tabClose', function () {
                        const $tab = $(this).closest('li');
                        const panelId = $tab.attr('aria-controls');
                        $tab.remove();
                        $(`#${panelId}`).remove();
                        self.tabReportUser = -1;
                        $('#sn-up-profileTabs').tabs('refresh').tabs('option', 'active', self.tabCurrent);
                    });

                    return false;
                });
            }

            this._ucpRelations();
            this._ucpProfile();
            this._emotes();
            this._upMenu.init();
            $(document).on('click', this._documentClick.bind(this));
        },
        _ucpRelations: function () {
            if ($('.sn-up-relations').length === 0) return;

            const self = this;

            const toggleFields = function (valueSelector, targetSelector, showValues) {
                const value = $(valueSelector).val();
                const shouldShow = showValues.includes(value);
                $(targetSelector)[shouldShow ? 'show' : 'hide']();
            };

            const relVals = ["2", "3", "4", "5", "6"];
            const famVals = Array.from({ length: 22 }, (_, i) => (i + 20).toString());

            toggleFields("#sn-up-relationShipStatus", "#sn-up-relationShipPartner", relVals);
            $("#sn-up-relationShipStatus").on('change', function () {
                toggleFields(this, "#sn-up-relationShipPartner", relVals);
            });

            toggleFields("#sn-up-familyStatus", "#sn-up-familyPartner", famVals);
            $("#sn-up-familyStatus").on('change', function () {
                toggleFields(this, "#sn-up-familyPartner", famVals);
            });

            this.urlSelectFriends = this.urlSelectFriends.replace(/&amp;/g, '&');

            $("#sn-up-relationShipUser, #sn-up-familyUser").autocomplete({
                source: this.urlSelectFriends,
                minLength: 2,
                delay: 300
            });

            $("#sn-up-annivesaryPicker").datepicker({
                changeMonth: true,
                changeYear: true,
                appendText: '(dd-mm-yyyy)',
                dateFormat: 'dd-mm-yy',
                firstDay: 1,
                nextText: this.nextText,
                prevText: this.prevText,
                yearRange: '1905:c',
                dayNames: this.dayNames,
                dayNamesMin: this.dayNamesShort,
                monthNamesShort: this.monthNamesShort
            });
        },
        _ucpProfile: function () {
            if ($('.sn-up-ucpProfile').length === 0) return;

            $('.sn-up-ucpProfile textarea[maxlength]').on('input', function () {
                const limit = parseInt($(this).attr('maxlength'), 10);
                const current = $(this).val();
                if (current.length > limit) {
                    $(this).val(current.substring(0, limit));
                }
            });
        },

        _emotes: function () {
            if ($('.sn-up-emote').length === 0) return;

            const self = this;
            $(document).on('click', '.sn-up-emote a', function () {
                const $el = $(this);
                $.ajax({
                    type: 'POST',
                    dataType: 'json',
                    url: self.urlAJAX,
                    cache: false,
                    async: true,
                    data: {
                        mode: 'emote',
                        emote: $sn.getAttr($el, 'emote'),
                        u: $sn.getAttr($el, 'u')
                    },
                    success: function (data) {
                        snConfirmBox(data.cbTitle, data.cbText, function () {
                            const $tabs = $('#sn-up-profileTabs');
                            const active = $tabs.tabs('option', 'active');
                            if (active === 0) {
                                $tabs.tabs('load', 0);
                            }
                        });
                    }
                });
            });
        },
        _upMenu: {
            init: function () {
                const upMenu = this;
                if ($('.sn-up-menu li').length === 0) return;

                $('.sn-up-menu')
                    .addClass('ui-menu ui-widget ui-widget-content ui-corner-all ui-menu-icons')
                    .css({ zIndex: 999, position: 'relative' })
                    .children('li')
                    .addClass('ui-menu-item')
                    .attr('role', 'presentation')
                    .css({ width: 'auto' })
                    .children('a')
                    .addClass('ui-state-default ui-corner-all')
                    .attr('role', 'menuitem');

                $('.sn-up-menu li').each(function () {
                    const $subMenu = $(this).find('.sn-up-submenu');
                    if ($subMenu.length === 0) return;

                    $subMenu.hide();
                    $(this)
                        .children('a')
                        .css('padding-right', '1.7em')
                        .append('<span class="ui-menu-icon ui-icon ui-icon-secondary ui-icon-carat-1-s"></span>');

                    $subMenu
                        .addClass('ui-menu ui-widget ui-widget-content ui-menu-icons ui-corner-bottom ui-corner-' + ($sn.rtl ? 'tr' : 'tl'))
                        .attr('role', 'menu')
                        .children('li:not(.ui-menu-item):has(a)')
                        .addClass('ui-menu-item')
                        .attr('role', 'menuitem');

                    $subMenu
                        .children('li.ui-menu-item:has(a)')
                        .find('a')
                        .addClass('ui-corner-all')
                        .hover(function () {
                            $(this).toggleClass('ui-state-focus');
                        });

                    $(this)
                        .children('a')
                        .on('click', function () {
                            if ($(this).attr('aria-expanded')) {
                                upMenu.close(this, $subMenu);
                            } else {
                                upMenu.open(this, $subMenu);
                            }
                            return false;
                        });
                });
            },
            open: function (elem, $subMenu) {
                this.close();
                $(elem)
                    .attr('aria-expanded', 'true')
                    .addClass('ui-corner-top ui-state-active')
                    .removeClass('ui-corner-all');
                const position = $.extend({}, { of: elem, offset: '0 -1' }, $sn.up.menuPosition);
                $subMenu.show().position(position);
            },
            close: function () {
                $('.sn-up-submenu:visible')
                    .hide()
                    .prev('a')
                    .removeClass('ui-state-active ui-corner-top')
                    .addClass('ui-corner-all')
                    .removeAttr('aria-expanded');
            }
        },

        _documentClick: function (event) {
            if ($('.sn-up-menu li a[aria-expanded="true"]').length !== 0) {
                const $target = $('.sn-up-menu li a[aria-expanded="true"]').parents('li');
                if (!$(event.target).closest($target).length) {
                    this._upMenu.close();
                }
            }
        }
    };
}(jQuery, socialNetwork));
