(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bootstrap = factory());
}(this, (function () { 'use strict';
  
  const SelectorEngine = {
    find(selector, element = document.documentElement) {
      return [].concat(...Element.prototype.querySelectorAll.call(element, selector))
    },
  
    findOne(selector, element = document.documentElement) {
      return Element.prototype.querySelector.call(element, selector)
    },
  
    children(element, selector) {
      return [].concat(...element.children).filter(child => child.matches(selector))
    },
  
    parents(element, selector) {
      const parents = []
      let ancestor = element.parentNode.closest(selector)
  
      while (ancestor) {
        parents.push(ancestor)
        ancestor = ancestor.parentNode.closest(selector)
      }
  
      return parents
    },
  
    prev(element, selector) {
      let previous = element.previousElementSibling
  
      while (previous) {
        if (previous.matches(selector)) {
          return [previous]
        }
  
        previous = previous.previousElementSibling
      }
  
      return []
    },
    // TODO: this is now unused; remove later along with prev()
    next(element, selector) {
      let next = element.nextElementSibling
  
      while (next) {
        if (next.matches(selector)) {
          return [next]
        }
  
        next = next.nextElementSibling
      }
  
      return []
    },
  
    focusableChildren(element) {
      const focusables = [
        'a',
        'button',
        'input',
        'textarea',
        'select',
        'details',
        '[tabindex]',
        '[contenteditable="true"]'
      ].map(selector => `${selector}:not([tabindex^="-"])`).join(',')
  
      return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el))
    },
  
    getSelectorFromElement(element) {
      const selector = getSelector(element)
  
      if (selector) {
        return SelectorEngine.findOne(selector) ? selector : null
      }
  
      return null
    },
  
    getElementFromSelector(element) {
      const selector = getSelector(element)
  
      return selector ? SelectorEngine.findOne(selector) : null
    },
  
    getMultipleElementsFromSelector(element) {
      const selector = getSelector(element)
  
      return selector ? SelectorEngine.find(selector) : []
    }
  }

  const MILLISECONDS_MULTIPLIER = 1000;
  const TRANSITION_END = 'transitionend';

  const toType = obj => {
    if (obj === null || obj === undefined) {
      return `${obj}`;
    }
  
    return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase();
  };

  const getSelector = element => {
    let selector = element.getAttribute('data-bs-target');
  
    if (!selector || selector === '#') {
      let hrefAttr = element.getAttribute('href'); // The only valid content that could double as a selector are IDs or classes,
      // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
      // `document.querySelector` will rightfully complain it is invalid.
      // See https://github.com/twbs/bootstrap/issues/32273
  
      if (!hrefAttr || !hrefAttr.includes('#') && !hrefAttr.startsWith('.')) {
        return null;
      } // Just in case some CMS puts out a full URL with the anchor appended
  
  
      if (hrefAttr.includes('#') && !hrefAttr.startsWith('#')) {
        hrefAttr = `#${hrefAttr.split('#')[1]}`;
      }
  
      selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : null;
    }
  
    return selector;
  };

  const getSelectorFromElement = element => {
    const selector = getSelector(element);
  
    if (selector) {
      return document.querySelector(selector) ? selector : null;
    }
  
    return null;
  };

  const getElementFromSelector = element => {
    const selector = getSelector(element);
    return selector ? document.querySelector(selector) : null;
  };

  const getTransitionDurationFromElement = element => {
    if (!element) {
      return 0;
    } // Get transition-duration of the element
  
  
    let {
      transitionDuration,
      transitionDelay
    } = window.getComputedStyle(element);
    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    const floatTransitionDelay = Number.parseFloat(transitionDelay); // Return 0 if element or transition duration is not found
  
    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0;
    } // If multiple durations are defined, take the first
  
  
    transitionDuration = transitionDuration.split(',')[0];
    transitionDelay = transitionDelay.split(',')[0];
    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
  };

  const triggerTransitionEnd = element => {
    element.dispatchEvent(new Event(TRANSITION_END));
  };

  const isElement$1 = obj => {
    if (!obj || typeof obj !== 'object') {
      return false;
    }
  
    if (typeof obj.jquery !== 'undefined') {
      obj = obj[0];
    }
  
    return typeof obj.nodeType !== 'undefined';
  };

  const getElement = obj => {
    if (isElement$1(obj)) {
      // it's a jQuery object or a node element
      return obj.jquery ? obj[0] : obj;
    }
  
    if (typeof obj === 'string' && obj.length > 0) {
      return SelectorEngine.findOne(obj);
    }
  
    return null;
  };

  const typeCheckConfig = (componentName, config, configTypes) => {
    Object.keys(configTypes).forEach(property => {
      const expectedTypes = configTypes[property];
      const value = config[property];
      const valueType = value && isElement$1(value) ? 'element' : toType(value);
  
      if (!new RegExp(expectedTypes).test(valueType)) {
        throw new TypeError(`${componentName.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
      }
    });
  };

  const reflow = element => element.offsetHeight;

  const getjQuery = () => {
    const {
      jQuery
    } = window;
  
    if (jQuery && !document.body.hasAttribute('data-bs-no-jquery')) {
      return jQuery;
    }
  
    return null;
  };

  const execute = callback => {
    if (typeof callback === 'function') {
      callback();
    }
  };

  const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
    if (!waitForTransition) {
      execute(callback);
      return;
    }
  
    const durationPadding = 5;
    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
    let called = false;
  
    const handler = ({
      target
    }) => {
      if (target !== transitionElement) {
        return;
      }
  
      called = true;
      transitionElement.removeEventListener(TRANSITION_END, handler);
      execute(callback);
    };
  
    transitionElement.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        triggerTransitionEnd(transitionElement);
      }
    }, emulatedDuration);
  };

  const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
  const stripNameRegex = /\..*/;

  const eventRegistry = {};

  let uidEvent = 1;
  const customEvents = {
    mouseenter: 'mouseover',
    mouseleave: 'mouseout'
  };
  const customEventsRegex = /^(mouseenter|mouseleave)/i;
  const nativeEvents = new Set(['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel', 'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointerleave', 'pointercancel', 'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur', 'change', 'reset', 'select', 'submit', 'focusin', 'focusout', 'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded', 'readystatechange', 'error', 'abort', 'scroll']);

  function getUidEvent(element, uid) {
    return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
  }

  function getEvent(element) {
    const uid = getUidEvent(element);
    element.uidEvent = uid;
    eventRegistry[uid] = eventRegistry[uid] || {};
    return eventRegistry[uid];
  }

  function bootstrapDelegationHandler(element, selector, fn) {
    return function handler(event) {
      const domElements = element.querySelectorAll(selector);
  
      for (let {
        target
      } = event; target && target !== this; target = target.parentNode) {
        for (let i = domElements.length; i--;) {
          if (domElements[i] === target) {
            event.delegateTarget = target;
  
            if (handler.oneOff) {
              // eslint-disable-next-line unicorn/consistent-destructuring
              EventHandler.off(element, event.type, selector, fn);
            }
  
            return fn.apply(target, [event]);
          }
        }
      } // To please ESLint
  
  
      return null;
    };
  }

  function findHandler(events, handler, delegationSelector = null) {
    const uidEventList = Object.keys(events);
  
    for (let i = 0, len = uidEventList.length; i < len; i++) {
      const event = events[uidEventList[i]];
  
      if (event.originalHandler === handler && event.delegationSelector === delegationSelector) {
        return event;
      }
    }
  
    return null;
  }

  function normalizeParams(originalTypeEvent, handler, delegationFn) {
    const delegation = typeof handler === 'string';
    const originalHandler = delegation ? delegationFn : handler;
    let typeEvent = getTypeEvent(originalTypeEvent);
    const isNative = nativeEvents.has(typeEvent);
  
    if (!isNative) {
      typeEvent = originalTypeEvent;
    }
  
    return [delegation, originalHandler, typeEvent];
  }

  function addHandler(element, originalTypeEvent, handler, delegationFn, oneOff) {
    if (typeof originalTypeEvent !== 'string' || !element) {
      return;
    }
  
    if (!handler) {
      handler = delegationFn;
      delegationFn = null;
    } // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
    // this prevents the handler from being dispatched the same way as mouseover or mouseout does
  
  
    if (customEventsRegex.test(originalTypeEvent)) {
      const wrapFn = fn => {
        return function (event) {
          if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
            return fn.call(this, event);
          }
        };
      };
  
      if (delegationFn) {
        delegationFn = wrapFn(delegationFn);
      } else {
        handler = wrapFn(handler);
      }
    }
  
    const [delegation, originalHandler, typeEvent] = normalizeParams(originalTypeEvent, handler, delegationFn);
    const events = getEvent(element);
    const handlers = events[typeEvent] || (events[typeEvent] = {});
    const previousFn = findHandler(handlers, originalHandler, delegation ? handler : null);
  
    if (previousFn) {
      previousFn.oneOff = previousFn.oneOff && oneOff;
      return;
    }
  
    const uid = getUidEvent(originalHandler, originalTypeEvent.replace(namespaceRegex, ''));
    const fn = delegation ? bootstrapDelegationHandler(element, handler, delegationFn) : bootstrapHandler(element, handler);
    fn.delegationSelector = delegation ? handler : null;
    fn.originalHandler = originalHandler;
    fn.oneOff = oneOff;
    fn.uidEvent = uid;
    handlers[uid] = fn;
    element.addEventListener(typeEvent, fn, delegation);
  }

  function removeHandler(element, events, typeEvent, handler, delegationSelector) {
    const fn = findHandler(events[typeEvent], handler, delegationSelector);
  
    if (!fn) {
      return;
    }
  
    element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
    delete events[typeEvent][fn.uidEvent];
  }

  function getTypeEvent(event) {
    // allow to get the native events from namespaced events ('click.bs.button' --> 'click')
    event = event.replace(stripNameRegex, '');
    return customEvents[event] || event;
  }

  const EventHandler = {
    on(element, event, handler, delegationFn) {
      addHandler(element, event, handler, delegationFn, false);
    },
  
    one(element, event, handler, delegationFn) {
      addHandler(element, event, handler, delegationFn, true);
    },
  
    off(element, originalTypeEvent, handler, delegationFn) {
      if (typeof originalTypeEvent !== 'string' || !element) {
        return;
      }
  
      const [delegation, originalHandler, typeEvent] = normalizeParams(originalTypeEvent, handler, delegationFn);
      const inNamespace = typeEvent !== originalTypeEvent;
      const events = getEvent(element);
      const isNamespace = originalTypeEvent.startsWith('.');
  
      if (typeof originalHandler !== 'undefined') {
        // Simplest case: handler is passed, remove that listener ONLY.
        if (!events || !events[typeEvent]) {
          return;
        }
  
        removeHandler(element, events, typeEvent, originalHandler, delegation ? handler : null);
        return;
      }
  
      if (isNamespace) {
        Object.keys(events).forEach(elementEvent => {
          removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
        });
      }
  
      const storeElementEvent = events[typeEvent] || {};
      Object.keys(storeElementEvent).forEach(keyHandlers => {
        const handlerKey = keyHandlers.replace(stripUidRegex, '');
  
        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
          const event = storeElementEvent[keyHandlers];
          removeHandler(element, events, typeEvent, event.originalHandler, event.delegationSelector);
        }
      });
    },
  
    trigger(element, event, args) {
      if (typeof event !== 'string' || !element) {
        return null;
      }
  
      const $ = getjQuery();
      const typeEvent = getTypeEvent(event);
      const inNamespace = event !== typeEvent;
      const isNative = nativeEvents.has(typeEvent);
      let jQueryEvent;
      let bubbles = true;
      let nativeDispatch = true;
      let defaultPrevented = false;
      let evt = null;
  
      if (inNamespace && $) {
        jQueryEvent = $.Event(event, args);
        $(element).trigger(jQueryEvent);
        bubbles = !jQueryEvent.isPropagationStopped();
        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
        defaultPrevented = jQueryEvent.isDefaultPrevented();
      }
  
      if (isNative) {
        evt = document.createEvent('HTMLEvents');
        evt.initEvent(typeEvent, bubbles, true);
      } else {
        evt = new CustomEvent(event, {
          bubbles,
          cancelable: true
        });
      } // merge custom information in our event
  
  
      if (typeof args !== 'undefined') {
        Object.keys(args).forEach(key => {
          Object.defineProperty(evt, key, {
            get() {
              return args[key];
            }
  
          });
        });
      }
  
      if (defaultPrevented) {
        evt.preventDefault();
      }
  
      if (nativeDispatch) {
        element.dispatchEvent(evt);
      }
  
      if (evt.defaultPrevented && typeof jQueryEvent !== 'undefined') {
        jQueryEvent.preventDefault();
      }
  
      return evt;
    }
  
  };

  const elementMap = new Map();
  var Data = {
    set(element, key, instance) {
      if (!elementMap.has(element)) {
        elementMap.set(element, new Map());
      }

      const instanceMap = elementMap.get(element); // make it clear we only want one instance per element
      // can be removed later when multiple key/instances are fine to be used

      if (!instanceMap.has(key) && instanceMap.size !== 0) {
        // eslint-disable-next-line no-console
        console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
        return;
      }

      instanceMap.set(key, instance);
    },

    get(element, key) {
      if (elementMap.has(element)) {
        return elementMap.get(element).get(key) || null;
      }

      return null;
    },

    remove(element, key) {
      if (!elementMap.has(element)) {
        return;
      }

      const instanceMap = elementMap.get(element);
      instanceMap.delete(key); // free up element references if there are no instances left for an element

      if (instanceMap.size === 0) {
        elementMap.delete(element);
      }
    }
  };

  const VERSION = '5.0.2';

  class BaseComponent {
    constructor(element) {
      element = getElement(element);
  
      if (!element) {
        return;
      }
  
      this._element = element;
      Data.set(this._element, this.constructor.DATA_KEY, this);
    }
  
    dispose() {
      Data.remove(this._element, this.constructor.DATA_KEY);
      EventHandler.off(this._element, this.constructor.EVENT_KEY);
      Object.getOwnPropertyNames(this).forEach(propertyName => {
        this[propertyName] = null;
      });
    }
  
    _queueCallback(callback, element, isAnimated = true) {
      executeAfterTransition(callback, element, isAnimated);
    }
    /** Static */
  
  
    static getInstance(element) {
      return Data.get(element, this.DATA_KEY);
    }
  
    static getOrCreateInstance(element, config = {}) {
      return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
    }
  
    static get VERSION() {
      return VERSION;
    }
  
    static get NAME() {
      throw new Error('You have to implement the static method "NAME", for each component!');
    }
  
    static get DATA_KEY() {
      return `bs.${this.NAME}`;
    }
  
    static get EVENT_KEY() {
      return `.${this.DATA_KEY}`;
    }
  
  }

  function normalizeData(val) {
    if (val === 'true') {
      return true;
    }
  
    if (val === 'false') {
      return false;
    }
  
    if (val === Number(val).toString()) {
      return Number(val);
    }
  
    if (val === '' || val === 'null') {
      return null;
    }
  
    return val;
  }
  
  function normalizeDataKey(key) {
    return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
  }

  const Manipulator = {
    setDataAttribute(element, key, value) {
      element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
    },
  
    removeDataAttribute(element, key) {
      element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
    },
  
    getDataAttributes(element) {
      if (!element) {
        return {};
      }
  
      const attributes = {};
      Object.keys(element.dataset).filter(key => key.startsWith('bs')).forEach(key => {
        let pureKey = key.replace(/^bs/, '');
        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
        attributes[pureKey] = normalizeData(element.dataset[key]);
      });
      return attributes;
    },
  
    getDataAttribute(element, key) {
      return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
    },
  
    offset(element) {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft
      };
    },
  
    position(element) {
      return {
        top: element.offsetTop,
        left: element.offsetLeft
      };
    }
  
  };

  const NAME$9 = 'collapse';
  const DATA_KEY$8 = 'bs.collapse';
  const EVENT_KEY$8 = `.${DATA_KEY$8}`;
  const DATA_API_KEY$5 = '.data-api';
  const Default$8 = {
    toggle: true,
    parent: ''
  };
  const DefaultType$8 = {
    toggle: 'boolean',
    parent: '(string|element)'
  };
  const EVENT_SHOW$5 = `show${EVENT_KEY$8}`;
  const EVENT_SHOWN$5 = `shown${EVENT_KEY$8}`;
  const EVENT_HIDE$5 = `hide${EVENT_KEY$8}`;
  const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$8}`;
  const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
  const CLASS_NAME_SHOW$8 = 'show';
  const CLASS_NAME_COLLAPSE = 'collapse';
  const CLASS_NAME_COLLAPSING = 'collapsing';
  const CLASS_NAME_COLLAPSED = 'collapsed';
  const WIDTH = 'width';
  const HEIGHT = 'height';
  const SELECTOR_ACTIVES = '.show, .collapsing';
  const SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';

  class Collapse extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._isTransitioning = false;
      this._config = this._getConfig(config);
      this._triggerArray = SelectorEngine.find(`${SELECTOR_DATA_TOGGLE$4}[href="#${this._element.id}"],` + `${SELECTOR_DATA_TOGGLE$4}[data-bs-target="#${this._element.id}"]`);
      const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);

      for (let i = 0, len = toggleList.length; i < len; i++) {
        const elem = toggleList[i];
        const selector = getSelectorFromElement(elem);
        const filterElement = SelectorEngine.find(selector).filter(foundElem => foundElem === this._element);

        if (selector !== null && filterElement.length) {
          this._selector = selector;

          this._triggerArray.push(elem);
        }
      }

      this._parent = this._config.parent ? this._getParent() : null;

      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._element, this._triggerArray);
      }

      if (this._config.toggle) {
        this.toggle();
      }
    } // Getters


    static get Default() {
      return Default$8;
    }

    static get NAME() {
      return NAME$9;
    } // Public


    toggle() {
      if (this._element.classList.contains(CLASS_NAME_SHOW$8)) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      if (this._isTransitioning || this._element.classList.contains(CLASS_NAME_SHOW$8)) {
        return;
      }

      let actives;
      let activesData;

      if (this._parent) {
        actives = SelectorEngine.find(SELECTOR_ACTIVES, this._parent).filter(elem => {
          if (typeof this._config.parent === 'string') {
            return elem.getAttribute('data-bs-parent') === this._config.parent;
          }

          return elem.classList.contains(CLASS_NAME_COLLAPSE);
        });

        if (actives.length === 0) {
          actives = null;
        }
      }

      const container = SelectorEngine.findOne(this._selector);

      if (actives) {
        const tempActiveData = actives.find(elem => container !== elem);
        activesData = tempActiveData ? Collapse.getInstance(tempActiveData) : null;

        if (activesData && activesData._isTransitioning) {
          return;
        }
      }

      const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$5);

      if (startEvent.defaultPrevented) {
        return;
      }

      if (actives) {
        actives.forEach(elemActive => {
          if (container !== elemActive) {
            Collapse.collapseInterface(elemActive, 'hide');
          }

          if (!activesData) {
            Data.set(elemActive, DATA_KEY$8, null);
          }
        });
      }

      const dimension = this._getDimension();

      this._element.classList.remove(CLASS_NAME_COLLAPSE);

      this._element.classList.add(CLASS_NAME_COLLAPSING);

      this._element.style[dimension] = 0;
      if (this._triggerArray.length) {
        this._triggerArray.forEach(element => {
          element.classList.remove(CLASS_NAME_COLLAPSED);
          element.setAttribute('aria-expanded', true);
        });
      }

      this.setTransitioning(true);

      const complete = () => {
        this._element.classList.remove(CLASS_NAME_COLLAPSING);

        this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$8);

        this._element.style[dimension] = '';
        this.setTransitioning(false);
        EventHandler.trigger(this._element, EVENT_SHOWN$5);
      };

      const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      const scrollSize = `scroll${capitalizedDimension}`;

      this._queueCallback(complete, this._element, true);

      this._element.style[dimension] = `${this._element[scrollSize]}px`;
    }

    hide() {
      if (this._isTransitioning || !this._element.classList.contains(CLASS_NAME_SHOW$8)) {
        return;
      }

      const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$5);

      if (startEvent.defaultPrevented) {
        return;
      }

      const dimension = this._getDimension();

      this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
      reflow(this._element);

      this._element.classList.add(CLASS_NAME_COLLAPSING);

      this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$8);

      const triggerArrayLength = this._triggerArray.length;

      if (triggerArrayLength > 0) {
        for (let i = 0; i < triggerArrayLength; i++) {
          const trigger = this._triggerArray[i];
          const elem = getElementFromSelector(trigger);

          if (elem && !elem.classList.contains(CLASS_NAME_SHOW$8)) {
            trigger.classList.add(CLASS_NAME_COLLAPSED);
            trigger.setAttribute('aria-expanded', false);
          }
        }
      }

      this.setTransitioning(true);

      const complete = () => {
        this.setTransitioning(false);

        this._element.classList.remove(CLASS_NAME_COLLAPSING);

        this._element.classList.add(CLASS_NAME_COLLAPSE);

        EventHandler.trigger(this._element, EVENT_HIDDEN$5);
      };

      this._element.style[dimension] = '';

      this._queueCallback(complete, this._element, true);
    }

    setTransitioning(isTransitioning) {
      this._isTransitioning = isTransitioning;
    } // Private


    _getConfig(config) {
      config = { ...Default$8,
        ...config
      };
      config.toggle = Boolean(config.toggle); // Coerce string values

      typeCheckConfig(NAME$9, config, DefaultType$8);
      return config;
    }

    _getDimension() {
      return this._element.classList.contains(WIDTH) ? WIDTH : HEIGHT;
    }

    _getParent() {
      let {
        parent
      } = this._config;
      parent = getElement(parent);
      const selector = `${SELECTOR_DATA_TOGGLE$4}[data-bs-parent="${parent}"]`;
      SelectorEngine.find(selector, parent).forEach(element => {
        const selected = getElementFromSelector(element);

        this._addAriaAndCollapsedClass(selected, [element]);
      });
      return parent;
    }

    _addAriaAndCollapsedClass(element, triggerArray) {
      if (!element || !triggerArray.length) {
        return;
      }

      const isOpen = element.classList.contains(CLASS_NAME_SHOW$8);
      triggerArray.forEach(elem => {
        if (isOpen) {
          elem.classList.remove(CLASS_NAME_COLLAPSED);
        } else {
          elem.classList.add(CLASS_NAME_COLLAPSED);
        }

        elem.setAttribute('aria-expanded', isOpen);
      });
    } // Static


    static collapseInterface(element, config) {
      let data = Collapse.getInstance(element);
      const _config = { ...Default$8,
        ...Manipulator.getDataAttributes(element),
        ...(typeof config === 'object' && config ? config : {})
      };

      if (!data && _config.toggle && typeof config === 'string' && /show|hide/.test(config)) {
        _config.toggle = false;
      }

      if (!data) {
        data = new Collapse(element, _config);
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      }
    }

    static jQueryInterface(config) {
      return this.each(function () {
        Collapse.collapseInterface(this, config);
      });
    }

  }

  EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function (event) {
    // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
    if (event.target.tagName === 'A' || event.delegateTarget && event.delegateTarget.tagName === 'A') {
      event.preventDefault();
    }

    const triggerData = Manipulator.getDataAttributes(this);
    const selector = getSelectorFromElement(this);
    const selectorElements = SelectorEngine.find(selector);
    selectorElements.forEach(element => {
      const data = Collapse.getInstance(element);
      let config;
      if (data) {
        // update parent attribute
        if (data._parent === null && typeof triggerData.parent === 'string') {
          data._config.parent = triggerData.parent;
          data._parent = data._getParent();
        }

        config = 'toggle';
      } else {
        config = triggerData;
      }

      Collapse.collapseInterface(element, config);
    });
  });
})))

