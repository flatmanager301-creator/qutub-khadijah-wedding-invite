(() => {
  'use strict';

  const body = document.body;
  const opening = document.getElementById('opening');
  const openButton = document.getElementById('openInvitation');
  const site = document.getElementById('site');
  const music = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const petalLayer = document.getElementById('petalLayer');
  const toast = document.getElementById('toast');
  const rsvpModal = document.getElementById('rsvpModal');
  const rsvpForm = document.getElementById('rsvpForm');
  const openRsvpButton = document.getElementById('openRsvp');
  const rsvpNameInput = document.getElementById('rsvpName');
  const guestCount = document.getElementById('guestCount');

  let invitationOpened = false;
  let lastFocusedElement = null;

  const params = new URLSearchParams(window.location.search);
  const rawGuest = params.get('g') || params.get('guest') || params.get('name') || 'Guest';
  const guestName = rawGuest
    .replace(/[+_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'Guest';

  document.getElementById('guestName').textContent = guestName;
  rsvpNameInput.value = guestName === 'Guest' ? '' : guestName;
  document.title = guestName === 'Guest'
    ? 'Khadijah & Qutubuddin — Darees & Paranwanu'
    : `${guestName} — Khadijah & Qutubuddin`;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  const buildPetals = () => {
    if (!petalLayer || petalLayer.childElementCount || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const fragment = document.createDocumentFragment();
    const count = window.innerWidth < 640 ? 10 : 15;
    for (let i = 0; i < count; i += 1) {
      const petal = document.createElement('i');
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.setProperty('--fall', `${10 + Math.random() * 10}s`);
      petal.style.setProperty('--delay', `${-Math.random() * 18}s`);
      petal.style.width = `${7 + Math.random() * 7}px`;
      petal.style.height = `${11 + Math.random() * 11}px`;
      petal.style.opacity = `${.25 + Math.random() * .34}`;
      fragment.appendChild(petal);
    }
    petalLayer.appendChild(fragment);
  };

  const setMusicButtonState = (isPlaying) => {
    musicToggle.classList.toggle('is-paused', !isPlaying);
    musicToggle.setAttribute('aria-pressed', String(isPlaying));
    musicToggle.setAttribute('aria-label', isPlaying ? 'Pause music' : 'Play music');
  };

  const startMusic = async () => {
    try {
      music.volume = 0.54;
      await music.play();
      setMusicButtonState(true);
    } catch (error) {
      setMusicButtonState(false);
    }
  };

  const finishOpening = () => {
    site.classList.add('is-visible');
    site.setAttribute('aria-hidden', 'false');
    musicToggle.classList.add('is-visible');
    body.classList.remove('is-locked');
    buildPetals();
    document.querySelector('.hero .reveal')?.classList.add('is-in-view');
  };

  const openInvitation = (instant = false) => {
    if (invitationOpened) return;
    invitationOpened = true;

    if (instant) {
      opening.classList.add('is-gone');
      finishOpening();
      return;
    }

    // Keep play() in the direct tap/click gesture for iOS Safari.
    startMusic();
    site.classList.add('is-visible');
    site.setAttribute('aria-hidden', 'false');
    opening.classList.add('is-opening');

    window.setTimeout(() => {
      opening.classList.add('is-gone');
      finishOpening();
    }, 1320);
  };

  // The entire screen is a real button. Click works on iOS/Android; pointerup is a fallback.
  openButton.addEventListener('click', () => openInvitation(false));
  openButton.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'touch') openInvitation(false);
  }, { passive: true });

  if (params.get('preview') === '1') {
    openInvitation(true);
  }

  musicToggle.addEventListener('click', async () => {
    if (music.paused) {
      try {
        music.volume = 0.54;
        await music.play();
        setMusicButtonState(true);
      } catch (error) {
        showToast('Tap again to start the music');
      }
    } else {
      music.pause();
      setMusicButtonState(false);
    }
  });

  // Countdown: 14 January 2027, 1:00 PM India time.
  const targetTime = new Date('2027-01-14T13:00:00+05:30').getTime();
  const countdownElements = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
  };

  const updateCountdown = () => {
    const remaining = Math.max(0, targetTime - Date.now());
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    countdownElements.days.textContent = String(days).padStart(3, '0');
    countdownElements.hours.textContent = String(hours).padStart(2, '0');
    countdownElements.minutes.textContent = String(minutes).padStart(2, '0');
    countdownElements.seconds.textContent = String(seconds).padStart(2, '0');
  };
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  // Scroll reveals with a no-IntersectionObserver fallback.
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-in-view'));
  }

  const openModal = () => {
    lastFocusedElement = document.activeElement;
    rsvpModal.classList.add('is-open');
    rsvpModal.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');
    window.setTimeout(() => rsvpNameInput.focus(), 180);
  };

  const closeModal = () => {
    rsvpModal.classList.remove('is-open');
    rsvpModal.setAttribute('aria-hidden', 'true');
    body.classList.remove('modal-open');
    lastFocusedElement?.focus?.();
  };

  openRsvpButton.addEventListener('click', openModal);
  rsvpModal.querySelectorAll('[data-close-modal]').forEach((element) => element.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && rsvpModal.classList.contains('is-open')) closeModal();
  });

  rsvpForm.addEventListener('change', (event) => {
    if (event.target.name !== 'attendance') return;
    const attending = event.target.value === 'Accepts with pleasure';
    guestCount.disabled = !attending;
    if (!attending) guestCount.value = '1';
  });

  rsvpForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!rsvpForm.reportValidity()) return;

    const formData = new FormData(rsvpForm);
    const name = String(formData.get('name') || '').trim();
    const attendance = String(formData.get('attendance') || '');
    const guests = guestCount.disabled ? 'Not applicable' : String(formData.get('guests') || '1');
    const message = String(formData.get('message') || '').trim();

    const lines = [
      'RSVP — Darees & Paranwanu',
      'Khadijah & Qutubuddin · 14 January 2027',
      '',
      `Name: ${name}`,
      `Response: ${attendance}`,
      `Number of guests: ${guests}`
    ];
    if (message) lines.push(`Message: ${message}`);

    const whatsappUrl = `https://wa.me/918097335253?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    showToast('Your RSVP message is ready in WhatsApp');
    closeModal();
  });
})();
