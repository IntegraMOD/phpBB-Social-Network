/**
 * @preserve phpBB Social Network 0.7.2 - User Status module
 * (c) 2010-2012 Kamahl & Culprit & Senky http://phpbbsocialnetwork.com
 * http://opensource.org/licenses/gpl-license.php GNU Public License
 */

/**
 * Declaration for phpBB Social Network User Status module
 * @param {object} $ jQuery
 * @param {object} $sn socialNetwork
 * @returns {void}
 */
(function($, $sn) {
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
            if (!$sn._inited || !$sn.enableModules.us) return false;
            $sn._settings(this, opts);
            this._resize();

            $("#sn-us-wallInput").watermark($sn.us.watermark, {
                useNative: false,
                className: 'sn-us-watermark'
            }).elastic({
                parentElement: '.sn-us-share',
                submitElement: '.sn-us-wallButton, .sn-us-fetchButton'
            }).trigger('blur');

            $(document).on('focusin keyup input cut paste', '#sn-us-wallInput', function() {
                const snUsShare = $(this).val();
                $(this).closest('.sn-us-share').find('input[name=sn-us-wallButton]').show();
                if ($sn.isValidURL(snUsShare)) {
                    $('input[name="sn-us-fetchButton"]').show();
                } else {
                    $('input[name="sn-us-fetchButton"]').hide();
                    $('input[name="sn-us-fetchClear"]').trigger('click');
                }
            });
            // Delete status
            $(document).on('click', '.sn-us-deleteStatus', function() {
                const status_id = $sn.getAttr($(this), 'sid');
                const status = $('#sn-us-status' + status_id).clone();
                status.find('div.sn-commentsBlock, a.sn-us-commentStatus, span.sn-expander-more, span.sn-expander-less').remove();

                snConfirmBox($sn.us.deleteStatusTitle, $sn.us.deleteStatusText + '<hr />' + status.html(), function() {
                    $.post($sn.us.url, {
                        smode: 'status_delete',
                        s_id: status_id
                    }, function() {
                        $('#sn-us-status' + status_id).closest('.sn-ap-textBlock').fadeOut('slow').remove();
                        $('#sn-us-status' + status_id).remove();
                    });
                });

                $($sn.confirmBox.dialogID).find('.sn-action-delete').remove();
            });

            // Delete entry
            $(document).on('click', '.sn-ap-deleteEntry', function() {
                const entry_id = $sn.getAttr($(this), 'eid');

                $.post($sn.us.url, {
                    smode: 'get_activity',
                    entry_id: entry_id
                }, function(data) {
                    snConfirmBox($sn.us.deleteActivityTitle, $sn.us.deleteActivityText + '<hr />' + data.content, function() {
                        $.post($sn.us.url, {
                            smode: 'delete_activity',
                            entry_id: entry_id
                        }, function() {
                            $('#sn-ap-entry' + entry_id).fadeOut('slow').remove();
                        });
                    });
                }, 'json');
            });

            $('.sn-us-fetchData .sn-us-fetchDesc').elastic();

            // Share status on Wall
            $(document).on('click', '.sn-us-share input[name=sn-us-wallButton]', function() {
                let status_text = $("#sn-us-wallInput").val().trim();
                if (!status_text || status_text === $sn.us.watermark) {
                    snConfirmBox($sn.us.emptyStatus, $sn.us.emptyStatus);
                    $(this).hide();
                    $('#sn-us-wallInput').val('').trigger('cut');
                    return;
                }

                const wall_id = $sn.getAttr($(this), 'wall') || 0;
                const isPage = $sn.isValidURL(status_text) && $('.sn-us-fetchData .title').html() !== '';
                const noImg = $('#sn-us-noImg').is(':checked');
                const noVid = $('#sn-us-noVideo').is(':checked');
                const $img = $('.sn-us-fetchImgs img:visible');

                let mentions = {};
                if (!$sn.isOutdatedBrowser) {
                    $('textarea.sn-us-mention').mentionsInput('getMentions', data => mentions = JSON.stringify(data))
                        .mentionsInput('val', text => status_text = text);
                }

                $.post($sn.us.url, {
                    smode: 'status_share_wall',
                    status: status_text,
                    mentions: mentions,
                    wall: wall_id,
                    isPage,
                    page: {
                        title: $('.sn-us-fetchData .title').html(),
                        url: $('.sn-us-fetchData .url a').attr('href'),
                        desc: $('.sn-us-fetchData .sn-us-fetchDesc').val(),
                        image: noImg ? '' : $img.attr('src'),
                        imageH: noImg ? '' : $sn.getAttr($img, 'imgH'),
                        imageW: noImg ? '' : $sn.getAttr($img, 'imgW'),
                        video: noVid ? '' : $('.sn-us-fetchVideo').html(),
                        videoI: noVid ? '' : $('.sn-us-fetchVideoInfo').html(),
                        videoP: noVid ? '' : $('.sn-us-fetchVideoProvider').html()
                    }
                }, function(data) {
                    if (!data) {
                        snConfirmBox($sn.us.emptyStatus, $sn.us.emptyStatus);
                    } else {
                        $('.sn-us-noStatus, .sn-ap-noEntry').remove();
                        if ($('.sn-ap-loadNewsOver').length) {
                            $(data).hide().insertAfter('.sn-ap-loadNewsOver').slideDown('slow');
                        } else {
                            $(data).hide().prependTo('#sn-us-profile').slideDown('slow');
                        }
                        $('input[name=sn-us-fetchClear]').trigger('click');
                        $('input[name=sn-us-fetchButton]').hide();
                        $sn.comments.waterMark();
                        $('.sn-us-statusBlock .sn-actions').removeAttr('style');
                    }
                    $('#sn-us-wallInput').val('').watermark($sn.us.watermark, {
                        useNative: false,
                        className: 'sn-us-watermark'
                    }).trigger('paste');
                    $('.sn-us-share .sn-us-wallButton').hide();
                });
            });
            // Show comment input on click
            $(document).on('click', '.sn-us-commentStatus', function() {
                const $commentArea = $(this).closest('.sn-us-statusBox').find('.sn-us-inputComment');
                $commentArea.focus();
                return false;
            });

            // Toggle comment button visibility
            $(document).on('focusin', '.sn-us-inputComment', function() {
                $('.sn-us-buttonCommentOver:visible').hide();
                $(this).next('.sn-us-buttonCommentOver').show();
            });

            // Post comment
            $(document).on('click', '.sn-us-shareComment input[name=sn-us-buttonComment]', function() {
                const status_id = $sn.getAttr($(this), "sid");
                let commentText = $("#sn-us-textarea" + status_id).val().trim();

                if (!commentText || commentText === $sn.us.watermarkComment) {
                    snConfirmBox($sn.comments.empty, $sn.comments.empty);
                    $(this).closest('.sn-us-shareComment').find('.sn-us-inputComment').val('');
                    return;
                }

                $.post($sn.us.url, {
                    smode: 'comment_share',
                    comment: commentText,
                    s_id: status_id
                }, function(data) {
                    const $container = $(`#sn-us-textarea${status_id}`).closest('.sn-us-shareComment');
                    if (/^Error:/i.test(data)) {
                        snConfirmBox('Error', data.replace(/^Error: /i, ''));
                        $container.closest('.sn-ap-textBlock').remove();
                    } else if (!data) {
                        snConfirmBox($sn.comments.empty, $sn.comments.empty);
                    } else {
                        $container.before(data);
                        $container.prev('.sn-us-commentBlock').slideDown();
                    }
                    $('.sn-us-buttonCommentOver:visible').hide();
                    $container.find('.sn-us-inputComment').val('').trigger('paste');
                    $sn.comments.waterMark();
                });
            });

            // Load more comments
            $(document).on('click', '.sn-us-getMoreComments', function() {
                const $this = $(this);
                const $loader = $this.next('.sn-us-commentsLoader').show();
                const statusID = $sn.getAttr($this, 'id');
                const userID = $sn.getAttr($this, 'user');
                const isBefore = $this.hasClass('before');
                const lastCommentID = $sn.getAttr(
                    isBefore
                        ? $this.closest('div.sn-more').prev('.sn-commentBlock')
                        : $this.closest('div.sn-more').next('.sn-commentBlock'),
                    'cid'
                );

                $.post($sn.us.url, {
                    smode: 'comment_more',
                    lCommentID: lastCommentID,
                    s_id: statusID,
                    u: userID
                }, function(data) {
                    const $target = $('#sn-us-status' + statusID + ' .sn-more');
                    if (isBefore) {
                        $target.before(data.comments);
                    } else {
                        $target.after(data.comments);
                    }
                    $('#sn-us-status' + statusID + ' .sn-us-commentBlock:hidden').show();
                    if (!data.moreComments) {
                        $target.remove();
                    } else {
                        $this.find('.sn-commentsCount').html(data.moreComments);
                    }
                    $loader.hide();
                }, 'json');

                return false;
            });
            // Load more statuses
            $(document).on('click', '.sn-us-getMore', function() {
                if ($('.ui-dialog').is(':visible') || $sn.us._isScrollingToLoadMore) return;

                const $this = $(this);
                const $prev = $this.closest('.sn-more');
                const $entry = $prev.prev('div[id^=sn-ap-entry]');
                const lEntry = $sn.getAttr($entry, 't');

                $sn.us._isScrollingToLoadMore = true;
                $('.sn-us-statusLoader').show();

                $.ajax({
                    type: 'POST',
                    cache: false,
                    url: $sn.us.url,
                    data: {
                        smode: 'status_more',
                        ltime: lEntry,
                        u: $sn.getAttr($this, 'user')
                    },
                    complete: function() {
                        $('.sn-us-statusLoader').hide();
                        $sn.us._isScrollingToLoadMore = false;
                    },
                    success: function(data) {
                        $prev.before(data.statuses);
                        $('div[id^=sn-ap-entry]:hidden').slideDown('slow');
                        if (!data.moreStatuses) {
                            $('.sn-more .sn-us-getMore').remove();
                        }
                        $sn.comments.waterMark();
                    }
                });
                return false;
            });

            // Fetch link preview
            $(document).on('click', 'input[name=sn-us-fetchButton]', function() {
                const fetchURL = $('#sn-us-wallInput').val();
                const $preview = $('.sn-us-fetchBlock .sn-us-fetchPreview');
                const $thumbs = $('.sn-us-thumbs');

                $('.sn-us-fetchBlock .loader').show();
                $preview.hide();
                $thumbs.hide();

                $.ajax({
                    type: 'POST',
                    url: $sn.us.urlFetch,
                    data: { action: 'load', url: fetchURL },
                    dataType: 'json',
                    error: function(data) {
                        $('input[name=sn-us-fetchClear]').trigger('click');
                        snConfirmBox('Error', data.responseText);
                    },
                    success: function(data) {
                        if (!data) {
                            $('input[name=sn-us-fetchClear]').trigger('click');
                            snConfirmBox('Error', 'No data returned');
                            return;
                        }

                        const $imgWrap = $('.sn-us-fetchImgs').empty();
                        const $imgNav = $('.sn-us-fetchImages .sn-us-fetchThumb');
                        const hasImgs = data.images.length > 0;

                        if (hasImgs) {
                            $.each(data.images, function(i, image) {
                                const $img = $('<img>', {
                                    src: image.img,
                                    id: 'sn-us-fetchPreviewImg_' + i,
                                    css: {
                                        display: i === 0 ? 'inline-block' : 'none',
                                        maxHeight: 150,
                                        width: 100
                                    }
                                });
                                $imgWrap.append($img);
                            });
                            $imgNav.find('.mPic').text(data.images.length);
                            $('.sn-us-fetchImages, .sn-us-thumbsImg').show();
                        } else {
                            $('.sn-us-fetchImages, .sn-us-thumbsImg').hide();
                        }

                        $('.sn-us-fetchImages .cPic').text('1');
                        $('.sn-us-fetchData .title').html(data.title);
                        $('.sn-us-fetchData .sn-us-fetchDesc').val(data.desc).trigger('paste');
                        $('.sn-us-fetchData .url a').html(data.url).attr('href', data.url);

                        if (data.video.object.length) {
                            $('.sn-us-fetchVideo').html(data.video.object).show();
                            $('.sn-us-thumbsVideo').show();
                            $('.sn-us-fetchVideoInfo').html(data.video.info);
                            $('.sn-us-fetchVideoProvider').html(data.video.provider);
                        } else {
                            $('.sn-us-fetchVideo, .sn-us-thumbsVideo').hide();
                        }

                        $('.sn-us-fetchBlock .loader').hide();
                        $preview.show();
                        $thumbs.show();
                        $('input[name=sn-us-fetchButton]').hide();
                        $('input[name=sn-us-fetchClear]').show();
                        $sn.us._resize();
                        $('.sn-us-fetchDesc').trigger('paste');
                    }
                });
            });
            // Clear fetch preview
            $(document).on('click', 'input[name=sn-us-fetchClear]', function() {
                $('.sn-us-fetchBlock .loader').hide();
                $('.sn-us-fetchImgs').empty();
                $('.sn-us-fetchData .title').empty();
                $('.sn-us-fetchData .sn-us-fetchDesc').empty();
                $('.sn-us-fetchData .url a').html('').attr('href', '');
                $('.sn-us-fetchVideo, .sn-us-fetchVideoInfo, .sn-us-fetchVideoProvider').empty();
                $('.sn-us-fetchBlock .sn-us-fetchPreview, .sn-us-thumbs').hide();
                $(this).hide();

                if ($sn.isValidURL($('#sn-us-wallInput').val())) {
                    $('input[name="sn-us-fetchButton"]').show();
                }
            });

            // Toggle image preview
            $(document).on('change', '#sn-us-noImg', function() {
                $('.sn-us-fetchImages .sn-us-fetchImgs, .sn-us-fetchImages .sn-us-fetchImgNav, .sn-us-fetchImages .sn-us-fetchThumb').toggle();
            });

            // Toggle video preview
            $(document).on('change', '#sn-us-noVideo', function() {
                $('.sn-us-fetchVideo').toggle();
            });

            // Preview navigation
            $(document).on('click', '.sn-us-fetchImgsNext', function() {
                $sn.us.changePicture(1);
            });
            $(document).on('click', '.sn-us-fetchImgsPrev', function() {
                $sn.us.changePicture(-1);
            });

			// IE < 9 fallback overlay styling
			if (document.documentMode && document.documentMode < 9) {
				$('.sn-us-videoOverlay').css({
					opacity: 0.4,
					background: '#000',
					width: '150px',
					height: '150px',
					position: 'absolute',
					cursor: 'pointer'
				});
			}

            // Enable embedded video on overlay click
            $(document).on('click', '.sn-us-videoOverlay', function() {
                const $obj = $(this).prev('div.sn-us-page-Video').children('object');
                const $embed = $obj.children('embed');
                $(this).parent('.sn-us-page-Preview').next('.clear').show();

                $(this).add($embed).css({
                    height: $obj.attr('height'),
                    width: $obj.attr('width')
                });
                $obj.add(this).removeAttr('style');
                $(this).hide();
            });
            $sn.comments.init();

            if (!$sn.isOutdatedBrowser) {
                $('textarea.sn-us-mention').mentionsInput({
                    templates: {
                        wrapper: _.template('<div class="sn-us-mentions-input-box"></div>'),
                        autocompleteList: _.template('<div class="sn-us-mentions-autocomplete-list"></div>'),
                        mentionsOverlay: _.template('<div class="sn-us-mentions"><div></div></div>')
                    },
                    onDataRequest: function(mode, query, callback) {
                        $.getJSON($sn.us.url, { smode: 'get_mention', uname: query }, function(data) {
                            const results = _.filter(data, item =>
                                item.name.toLowerCase().indexOf(query.toLowerCase()) > -1
                            );
                            callback.call(this, results);
                        });
                    }
                });
            }
        },

        changePicture: function(dir) {
            let c_pic = parseInt($('.sn-us-fetchImgs img:visible').attr('id').replace(/^sn-us-fetchPreviewImg_/, ''));
            const total = $('.sn-us-fetchImgs img').length;

            if (c_pic + dir < 0) c_pic = total;
            else if (c_pic + dir >= total) c_pic = -1;

            $('.sn-us-fetchImgs img:visible').hide();
            $('#sn-us-fetchPreviewImg_' + (c_pic + dir)).show();
            $('.sn-us-fetchImages .cPic').text(c_pic + dir + 1);
        },

        _resize: function() {
            $('#sn-us').css({
                left: (($(document).width() - $('#sn-us').width()) / 2) + 'px'
            });

            $('.sn-us-fetchDesc').css({
                width:
                    $('.sn-us-fetchData').width()
                    - $('.sn-us-fpreviews').width()
                    - 2 * parseInt($('.sn-us-fpreviews').css('padding-right'))
                    - 2 * parseInt($('.sn-us-fpreviews').css('padding-left'))
            });
        },

        _scroll: function() {
            if (
                $('.sn-more').length &&
                $('.sn-us-getMore').length &&
                !$sn.ap._isScrollingToLoadMore &&
                $(window).scrollTop() >= $('.sn-us-getMore').offset().top - $(window).height()
                    + $('.sn-us-getMore').parent().height()
            ) {
                $(document).oneTime($sn.us.loadMoreTime, 'sn-us-checkScrollDown', function() {
                    if (!$('.sn-us-getMore').length || $sn.ap._isScrollingToLoadMore) return;
                    if (
                        $(window).scrollTop() >= $('.sn-us-getMore').offset().top - $(window).height()
                        + $('.sn-us-getMore').parent().height()
                    ) {
                        $('.sn-us-getMore').trigger('click');
                    }
                });
            }
        }
    };
}(jQuery, socialNetwork));