class EndlessPagination extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.container = document.querySelector('.c-collection__grid');
    this.paginationWrapper = document.querySelector('.c-collection__pagination--wrapper');

    this.loadMoreBtn = this.querySelector('[data-load-more]');
    
    if(!this.loadMoreBtn) return;

    this.nextPageUrl = this.loadMoreBtn.dataset.nextUrl;
    this.loadMoreBtn.addEventListener('click', this.loadMore.bind(this));
  }

  loadMore() {
    this.loadMoreBtn.disabled = true;

    this.request = new XMLHttpRequest();
    this.request.onreadystatechange = function () {
      if (!this.request.responseXML) return;
      if (this.request.readyState !== 4 || this.request.status !== 200) return;
      const newContent = this.request.responseXML.querySelectorAll('.c-collection__grid')[0];
      
      const newPagination = this.request.responseXML.querySelectorAll('.c-collection__pagination--wrapper')[0];
      this.container.insertAdjacentHTML("beforeend", newContent.innerHTML);
      if (newPagination) {
        this.paginationWrapper.innerHTML = newPagination.innerHTML;
      }

      document.dispatchEvent(new CustomEvent('ajax:loaded'));
    }.bind(this);

    this.request.open("GET", this.nextPageUrl);
    this.request.responseType = "document";
    this.request.send();
  }

  loadInCache() {

  }
}

