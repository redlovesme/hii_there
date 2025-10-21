/* Client-only front-end: no admin, no Google account, no backend.
   Forever-evasive "No" button, date restrictions (Thu/Fri/Sat/Sun unavailable).
   After Confirm: show "Be ready at [date/time]" then open meeting.html with ?when=ISO_DATETIME.
*/

/* DOM elements */
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const result = document.getElementById('result');
const dateForm = document.getElementById('dateForm');
const dateInput = document.getElementById('dateInput');
const timeInput = document.getElementById('timeInput');
const confirmBtn = document.getElementById('confirmBtn');
const formMsg = document.getElementById('formMsg');
const buttonsContainer = document.getElementById('buttons');

/* Evasive NO button behavior (forever evasive) */
function getRandomPositionForButton(elWidth = 100, elHeight = 40) {
  const padding = 12;
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  const maxX = Math.max(padding, vw - elWidth - padding);
  const maxY = Math.max(padding + 60, vh - elHeight - padding);

  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  return {x, y};
}

function moveNoButton() {
  const rect = noBtn.getBoundingClientRect();
  const { x, y } = getRandomPositionForButton(rect.width, rect.height);

  noBtn.style.position = 'fixed';
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.transform = 'translate(0,0)';
  noBtn.style.transition = 'left 220ms ease, top 220ms ease, transform 160ms ease';
}

noBtn.addEventListener('mouseenter', () => moveNoButton());
buttonsContainer.addEventListener('mousemove', (e) => {
  const nbRect = noBtn.getBoundingClientRect();
  const distanceX = Math.abs(e.clientX - (nbRect.left + nbRect.width / 2));
  const distanceY = Math.abs(e.clientY - (nbRect.top + nbRect.height / 2));
  const closeness = 80;
  if (distanceX < closeness && distanceY < closeness) moveNoButton();
});
noBtn.addEventListener('click', () => {
  result.textContent = "Nope — not today 😉";
  moveNoButton();
});
noBtn.addEventListener('focus', () => moveNoButton());

/* YES button behavior */
yesBtn.addEventListener('click', () => {
  result.textContent = "Yay! 🎉";
  dateForm.classList.remove('hidden');
  dateForm.scrollIntoView({behavior: 'smooth', block: 'center'});
});

/* Date constraints: not available Thu(4), Fri(5), Sat(6), Sun(0) */
/* Ensure date min is tomorrow */
function setMinDateToTomorrow(){
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2,'0');
  const dd = String(tomorrow.getDate()).padStart(2,'0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}
setMinDateToTomorrow();

function validateDateValue(dateStr) {
  if (!dateStr) return false;
  const parts = dateStr.split('-').map(Number);
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  const day = dt.getDay();
  if (day === 4 || day === 5 || day === 6 || day === 0) {
    return false;
  }
  return true;
}

dateInput.addEventListener('change', () => {
  formMsg.textContent = '';
  if (!validateDateValue(dateInput.value)) {
    formMsg.textContent = "That date falls on Thursday, Friday or weekend — please pick another day.";
    dateInput.value = '';
  }
});

/* Confirm: show "Be ready at [date/time]" then redirect to meeting page (client-only). */
confirmBtn.addEventListener('click', (e) => {
  formMsg.textContent = '';
  const dateVal = dateInput.value;
  const timeVal = timeInput.value;
  if (!dateVal || !timeVal) {
    formMsg.textContent = "Please choose both a date and a time.";
    return;
  }
  if (!validateDateValue(dateVal)) {
    formMsg.textContent = "Selected date isn't allowed (Thursday, Friday or weekend).";
    return;
  }

  const iso = `${dateVal}T${timeVal}:00`;
  const humanDate = new Date(iso).toLocaleString([], {
    weekday: 'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit'
  });

  // Immediately tell the visitor to be ready at the chosen date/time
  result.textContent = `Be ready at ${humanDate}. Opening meeting page...`;

  // Then navigate to the meeting page (gives user a moment to read the message)
  const encoded = encodeURIComponent(iso);
  setTimeout(() => {
    window.location.href = `meeting.html?when=${encoded}`;
  }, 900);
});
