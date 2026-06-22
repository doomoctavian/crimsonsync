export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function initials(name) {
  return String(name || 'CS')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'CS';
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export function formatShortDate(value) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function normalizeRole(role) {
  if (role === 'blood-bank' || role === 'blood_bank') {
    return 'bloodBank';
  }
  return role;
}

export function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getCompatibilityHint(bloodGroup) {
  const map = {
    'O-': 'Universal red-cell donor; can help all blood groups.',
    'O+': 'Compatible with O+, A+, B+, and AB+ recipients.',
    'A-': 'Compatible with A-, A+, AB-, and AB+ recipients.',
    'A+': 'Compatible with A+ and AB+ recipients.',
    'B-': 'Compatible with B-, B+, AB-, and AB+ recipients.',
    'B+': 'Compatible with B+ and AB+ recipients.',
    'AB-': 'Compatible with AB- and AB+ recipients.',
    'AB+': 'Universal plasma donor and AB+ red-cell recipient.',
  };
  return map[bloodGroup] || 'Compatibility will be calculated by the backend matching service.';
}

export function statusClass(value) {
  return `status-${String(value || '').toLowerCase().replace(/\s+/g, '-')}`;
}

export function assertEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function nowTime() {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date());
}
