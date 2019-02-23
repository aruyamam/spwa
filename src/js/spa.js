const configMap = {
   extendedHeight: 434,
   extendedTitle: 'Click to retract',
   retractedHeight: 16,
   retractedTitle: 'Click to extend',
   templateHtml: '<div class="spa-slider"></div>',
};

let $chatSlider;

// DOM method /toggleSlider/
// alternates slider height
//
const toggleSlider = () => {
   const sliderHeight = $chatSlider.height();

   // extend slider if fully retracted
   if (sliderHeight === configMap.retractedHeight) {
      $chatSlider
         .animate({ height: configMap.extendedHeight })
         .attr('title', configMap.extendedTitle);

      return true;
   }

   // retract slider if fully extended
   if (sliderHeight === configMap.extendedHeight) {
      $chatSlider
         .animate({ height: configMap.retractedHeight })
         .attr('title', configMap.retractedTitle);

      return true;
   }

   // do not take action if slider is in transition
   return false;
};

// Event handler /onClickSlider/
// receives click event and calls toggleSlider
//
const onClickSlider = () => {
   toggleSlider();

   return false;
};

// Set initial state and provides feature
//
const initModule = ($contianer) => {
   // render HTML
   $contianer.html(configMap.templateHtml);
   $chatSlider = $contianer.find('.spa-slider');

   // initialize slider height and title
   // bind the user click event to the event handler
   $chatSlider.attr('title', configMap.retractedTitle).click(onClickSlider);

   return true;
};

export default { initModule };
