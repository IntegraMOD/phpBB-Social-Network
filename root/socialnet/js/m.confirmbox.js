/**
 * @preserve phpBB Social Network 0.7.2 - confirmBox
 * (c) 2010-2012 Kamahl & Culprit & Senky http://phpbbsocialnetwork.com
 * http://opensource.org/licenses/gpl-license.php GNU Public License
 * (Updated to jQuery 3.7+ and implemented no-conflict mode, integramod.com, December 2024)
 */
 
/**
 * confirmBox function
 * @param {string} cbTitle title
 * @param {string} cbText text
 * @param {function} callbackConfirm callback function for confirm
 * @param {function} callbackLoad callback function for load confirmBox
 * @returns {void}
 */
function snConfirmBox(cbTitle, cbText, callbackConfirm, callbackLoad) {
    /**
     * @param {object} $ jQuery
     * @param {object} snCB socialNetwork confirmBox object
     * @returns {void}
     */
    (function($, snCB) {
        if (snCB.enable) {
            cbText = '<div>' + cbText + '</div>';
            $(snCB.dialogID).html(cbText).prev('.ui-dialog-titlebar').find('.ui-dialog-title').html(cbTitle);
 
            var dialogButtons = [];
            if (callbackConfirm == null || !$.isFunction(callbackConfirm)) {
                dialogButtons = [{
                    text: snCB.button_close,
                    click: function() {
                        $(this).dialog('close');
                    }
                }];
            } else {
                dialogButtons = [{
                    text: snCB.button_confirm,
                    click: function() {
                        if ($.isFunction(callbackConfirm)) {
                            callbackConfirm.apply();
                        }
                        $(this).dialog('close');
                    },
                    'class': 'sn-button-bold'
                }, {
                    text: snCB.button_cancel,
                    click: function() {
                        $(this).dialog('close');
                    }
                }];
            }
 
            $(snCB.dialogID).dialog('option', {
                buttons: dialogButtons,
                open: function() {
                    snCB.dropShadow($(snCB.dialogID).parent('.ui-dialog'), snCB.shadowBox);
                    if (callbackLoad != null && $.isFunction(callbackLoad)) {
                        callbackLoad.apply();
                    }
                    snCB.correctSize();
                },
                close: function() {
                    $(snCB.dialogID).parent('.ui-dialog').removeAttr('aria-shadow').prev('.ui-overlay').remove();
                }
            }).dialog('open');
 
        } else if (callbackConfirm != null && $.isFunction(callbackConfirm)) {
            callbackConfirm.apply();
        }
    }(jQuery.noConflict(true), socialNetwork.confirmBox));
}
 
// Ensure jQuery is loaded and in no-conflict mode
(function() {
    if (typeof jQuery === 'undefined') {
        console.error('jQuery is not loaded. Please make sure to include jQuery 3.7.0 before this script.');
        return;
    }
 
    if (parseFloat(jQuery.fn.jquery) < 3.7) {
        console.warn('This script requires jQuery 3.7.0 or higher. You are using version ' + jQuery.fn.jquery);
    }
})();