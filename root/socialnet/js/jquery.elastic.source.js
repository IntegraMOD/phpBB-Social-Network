/**
 * @name Elastic
 * @descripton Elastic is jQuery plugin that grow and shrink your textareas automatically
 * @version 1.6.11
 * @requires jQuery 3.7.1+
 * 
 * @author Jan Jarfalk
 * @author-email jan.jarfalk@unwrongest.com
 * @author-website http://www.unwrongest.com
 * 
 * @modifiedBy Jan Kalach
 * @modifiedBy-email jankalach@gmail.com
 * @modifiedBy-website http://phpbb3hacks.com
 * @modified Added option to be useable without the ENTER.
 * 
 * 
 * @licence MIT License - http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
    jQuery.fn.extend({
        elastic: function(opts) {
            var mimics = [
                'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                'fontSize', 'lineHeight', 'fontFamily', 'width', 'fontWeight',
                'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
                'borderTopStyle', 'borderTopColor', 'borderRightStyle', 'borderRightColor',
                'borderBottomStyle', 'borderBottomColor', 'borderLeftStyle', 'borderLeftColor'
            ];

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
                if (this.type !== 'textarea') return false;
                if (this.dataElastic === 'elastic') return false;

                var $textarea = $(this),
                    $twin = $('<div />').css({
                        position: 'absolute',
                        display: 'none',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap'
                    }),
                    lineHeight = parseInt($textarea.css('line-height'), 10) || parseInt($textarea.css('font-size'), 10),
                    minheight = parseInt($textarea.css('height'), 10) || lineHeight * 3,
                    maxheight = parseInt($textarea.css('max-height'), 10) || Number.MAX_VALUE;

                if (maxheight < 0) maxheight = Number.MAX_VALUE;

                $textarea.canBlur = true;
                $textarea.parentElement = defaults.parentElement;
                $textarea.submitElement = defaults.submitElement;

                $textarea.parents($textarea.parentElement).find($textarea.submitElement)
                    .on('mouseover', function() { $textarea.canBlur = false; })
                    .on('mouseout', function() { $textarea.canBlur = true; });

                $twin.appendTo($textarea.parent());

                for (var i = 0; i < mimics.length; i++) {
                    $twin.css(mimics[i], $textarea.css(mimics[i]));
                }

                function setTwinWidth() {
                    var curatedWidth = Math.floor(parseInt($textarea.width(), 10));
                    if ($twin.width() !== curatedWidth) {
                        $twin.css('width', curatedWidth + 'px');
                        update(true);
                    }
                }

                function setHeightAndOverflow(height, overflow) {
                    var curratedHeight = Math.floor(parseInt(height, 10));
                    if ($textarea.height() !== curratedHeight) {
                        $textarea.css({
                            height: curratedHeight + 'px',
                            overflow: overflow
                        });
                    }
                }

                function update(forced) {
                    var textareaContent = $textarea.val()
                        .replace(/&/g, '&amp;')
                        .replace(/ {2}/g, '&nbsp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/\n/g, defaults.enterReplacement);

                    var twinContent = $twin.html().replace(/<br>/ig, '<br />');

                    if (forced || textareaContent + '&nbsp;' !== twinContent) {
                        $twin.html(textareaContent + '&nbsp;');
                        var goalheight = ($textarea.attr('data-newline') === 'true' && $textarea.is(':focus'))
                            ? $twin.height() + lineHeight
                            : $twin.height();

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

                $textarea.css('overflow', 'hidden');

                $textarea.on('keyup blur cut paste', function() {
                    if ($textarea.canBlur) update(true);
                });

                $(window).on('resize', setTwinWidth);
                $textarea.on('resize', setTwinWidth);
                $textarea.on('update', update);
                $textarea.on('focusin', update);

                $textarea.attr('data-newline', defaults.showNewLine);
                $textarea.dataElastic = 'elastic';

                $textarea.on('blur', function() {
                    if ($twin.height() < maxheight && $textarea.canBlur) {
                        $textarea.height(Math.max($twin.height(), minheight));
                    }
                });

                $textarea.on('input paste', function() {
                    setTimeout(update, 250);
                });

                update(true);
            });
        }
    });
})(jQuery);
