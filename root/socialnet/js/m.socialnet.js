/**
 * @preserve phpBB Social Network - Modernized Core for jQuery 3.7
 * Original: Kamahl & Culprit & Senky
 * Updated for IM3 compatibility
 */
(function($) {
    $.fn.metadataInit = function(param) {
        $(this).each(function() {
            $(this).attr(param, eval('\$(this).metadata().' + param + ';'));
        });
    };
}(jQuery));

var socialNetwork = (function($) {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return {
        mobileBrowser: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase()),
        _debug: false,
        allow_load: true,
        rtl: false,
        user_id: 1,
        expanderTextMore: '[read more]',
        expanderTextLess: '[read less]',
        browserOutdatedTitle: 'Your browser is outdated',
        browserOutdated: 'Some features may not work on this browser because it is outdated.',
        showBrowserOutdated: false,
        isOutdatedBrowser: false,
        cookies: {},
        cookie: {
            name: '',
            path: '',
            domain: '',
            secure: '0'
        },
        enableModules: {
            im: false,
            us: false,
            ap: false,
            up: false,
            ntf: false,
            fms: false
        },
        _inited: false,
        _DOMinited: false,
        menuPosition: {
            my: "right top",
            at: "left top"
        },
        _settings: function(obj, opts) {
            if (!opts || $.isEmptyObject(opts)) return;
            if (obj._inited) return;
            $.extend(true, obj, opts);
            obj._inited = true;
        },

        init: function(opts) {
            const self = this;
            this._settings(this, opts);

            if (!this.cookie.name.endsWith('_')) {
                this.cookie.name += '_';
            }

            this.confirmBox.init();
            this._minBrowser();

            $.metadata.setType("class");

            $(window)
                .on('resize', function() { self._resizeBlocks(); })
                .on('scroll', function() { self._scrollBlocks(); })
                .on('unload', function() { self._unloadBlocks(); });

            $(document)
                .on('click', function(e) { self._documentClick(e); })
                .on('DOMSubtreeModified', '.sn-page-content', function() {
                    self._DOMSubtreeModified();
                });

            this.rtl = $('body').hasClass('rtl');

            if (!this.cookie.domain.match(/^[\d\.]+$/) && !this.cookie.domain.startsWith('.')) {
                this.cookie.domain = '.' + this.cookie.domain;
            }

            if ($('ul.sn-menu').length > 0) {
                $('ul.sn-menu').menu({
                    position: this.menuPosition
                }).removeClass('ui-corner-all');
                $('.sn-menu *').removeClass('ui-corner-all ui-corner-top ui-corner-bottom');
            }

            $('input.ui-button').on('mouseover mouseout', function() {
                $(this).toggleClass('ui-state-hover');
            });

            setTimeout(function() {
                self._resize();
            }, 250);

            if (this._debug) this._debugInit();
        },
        _minBrowser: function() {
            const minVersions = {
                Chrome: 60,
                Firefox: 60,
                Safari: 11,
                Edge: 16,
                Opera: 50,
                IE: 11
            };

            const ua = navigator.userAgent;
            let browser = 'Unknown';
            let version = 0;

            if (/MSIE|Trident/.test(ua)) {
                browser = 'IE';
                version = parseInt((ua.match(/(MSIE |rv:)(\d+)/) || [])[2], 10);
            } else if (/Chrome/.test(ua) && !/Edge/.test(ua)) {
                browser = 'Chrome';
                version = parseInt((ua.match(/Chrome\/(\d+)/) || [])[1], 10);
            } else if (/Firefox/.test(ua)) {
                browser = 'Firefox';
                version = parseInt((ua.match(/Firefox\/(\d+)/) || [])[1], 10);
            } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
                browser = 'Safari';
                version = parseInt((ua.match(/Version\/(\d+)/) || [])[1], 10);
            } else if (/Edge/.test(ua)) {
                browser = 'Edge';
                version = parseInt((ua.match(/Edge\/(\d+)/) || [])[1], 10);
            } else if (/Opera|OPR/.test(ua)) {
                browser = 'Opera';
                version = parseInt((ua.match(/(Opera|OPR)\/(\d+)/) || [])[2], 10);
            }

            if (minVersions[browser] && version < minVersions[browser]) {
                if (this.showBrowserOutdated && this.getCookie('sn_showBrowserOutdated', 0) == 0) {
                    this.setCookie('sn_showBrowserOutdated', 1);
                    snConfirmBox(this.browserOutdatedTitle, this.browserOutdated + '<br />' + browser + ' ' + version);
                }
                this.isOutdatedBrowser = true;
                return false;
            }

            return true;
        },

        _resize: function() {
            this._DOMinited = true;
            if ($('.sn-page').length > 0) {
                $('.sn-page-content').css({
                    minHeight: Math.max(
                        $('.sn-page-columnLeft').height() || 0,
                        $('.sn-page-columnRight').height() || 0
                    )
                });
            }
            this._DOMinited = false;
        },

        _resizeBlocks: function() {
            this._DOMinited = true;
            this._resize();
            const self = this;
            $.each(self.enableModules, function(idx, value) {
                if (value && self[idx] && typeof self[idx]._resize === 'function') {
                    self[idx]._resize();
                }
            });
            this._DOMinited = false;
        },

        _scrollBlocks: function() {
            const self = this;
            $.each(self.enableModules, function(idx, value) {
                if (value && self[idx] && typeof self[idx]._scroll === 'function') {
                    self[idx]._scroll();
                }
            });
        },

        _unloadBlocks: function() {
            const self = this;
            this._DOMinited = true;
            $.each(self.enableModules, function(idx, value) {
                if (value && self[idx] && typeof self[idx]._unload === 'function') {
                    self[idx]._unload();
                }
            });
            this._DOMinited = false;
        },

        _documentClick: function(event) {
            const self = this;
            this._DOMinited = true;
            $.each(self.enableModules, function(idx, value) {
                if (value && self[idx] && typeof self[idx]._documentClick === 'function') {
                    self[idx]._documentClick(event);
                }
            });
            this._DOMinited = false;
        },
        _DOMSubtreeModified: function() {
            this._DOMinited = true;
            this._textExpander();
            const self = this;
            $.each(self.enableModules, function(idx, value) {
                if (value && self[idx] && typeof self[idx]._DOMChanged === 'function') {
                    self[idx]._DOMChanged();
                }
            });
            this._resize();
            this._DOMinited = false;
        },

        _textExpander: function() {
            const $el = $('.sn-expander-text:not([aria-expander="expander"])');
            if ($el.length) {
                $el.attr('aria-expander', 'expander').expander({
                    slicePoint: 500,
                    widow: 1,
                    preserveWords: false,
                    expandText: this.expanderTextMore,
                    userCollapseText: this.expanderTextLess,
                    expandPrefix: '...',
                    userCollapsePrefix: ' ',
                    moreClass: 'sn-expander-more',
                    lessClass: 'sn-expander-less',
                    detailClass: 'sn-expander-details'
                });
            }
        },

        getCookie: function(name, defaultValue) {
            name = name.replace(/-/g, '_');
            const val = $.cookie(this.cookie.name + name);
            return val == null && defaultValue !== undefined ? defaultValue : val;
        },

        setCookie: function(name, value) {
            name = name.replace(/-/g, '_');
            $.cookie(this.cookie.name + name, value, this.cookie);
        },

        getAttr: function(o, a) {
            if (!o.length) return false;
            return o.attr(a) !== undefined ? o.attr(a) : o.metadata()[a];
        },

        insertAtCaret: function(textarea, value) {
            return textarea.each(function() {
                if (document.selection) {
                    this.focus();
                    const sel = document.selection.createRange();
                    sel.text = value;
                    this.focus();
                } else if (this.selectionStart || this.selectionStart === 0) {
                    const start = this.selectionStart, end = this.selectionEnd;
                    this.value = this.value.substring(0, start) + value + this.value.substring(end);
                    this.selectionStart = this.selectionEnd = start + value.length;
                } else {
                    this.value += value;
                    this.focus();
                }
                $(this).trigger('paste');
            });
        }
    };
}(jQuery));

