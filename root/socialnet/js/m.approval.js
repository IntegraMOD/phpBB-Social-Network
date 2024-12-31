/**
 * @preserve phpBB Social Network 0.7.2 - Friends Management System
 * (c) 2010-2012 Kamahl & Culprit & Senky http://phpbbsocialnetwork.com
 * http://opensource.org/licenses/gpl-license.php GNU Public License
 * (Updated to jQuery 3.7+ and implemented no-conflict mode, integramod.com, December 2024)
 */
 
/**
 * Declaration for phpBB Social Network Friends Management System module
 * @param {function} $ jQuery
 * @param {object} $sn socialNetwork
 * @returns {void}
 */
(function($, $sn) {
    // Use jQuery.noConflict() to avoid conflicts with other libraries
    $ = jQuery.noConflict(true);
 
    $sn.fms = {
        url: '',
        urlFMS: '',
        noFriends: '{ FAS FRIENDGROUP NO TOTAL }',
        deleteUserGroup: '{ FMS_DELETE_FRIENDUSERGROUP }',
        deleteUserGroupText: '{ FMS_DELETE_FRIENDUSERGROUP_TEXT }',
        _init: false,
 
        _load: function(m, s, u) {
            var i_bl = m;
            if (m == 'friends'){
                i_bl = 'friend';
            }
            $.ajax({
                url: $sn.fms.url,
                data: {
                    mode: m,
                    fmsf: s,
                    usr: u
                },
                success: function(data) {
                    $('#ucp_' + i_bl + ' .inner').html(data);
                    $('.sn-fms-friend span').textOverflow('..');
                    $sn.fms._runLoadInit(m);
                }
            });
        },
 
        // ... (rest of the code remains the same)
 
        init: function(opts) {
            if (!$sn._inited) {
                return false;
            }
            if ($sn.enableModules.fms == undefined || !$sn.enableModules.fms) {
                return false;
            }
            $sn._settings(this, opts);
 
            this._initUcpFormAdd();
 
            this._initUcpForms();
            this._initUcpHistory();
 
            this._initUpGroupMenu();
            // GROUPS ACCORDION
            this._initGroupAccordion();
        },
 
        // ... (rest of the code remains the same)
 
        _initUcpForms: function() {
            var self = this;
            if ($('form[id=ucp_friend]').length == 0 && $('form[id=ucp_approve]').length == 0 && $('form[id=ucp_cancel]').length == 0) {
                return;
            }
            this.callbackInit('friend');
            $(document).on('click', '.sn-fms-friend', function() {
                var chCls = 'checked';
                $(this).toggleClass(chCls);
                $(this).children('input[type=checkbox]').prop('checked', $(this).hasClass(chCls));
 
                self._changeButtons(this, chCls);
            });
            $('.sn-fms-friend span').textOverflow('..');
 
            $(document).on('click', '.sn-fms-friend a', function(e) {
                e.preventDefault();
                window.location = $(this).attr('href');
            });
 
            // ... (rest of the function remains the same)
        },
 
        // ... (rest of the code remains the same)
 
        _initGroupAccordion: function() {
            var self = this;
            // Group Accordion with droppable
            if ($('#sn-fms-groupAccordion').length == 0) {
                return;
            }
 
            $('#sn-fms-groupAccordion').accordion({
                collapsible: false,
                heightStyle: "content",
                event: "click",
                activate: function(e, ui) {
                    self._loadFriends(ui.newPanel);
                }
            });
            self._loadFriends($('#sn-fms-groupAccordion').children('div').first());
 
            // ... (rest of the function remains the same)
        },
 
        // ... (rest of the code remains the same)
    };
}(jQuery, socialNetwork));