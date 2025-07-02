/**
 * @preserve phpBB Social Network 0.7.2 - Friends Management System
 * (c) 2010-2012 Kamahl & Culprit & Senky http://phpbbsocialnetwork.com
 * http://opensource.org/licenses/gpl-license.php GNU Public License
 */

/**
 * Declaration for phpBB Social Network Friends Management System module
 * @param {object} $ jQuery
 * @param {object} $sn socialNetwork
 * @returns {void}
 */
(function($, $sn) {
    $sn.fms = {
        url: '',
        urlFMS: '',
        noFriends: '{ FAS FRIENDGROUP NO TOTAL }',
        deleteUserGroup: '{ FMS_DELETE_FRIENDUSERGROUP }',
        deleteUserGroupText: '{ FMS_DELETE_FRIENDUSERGROUP_TEXT }',
        _init: false,

        _load: function(m, s, u) {
            let i_bl = m === 'friends' ? 'friend' : m;
            $.ajax({
                url: $sn.fms.url,
                data: { mode: m, fmsf: s, usr: u },
                success: function(data) {
                    $('#ucp_' + i_bl + ' .inner').html(data);
                    $('.sn-fms-friend span').textOverflow('..');
                    $sn.fms._runLoadInit(m);
                }
            });
        },

        usersLoad: function(m, s, l, u, c, r, p) {
            const self = this;
            $.ajax({
                url: self.urlFMS,
                data: {
                    mode: m, fmsf: s, flim: l, usr: u,
                    chkbx: c, sl: r, pl: p
                },
                dataType: 'json',
                success: function(data) {
                    if (!r) {
                        $('#sn-fms-usersBlockPagination-' + m).html(data.pagination);
                    }
                    $('#sn-fms-usersBlockContent-' + m).html(data.content);
                    self.callbackInit(m);
                }
            });
        },

        callbackInit: function(mode) {
            if (this._inits[mode]) {
                return this._inits[mode].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof mode === 'object' || !mode) {
                return mode.init.apply(this, arguments);
            }
        },
        _inits: {
            friend: function() {
                $sn.fms._inits._simple('friend');
                $sn.fms._inits.group();
            },
            approve: function() {
                $sn.fms._inits._simple('approve');
            },
            cancel: function() {
                $sn.fms._inits._simple('cancel');
            },
            group: function() {
                $('.sn-fms-friendsBlock.ufg .sn-fms-users > div').draggable({
                    helper: 'clone',
                    appendTo: 'body',
                    revert: 'invalid'
                });
            },
            _simple: function(m) {
                $('#sn-fms-usersBlockContent-' + m)
                    .parents('form[id^=ucp] .inner')
                    .children('fieldset.submit-buttons')
                    .children('input')
                    .prop('disabled', true)
                    .addClass('disabled');
            }
        },

        _groupChange: function(s_sub, i_gid, i_uid, s_gid) {
            let dt = $.ajax({
                type: 'POST',
                url: $sn.fms.url,
                async: false,
                cache: false,
                dataType: 'json',
                data: {
                    mode: 'group',
                    sub: s_sub,
                    gid: i_gid,
                    uid: i_uid,
                    tid: s_gid
                }
            }).responseText;
            dt = $.parseJSON(dt);
            return dt;
        },

        _loadFriends: function(toobj) {
            if (toobj.html() !== '') return false;

            $.ajax({
                type: 'POST',
                url: $sn.fms.urlFMS,
                dataType: 'json',
                async: false,
                data: {
                    mode: 'friendgroup',
                    gid: $sn.getAttr(toobj, 'gid')
                },
                success: function(data) {
                    toobj.append(data.content);
                }
            });
        },
        _changeButtons: function(obj, chCls) {
            const snFmsButtons = $(obj)
                .closest('form[id^=ucp]')
                .find('fieldset.submit-buttons input');

            if ($(obj).siblings('.sn-fms-friend.' + chCls).length !== 0) {
                snFmsButtons.prop('disabled', false).removeClass('disabled');
            } else {
                snFmsButtons.prop('disabled', true).addClass('disabled');
            }
        },

        init: function(opts) {
            if (!$sn._inited || !$sn.enableModules.fms) return false;

            $sn._settings(this, opts);
            this._initUcpFormAdd();
            this._initUcpForms();
            this._initUcpHistory();
            this._initUpGroupMenu();
            this._initGroupAccordion(); // GROUPS ACCORDION
        },

        _initUcpFormAdd: function() {
            const $add = $('form#ucp #add');
            const $submit = $('form#ucp input[name=submit]');
            const $reset = $('form#ucp input[name=reset]');

            if ($add.length === 0 || $('#usernames').length !== 0) return;

            $add.on('keyup change', function () {
                if ($(this).val() === '') {
                    $submit.prop('disabled', true).addClass('disabled');
                } else {
                    $submit.prop('disabled', false).removeClass('disabled');
                }
            });

            $reset.on('click', function () {
                $submit.prop('disabled', true).addClass('disabled');
            });

            $('form#ucp').on('mouseover', function () {
                $add.trigger('keyup');
            });

            if ($add.val() === '') {
                $submit.prop('disabled', true).addClass('disabled');
            } else {
                $submit.prop('disabled', false).removeClass('disabled');
            }
        },
        _initUcpForms: function() {
            const self = this;

            if (
                $('#ucp_friend').length === 0 &&
                $('#ucp_approve').length === 0 &&
                $('#ucp_cancel').length === 0
            ) return;

            this.callbackInit('friend');

            $(document).on('click', '.sn-fms-friend', function() {
                const chCls = 'checked';
                $(this).toggleClass(chCls);
                $(this)
                    .find('input[type=checkbox]')
                    .prop('checked', $(this).hasClass(chCls));
                self._changeButtons(this, chCls);
            });

            $('.sn-fms-friend span').textOverflow('..');

            $(document).on('click', '.sn-fms-friend a', function() {
                window.location = $(this).attr('href');
                return false;
            });

            $('[id^=ucp_] a.mark').on('click', function () {
                const $s_block = $(this).attr('class').replace('mark ', '');
                $('#sn-fms-usersBlockContent-' + $s_block + ' .sn-fms-friend')
                    .addClass('checked')
                    .find('input[type=checkbox]')
                    .prop('checked', true);
                self._changeButtons(
                    $('#sn-fms-usersBlockContent-' + $s_block + ' .sn-fms-friend'),
                    'checked'
                );
                return false;
            });

            $('[id^=ucp_] a.unmark').on('click', function () {
                const $s_block = $(this).attr('class').replace('unmark ', '');
                $('#sn-fms-usersBlockContent-' + $s_block + ' .sn-fms-friend')
                    .removeClass('checked')
                    .find('input[type=checkbox]')
                    .prop('checked', false);
                self._changeButtons(
                    $('#sn-fms-usersBlockContent-' + $s_block + ' .sn-fms-friend'),
                    'checked'
                );
                return false;
            });

            $(document).on('click', 'input[type=reset]', function () {
                $('.sn-fms-friend').removeClass('checked');
                $('.sn-fms-friend input[type=checkbox]').prop('checked', false);
            });
        },
        _initUcpHistory: function() {
            $(document).on('click', '.sn-im-history-conversation', function () {
                window.location = $sn.getAttr($(this), 'u');
            });
        },

        _initGroupAccordion: function() {
            const self = this;
            let sortableIn = 0;

            if ($('#sn-fms-groupAccordion').length === 0) return;

            $('#sn-fms-groupAccordion').accordion({
                collapsible: false,
                clearStyle: true,
                event: 'click',
                changestart: function (e, ui) {
                    self._loadFriends(ui.newContent);
                }
            });

            self._loadFriends($('#sn-fms-groupAccordion').children('div').first());

            $('#sn-fms-groupAccordion > div')
                .droppable({
                    drop: function (event, ui) {
                        const $existing = $(this).find('div[title="' + ui.draggable.attr('title') + '"]');
                        if ($existing.length > 0) return;

                        const i_gid = $sn.getAttr($(this), 'gid');
                        const i_uid = $sn.getAttr(ui.draggable, 'uid');
                        const o_cnt = $('h3#sn-fms-grp' + i_gid + '-header span.counter');
                        const i_cnt = parseInt(o_cnt.text(), 10);

                        if (i_cnt === 0) $(this).html('');
                        $(this).append(ui.draggable.clone().css({ zIndex: 1500, opacity: 1 }));
                        o_cnt.text(i_cnt + 1);
                        self._groupChange('add', i_gid, i_uid);
                    },
                    activate: function (event, ui) {
                        ui.draggable.css({ opacity: 0.5 });
                    },
                    deactivate: function (event, ui) {
                        ui.draggable.css({ opacity: 1 });
                    }
                })
                .sortable({
                    helper: 'clone',
                    placeholder: 'sn-fms-friend move ui-state-highlight',
                    start: function (e, ui) {
                        $('.sn-fms-friend.move.ui-state-highlight').css({
                            height: ui.item.height() + 'px'
                        });
                    },
                    appendTo: 'body',
                    receive: function () {
                        sortableIn = 1;
                    },
                    over: function () {
                        sortableIn = 1;
                    },
                    out: function () {
                        sortableIn = 0;
                    },
                    beforeStop: function (e, ui) {
                        if (sortableIn === 0) {
                            const i_gid = $sn.getAttr($(this), 'gid');
                            const i_uid = $sn.getAttr(ui.item, 'uid');
                            const d_item = ui.item.clone();

                            $('body').append(d_item.css({
                                position: 'absolute',
                                top: ui.position.top,
                                left: ui.position.left
                            }));

                            ui.item.remove();
                            $('body > .sn-fms-friend')
                                .addClass('red')
                                .effect('explode', {}, 1000)
                                .remove();

                            const o_cnt = $('h3#sn-fms-grp' + i_gid + '-header span.counter');
                            o_cnt.text(parseInt(o_cnt.text(), 10) - 1);
                            self._groupChange('remove', i_gid, i_uid);
                        }
                    },
                    stop: function () {
                        const i_gid = $sn.getAttr($(this), 'gid');
                        const o_cnt = parseInt($('h3#sn-fms-grp' + i_gid + '-header span.counter').text(), 10);
                        if (o_cnt === 0) {
                            $(this).html(self.noFriends);
                        }
                    }
                });
            self.callbackInit('group');

            $(document).on('click', '#sn-fms-groupAccordion .sn-fms-groupDelete', function () {
                const i_gid = $sn.getAttr($(this), 'gid');
                const $grp = $('#sn-fms-groupAccordion > [id^="sn-fms-grp' + i_gid + '"]');
                const groupName = $('#sn-fms-groupAccordion > .ui-accordion-header[id^="sn-fms-grp' + i_gid + '"] a')
                    .text()
                    .replace(/\([^\(]+\)$/i, '');

                snConfirmBox(self.deleteUserGroup, self.deleteUserGroupText + '<br /><strong>' + groupName + '</strong>', function () {
                    $grp.remove();
                    self._groupChange('delete', i_gid, -1);
                });
                return false;
            });
        },

        _initUpGroupMenu: function () {
            const self = this;
            if ($('.sn-up-menu li').length === 0) return;

            $(document).on('click', '.sn-fms-groups a:not(#sn-fms-grpCreate)', function () {
                const gid = $sn.getAttr($(this), 'gid');
                const uid = $sn.getAttr($(this), 'uid');
                const $icon = $(this).children('.ui-icon');
                const sub = $icon.hasClass('ui-icon-check') ? 'remove' : 'add';
                self._groupChange(sub, gid, uid);
                $icon.toggleClass('ui-icon-check ui-icon-no');
                return false;
            });

            $(document).on('click', '.sn-fms-grpCreate .ui-icon', function () {
                const $text = $('#sn-fms-grpCreateText');
                const gid = $sn.getAttr($text, 'gid');
                const uid = $sn.getAttr($text, 'uid');
                const g_t = $text.val();
                const data = self._groupChange('create', gid, uid, g_t);

                const selector = 'a[class*="gid:' + data.gid + '"]';
                if ($(selector).length > 0) {
                    $(selector).children('.ui-icon').toggleClass('ui-icon-no ui-icon-check');
                    $text.val('');
                    return;
                }

                const $li = $('<li>', { role: 'menu-item' }).addClass('ui-menu-item');
                const $a = $('<a>', {
                    href: '#',
                    class: `{gid:${data.gid},uid:${data.uid}} ui-corner-all`,
                    html: '<span class="ui-icon ui-icon-check"></span>' + g_t
                }).hover(function () {
                    $(this).toggleClass('ui-state-focus');
                });

                $li.append($a);
                $('li.sn-fms-grpCreate').before($li);
                $text.val('');
            });

            $('#sn-fms-grpCreateText')
                .watermark($('#sn-fms-grpCreateText').val(), {
                    useNative: false,
                    className: 'sn-watermark'
                })
                .on('keypress', function (e) {
                    if (!$sn.isKey(e, $sn.im.opts.sendSequence)) return;
                    $('.sn-fms-grpCreate .ui-icon').trigger('click');
                })
                .on('focusin focusout', function () {
                    $(this).closest('a#sn-fms-grpCreate').toggleClass('ui-state-active');
                });
        }
    };
}(jQuery, socialNetwork));
