/**
 * @preserve phpBB Social Network 0.7.2 - User Status module
 * (c) 2010-2012 Kamahl & Culprit & Senky http://phpbbsocialnetwork.com
 * http://opensource.org/licenses/gpl-license.php GNU Public License
 * (Updated to jQuery 3.7+ and implemented no-conflict mode, integramod.com, December 2024)
 */
 
/**
 * Declaration for phpBB Social Network User Status module
 * @param {object} $ jQuery
 * @param {object} $sn socialNetwork
 * @returns {void}
 */
(function($, $sn) {
    // Use jQuery.noConflict() to avoid conflicts with other libraries
    $ = jQuery.noConflict(true);
 
    $sn.us = {
        loadMoreTime: 4000,
        watermark: '',
        emptyStatus: '',
        watermarkComment: '',
        emptyComment: '',
        deleteStatusTitle: '',
        deleteStatusText: '',
        deleteActivityTitle: '',
        deleteActivityText: '',
        url: './socialnet/userstatus.php',
        urlFetch: './socialnet/fetch.php',
        _inited: false,
        _isScrollingToLoadMore: false,
        init: function(opts) {
            if (!$sn._inited) {
                return false;
            }
            if ($sn.enableModules.us == undefined || !$sn.enableModules.us) {
                return false;
            }
            $sn._settings(this, opts);
 
            this._resize();
 
            $("#sn-us-wallInput").watermark($sn.us.watermark, {
                useNative: false,
                className: 'sn-us-watermark'
            }).on('focusin keyup input cut paste', function() {
                var snUsShare = $(this).val();
                $(this).parents('.sn-us-share').children('input[name=sn-us-wallButton]').show();
                if ($sn.isValidURL(snUsShare) == true) {
                    $('input[name="sn-us-fetchButton"]').show();
                } else {
                    $('input[name="sn-us-fetchButton"]').hide();
                    $('input[name="sn-us-fetchClear"]').trigger('click');
                }
            }).elastic({
                parentElement: '.sn-us-share',
                submitElement: '.sn-us-wallButton, .sn-us-fetchButton'
            }).trigger('blur');
 
            // Delete status
            $(document).on('click', ".sn-us-deleteStatus", function() {
                var status_id = $sn.getAttr($(this), 'sid');
                var wallid = $sn.getAttr($(this), 'wid');
                var status = $('#sn-us-status' + status_id).clone();
                status.find('div.sn-commentsBlock, a.sn-us-commentStatus, span.sn-expander-more, span.sn-expander-less').remove();
 
                snConfirmBox($sn.us.deleteStatusTitle, $sn.us.deleteStatusText + '<hr />' + status.html(), function() {
                    $.ajax({
                        type: "POST",
                        url: $sn.us.url,
                        cache: false,
                        data: {
                            smode: 'status_delete',
                            s_id: status_id
                        },
                        success: function(data) {
                            $('#sn-us-status' + status_id).parents('.sn-ap-textBlock').fadeOut('slow').remove();
                            if ($('#sn-us-status' + status_id).length != 0) {
                                $('#sn-us-status' + status_id).remove();
                            }
                        }
                    });
                });
                $($sn.confirmBox.dialogID).find('.sn-action-delete').remove();
            });
 
            // ... (rest of the code remains the same)
 
        },
        // ... (rest of the methods remain the same)
    };
}(jQuery, socialNetwork));