// Confirm box module
(function($, $sn) {
    $sn.confirmBox = {
        dialogID: '#dialog',
        dialogClass: 'sn-confirmBox',
        enable: false,
        resizable: false,
        draggable: true,
        modal: true,
        width: 400,
        button_confirm: 'Confirm',
        button_cancel: 'Cancel',
        button_close: 'Close',
        overlay: null,

        init: function() {
            if (!this.enable) return;

            const $dialog = $('<div/>', {
                id: this.dialogID.replace('#', ''),
                class: 'ui-body-dialog',
                css: { display: 'none' },
                title: 'Confirm Box'
            }).html('Content Confirm Box').appendTo('body');

            $dialog.dialog({
                width: this.width,
                resizable: this.resizable,
                draggable: this.draggable,
                modal: this.modal,
                autoOpen: true,
                dialogClass: this.dialogClass,
                buttons: [{
                    text: this.button_close,
                    click: function() { $(this).dialog('close'); }
                }]
            }).dialog('close');
        }
    };
}(jQuery, socialNetwork));

// Comments module
(function($, $sn) {
    $sn.comments = {
        deleteTitle: 'Delete',
        deleteText: 'Delete this comment?',
        watermark: 'Write a comment...',

        init: function() {
            const self = this;
            const confirmBox = $sn.confirmBox;

            $(document).on('click', '.sn-deleteComment', function() {
                const $el = $(this);
                const cid = $sn.getAttr($el, "cid");
                const url = $sn.getAttr($el, "url");
                const $comment = $('#sn-comment' + cid);

                snConfirmBox(self.deleteTitle, self.deleteText + '<hr />' + $comment.html(), function() {
                    $.post(url, { smode: 'comment_delete', c_id: cid }, function() {
                        $comment.fadeOut('slow').remove();
                    });
                });

                const $dialog = $(confirmBox.dialogID);
                $dialog.find('.sn-expander-more, .sn-expander-less').remove();
                $dialog.find('.sn-expander-details').show();
                $dialog.find('.sn-expander-text').removeAttr('aria-expander');
            });

            this.waterMark();
        },

        waterMark: function() {
            $(".sn-inputComment")
                .watermark(this.watermark, {
                    useNative: false,
                    className: 'sn-watermark'
                })
                .elastic({
                    showNewLine: false,
                    parentElement: '.sn-shareComment',
                    submitElement: 'input[name="sn-us-buttonComment"]'
                });
        }
    };
}(jQuery, socialNetwork));
