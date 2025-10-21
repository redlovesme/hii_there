// Simple client-side admin: protected by hardcoded credentials.
// NOTE: This is not secure for production — credentials and data are stored client-side.
// Credentials:
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'lovina'; // the password I gave you

const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const status = document.getElementById('status');
const content = document.getElementById('content');
const listContainer = document.getElementById('listContainer');
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginControls = document.getElementById('loginControls');

function loadBookings() {
  try {
    const raw = localStorage.getItem('dateBookings');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function renderList(items) {
  if (!items || items.length === 0) {
    listContainer.innerHTML = `<div class="small">No bookings found.</div>`;
    return;
  }
  const rows = items.slice().reverse(); // newest first
  let html = '<table><thead><tr><th>Saved at</th><th>Datetime (ISO)</th><th>Readable</th><th>Origin</th></tr></thead><tbody>';
  rows.forEach(r => {
    html += `<tr>
      <td>${escapeHtml(r.savedAt||'')}</td>
      <td>${escapeHtml(r.datetime||'')}</td>
      <td>${escapeHtml(r.human||'')}</td>
      <td>${escapeHtml(r.origin||'')}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  listContainer.innerHTML = html;
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function onLogin() {
  const u = (usernameInput.value || '').trim();
  const p = (passwordInput.value || '').trim();
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    status.textContent = 'Logged in.';
    loginControls.style.display = 'none';
    content.style.display = 'block';
    refresh();
  } else {
    status.textContent = 'Bad credentials.';
  }
}

function refresh() {
  const items = loadBookings();
  renderList(items);
  status.textContent = `Loaded ${items.length} booking(s).`;
}

function exportCSV() {
  const items = loadBookings();
  if (!items || items.length === 0) {
    status.textContent = 'No bookings to export.';
    return;
  }
  const rows = [['SavedAt','DatetimeISO','HumanReadable','Origin']];
  items.forEach(it => rows.push([it.savedAt||'', it.datetime||'', it.human||'', it.origin||'']));
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bookings.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  status.textContent = 'Export started.';
}

function clearAll() {
  if (!confirm('Clear all saved bookings from localStorage? This cannot be undone.')) return;
  localStorage.removeItem('dateBookings');
  refresh();
  status.textContent = 'All bookings cleared.';
}

function logout() {
  content.style.display = 'none';
  loginControls.style.display = 'flex';
  usernameInput.value = '';
  passwordInput.value = '';
  status.textContent = 'Logged out.';
}

loginBtn.addEventListener('click', onLogin);
refreshBtn.addEventListener('click', refresh);
exportBtn.addEventListener('click', exportCSV);
clearBtn.addEventListener('click', clearAll);
logoutBtn.addEventListener('click', logout);

// allow Enter to submit login
passwordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') onLogin(); });
usernameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') onLogin(); });