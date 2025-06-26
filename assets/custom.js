(() => {
  const VideoOnHover = () => {
    $(document).on('mouseover mouseleave touchstart touchend', '.o-product-thumbnail', (e) => {
      console.log('VideoOnHover', e.type);
      //console.log(e);
      let $target = $(e.currentTarget);
      let $video = $target.find('video');
      if ($video.length) {
        let video = $video[0];
        video.loop = true;
        video.muted = true;
        video.controls = false;
        if(window.innerWidth > 900) {
          setTimeout(() => {
            video[['mouseover', 'touchstart'].indexOf(e.type) !== -1 ? 'play' : 'pause']();
          }, 0);
        }
      }
    });
  }

  const RewardsPageMobile = () => {
    UpdateOrder = (type) => {
      let item = type == 'desktop' ? 1 : 2;
      let $item = document.querySelector(`.c-rewards-details__tabs .c-rewards-details__tab:nth-of-type(${ item })`);
      if ($item) {
        $item.click();
        $item.dispatchEvent(new Event('click', {bubbles: true}));
      }
    }

    let breakpoint = window.matchMedia('(max-width: 900px)');
    breakpoint.addEventListener('change', (e) => {
     e.matches ? UpdateOrder('mobile') : UpdateOrder('desktop');
    });
 
    if (breakpoint.matches) {
      UpdateOrder();
    } 
  }

  const DOMReady = () => {
    VideoOnHover();
    RewardsPageMobile();
  }

  document.addEventListener('DOMContentLoaded', DOMReady);
})();

//d()(document).on("ajaxProduct:loaded",(function(){return x(g.getUserCurrency())})),