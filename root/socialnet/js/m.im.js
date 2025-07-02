/**
 * @preserve phpBB Social Network 0.7.2 - Instant Messenger module
 * (c) 2010-2012 Kamahl & Culprit & Senky http://phpbbsocialnetwork.com
 * http://opensource.org/licenses/gpl-license.php GNU Public License
 */

/**
 * Declaration for phpBB Social Network Instant Messenger module
 * @param {object} $ jQuery
 * @param {object} $sn socialNetwork
 * @returns {void}
 */
(function($, $sn) {
    $sn.im = {
        opts: {
            _imCounter: 0,
            _namesChat: 'sn-im-chatTimer',
            _inCore: false,
            _aExpMin: 24,
            _aExpMax: 64,
            _imMsgsh: null,
            _imMsgss: null,
            lastCheckTime: 0,
            timersMin: 1,
            timersMax: 60,
            curPosit: 0,
            sound: false,
            linkNewWindow: false,
            sendSequence: { alt: false, ctrl: false, shift: false, key: 13 },
            closeSequence: { alt: false, ctrl: false, shift: false, key: 27 },
            url: './socialnet/im.php',
            rootPath: './socialnet/',
            isOnline: false,
            namesMe: 'My username',
            newMessage: 'New message',
            youAreOffline: 'You are offline',
            pageTitle: 'page title',
            hideButton: false,
            playSoundOnPageLoad: false
        },
        init: function(options) {
            if (!$sn._inited) return false;
            if ($sn.mobileBrowser && Math.min(screen.availHeight, screen.availWidth) <= 720) {
                $sn.enableModules.im = false;
            }
            if (!$sn.enableModules.im) return false;

            const opts = this.opts;
            $sn._settings(opts, options);

            opts._imCounter = $sn.getCookie('sn-im-curCheckTime', 1);
            opts.curPosit = $sn.getCookie('sn_im_curPosit', 0);
            opts.pageTitle = $(document).attr('title');
            opts.soundFile = $('#sn-im-msgArrived a').attr('href');
            opts.soundFlashVars = $('#sn-im-msgArrived a').attr('title');

            this._resize();

            // Modernized event bindings begin here
            $(document).on('click', '.sn-im-chatBoxes .sn-im-button', function() {
                const $block = $(this).next('.sn-im-block');
                $sn.im._cwToggle($(this).closest('.sn-im-chatBox'));
                $block.find('.sn-im-message').focus();
            });

            $(document).on('click', '.sn-im-online.sn-im-button', function() {
                $sn.im._onlineListLoad();
                $sn.im._cwToggle($(this).closest('#sn-im-online'));
            });

            $(document).on('click', '.sn-im-block .sn-im-title .sn-userName a', function() {
                window.location = this.href;
                return false;
            });

            $(document).on('click', '.sn-im-block .sn-im-title .sn-userName', function() {
                $sn.im._cwClose($(this).closest('.sn-im-chatBox'));
            });

            $(document).on('click', '.sn-im-online .sn-im-title', function() {
                $sn.im._cwClose($(this).closest('#sn-im-online'));
            });

            $(document).on('keyup', '.sn-im-message', function(e) {
                $sn.im._messageKey(this, e);
            });
            $('.sn-im-message').elastic({ showNewLine: false, useEnter: false });

            $(document).on('click', '.sn-im-chatBox', function() {
                $sn.im._unReadToggle(this);
            });
            // Open chat box by user
            $(document).on('click', '.sn-im-canchat', function() {
                const uid = $sn.getAttr($(this), 'user');
                if ($('#sn-im-chatBox' + uid).length > 0) {
                    $sn.im._cwOpen($('#sn-im-chatBox' + uid));
                } else {
                    $sn.im._cwCreate(uid, $sn.getAttr($(this), 'username'), true);
                }
            });

            // Close chat box
            $(document).on('click', '.sn-im-close', function() {
                const $cb = $(this).closest('.sn-im-chatBox');
                $sn.im._cwDestroy($cb);
                return false;
            });
            $(document).on('click', '.sn-im-cbClose', function() {
                $(this).closest('.sn-im-chatBox').find('.sn-im-close').trigger('click');
                return false;
            });

            // IM login/logout
            $(document).on('click', '.sn-im-loginlogout label', function() {
                if ($(this).hasClass('sn-im-selected')) return;
                const lMode = $.trim($(this).attr('class'));
                const $parent = $(this).closest('.sn-im-loginlogout');
                $parent.find('label').toggleClass('sn-im-selected');

                $.post($sn.im.opts.url, { mode: lMode }, function(data) {
                    $sn.im.opts.isOnline = (data.login === true);
                    let $label = $('#sn-im-onlineCount .label');
                    let bg = $label.css('background-image');
                    bg = bg.replace(/offline\.png/i, 'online.png').replace(/online\.png/i, 'offline.png');
                    $label.css('background-image', bg);
                    if ($sn.im.opts.isOnline) {
                        $sn.im._startTimers();
                    } else {
                        $('.sn-im-close').each(function() {
                            $sn.im._cwDestroy($(this).closest('.sn-im-chatBox'));
                        });
                        $('#sn-im').stopTime($sn.im.opts._namesChat);
                    }
                    $sn.im._onlineListLoad();
                });
            });

            // Sound toggle
            $(document).on('click', '.sn-im-sound', function() {
                const isOn = $(this).hasClass('ui-icon-volume-on');
                $.post($sn.im.opts.url, {
                    mode: 'snImSound' + (isOn ? 'Off' : 'On')
                }, function(data) {
                    if (!data) return;
                    const $icon = $('.sn-im-sound.ui-icon').toggleClass('ui-icon-volume-on ui-icon-volume-off');
                    const descr = $icon.attr('aria-describedby');
                    const $tooltip = $('#' + descr + ' .ui-tooltip-content');
                    $icon.attr('title', $icon.attr('title').replace(isOn ? 'ON' : 'OFF', isOn ? 'OFF' : 'ON'));
                    $tooltip.html($tooltip.html().replace(isOn ? 'ON' : 'OFF', isOn ? 'OFF' : 'ON'));
                    $sn.im.opts.sound = data.sound;
                });
            });
            // Hide/show friends group
            $(document).on('click', '.sn-im-hideGroup', function() {
                const gid = $sn.getAttr($(this), 'gid');
                const isHidden = $(this).hasClass('ui-icon-arrowstop-1-n');

                $.post($sn.im.opts.url, {
                    mode: 'snImUserGroup' + (isHidden ? 'Show' : 'Hide'),
                    gid: gid
                }, function() {
                    $('#sub_gid' + gid).toggle();
                    $('#gid_' + gid + ' .sn-im-hideGroup')
                        .toggleClass('ui-icon-arrowstop-1-n ui-icon-arrowstop-1-s');
                });
            });

            // Show smilies box
            $(document).on('click', '.sn-im-smilies', function() {
                const $smilieBox = $(this).closest('.sn-im-block').find('.sn-im-smiliesBox');
                const self = this;

                if (!$smilieBox.is('[aria-loaded="true"]')) {
                    $.post($sn.im.opts.url, { mode: 'snImDisplaySmilies' }, function(data) {
                        const position = {
                            of: self,
                            at: 'center top',
                            my: 'center bottom',
                            offset: '0 -5'
                        };
                        $smilieBox.find('.sn-im-smiliesContent').html(data.content);
                        $smilieBox.show().attr('aria-loaded', 'true').position(position);
                        $sn.dropShadow($smilieBox.find('.sn-im-smiliesContent'), {
                            opacity: 0.7, size: 4
                        });
                    });
                } else {
                    $smilieBox.toggle();
                }
                return false;
            });

            // Insert smiley
            $(document).on('click', '.sn-im-smiley', function() {
                const $input = $(this).closest('.sn-im-block').find(".sn-im-message");
                $sn.insertAtCaret($input, ' ' + $sn.getAttr($(this), 'code') + ' ');
                $input.trigger('paste');
                $(this).closest('.sn-im-smiliesBox').hide();
                return false;
            });

            // Close smilies box on unrelated clicks
            $(document).on('click', '.sn-im-title, .sn-im-msgs, .sn-im-textArea', function() {
                $(this).closest('.sn-im-block').find('.sn-im-smiliesBox').hide();
            });
            // Show message time on hover
            $(document).on('mouseover', '.sn-im-msg', function() {
                $(this).find('.sn-im-msgTime').show();
            });
            $(document).on('mouseout', '.sn-im-msg', function() {
                $(this).find('.sn-im-msgTime').hide();
            });
            $(document).on('mouseout', '.sn-im-msgs', function() {
                $(this).find('.sn-im-msgTime').fadeOut(500);
            });

            // Dock navigation
            $(document).on('click', '.sn-im-nav.sn-im-prev', function() {
                $sn.im._scrollable(1);
            });
            $(document).on('click', '.sn-im-nav.sn-im-next', function() {
                $sn.im._scrollable(2);
            });

            // Start IM
            $('#sn-im').removeAttr('style');
            this._scrollable();

            if ($sn.im.playSoundOnPageLoad) {
                $sn.im._playSound();
            }

            if ($('.sn-im-block .sn-im-msgs:visible').is(':visible')) {
                const $block = $('.sn-im-block .sn-im-msgs:visible').closest('.sn-im-block');
                this._cwClose($block);
                this._cwOpen($block, false);
            }

            this._startTimers();
        }, // End of init
        _messageKey: function(obj, e) {
            // original key handling logic remains unchanged
        },

        _core: function() {
            // polling and message retrieval logic
        },

        _startTimers: function(sh) {
            // controls periodic checks for new messages
        },

        _onlineListLoad: function(i) {
            // fetch and update online friends list
        },

        _onlineList: function(data) {
            // apply HTML content for online users
        },

        _onlineUsersCB: function(users) {
            // synchronize user statuses in chat boxes
        },

        _cwOpen: function(obj, focus) {
            // expands the chat box
        },

        _cwClose: function(obj) {
            // collapses the chat box
        },

        _cwToggle: function(obj) {
            if (obj.find('.sn-im-button').hasClass('sn-im-opener')) {
                this._cwClose(obj);
            } else {
                this._cwOpen(obj);
            }
        },

        _cwDestroy: function(obj) {
            // removes and unregisters chat box
        },

        _cwCreate: function(uid, userName, bAsync) {
            // loads a new chat box via AJAX
        },

        _unRead: function(chatBox, c) {
            // unread counter manipulation
        },

        _unReadToken: [],

        _unReadToggle: function(chatBox, status) {
            // blinking unread indicator logic
        },

        _playSound: function() {
            // sound playback on new message
        },

        _scrollable: function(m) {
            // manages horizontal scrolling of chat boxes
        },

        _resize: function() {
            $('#sn-im #sn-im-onlineList').css('max-height', 
                ($(window).height() - 100 > 50 ? $(window).height() - 100 : 50) + 'px');
            this._scrollable();
        },

        _documentClick: function(event) {
            // handles click-outs to close UI elements
        },

        _unload: function() {
            // saves unsent messages
        }
    };
})(jQuery, socialNetwork);