customElements.define('endless-pagination', EndlessPagination);

class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.mainContent = document.querySelector('.c-collection__main');
    this.changeOnSubmit = this.dataset.changeOnSubmit == 'true'? true : false;

    this.form = this.querySelector('form');
    const id = this.form.getAttribute('id');
    this.submitBtn = document.querySelector(`button[type="submit"][form="${id}"]`)

    this.drawer = document.querySelector(this.form.dataset?.drawer)

    if(!this.changeOnSubmit) {
      this.form.addEventListener('change', this.handleChange.bind(this));
    } else {
      console.log('Change on submit')
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    if(this.submitBtn) {
      this.submitBtn.addEventListener('click', this.onSubmitClick.bind(this));
    }
    
    this.id = this.form.getAttribute('id')
  }

  onSubmitClick(e) {
    e.preventDefault();

    if(this.drawer) this.drawer.classList.remove('is-open');
    const formData = new FormData(this.form);
    const url = new URL(window.location);

    url.searchParams.forEach((_, key) => {
      if(key !== 'sort_by') {
        url.searchParams.delete(key)
      }
    });
    formData.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    this.mainContent.classList.add('is-loading');

    this.request = new XMLHttpRequest();
    this.request.onreadystatechange = function () {
      if (!this.request.responseXML) return;
      if (this.request.readyState !== 4 || this.request.status !== 200) return;
      const newContent = this.request.responseXML.querySelectorAll('.c-collection__main')[0];

      const inputs = this.request.responseXML.querySelectorAll(`#${this.id} input.facets__input`);
      inputs.forEach(input => {
        const name = input.getAttribute('name');
        const value = input.value;
        
        const existingInput = this.form.querySelector(`[name="${name}"][value="${value}"]`);
        if(input.disabled) {
          existingInput.disabled = true;
        } else {
          existingInput.disabled = false;
        }
        if (existingInput) {
          const existingInputLabel = existingInput.closest('label');

          const countEl = existingInputLabel.querySelector('.value-count[data-value-count]');
          const countElHidden = existingInputLabel.querySelector('.visually-hidden[data-value-count]');

          if (countEl) {
            const countSource = input.closest('label').querySelector('.value-count[data-value-count]');
            countEl.innerHTML = countSource.innerHTML;
          }

          if(countElHidden) {
            const countSource = input.closest('label').querySelector('.visually-hidden[data-value-count]');
            countElHidden.innerHTML = countSource.innerHTML;
          }
        }
        // this.form.querySelector(`[name="${input.name}"]`).value = input.value;
      });

      history.pushState({ path: url.href }, '', url.href);
      
      this.mainContent.innerHTML = newContent.innerHTML;
      this.mainContent.classList.remove('is-loading');
      
      this.mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
      document.dispatchEvent(new CustomEvent('ajax:loaded'));
    }.bind(this);

    this.request.open("GET", url.toString());
    this.request.responseType = "document";
    this.request.send();
  }

  handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const url = new URL(window.location);

    url.searchParams.forEach((_, key) => url.searchParams.delete(key));
    formData.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
  }

  handleChange(e) {
    const formData = new FormData(this.form);
    const url = new URL(window.location);

    url.searchParams.forEach((_, key) => {
      if(key !== 'sort_by') {
        url.searchParams.delete(key)
      }
    });
    formData.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    this.mainContent.classList.add('is-loading');
    this.request = new XMLHttpRequest();
    this.request.onreadystatechange = function () {
      if (!this.request.responseXML) return;
      if (this.request.readyState !== 4 || this.request.status !== 200) return;
      const newContent = this.request.responseXML.querySelectorAll('.c-collection__main')[0];

      const inputs = this.request.responseXML.querySelectorAll(`#${this.id} input.facets__input`);
      inputs.forEach(input => {
        const name = input.getAttribute('name');
        const value = input.value;
        
        const existingInput = this.form.querySelector(`[name="${name}"][value="${value}"]`);
        if(input.disabled) {
          existingInput.disabled = true;
        } else {
          existingInput.disabled = false;
        }
        if (existingInput) {
          const existingInputLabel = existingInput.closest('label');

          const countEl = existingInputLabel.querySelector('.value-count[data-value-count]');
          const countElHidden = existingInputLabel.querySelector('.visually-hidden[data-value-count]');

          if (countEl) {
            const countSource = input.closest('label').querySelector('.value-count[data-value-count]');
            countEl.innerHTML = countSource.innerHTML;
          }

          if(countElHidden) {
            const countSource = input.closest('label').querySelector('.visually-hidden[data-value-count]');
            countElHidden.innerHTML = countSource.innerHTML;
          }
        }
        // this.form.querySelector(`[name="${input.name}"]`).value = input.value;
      });

      history.pushState({ path: url.href }, '', url.href);
      
      this.mainContent.innerHTML = newContent.innerHTML;
      this.mainContent.classList.remove('is-loading');

      this.mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
      document.dispatchEvent(new CustomEvent('ajax:loaded'));
    }.bind(this);

    this.request.open("GET", url.toString());
    this.request.responseType = "document";
    this.request.send();
  }
}

