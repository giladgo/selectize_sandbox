$(function() {
    var $select = $('select').selectize({
      highlight: false,
       plugins: {
         'scroll-to-middle': {},
         'focus-when-empty': {valueToFocusWhenEmpty: '0.00'},
         'open-up': {},
         'no_results': {message: 'Invalid Value'},
         'hide-arrow': {}
       },
       score: function(query) {
         var score = this.getScoreFunction(query);

         // Filter out things that do not match the beginning of the text (ignoring the '-')
         var beginningRx = new RegExp("^-?" + query);
         return function(item) {
           if (!beginningRx.test(item.value)) {
             return 0;
           }

           // Make sure negative values are sorted properly. To do this, we simply add the fraction value
           // of the given number, while keeping the sign, so that negative values will be sorted 'backwards'
           var theValue = parseFloat(item.value);
           return score(item) + (theValue % 1) + 1; // +1 so we don't get negative score;
         };
       }
    });
});




/// ---------------------------- Plugins -------------------------

// Causes it to open in the middle
Selectize.define('scroll-to-middle', function(options) {
  var self = this;
  var original = self.setActiveOption;
  this.setActiveOption = function($option, scroll, animate) {
    if (scroll == null) scroll = true;
    var result = original.apply(this, arguments);
    if (!self.$activeOption) {
      return result;
    }
    if (scroll) {
      var scroll        = self.$dropdown_content.scrollTop() || 0;
      var height_menu   = self.$dropdown_content.height();
      var height_item   = self.$activeOption.outerHeight(true);
      var y = self.$activeOption.offset().top - self.$dropdown_content.offset().top + scroll;
      var scroll_middle = y - (height_menu / 2) + (height_item / 2);
      self.$dropdown_content.scrollTop(scroll_middle);
    }

    return result;
  }.bind(self);
});

// Causes a certain item to be focused when opened while empty
Selectize.define('focus-when-empty', function(options) {
  var self = this;
  self.on('dropdown_open', function() {
    if (!self.getValue()) {
      var elementToFocus = self.getElementWithValue(options.valueToFocusWhenEmpty, self.$dropdown_content.children());
      self.setActiveOption(elementToFocus, true, false);
    }
  });
});

// Causes it to open up when needed
Selectize.define('open-up', function(options) {
  var self = this;
  var original = self.positionDropdown;
  this.positionDropdown = function() {
    var result = original.apply(this, arguments);

    // remove the bottom so we can recalculate the overflow properly
    this.$dropdown.removeClass('open-up');
    this.$dropdown.css({
      bottom: ''
    });

    dropdownBottomPosition = self.$dropdown.offset().top + self.$dropdown.height();
    isOverflow = window.innerHeight - dropdownBottomPosition < 0;

    if (isOverflow) {
      var $control = this.$control;
      var offset = this.settings.dropdownParent === 'body' ? $control.offset() : $control.position();
      offset.top += $control.outerHeight(true);

      this.$dropdown.css({
        top   : '',
        bottom: offset.top
      });
      this.$dropdown.addClass('open-up');
    }

    return result;
  }.bind(self);
});


// Shows a 'no results found' message'
// got it from https://gist.github.com/antitoxic/9156ae5a4531fce46ad1
Selectize.define('no_results', function( options ) {
    var KEY_LEFT      = 37;
    var KEY_UP        = 38;
    var KEY_RIGHT     = 39;
    var KEY_DOWN      = 40;
    var ignoreKeys = [KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN]
    var self = this;

    options = $.extend({
        message: 'No results found.',
        html: function(data) {
            return '<div class="dropdown-empty-message">' + data.message + '</div>';
        }
    }, options );


    self.on('type', function(str) {
        if (!self.hasOptions) {
            self.$empty_results_container.show();
        } else {
            self.$empty_results_container.hide();
        }
    });

    self.onKeyUp = (function() {
        var original = self.onKeyUp;

        return function ( e ) {
            if (ignoreKeys.indexOf(e.keyCode) > -1) return;
            self.isOpen = false;
            original.apply( self, arguments );
        }
    })();

    self.onBlur = (function () {
        var original = self.onBlur;

        return function () {
            original.apply( self, arguments );
            self.$empty_results_container.hide();
        };
    })();

    self.setup = (function() {
        var original = self.setup;
        return function() {
            original.apply( self, arguments);
            self.$empty_results_container = $(
                options.html($.extend({
                    classNames: self.$input.attr( 'class' )
                }, options))
            );
            self.$empty_results_container.hide();
            self.$dropdown.append(self.$empty_results_container);
        };
    })();
});

// This hides the up arrow. All of the work is done in the CSS
Selectize.define('hide-arrow', function(){
});
