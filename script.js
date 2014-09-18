$(function() {
    var $select = $('select').selectize({
      highlight: false,
       plugins: {
         'open_middle': {},
         'focus_when_empty': {valueToFocusWhenEmpty: '0.00'},
         'open-up': {}
       }
    });
});




/// ---------------------------- Plugins -------------------------

// Causes it to open in the middle
Selectize.define('open_middle', function(options) {
  var self = this;
  var original = self.setActiveOption;
  this.setActiveOption = function($option, scroll, animate) {
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
Selectize.define('focus_when_empty', function(options) {
  var self = this;
  self.on('dropdown_open', function() {
    if (!self.getValue()) {
      var elementToFocus = $(self.$dropdown_content.find("div[data-value='" + options.valueToFocusWhenEmpty + "']"));
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