customElements.define('facet-filters-form', FacetFiltersForm);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.mainContent = document.querySelector('.c-collection__main');
    
    this.link = this.querySelector('a.active-facets__button');
    this.link.addEventListener('click', this.removeFacet.bind(this));
  }

  removeFacet(e) {
    e.preventDefault();
    const url = new URL(e.currentTarget.href);

    this.mainContent.classList.add('is-loading');

    this.request = new XMLHttpRequest();
    this.request.onreadystatechange = function () {
      if (!this.request.responseXML) return;
      if (this.request.readyState !== 4 || this.request.status !== 200) return;
      const newContent = this.request.responseXML.querySelectorAll('.c-collection__main')[0];

      const inputs = this.request.responseXML.querySelectorAll(`input.facets__input`);
      inputs.forEach(input => {
        const name = input.getAttribute('name');
        const value = input.value;
        
        const form = input.closest('form');
        const formId = form.getAttribute('id');

        const existingInput = document.querySelector(`#${formId} [name="${name}"][value="${value}"]`);
        if(existingInput) {
          if(input.disabled) {
            existingInput.disabled = true;
          } else {
            existingInput.disabled = false;
          }

          if(input.checked) {
            existingInput.checked = true;
          } else {
            existingInput.checked = false;
          }

          const existingInputLabel = existingInput.closest('label');

          const countEl = existingInputLabel.querySelector('.value-count[data-value-count]');
          const countElHidden = existingInputLabel.querySelector('.visually-hidden[data-value-count]');

          if (countEl) {
            const countSource = input.closest('label').querySelector('.value-count[data-value-count]');
            countEl.innerHTML = countSource.innerHTML;
          }

          if(countElHidden) {
            const countSource = input.closest('label').querySelector('.visually-hidden[data-value-count]');
            countElHidden.innerHTML = countSource.innerHTML;
          }
        }
      })

      history.pushState({ path: url.href }, '', url.href);
      
      this.mainContent.innerHTML = newContent.innerHTML;
      this.mainContent.classList.remove('is-loading');
      this.mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
      
      document.dispatchEvent(new CustomEvent('ajax:loaded'));
    }.bind(this);

    this.request.open("GET", url.toString());
    this.request.responseType = "document";
    this.request.send();
  }
}

