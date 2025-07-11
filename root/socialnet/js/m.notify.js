/**
 * @preserve phpBB Social Network 0.7.2 - Notification module
 * (c) 2010-2012 Kamahl & Culprit & Senky http://phpbbsocialnetwork.com
 * http://opensource.org/licenses/gpl-license.php GNU Public License
 */

/**
 * Declaration for phpBB Social Network Notification module
 * @param {object} $ jQuery
 * @param {object} $sn socialNetwork
 * @returns {void}
 */
(function($, $sn) {
    $sn.ntf = {
        checkTime: 6000,
        timerName: 'sn-ntf-ticker',
        url: '',
        position: $sn.rtl ? 'bottom-right' : 'bottom-left',
        glue: 'before',
        closer: false,
        life: 10000,
        theme: 'black',

        init: function(opts) {
            var self = this;
            if (!$sn._inited) return false;
            if ($sn.enableModules.ntf == undefined || !$sn.enableModules.ntf) return false;

            $sn._settings(this, opts);

            $.extend($.jGrowl.defaults, {
                position: this.position,
                glue: this.glue,
                closer: this.closer,
                life: this.life,
                theme: this.theme
            });

            // Modernized event bindings
            $(document).on('click', '.sn-ntf-delete', function() {
                var $ntf_bl = $(this).closest('.sn-ntf-block');
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
                            if ($('#sn-page-content').children('.sn-ntf-block').length === 0) {
                                $('.sn-ntf-no-ntf').show();
                            }
                        }
                    }
                });
            });

            $(document).on('click', '.sn-ntf-markRead', function() {
                var $this = $(this);
                var $ntf_bl = $(this).closest('.sn-ntf-block');
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

            if (!$sn.allow_load) return;

            self._sn_ntf_check(0);
            $(document).everyTime(self.checkTime, self.timerName, function(i) {
                self._sn_ntf_check(i);
            });
        },

        _sn_ntf_check: function(i) {
            var self = this;
            if (i > 50) {
                $(document).stopTime(self.timerName);
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
