document.addEventListener("DOMContentLoaded", function() {
  var endlessScroll = new Ajaxinate({
    container: '[data-collection-template-products]',
    pagination: '[data-collection-template-pagination]',
    method: 'click',
    offset: 1000
  });
});