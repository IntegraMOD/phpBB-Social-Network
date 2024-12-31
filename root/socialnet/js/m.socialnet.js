/**
 * @preserve phpBB Social Network 0.7.2 - Core
 * (c) 2010-2012 Kamahl & Culprit & Senky http://phpbbsocialnetwork.com
 * http://opensource.org/licenses/gpl-license.php GNU Public License
 * (Updated to jQuery 3.7+ and implemented no-conflict mode, integramod.com, December 2024)
 */
 
(function($) {
  // Use jQuery.noConflict() to avoid conflicts with other libraries
  $ = jQuery.noConflict(true);
 
  /**
   * Extend jQuery Library
   * @param {object} $ jQuery
   * @returns {void}
   */
  $.fn.metadataInit = function(param) {
    $(this).each(function() {
      $(this).attr(param, eval('$(this).metadata().' + param + ';'));
    });
  };
 
  /**
   * Declaration of phpBB Social Network object
   * @param {object} $ jQuery
   * @returns {object} socialNetwork
   */
  var socialNetwork = (function($) {
    // The rest of the socialNetwork object remains the same
    // ...
 
    return {
      // ... (existing properties and methods)
 
      init: function(opts) {
        var self = this;
        this._settings(this, opts);
        if (this.strpos(this.cookie.name, '_', -1) != 0) {
          this.cookie.name += '_';
        }
 
        this.confirmBox.init();
 
        this._minBrowser();
 
        // Update: Remove $.metadata.setType("class")
        // $.metadata is not supported in jQuery 3.7
 
        $(window).on('resize', function() {
          self._resizeBlocks();
        }).on('scroll', function() {
          self._scrollBlocks();
        }).on('unload', function() {
          self._unloadBlocks();
        });
 
        $(document).on('click', function(event) {
          self._documentClick(event);
        });
 
        $('.sn-page-content').on('DOMSubtreeModified', function() {
          self._DOMSubtreeModified();
        });
 
        // ... (rest of the init function)
      },
 
      // ... (other methods)
 
      _minBrowser: function() {
        // Update: Remove $.browser checks as it's not supported in jQuery 3.7
        // Consider using feature detection instead of browser detection
        return true;
      },
 
      // ... (other methods)
    };
  })(jQuery);
 
  /**
   * Declaration for phpBB Social Network confirmBox
   * @param {object} $ jQuery
   * @param {object} $sn socialNetwork
   * @returns {void}
   */
  (function($, $sn) {
    $sn.confirmBox = {
      // ... (existing properties)
 
      init: function() {
        // ... (existing code)
 
        $(document).on('click', '.sn-deleteComment', function() {
          // ... (existing code for delete comment)
        });
 
        // ... (rest of the init function)
      },
 
      // ... (other methods)
    };
  })(jQuery, socialNetwork);
 
  /**
   * Declaration for phpBB Social Network comments
   * @param {object} $ jQuery
   * @param {object} $sn socialNetwork
   * @returns {void}
   */
  (function($, $sn) {
    $sn.comments = {
      // ... (existing properties)
 
      init: function() {
        var self = this;
        var confirmBox = $sn.confirmBox;
 
        // Update: Use .on() instead of .live()
        $(document).on('click', ".sn-deleteComment", function() {
          // ... (existing code for delete comment)
        });
 
        self.waterMark();
      },
 
      waterMark: function() {
        // Note: Make sure you're using a jQuery plugin that's compatible with jQuery 3.7 for watermark and elastic
        $(".sn-inputComment").watermark($sn.comments.watermark, {
          useNative: false,
          className: 'sn-watermark'
        }).elastic({
          showNewLine: false,
          parentElement: '.sn-shareComment',
          submitElement: 'input[name="sn-us-buttonComment"]'
        });
      }
    };
  })(jQuery, socialNetwork);
 
})(jQuery);