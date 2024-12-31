/**
 * @preserve phpBB Social Network 0.7.2 - Notification module
 * (c) 2010-2012 Kamahl & Culprit & Senky http://phpbbsocialnetwork.com
 * http://opensource.org/licenses/gpl-license.php GNU Public License
 * (Updated to jQuery 3.7+ and implemented no-conflict mode, integramod.com, December 2024)
 */
 
/**
 * Declaration for phpBB Social Network Notification module
 * @param {function} $ jQuery
 * @param {object} $sn socialNetwork
 * @returns {void}
 */
(function($, $sn) {
    // Use jQuery.noConflict() to avoid conflicts with other libraries
    $ = jQuery.noConflict();
 
    $sn.ntf = {
        checkTime: 6000,
        timerName: 'sn-ntf-ticker',
        url: '',
        position: $sn.rtl ? 'bottom-right' : 'bottom-left',
        glue: 'before',
        closer: false,
        life: 10000,
        theme: 'black',
        /**
         * Initialization
         * @param {object} opts Options
         * @returns {void}
         */
        init: function(opts) {
            var self = this;
            if (!$sn._inited) {
                return false;
            }
            if ($sn.enableModules.ntf == undefined || !$sn.enableModules.ntf) {
                return false;
            }
            $sn._settings(this, opts);
 
            $.extend($.jGrowl.defaults, {
                position: this.position,
                glue: this.glue,
                closer: this.closer,
                life: this.life,
                theme: this.theme
            });
 
            // Use .on() instead of .live() for event delegation
            $(document).on('click', '.sn-ntf-delete', function() {
                var $ntf_bl = $(this).parents('.sn-ntf-block');
                var ntf_id = $sn.getAttr($(this), 'ntf_id');
 
                $.ajax({
                    type: 'post',
                    url: self.url,
                    dataType: 'json',
                    data: {
                        type: 'delete',
                        nid: ntf_id
                    },
                    success: function(data) {
                        if (data.del) {
                            $ntf_bl.remove();
                            if ($('#sn-page-content').children('.sn-ntf-block').length == 0) {
                                $('.sn-ntf-no-ntf').show();
                            }
                        }
                    }
                });
            });
 
            // Use .on() instead of .live() for event delegation
            $(document).on('click', '.sn-ntf-markRead', function() {
                var $this = $(this);
                var $ntf_bl = $(this).parents('.sn-ntf-block');
                var ntf_id = $sn.getAttr($(this), 'ntf_id');
                $.ajax({
                    type: 'post',
                    url: self.url,
                    dataType: 'json',
                    data: {
                        type: 'markRead',
                        nid: ntf_id
                    },
                    success: function(data) {
                        $ntf_bl.removeClass('sn-ntf-unread');
                        $this.remove();
                    }
                });
            });
 
            if (!$sn.allow_load) {
                return;
            }
            self._sn_ntf_check(0);
            // Use setInterval instead of everyTime
            self.intervalId = setInterval(function() {
                self._sn_ntf_check(self.checkCount++);
            }, self.checkTime);
        },
        checkCount: 0,
        intervalId: null,
        _sn_ntf_check: function(i) {
            var self = this;
            if (i > 50) {
                clearInterval(self.intervalId);
                return false;
            }
            $.ajax({
                type: 'POST',
                url: self.url,
                dataType: 'json',
                success: function(data) {
                    if ($('#sn-ntf-cube').length) {
                        self._sn_ntf_cubes('#sn-ntf-cube', '#sn-ntf-cube', data.cnt);
                    }
                    if ($('#sn-ntf-notify').length) {
                        $('#sn-ntf-notify a').html(data.cnt + '');
                    }
 
                    $.each(data.message, function(i, ntf) {
                        $.jGrowl(ntf);
                    });
                }
            });
        },
        _sn_ntf_cubes: function(s_obj, s_obj2, s_count) {
            if (s_count == 0) {
                $(s_obj).hide();
            } else {
                $(s_obj).show();
                $(s_obj2).html(s_count + '');
            }
        }
    };
}(jQuery, socialNetwork));