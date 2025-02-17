class CountdownTimer extends HTMLElement {
  constructor() {
    super()

    // Initial state
    this.isRunning = false;
    this.targetDate = null;
    this.timeLeft = {
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  connectedCallback() {
    this.targetDate = new Date(this.getAttribute('expires-at'));
    this.expirationBehavior = this.getAttribute('expiration-behavior');

    this.start()
  }

  start() {
    if(!this.isRunning) {
      if(!this.interval) {
        if (isNaN(this.targetDate.getTime())) return;
      }

      this.interval = setInterval(() => {
        const now = new Date();
        const timeDiff = this.targetDate - now;

        if (timeDiff <= 0) {
          clearInterval(this.interval);
          this.isRunning = false;
          this.dispatchEvent(new CustomEvent('timerEnd'));
          return;
        }

        // Calculate remaining time
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        this.timeLeft = { hours, minutes, seconds };
        this.updateDisplay();
        
        this.dispatchEvent(new CustomEvent('timerTick', { 
          detail: { ...this.timeLeft }
        }));
      }, 1000);
      this.isRunning = true;
    }
  }

  updateDisplay() {
    this.querySelector('.hours').textContent = this.timeLeft.hours >= 1000 ? 99 : this.timeLeft.hours.toString().padStart(2, '0');
    this.querySelector('.minutes').textContent = this.timeLeft.minutes.toString().padStart(2, '0');
    this.querySelector('.seconds').textContent = this.timeLeft.seconds.toString().padStart(2, '0');
  }
}
customElements.define('countdown-timer', CountdownTimer);