(() => {
  const opening = document.getElementById('opening');
  const openButton = document.getElementById('openInvitation');
  const site = document.getElementById('site');
  const music = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const toast = document.getElementById('toast');

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  // Personalized guest name: ?g=Guest-Name, ?guest=Guest%20Name, or ?name=Guest
  const params = new URLSearchParams(window.location.search);
  const rawGuest = params.get('g') || params.get('guest') || params.get('name') || 'Guest';
  const cleanGuest = rawGuest
    .replace(/[+_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'Guest';
  document.getElementById('guestName').textContent = cleanGuest;
  document.title = cleanGuest === 'Guest'
    ? 'Khadijah & Qutubuddin — Darees & Paranwanu'
    : `${cleanGuest} — Khadijah & Qutubuddin`;

  const buildPetals = (container, count, openingMode = false) => {
    if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i += 1) {
      const petal = document.createElement('i');
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.setProperty('--fall', `${openingMode ? 5 + Math.random() * 4 : 10 + Math.random() * 9}s`);
      petal.style.setProperty('--delay', `${-Math.random() * 16}s`);
      petal.style.setProperty('--rot', `${Math.random() * 360}deg`);
      petal.style.setProperty('--blur', `${Math.random() > .72 ? .6 : 0}px`);
      petal.style.width = `${7 + Math.random() * 9}px`;
      petal.style.height = `${11 + Math.random() * 13}px`;
      petal.style.opacity = `${.32 + Math.random() * .48}`;
      petal.style.animationName = openingMode ? 'openingFall' : 'fall';
      fragment.appendChild(petal);
    }
    container.appendChild(fragment);
  };

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fall {
      0% { transform: translate3d(0,-10vh,0) rotate(0deg); }
      50% { transform: translate3d(28px,52vh,0) rotate(190deg); }
      100% { transform: translate3d(-22px,112vh,0) rotate(390deg); }
    }
    @keyframes openingFall {
      0% { transform: translate3d(0,-5vh,0) rotate(0deg) scale(.8); }
      100% { transform: translate3d(20px,110vh,0) rotate(420deg) scale(1.1); }
    }
  `;
  document.head.appendChild(style);
  buildPetals(document.getElementById('openingPetals'), 16, true);
  buildPetals(document.getElementById('petalLayer'), 11, false);

  const playMusic = async () => {
    try {
      music.volume = 0;
      await music.play();
      musicToggle.classList.remove('is-paused');
      musicToggle.setAttribute('aria-pressed', 'true');
      musicToggle.setAttribute('aria-label', 'Pause music');
      let volume = 0;
      const fade = window.setInterval(() => {
        volume = Math.min(volume + .04, .58);
        music.volume = volume;
        if (volume >= .58) window.clearInterval(fade);
      }, 90);
    } catch {
      musicToggle.classList.add('is-paused');
      musicToggle.setAttribute('aria-pressed', 'false');
      musicToggle.setAttribute('aria-label', 'Play music');
    }
  };

  const openInvitation = () => {
    if (opening.classList.contains('is-opening')) return;
    opening.classList.add('is-opening');
    playMusic();
    window.setTimeout(() => {
      opening.classList.add('is-open');
      site.classList.add('is-visible');
      site.setAttribute('aria-hidden', 'false');
      document.body.classList.remove('is-locked');
      musicToggle.classList.add('is-visible');
      document.querySelector('.hero .reveal')?.classList.add('is-in-view');
    }, 1550);
  };
  openButton.addEventListener('click', openInvitation);

  musicToggle.addEventListener('click', async () => {
    if (music.paused) {
      try {
        await music.play();
        musicToggle.classList.remove('is-paused');
        musicToggle.setAttribute('aria-pressed', 'true');
        musicToggle.setAttribute('aria-label', 'Pause music');
      } catch {
        showToast('Tap once more to start the music');
      }
    } else {
      music.pause();
      musicToggle.classList.add('is-paused');
      musicToggle.setAttribute('aria-pressed', 'false');
      musicToggle.setAttribute('aria-label', 'Play music');
    }
  });

  const target = new Date('2027-01-14T13:00:00+05:30').getTime();
  const countdownEls = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
  };
  const updateCountdown = () => {
    const difference = Math.max(0, target - Date.now());
    const days = Math.floor(difference / 86400000);
    const hours = Math.floor((difference % 86400000) / 3600000);
    const minutes = Math.floor((difference % 3600000) / 60000);
    const seconds = Math.floor((difference % 60000) / 1000);
    countdownEls.days.textContent = String(days).padStart(3, '0');
    countdownEls.hours.textContent = String(hours).padStart(2, '0');
    countdownEls.minutes.textContent = String(minutes).padStart(2, '0');
    countdownEls.seconds.textContent = String(seconds).padStart(2, '0');
  };
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .14, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Calendar file. Uses a one-hour placeholder duration; recipients can adjust it after adding.
  document.getElementById('addCalendar').addEventListener('click', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Khadijah & Qutubuddin//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:khadijah-qutubuddin-20270114@invitation',
      'DTSTAMP:20260719T000000Z',
      'DTSTART;TZID=Asia/Kolkata:20270114T130000',
      'DTEND;TZID=Asia/Kolkata:20270114T140000',
      'SUMMARY:Darees & Paranwanu — Khadijah & Qutubuddin',
      'DESCRIPTION:Darees & Paranwanu of Khadijah and Qutubuddin.',
      'LOCATION:Zainee Baug\\, Lonavala',
      'URL:https://maps.app.goo.gl/Fog3jcmgD3iV9pnt9',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Darees & Paranwanu tomorrow',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Khadijah-Qutubuddin-Darees-Paranwanu.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Calendar invitation prepared');
  });
})();