customElements.define('facet-remove', FacetRemove);

document.addEventListener('DOMContentLoaded', () => {
  const drawerToggleButtons = document.querySelectorAll('[data-drawer-toggle]')
  drawerToggleButtons.forEach(item => {
    item.addEventListener('click', (e) => {
      if(window.innerWidth < 750) {
        const targetDrawer = item.getAttribute('data-drawer-toggle')
        const drawer = document.querySelector(targetDrawer)

        if(targetDrawer) {
          drawer.classList.toggle('is-open')
        }
      }
    })
  })
})

class CustomSelect extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.isOpen = false;
      this.select = this.querySelector('select');
      this.toggle = this.querySelector('[data-toggle]');
      this.options = this.querySelectorAll('[data-option]');
      this.mainContent = document.querySelector('.c-collection__main');

      this.container = this.querySelector('[data-container]');

      this.toggle.addEventListener('click', this.toggleDropdown.bind(this));
      this.options.forEach((option) => {
        option.addEventListener('click', this.selectOption.bind(this));
      })

      this.select.addEventListener('change', this.applyFilter.bind(this));
    }

    toggleDropdown() {
      if(!this.isOpen) {
        this.container.classList.add('is-open');
        this.isOpen = true;
        this.setAttribute('open', '')
      } else {
        this.container.classList.remove('is-open');
        this.isOpen = false;
        this.removeAttribute('open')
      }
    }

    selectOption(e) {
      e.preventDefault();
      this.container.classList.remove('is-open');
      this.isOpen = false;
      this.toggle.setAttribute('open', '');
      this.removeAttribute('open', '');

      this.querySelector('[data-selected]').removeAttribute('data-selected');
      e.currentTarget.setAttribute('data-selected', 'selected');

      this.select.value = e.currentTarget.getAttribute('data-value');
      this.select.dispatchEvent(new Event('change'));
    }

    applyFilter(e) {
      e.preventDefault();

      const url = new URL(window.location);
      url.searchParams.set(this.select.name, this.select.value);

      this.mainContent.classList.add('is-loading');

      this.request = new XMLHttpRequest();
      this.request.onreadystatechange = function () {
        if (!this.request.responseXML) return;
        if (this.request.readyState !== 4 || this.request.status !== 200) return;
        const newContent = this.request.responseXML.querySelectorAll('.c-collection__main')[0];
        
        history.pushState({ path: url.href }, '', url.href);
        
        this.mainContent.innerHTML = newContent.innerHTML;
        this.mainContent.classList.remove('is-loading');
        this.mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
        document.dispatchEvent(new CustomEvent('ajax:loaded'));
      }.bind(this);

      this.request.open("GET", url.toString());
      this.request.responseType = "document";
      this.request.send();
    }
  }

  customElements.define("custom-select", CustomSelect);

  class SliderProductCard extends HTMLElement {
  constructor() {
    super();
    this.swiper = null;
    this.sliderEl = null;
    this.isInitialized = false;
    this.videoObserver = null;
    this.intersectionObserver = null;
  }

  connectedCallback() {
    // Only initialize when element enters viewport
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !this.isInitialized) {
        const tryInitializeSwiper = () => {
          if (window.Swiper) {
            clearInterval(this.swiperCheckInterval);
            this.initializeSwiper();
            this.isInitialized = true;
            this.intersectionObserver.disconnect();
          }
        }
        if (window.Swiper) {
          tryInitializeSwiper();
        } else {
          // Poll for Swiper every 100ms until it's available
          this.swiperCheckInterval = setInterval(tryInitializeSwiper, 100);
        }
      }
    }, {
      root: null,
      rootMargin: '100px', // Load slightly before it comes into view
      threshold: 0.1
    });
    
    this.intersectionObserver.observe(this);
  }

  initializeSwiper() {
    this.sliderEl = this.querySelector('.swiper');
    this.paginationEl = this.querySelector('.product-card-image-carousel__dots');
    this.navigationNextEl = this.querySelector('.product-card-button--next');
    this.navigationPrevEl = this.querySelector('.product-card-button--prev');
    if (!this.sliderEl) {
      console.warn('Swiper element not found in SliderProductCard');
      return;
    }

    // Set up video observer for better performance
    this.setupVideoObserver();

    try {
      this.swiper = new Swiper(this.sliderEl, {
        slidesPerView: 1,
        spaceBetween: 2,
        centeredSlides: false,
        roundLengths: false,
        navigation: {
          nextEl: this.navigationNextEl,
          prevEl: this.navigationPrevEl,
        },
        pagination: {
          el: this.paginationEl,
          type: 'bullets',
        },
        loop: true,
        breakpoints: {
          768: {
            navigation: {
              nextEl: this.navigationNextEl,
              prevEl: this.navigationPrevEl,
            }
          }
        },
        lazy: {
          loadPrevNext: true,
          loadPrevNextAmount: 1,
          loadOnTransitionStart: true,
          elementClass: 'swiper-lazy',
          loadingClass: 'swiper-lazy-loading',
          loadedClass: 'swiper-lazy-loaded',
          preloaderClass: 'swiper-lazy-preloader',
        },
        // Performance optimizations
        observer: true,
        observeParents: true,
        updateOnWindowResize: true,
        watchSlidesProgress: true,
        a11y: {
          enabled: true,
          prevSlideMessage: 'Previous slide',
          nextSlideMessage: 'Next slide',
        },
        on: {
          init: (swiper) => {
            // Load initial slide immediately
            if (swiper && swiper.slides && swiper.activeIndex !== undefined) {
              const activeSlide = swiper.slides[swiper.activeIndex];
              if (activeSlide) {
                const lazyElements = activeSlide.querySelectorAll('.swiper-lazy');
                lazyElements.forEach(el => {
                  if (el.dataset.src) {
                    el.src = el.dataset.src;
                    el.classList.add('swiper-lazy-loaded');
                  } else if (el.dataset.background) {
                    el.style.backgroundImage = `url(${el.dataset.background})`;
                    el.classList.add('swiper-lazy-loaded');
                  }
                });
              }
            }
          },
          lazyImageReady: (swiper, slideEl, imageEl) => {
            if (!swiper || typeof swiper.activeIndex !== 'number' || !swiper.slides) {
              return;
            }
            
            if (swiper.activeIndex === swiper.slides.indexOf(slideEl)) {
              imageEl.classList.add('swiper-lazy-loaded');
            }
          },
          slideChange: (swiper) => {
            this.handleMediaOnSlideChange(swiper);

          },
          destroy: () => {
            this.cleanup();
          }
        },
        preloadImages: false,
        speed: 500,
        resistance: true,
        resistanceRatio: 0.85,
      });

      // Add event listeners for touch devices to prevent unwanted zooming/scrolling
      if ('ontouchstart' in window) {
        this.sliderEl.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      }
    } catch (error) {
      console.error('Error initializing Swiper:', error);
      this.cleanup(); // Clean up any partial initialization
    }
  }

  setupVideoObserver() {
    // Create IntersectionObserver for videos to only play when visible
    this.videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.paused && video.dataset.autoplay === 'true') {
            video.play().catch(e => {
              console.warn('Video autoplay prevented:', e);
              // Add play button overlay if autoplay is blocked
              this.addPlayButton(video);
            });
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
        }
      });
    }, { threshold: 0.5 });

    // Observe all videos
    const videos = this.querySelectorAll('video');
    videos.forEach(video => {
      this.videoObserver.observe(video);
      
      // Mark videos that should autoplay
      if (video.hasAttribute('autoplay')) {
        video.dataset.autoplay = 'true';
        // Remove autoplay attribute to prevent unwanted autoplay
        video.removeAttribute('autoplay');
      }
    });
  }

  addPlayButton(video) {
    // Check if play button already exists
    if (video.parentNode.querySelector('.video-play-button')) return;
    
    const playButton = document.createElement('button');
    playButton.className = 'video-play-button';
    playButton.setAttribute('aria-label', 'Play video');
    playButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
    
    // Position the button
    playButton.style.position = 'absolute';
    playButton.style.top = '50%';
    playButton.style.left = '50%';
    playButton.style.transform = 'translate(-50%, -50%)';
    playButton.style.background = 'rgba(0,0,0,0.5)';
    playButton.style.color = 'white';
    playButton.style.border = 'none';
    playButton.style.borderRadius = '50%';
    playButton.style.padding = '12px';
    playButton.style.cursor = 'pointer';
    
    // Add click event
    playButton.addEventListener('click', () => {
      video.play().catch(e => console.warn('Video play error:', e));
      playButton.remove();
    });
    
    // Add the button
    video.parentNode.style.position = 'relative';
    video.parentNode.appendChild(playButton);
  }

  handleMediaOnSlideChange(swiper) {
    if (!swiper || !swiper.slides || typeof swiper.activeIndex !== 'number') {
      console.warn('Invalid swiper state in handleMediaOnSlideChange');
      return;
    }
    
    try {
      const activeIndex = swiper.activeIndex;
      const activeSlide = swiper.slides[activeIndex];
      if (!activeSlide) {
        console.warn('Active slide not found');
        return;
      }
      
      // Handle native videos
      const activeVideo = activeSlide.querySelector('video');
      if(activeVideo) {
        const wrapperEl = activeSlide.querySelector('.swiper-lazy');
        if(wrapperEl.classList.contains('swiper-lazy-loaded')) {
          activeVideo.play().catch(e => {
            this.addPlayButton(activeVideo);
          });
        }
      }

      // Handle external videos with postMessage safely
      this.handleExternalVideo(activeSlide, true);

      // Handle inactive slides
      swiper.slides.forEach((slide, index) => {
        if (index !== activeIndex) {
          // Pause native videos
          const inactiveVideo = slide.querySelector('video');
          if (inactiveVideo) {
            inactiveVideo.pause();
          }
          
          // Pause external videos
          this.handleExternalVideo(slide, false);
        }
      });
    } catch (error) {
      console.error('Error handling media on slide change:', error);
    }
  }

  handleExternalVideo(slide, shouldPlay) {
    const iframe = slide.querySelector('.external-video-container iframe');
    if (!iframe || !iframe.contentWindow) return;
    
    try {
      if (iframe.src.includes('youtube')) {
        const command = shouldPlay ? 'playVideo' : 'pauseVideo';
        iframe.contentWindow.postMessage(`{"event":"command","func":"${command}","args":""}`, '*');
      } else if (iframe.src.includes('vimeo')) {
        const method = shouldPlay ? 'play' : 'pause';
        iframe.contentWindow.postMessage(`{"method":"${method}"}`, '*');
      }
    } catch (e) {
      console.warn('External video interaction error:', e);
    }
  }
  
  handleTouchStart(event) {
    // Prevent unwanted zooming/scrolling on mobile
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }

  disconnectedCallback() {
    this.cleanup();
  }
  
  cleanup() {
    // Clean up all observers and listeners
    if (this.videoObserver) {
      this.videoObserver.disconnect();
      this.videoObserver = null;
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
    
    if (this.sliderEl) {
      if ('ontouchstart' in window) {
        this.sliderEl.removeEventListener('touchstart', this.handleTouchStart);
      }
    }
    
    this.isInitialized = false;
  }
}

// Register the custom element
customElements.define("slider-product-card", SliderProductCard);
  