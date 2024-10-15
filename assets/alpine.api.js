(() => {
  const ConvertStringToHTML = function (str) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, 'text/html');
    return doc.body;
  }

  const ArrayShuffle = (array) => {
    var i = 0, j = 0, temp = null;
    for (i = array.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1));
      temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  const OnElementMutated = (selector, config, callback) => {
    var observer = new MutationObserver(callback);

    // Notify me of everything!
    var observerConfig = {
      attributes: config.attributes || true, 
      childList: config.childList || true, 
      characterData: config.characterData || false 
    };

    // In this case we'll listen to all changes to body and child nodes
    var targetNodes = document.querySelectorAll(selector);
    targetNodes.forEach((node) => {
      observer.observe(node, observerConfig);
    });  
  }
  
  const GetRelatedProducts = async (related_tag) => {
    let url = `/collections/all/${ related_tag }`;
    return fetch(url).then(res => res.text());
  }

  const FormSubmitAjax = (form) => {
    return fetch(form.action, { method: 'POST', body: new FormData(form) });
  }

  const GetCartJson = () => {
    return $.getJSON('/cart.js');
  }

  const UpdateCartAttributes = async(data) => {
    return $.ajax({
      type: 'POST',
      url: '/cart/update.js',
      data: data
    }, null, 'json');
  }

  document.addEventListener('load-related-products', async (e) => {
    let $section = document.querySelector('[data-related-products]');
    let related_res = await GetRelatedProducts(e.detail.related_tag);
    let $relatedProducts = [...ConvertStringToHTML(related_res).querySelectorAll('[data-collection-template-products] .o-product-thumbnail')];
    let current_product = $section.dataset.current_product;
    let limit = $section.dataset.limit;

    $relatedProducts = $relatedProducts.filter($product => $product.dataset.handle !== current_product);
    $relatedProducts = ArrayShuffle($relatedProducts);
    $relatedProducts = $relatedProducts.slice(0, limit);

    //console.log($relatedProducts)
    $relatedProducts.forEach(($item) => {
      $item.querySelectorAll('button').forEach(($atc_btn) => {
        $atc_btn.setAttribute('x-on:click.prevent', `$dispatch('related:AddItemToCart')`);
      });
      $section.insertAdjacentElement('beforeend', $item);
    });
    if ($relatedProducts.length && e.detail.related_tag !== '') {
      $section.closest('.c-recommended-products-carousel').classList.remove('u-visually-hidden');
    }
  });

  // cart item updated
  document.addEventListener('quantity-updated', async(e) => {
    // console.log(e);
    let lineIndex = e.detail.lineIndex;
    let cart = await GetCartJson();
    let cart_lineIndex = cart.attributes.updated_line;

    if (lineIndex != cart_lineIndex) {
      UpdateCartAttributes({attributes: {updated_line: lineIndex}});
    }
  });

  // Klaviyo newsletter form
  document.addEventListener('klaviyo-form-Um3f8U-init', (e) => {
    OnElementMutated('.klaviyo-newsletter-form div', {}, (m) => {
      document.querySelectorAll('.klaviyo-newsletter-form').forEach(($container) => {
        $container.querySelectorAll('.kl-private-reset-css-Xuajs1').forEach(($item) => {
          $item.classList.remove('kl-private-reset-css-Xuajs1');
        });

        let $btn = $container.querySelector('form button');
        if ($btn) {
          $btn.innerHTML = '<span>Submit</span>';
          $btn.removeAttribute('style');
          $btn.className = '';

          let $btnWrap = $btn.closest('div');
          $btnWrap.removeAttribute('style');
          $btnWrap.className = '';
          $btnWrap.classList.add('c-newsletter-form__btn');  
        }

        let $email = $container.querySelector('input[type=email]');
        if ($email) {
          $email.setAttribute('placeholder', 'Email address');
          $email.removeAttribute('style');
          $email.className = '';
          $email.classList.add('c-newsletter-form__input', 'o-input', 'is-secondary');
        }
      });
    });
  });

  // Filter options color dropdown
  document.addEventListener('init-FilterOptionsColor', (e) => {
    let $section = e.target;
    let id = $section.getAttribute('id');
    let isDesktop = window.matchMedia("(min-width: 750px)").matches;
    if (!isDesktop) return;

    OnElementMutated(`#${ id }`, {}, (m) => {
      let $colors = $section.querySelectorAll('button');
      $colors.forEach(($button) => {
        let color = $button.dataset.option.replace('color-', '');
        if (!$button.querySelector('.color-name')) {
          $button.insertAdjacentHTML('beforeend', `<span class="color-name">${ color }</span>`);
        }
        if (!$button.closest('.button-wrap')) {
          $button.outerHTML = `<div class="button-wrap">${ $button.outerHTML }</div>`;
        }
      });
    });
  });
})();

