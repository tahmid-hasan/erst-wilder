!function(){"use strict"}();
class PromoSlideshow extends HTMLElement {
  constructor() {
    super();

    this.container = this.querySelector('[data-promo-slider]');
    this.slidesPerView = parseFloat(this.getAttribute('slides-per-view'));
    this.sliderPerViewMobile = parseFloat(this.getAttribute('slides-per-view-mobile'));
    this.slider = null;

    this.previous = this.querySelector('[data-carousel-previous]')
    this.next = this.querySelector('[data-carousel-next]')
  }

  connectedCallback() {
    if (this.container) {
      this.observeVisibility();
    }
  }

  observeVisibility() {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.slider) {
          const tryInitSwiper = () => {
            if (window.Swiper) {
              clearInterval(this.swiperCheckInterval);
              this.initSwiper();
              observer.unobserve(this.container); // Stop observing after initialization
            }
          };
          if (window.Swiper) {
            tryInitSwiper();
          } else {
            this.swiperCheckInterval = setInterval(tryInitSwiper, 100);
          } //Stop observing after initialization
        }
      });
    }, { rootMargin: "100px" });

    observer.observe(this.container);
  }

  initSwiper() {
    console.log('Slides per view: ', this.slidesPerView);
    const slideCount = this.container.querySelectorAll('.swiper-slide').length;
    const isCentered = slideCount < this.slidesPerView;
    const isMobile = window.innerWidth < 750;
    if(isCentered) {
      this.container.setAttribute('data-center', 'true');
    }
    const initialSlide = isMobile ? slideCount - 1 : 0;
    this.slider = new Swiper(this.container, {
      slidesPerView: this.sliderPerViewMobile,
      spaceBetween: 22.5,
      navigation: {
        nextEl: this.next,
        prevEl: this.previous,
      },
      breakpoints: {
        750: {
          slidesPerView: 3
        },
        1100: {
          slidesPerView: this.slidesPerView
        }
      }
    });
  }
}
customElements.define("promo-slideshow", PromoSlideshow);