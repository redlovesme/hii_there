// meeting.js: reads ?when=ISO_DATETIME and shows the scheduled date/time (no countdown).
// If the scheduled time is very near or in the past, it still displays "Be ready" immediately.

function qs(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

const when = qs('when');
const info = document.getElementById('info');

if (!when) {
  info.textContent = "No scheduled time found.";
} else {
  const dt = new Date(when);
  if (isNaN(dt.getTime())) {
    info.textContent = "Invalid scheduled time.";
  } else {
    info.textContent = `Be ready at: ${dt.toLocaleString([], {weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit'})}`;
  }
}