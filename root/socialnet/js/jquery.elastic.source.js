/**
 * @name Elastic
 * @descripton Elastic is jQuery plugin that grow and shrink your textareas automatically
 * @version 1.6.12
 * @requires jQuery 3.7+
 * 
 * @author Jan Jarfalk
 * @author-email jan.jarfalk@unwrongest.com
 * @author-website http://www.unwrongest.com
 * 
 * @modifiedBy Jan Kalach
 * @modifiedBy-email jankalach@gmail.com
 * @modified Added option to be useable without the ENTER.
 * 
 * (Updated to jQuery 3.7+ and implemented no-conflict mode, integramod.com, December 2024)
 * 
 * @licence MIT License - http://www.opensource.org/licenses/mit-license.php
 */
 
(function($) {
    $.fn.extend({
        elastic: function(opts) {
 
            // We will create a div clone of the textarea by copying these attributes from the textarea to the div.
            var mimics = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'fontSize', 'lineHeight', 'fontFamily', 'width', 'fontWeight', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'borderTopStyle', 'borderTopColor', 'borderRightStyle', 'borderRightColor', 'borderBottomStyle', 'borderBottomColor', 'borderLeftStyle', 'borderLeftColor'];
 
            var defaults = {
                showNewLine: true,
                useEnter: true,
                enterReplacement: '<br />',
                parentElement: null,
                submitElement: null
            };
 
            defaults = $.extend(true, {}, defaults, opts);
 
            if (!defaults.useEnter) {
                defaults.enterReplacement = '';
            }
 
            return this.each(function() {
 
                // Elastic only works on textareas
                if (this.type !== 'textarea') {
                    return false;
                }
 
                // Elastic only works on non initialized objects
                if ($(this).data('elastic') === 'elastic') {
                    return false;
                }
 
                var $textarea = $(this),
                    $twin = $('<div />').css({
                        'position': 'absolute',
                        'display': 'none',
                        'word-wrap': 'break-word',
                        'white-space': 'pre-wrap'
                    }),
                    lineHeight = parseInt($textarea.css('line-height'), 10) || parseInt($textarea.css('font-size'), '10'),
                    minheight = parseInt($textarea.css('height'), 10) || lineHeight * 3,
                    maxheight = parseInt($textarea.css('max-height'), 10) || Number.MAX_VALUE,
                    goalheight = 0;
 
                // Opera returns max-height of -1 if not set
                if (maxheight < 0) {
                    maxheight = Number.MAX_VALUE;
                }
 
                $textarea.canBlur = true;
 
                $textarea.parentElement = defaults.parentElement;
                $textarea.submitElement = defaults.submitElement;
 
                $textarea.parents($textarea.parentElement).find($textarea.submitElement).on('mouseover', function() {
                    $textarea.canBlur = false;
                }).on('mouseout', function() {
                    $textarea.canBlur = true;
                });
 
                // Append the twin to the DOM
                // We are going to measure the height of this, not the textarea.
                $twin.appendTo($textarea.parent());
 
                // Copy the essential styles (mimics) from the textarea to the twin
                var i = mimics.length;
                while (i--) {
                    $twin.css(mimics[i].toString(), $textarea.css(mimics[i].toString()));
                }
 
                // Updates the width of the twin. (solution for textareas with widths in percent)
                function setTwinWidth() {
                    var curatedWidth = Math.floor(parseInt($textarea.width(), 10));
                    if ($twin.width() !== curatedWidth) {
                        $twin.css({
                            'width': curatedWidth + 'px'
                        });
 
                        // Update height of textarea
                        update(true);
                    }
                }
 
                // Sets a given height and overflow state on the textarea
                function setHeightAndOverflow(height, overflow) {
                    var curratedHeight = Math.floor(parseInt(height, 10));
                    if ($textarea.height() !== curratedHeight) {
                        $textarea.css({
                            'height': curratedHeight + 'px',
                            'overflow': overflow
                        });
                    }
                }
 
                // This function will update the height of the textarea if necessary
                function update(forced) {
                    var textareaContent = $textarea.val().replace(/&/g, '&amp;').replace(/ {2}/g, '&nbsp;').replace(/<|>/g, '&gt;').replace(/\n/g, defaults.enterReplacement);
 
                    // Compare curated content with curated twin.
                    var twinContent = $twin.html().replace(/<br>/ig, '<br />');
 
                    if (forced || textareaContent + '&nbsp;' !== twinContent) {
                        // Add an extra white space so new rows are added when you are at the end of a row.
                        $twin.html(textareaContent + '&nbsp;');
                        // Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
                        if ($textarea.attr('data-newline') == 'true' && $textarea.is(':focus'))
                            goalheight = $twin.height() + lineHeight; // Additional line height for textarea
                        else
                            goalheight = $twin.height(); // Do not add the additional line height to textarea
 
                        if (Math.abs(goalheight - $textarea.height()) > 3) {
                            if (goalheight >= maxheight) {
                                setHeightAndOverflow(maxheight, 'auto');
                            } else if (goalheight <= minheight) {
                                setHeightAndOverflow(minheight, 'hidden');
                            } else {
                                setHeightAndOverflow(goalheight, 'hidden');
                            }
                        }
                    }
                }
 
                // Hide scrollbars
                $textarea.css({
                    'overflow': 'hidden'
                });
 
                // Update textarea size on keyup, change, cut and paste
                $textarea.on('keyup blur cut paste', function(event) {
                    if ($textarea.canBlur) {
                        update(true);
                    }
                });
 
                // Update width of twin if browser or textarea is resized (solution for textareas with widths in percent)
                $(window).on('resize', setTwinWidth);
                $textarea.on('resize', setTwinWidth);
                $textarea.on('update', update);
                $textarea.on('focusin', update);
                $textarea.attr('data-newline', defaults.showNewLine);
                $textarea.data('elastic', 'elastic');
 
                // Compact textarea on blur
                $textarea.on('blur', function(event) {
                    if ($twin.height() < maxheight && $textarea.canBlur) {
                        if ($twin.height() > minheight) {
                            $textarea.height($twin.height());
                        } else {
                            $textarea.height(minheight);
                        }
                    }
                });
 
                // And this line is to catch the browser paste event
                $textarea.on('input paste', function(e) {
                    setTimeout(update, 250);
                });
 
                // Run update once when elastic is initialized
                update(true);
            });
        }
    });
})(jQuery.noConflict(true));