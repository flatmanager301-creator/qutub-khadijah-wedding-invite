(() => {
  "use strict";

  const RSVP_PHONE = "971582784172";
  const RSVP_DEADLINE = new Date("2027-01-13T23:59:59+05:30");
  const WEDDING_START = new Date("2027-01-17T09:00:00+05:30");
  const defaultGuest = { name: "Guest", seats: 6, code: "GENERAL", events: "both" };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function normalizeEvents(value) {
    return ["both", "day1", "day2"].includes(value) ? value : "both";
  }

  function decodeGuestPayload(value) {
    if (!value) return null;
    try {
      const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
      const parsed = JSON.parse(new TextDecoder().decode(bytes));
      if (!parsed || typeof parsed.name !== "string") return null;
      return {
        name: parsed.name.trim().slice(0, 100) || "Guest",
        seats: Math.min(Math.max(Number(parsed.seats) || 1, 1), 30),
        code: String(parsed.code || "GUEST").replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "GUEST",
        events: normalizeEvents(String(parsed.events || "both"))
      };
    } catch (error) {
      console.warn("Could not read the personalized guest link.", error);
      return null;
    }
  }

  function readGuest() {
    const params = new URLSearchParams(location.search);
    const encoded = decodeGuestPayload(params.get("g"));
    if (encoded) return encoded;

    const name = params.get("guest") || params.get("to");
    if (name) {
      return {
        name: name.trim().slice(0, 100) || "Guest",
        seats: Math.min(Math.max(Number(params.get("seats")) || 1, 1), 30),
        code: (params.get("code") || "GUEST").replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "GUEST",
        events: normalizeEvents(params.get("events") || "both")
      };
    }
    return { ...defaultGuest };
  }

  const guest = readGuest();

  function invitationScopeLabel() {
    if (guest.events === "day1") return "17 January celebration";
    if (guest.events === "day2") return "18 January celebration";
    return "both wedding celebrations";
  }

  function setEventSelectionOptions() {
    const select = $("#eventSelection");
    const choices = guest.events === "day1"
      ? [["17 January only", "17 January only"]]
      : guest.events === "day2"
        ? [["18 January only", "18 January only"]]
        : [
            ["Both days", "Both days"],
            ["17 January only", "17 January only"],
            ["18 January only", "18 January only"]
          ];

    select.replaceChildren(...choices.map(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      return option;
    }));
  }

  function applyEventAccess() {
    const day1 = $('[data-event-card="day1"]');
    const day2 = $('[data-event-card="day2"]');
    const timeline = $(".timeline");

    if (guest.events === "day1") day2?.classList.add("is-hidden");
    if (guest.events === "day2") day1?.classList.add("is-hidden");
    if (guest.events !== "both") timeline?.classList.add("single-event");
    setEventSelectionOptions();
  }

  function setPersonalization() {
    const isGeneral = guest.name === "Guest";
    const displayName = isGeneral ? "Dear Guest" : `Dear ${guest.name}`;
    const seatText = guest.seats === 1
      ? "Reserved especially for you"
      : `Reserved for up to ${guest.seats} guests`;

    $("#guestGreeting").textContent = displayName;
    $("#introGuest").textContent = isGeneral
      ? "A special invitation awaits you"
      : `An invitation for ${guest.name}`;
    $("#rsvpName").value = isGeneral ? "" : guest.name;
    const scratchGuest = $("#scratchGuest");
    const scratchSeats = $("#scratchSeats");
    if (scratchGuest) scratchGuest.textContent = displayName;
    if (scratchSeats) {
      scratchSeats.textContent = isGeneral
        ? "We would be honoured by your presence at both wedding celebrations."
        : `${seatText}. You are invited to ${invitationScopeLabel()}.`;
    }

    if (!isGeneral) {
      $("#introSeats").hidden = false;
      $("#introSeats").textContent = `${seatText} · ${invitationScopeLabel()}`;
      $("#heroSeatNote").textContent = `${seatText} · ${invitationScopeLabel()}`;
      $("#seatNote").hidden = false;
      $("#seatNote").textContent = guest.seats === 1
        ? "This invitation has been lovingly reserved for you."
        : `This invitation has been lovingly reserved for up to ${guest.seats} guests.`;
      $("#rsvpGuestSummary").hidden = false;
      $("#rsvpGuestSummary").textContent = `${guest.name} · ${seatText} · ${invitationScopeLabel()}`;
    }

    const select = $("#guestCount");
    select.innerHTML = "";
    const maximumSeats = isGeneral ? 10 : guest.seats;
    for (let count = 1; count <= maximumSeats; count += 1) {
      const option = document.createElement("option");
      option.value = String(count);
      option.textContent = `${count} ${count === 1 ? "guest" : "guests"}`;
      select.append(option);
    }

    if (!isGeneral) {
      document.title = `${guest.name} | Qutubuddin & Khadijah`;
    }
  }

  function createPetals(amount = 18) {
    const container = $("#petals");
    const template = $("#particleTemplate");
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < amount; index += 1) {
      const particle = template.content.firstElementChild.cloneNode(true);
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.setProperty("--duration", `${3.6 + Math.random() * 2.4}s`);
      particle.style.setProperty("--drift", `${-90 + Math.random() * 180}px`);
      particle.style.animationDelay = `${Math.random() * .55}s`;
      particle.style.transform = `rotate(${Math.random() * 180}deg)`;
      fragment.append(particle);
      setTimeout(() => particle.remove(), 7000);
    }
    container.append(fragment);
  }

  function showInvitation(instant = false) {
    const intro = $("#intro");
    $("#invitation").classList.add("visible");
    $("#invitation").setAttribute("aria-hidden", "false");
    document.body.classList.remove("intro-locked");
    document.body.classList.add("invite-open");

    const finishOpening = () => {
      intro.classList.add("opened");
      setTimeout(() => 3074(".hero .reveal").forEach((element, index) => {
        setTimeout(() => element.classList.add("in-view"), index * 85);
      }), instant ? 10 : 80);
    };

    if (instant) finishOpening();
    else setTimeout(finishOpening, 340);
  }

  function openInvitation() {
    const envelope = $("#openInvite");
    const intro = $("#intro");
    if (envelope.classList.contains("is-opening")) return;
    requestAnimationFrame(() => {
      envelope.classList.add("is-opening");
      intro.classList.add("is-transitioning");
      createPetals(18);
    });
    try { sessionStorage.setItem("qk-invite-opened", "1"); } catch (_) { /* File previews may block storage. */ }
    setTimeout(() => showInvitation(false), 1320);
  }

  function initIntro() {
    $("#openInvite").addEventListener("click", openInvitation);
    $("#openText").addEventListener("click", openInvitation);

    const parameters = new URLSearchParams(location.search);
    if (parameters.get("preview") === "1") {
      showInvitation(true);
      return;
    }

    let previouslyOpened = false;
    try { previouslyOpened = sessionStorage.getItem("qk-invite-opened") === "1"; } catch (_) { /* Ignore unavailable storage. */ }
    if (previouslyOpened && location.hash) showInvitation(true);
  }

  function pad(value, length = 2) {
    return String(Math.max(0, value)).padStart(length, "0");
  }

  function updateCountdown() {
    const distance = WEDDING_START.getTime() - Date.now();
    if (distance <= 0) {
      $("#countdown").innerHTML = "<p class='countdown-live'>The celebration has begun ✦</p>";
      return;
    }
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    $("#days").textContent = pad(days, 3);
    $("#hours").textContent = pad(hours);
    $("#minutes").textContent = pad(minutes);
    $("#seconds").textContent = pad(seconds);
  }

  function initRevealAnimations() {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach(element => element.classList.add("in-view"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px" });
    $$(".reveal").forEach(element => observer.observe(element));
  }

  function initScrollProgress() {
    const progress = $("#scrollProgress");
    let ticking = false;
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      progress.style.width = `${ratio * 100}%`;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function initScratchReveal() {
    const canvas = $("#scratchCanvas");
    const heart = $("#scratchHeart");
    const hint = $("#scratchHint");
    if (!canvas || !heart) return;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    let drawing = false;
    let revealed = false;
    let moveCounter = 0;
    let initialOpaqueSamples = 1;

    function paintCover() {
      if (revealed) return;
      const rect = heart.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);
      context.globalCompositeOperation = "source-over";
      context.save();
      context.beginPath();
      context.moveTo(rect.width * .5, rect.height * .96);
      context.bezierCurveTo(rect.width * .43, rect.height * .88, rect.width * .05, rect.height * .64, rect.width * .035, rect.height * .31);
      context.bezierCurveTo(rect.width * .02, rect.height * .08, rect.width * .30, rect.height * -.01, rect.width * .50, rect.height * .25);
      context.bezierCurveTo(rect.width * .70, rect.height * -.01, rect.width * .98, rect.height * .08, rect.width * .965, rect.height * .31);
      context.bezierCurveTo(rect.width * .95, rect.height * .64, rect.width * .57, rect.height * .88, rect.width * .5, rect.height * .96);
      context.closePath();
      context.clip();

      const gradient = context.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, "#f3dddf");
      gradient.addColorStop(.5, "#dcaeb5");
      gradient.addColorStop(1, "#c98d9a");
      context.fillStyle = gradient;
      context.fillRect(0, 0, rect.width, rect.height);

      context.globalAlpha = .24;
      context.strokeStyle = "#ffffff";
      context.lineWidth = 1;
      for (let x = -rect.height; x < rect.width + rect.height; x += 22) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x + rect.height, rect.height);
        context.stroke();
      }
      context.globalAlpha = 1;

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      context.fillStyle = "rgba(112, 42, 62, .86)";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `500 ${Math.max(18, rect.width * .055)}px Cormorant Garamond, Georgia, serif`;
      context.fillText("Scratch to Reveal", cx, cy - 8);
      context.font = `600 ${Math.max(9, rect.width * .022)}px Manrope, sans-serif`;
      context.letterSpacing = "2px";
      context.fillStyle = "rgba(112, 42, 62, .62)";
      context.fillText("A PERSONAL NOTE AWAITS", cx, cy + 25);
      context.letterSpacing = "0px";
      context.restore();

      const initialPixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      initialOpaqueSamples = 0;
      const initialStride = 4 * 28;
      for (let index = 3; index < initialPixels.length; index += initialStride) {
        if (initialPixels[index] > 40) initialOpaqueSamples += 1;
      }
      initialOpaqueSamples = Math.max(1, initialOpaqueSamples);
    }

    function eraseAt(event) {
      if (!drawing || revealed) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const radius = Math.max(20, rect.width * .065);
      context.globalCompositeOperation = "destination-out";
      const fade = context.createRadialGradient(x, y, 0, x, y, radius);
      fade.addColorStop(0, "rgba(0,0,0,1)");
      fade.addColorStop(.72, "rgba(0,0,0,.92)");
      fade.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = fade;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();

      moveCounter += 1;
      if (moveCounter % 8 === 0) checkProgress();
    }

    function checkProgress() {
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let opaque = 0;
      const stride = 4 * 28;
      for (let index = 3; index < pixels.length; index += stride) {
        if (pixels[index] > 40) opaque += 1;
      }
      const scratchedRatio = 1 - (opaque / initialOpaqueSamples);
      if (scratchedRatio > .42 || moveCounter > 135) revealAll();
    }

    function revealAll() {
      if (revealed) return;
      revealed = true;
      drawing = false;
      heart.classList.add("is-revealed");
      if (hint) hint.textContent = "Revealed with love ✦";
      createPetals(20);
    }

    canvas.addEventListener("pointerdown", event => {
      drawing = true;
      canvas.setPointerCapture?.(event.pointerId);
      eraseAt(event);
    });
    canvas.addEventListener("pointermove", eraseAt);
    ["pointerup", "pointercancel", "pointerleave"].forEach(type => {
      canvas.addEventListener(type, () => {
        drawing = false;
        if (!revealed) checkProgress();
      });
    });
    canvas.addEventListener("dblclick", revealAll);

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(paintCover, 160);
    }, { passive: true });
    paintCover();
  }

  const calendarEvents = {
    day1: {
      filename: "Qutubuddin-Khadijah-17-Jan-2027.ics",
      title: "Mandvo Katho, Manak Thamb & Mehendi Mama Musalo",
      start: "20270117T033000Z",
      end: "20270117T063000Z",
      location: "Taheri Manzil, Tayyeb Pura, Bohra Bakhal, Mandsaur",
      description: "Wedding celebration of Qutubuddin and Khadijah. Dress code: Blue. Directions: https://maps.app.goo.gl/vPzPRF8h2ZnW9pin7?g_st=ac"
    },
    day2: {
      filename: "Qutubuddin-Khadijah-Walima-18-Jan-2027.ics",
      title: "Khushi Darees & Walima Lunch",
      start: "20270118T070000Z",
      end: "20270118T100000Z",
      location: "Mawaid al Burhani, Mandsaur",
      description: "Walima celebration of Qutubuddin and Khadijah. Dress code: White. Directions: https://maps.app.goo.gl/mNKN7sLj6kLqyzX27"
    }
  };

  function escapeIcs(text) {
    return String(text).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  }

  function downloadCalendar(eventKey) {
    const event = calendarEvents[eventKey];
    if (!event) return;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Qutubuddin and Khadijah Wedding//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${eventKey}-qk-wedding-2027@invitation`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
      `DTSTART:${event.start}`,
      `DTEND:${event.end}`,
      `SUMMARY:${escapeIcs(event.title)}`,
      `LOCATION:${escapeIcs(event.location)}`,
      `DESCRIPTION:${escapeIcs(event.description)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = event.filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function initCalendarButtons() {
    $$(".add-calendar").forEach(button => {
      button.addEventListener("click", () => downloadCalendar(button.dataset.event));
    });
  }

  function setStatus(element, text, type = "") {
    element.textContent = text;
    element.className = `status-message ${type}`.trim();
  }

  function supabaseReady() {
    const config = window.WEDDING_CONFIG || {};
    return Boolean(
      config.enableSupabase &&
      config.supabaseUrl &&
      config.supabaseAnonKey &&
      window.supabase?.createClient
    );
  }

  let supabaseClient = null;
  function getSupabase() {
    if (!supabaseReady()) return null;
    if (!supabaseClient) {
      const config = window.WEDDING_CONFIG;
      supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    }
    return supabaseClient;
  }

  async function saveRsvp(payload) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client.from("wedding_rsvps").insert({
      guest_code: guest.code,
      invited_name: guest.name,
      response_name: payload.name,
      attendance: payload.attendance,
      attendee_count: payload.guestCount,
      event_selection: payload.eventSelection,
      message: payload.message || null,
      source_url: location.href
    });
    if (error) console.warn("RSVP database logging failed:", error.message);
  }

  function initRsvp() {
    const form = $("#rsvpForm");
    const guestCount = $("#guestCount");
    const eventSelection = $("#eventSelection");
    const status = $("#rsvpStatus");

    $$('input[name="attendance"]').forEach(input => {
      input.addEventListener("change", () => {
        const attending = form.elements.attendance.value === "Joyfully attending";
        guestCount.disabled = !attending;
        eventSelection.disabled = !attending;
        if (!attending) guestCount.value = "1";
      });
    });

    if (Date.now() > RSVP_DEADLINE.getTime()) {
      setStatus(status, "The RSVP deadline has passed. You may still contact Qutubuddin directly on WhatsApp.", "error");
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const isAttending = data.get("attendance") === "Joyfully attending";
      const payload = {
        name: String(data.get("name") || "").trim(),
        attendance: String(data.get("attendance") || ""),
        guestCount: isAttending ? Number(data.get("guestCount") || 1) : 0,
        eventSelection: isAttending ? String(data.get("eventSelection") || invitationScopeLabel()) : "Not applicable",
        message: String(data.get("message") || "").trim()
      };

      setStatus(status, "Preparing your RSVP…");
      await saveRsvp(payload);

      const lines = [
        "Wedding RSVP — Qutubuddin & Khadijah",
        "",
        `Invitation for: ${guest.name}`,
        `Guest code: ${guest.code}`,
        `Response from: ${payload.name}`,
        `Attendance: ${payload.attendance}`,
        isAttending ? `Number attending: ${payload.guestCount}` : null,
        isAttending ? `Functions: ${payload.eventSelection}` : null,
        payload.message ? `Message: ${payload.message}` : null
      ].filter(Boolean);

      const whatsappUrl = `https://wa.me/${RSVP_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
      setStatus(status, "WhatsApp is opening. Tap Send to complete your RSVP.", "success");
      window.open(whatsappUrl, "_blank", "noopener");
    });
  }

  function formatBytes(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function safeFileName(name) {
    const dot = name.lastIndexOf(".");
    const extension = dot >= 0 ? name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g, "") : "";
    const base = (dot >= 0 ? name.slice(0, dot) : name)
      .normalize("NFKD")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "memory";
    return `${base}${extension}`;
  }

  function initUploads() {
    const form = $("#uploadForm");
    const input = $("#photoFiles");
    const picker = $("#uploadPicker");
    const button = $("#uploadButton");
    const preview = $("#filePreview");
    const status = $("#uploadStatus");
    let selectedFiles = [];

    if (!supabaseReady()) {
      setStatus(status, "Photo uploads are ready and will become active after the private gallery is connected.");
    }

    function renderFiles(files) {
      selectedFiles = [...files].slice(0, 12);
      preview.innerHTML = "";
      let valid = selectedFiles.length > 0;
      selectedFiles.forEach(file => {
        if (file.size > 15 * 1024 * 1024) valid = false;
        const row = document.createElement("div");
        row.className = "file-row";
        const name = document.createElement("span");
        const size = document.createElement("small");
        name.textContent = file.name;
        size.textContent = file.size > 15 * 1024 * 1024 ? "Over 15 MB" : formatBytes(file.size);
        row.append(name, size);
        preview.append(row);
      });
      button.disabled = !valid || !supabaseReady();
      if (!valid && selectedFiles.length) setStatus(status, "Please remove files larger than 15 MB.", "error");
      else if (supabaseReady()) setStatus(status, `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} ready to upload.`);
    }

    picker.addEventListener("click", () => input.click());
    input.addEventListener("change", () => renderFiles(input.files));

    ["dragenter", "dragover"].forEach(type => picker.addEventListener(type, event => {
      event.preventDefault();
      picker.classList.add("dragging");
    }));
    ["dragleave", "drop"].forEach(type => picker.addEventListener(type, event => {
      event.preventDefault();
      picker.classList.remove("dragging");
    }));
    picker.addEventListener("drop", event => renderFiles(event.dataTransfer.files));

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const client = getSupabase();
      if (!client) {
        setStatus(status, "The private photo gallery is not connected yet.", "error");
        return;
      }
      if (!selectedFiles.length) return;

      button.disabled = true;
      const originalButton = button.innerHTML;
      button.textContent = "Uploading…";
      let uploaded = 0;
      try {
        const { data: sessionData, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;
        let user = sessionData.session?.user || null;
        if (!user) {
          const { data: authData, error: authError } = await client.auth.signInAnonymously();
          if (authError) throw new Error(`Anonymous photo access is not enabled: ${authError.message}`);
          user = authData.user;
        }
        if (!user) throw new Error("Could not create a secure upload session.");

        for (const file of selectedFiles) {
          const uniqueId = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
          const path = `${user.id}/${guest.code}/${Date.now()}-${uniqueId}-${safeFileName(file.name)}`;
          const { error: uploadError } = await client.storage
            .from(window.WEDDING_CONFIG.uploadBucket || "wedding-photos")
            .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
          if (uploadError) throw uploadError;

          const { error: rowError } = await client.from("wedding_photo_uploads").insert({
            uploader_id: user.id,
            guest_code: guest.code,
            guest_name: guest.name,
            file_path: path,
            original_filename: file.name,
            mime_type: file.type || null,
            size_bytes: file.size
          });
          if (rowError) console.warn("Photo metadata logging failed:", rowError.message);
          uploaded += 1;
          setStatus(status, `Uploaded ${uploaded} of ${selectedFiles.length}…`);
        }

        setStatus(status, "Thank you — your memories have been added to our private gallery.", "success");
        selectedFiles = [];
        input.value = "";
        preview.innerHTML = "";
      } catch (error) {
        console.error(error);
        setStatus(status, `Upload could not be completed: ${error.message || "please try again."}`, "error");
      } finally {
        button.innerHTML = originalButton;
        button.disabled = selectedFiles.length === 0 || !supabaseReady();
      }
    });
  }

  async function shareInvitation() {
    const shareData = {
      title: "Qutubuddin & Khadijah — Wedding Invitation",
      text: `You are invited to celebrate with Qutubuddin and Khadijah on 17 & 18 January 2027 in Mandsaur.${guest.name === "Guest" ? "" : ` Invitation for ${guest.name}.`}`,
      url: location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(location.href);
        const button = $("#shareInvite");
        if (button) {
          const old = button.innerHTML;
          button.textContent = "Link copied";
          setTimeout(() => { button.innerHTML = old; }, 1800);
        }
      }
    } catch (error) {
      if (error.name !== "AbortError") console.warn(error);
    }
  }

  function initShare() {
    $("#shareInvite")?.addEventListener("click", shareInvitation);
    $("#dockShare")?.addEventListener("click", shareInvitation);
  }

  function initLightbox() {
    const lightbox = $("#lightbox");
    const image = $("#lightboxImage");
    const close = () => {
      lightbox.hidden = true;
      image.src = "";
      document.body.classList.remove("lightbox-open");
    };

    $$("[data-lightbox]").forEach(button => {
      button.addEventListener("click", () => {
        image.src = button.dataset.lightbox;
        image.alt = button.querySelector("img")?.alt || "Wedding photograph";
        lightbox.hidden = false;
        document.body.classList.add("lightbox-open");
        $("#lightboxClose").focus();
      });
    });
    $("#lightboxClose").addEventListener("click", close);
    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) close();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !lightbox.hidden) close();
    });
  }

  applyEventAccess();
  setPersonalization();
  initIntro();
  initRevealAnimations();
  initScrollProgress();
  initCalendarButtons();
  initRsvp();
  initUploads();
  initShare();
  initLightbox();
  initScratchReveal();
  updateCountdown();
  setInterval(updateCountdown, 1000);
})();