document.addEventListener('alpine:init', () => {
  const GetCurrentLocation = async() => {
    return await fetch(
       window.Shopify.routes.root
         + 'browsing_context_suggestions.json'
         + '?country[enabled]=true'
         + `&country[exclude]=${window.Shopify.country}`
         + '&language[enabled]=true'
         + `&language[exclude]=${window.Shopify.language}`
     ).then(r => r.json());
   }

  Alpine.data('HeroFullBannerCarousel', () => ({
    $section: null,
    swiper: null,
    initialized: false,
    init() {
      let am = this;
      document.addEventListener('init-HeroFullBannerCarousel', (e) => {
        if (am.initialized) return;
        
        am.initialized = true;
        am.$section = e.target;
        let $slides = am.$section.querySelectorAll('.swiper-slide');
        if ($slides.length == 1) return;
        am.InitCarousel();
      });
    },
    InitCarousel() {
      let am = this;

      let autoplay_delay = parseInt(am.$section.dataset.carousel_autoplay_delay) * 1000;
      let swiper_config = {
        navigation: {
          nextEl: am.$section.querySelector('.swiper-button-next'),
          prevEl: am.$section.querySelector('.swiper-button-prev')
        },
        loop: true
      };

      if (autoplay_delay) {
        swiper_config.autoplay = {
          delay: autoplay_delay,
          disableOnInteraction: false,
        }
      }

      let swiper = new Swiper(am.$section.querySelector('.mySwiper'), swiper_config);
      am.swiper = swiper;
    }
  }));

  Alpine.data('SplitBannerCarousel', () => ({
    cache: {},
    init() {
      let am = this;
      am.InitSelf()
      am.InitCarousel()
    },
    InitSelf() {
      let am = this;
      am.cache.$carousel = am.$el
    },
    InitCarousel() {
      let am = this;
      let autoplay_delay = parseInt(am.cache.$carousel.dataset.carousel_autoplay_delay || 0) * 1000;
      let swiper_config = {
        navigation: {
          nextEl: am.cache.$carousel.querySelector('.swiper-button-next'),
          prevEl: am.cache.$carousel.querySelector('.swiper-button-prev')
        },
        loop: true
      };

      if (autoplay_delay) {
        swiper_config.autoplay = {
          delay: autoplay_delay,
          disableOnInteraction: false,
        }
      }

      let swiper = new Swiper(am.cache.$carousel, swiper_config);
    }
  }));

  const SESSION_LOCATION_KEY = '_location';
  Alpine.data('CurrencySwitcher', () => ({
    async init() {
      let am = this;
      let $currency = am.$el.querySelector('select');

      let location = JSON.parse(sessionStorage.getItem(SESSION_LOCATION_KEY));
      if (!location) {
        location = await GetCurrentLocation();
        sessionStorage.setItem(SESSION_LOCATION_KEY, JSON.stringify(location));
      }

      let countries_map = [
        { countries: ['United Kingdom'], currency: 'GBP' },
        { countries: ['Australia', 'New Zealand'], currency: 'AUD' },
        { countries: ['United States'], currency: 'USD' },
        { countries: ['Austria','Belgium','Finland','France','Germany','Greece','Italy','Netherlands','Portugal','Spain'], currency: 'EUR' },
        { countries: ['Canada'], currency: 'CAD' },
        { countries: ['China'], currency: 'CNY' },
        { countries: ['Japan'], currency: 'JPY' },
      ];
      // console.log(location);
      let country = location.detected_values.country.name;
      let country_match = countries_map.find(item => item.countries.indexOf(country) !== -1);

      if (!country_match || $currency.value == country_match.currency) return;

      $currency.value = country_match.currency;
      $currency.dispatchEvent(new Event('change', {bubbles: true}));
    }
  }));

  Alpine.data('GiftFormDatePicker', () => ({
    date: '',
    display_date: '',
    init() {
      this.InitSelf();
    },
    ConvertDateToString(date) {
      let day = date.getDate();
      day = `${day<10?'0':''}${day}`;

      let month = date.getMonth() + 1;
      month = `${month<10?'0':''}${month}`;

      let year = date.getFullYear();
      return {
        date_input_format: `${year}-${month}-${day}`,
        display_format: `${day}/${month}/${year}`
      };
    },
    InitSelf() {
      let am = this;
      let nextDay = new Date();
      // nextDay.setDate(nextDay.getDate() + 1);

      let picker = new Pikaday({ 
        field: am.$el.querySelector('#datepicker'),
        minDate: nextDay,
        toString(date) {
          return am.ConvertDateToString(date);
        },        
        onSelect() {
          am.date = picker.toString().date_input_format;
          am.display_date = picker.toString().display_format;
        }
      });
    },
    e_UpdateDate() {
      let am = this;
    }
  }));
});
