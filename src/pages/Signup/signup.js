/**
 * CrimsonSync Signup — role-selection flow with role-specific forms.
 * Donor/Recipient: minimal friction, no verification required.
 * Hospital/Blood Bank: required document upload, pending verification.
 *
 * TODO (API integration): Replace mock calls with authService.register()
 * pointing to FastAPI/Django endpoints defined in src/services/auth.service.js
 */

import { signup } from '../../api/auth.api.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import { normalizeRole, getDashboardPath } from '../../utils/auth.js';
import { initTheme } from '../../hooks/useTheme.js';
import { showToast } from '../../components/common/toast.js';

initTheme();

// ── Screens ──────────────────────────────────────────────────────────────────
const roleSelectScreen   = document.getElementById('roleSelectScreen');
const donorFormScreen    = document.getElementById('donorFormScreen');
const recipientFormScreen = document.getElementById('recipientFormScreen');
const orgFormScreen      = document.getElementById('orgFormScreen');
const pendingScreen      = document.getElementById('pendingScreen');

let selectedRole = null;

function showScreen(screenEl) {
    [roleSelectScreen, donorFormScreen, recipientFormScreen, orgFormScreen, pendingScreen]
        .forEach(s => { s.style.display = 'none'; });
    screenEl.style.display = 'block';
}

// ── Role Selection ────────────────────────────────────────────────────────────
document.querySelectorAll('.role-pick-card').forEach(card => {
    card.addEventListener('click', () => {
        selectedRole = card.dataset.role;
        if (selectedRole === 'donor') {
            showScreen(donorFormScreen);
        } else if (selectedRole === 'recipient') {
            showScreen(recipientFormScreen);
        } else {
            // hospital or blood_bank
            document.getElementById('orgRoleLabel').textContent =
                selectedRole === 'blood_bank' ? 'Blood Bank' : 'Hospital';
            showScreen(orgFormScreen);
        }
    });
});

// ── Back buttons ─────────────────────────────────────────────────────────────
['backFromDonor', 'backFromRecipient', 'backFromOrg'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => showScreen(roleSelectScreen));
});

// ── File input labels ────────────────────────────────────────────────────────
document.getElementById('o_license_doc')?.addEventListener('change', e => {
    document.getElementById('license_doc_name').textContent =
        e.target.files[0]?.name || '';
});
document.getElementById('o_reg_doc')?.addEventListener('change', e => {
    document.getElementById('reg_doc_name').textContent =
        e.target.files[0]?.name || '';
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function setLoading(btn, loading, label = 'Create Account') {
    btn.disabled = loading;
    btn.textContent = loading ? 'Creating account…' : label;
}

// ── DONOR Signup ──────────────────────────────────────────────────────────────
document.getElementById('donorForm').addEventListener('submit', async e => {
    e.preventDefault();
    const password = document.getElementById('d_password').value;
    const confirm  = document.getElementById('d_confirm').value;
    const terms = document.getElementById('d_terms').checked;

    if (password !== confirm) { showToast('Passwords do not match'); return; }

    if (!terms) {
        showToast('Please agree to the Terms and Conditions.');
        return;
    }

    const btn = document.getElementById('donorSubmitBtn');
    setLoading(btn, true, 'Create Donor Account');

    const userData = {
        name:      document.getElementById('d_name').value.trim(),
        age:       parseInt(document.getElementById('d_age').value, 10),
        bloodType: document.getElementById('d_bloodType').value,
        email:     document.getElementById('d_email').value.trim(),
        password,
        role:      ROLES.DONOR,
        // verification is optional — starts unverified
        verified:  false,
        verificationStatus: 'unverified',
    };

    try {
        // TODO: POST /api/auth/register with userData (FastAPI/Django)
        await signup(userData);
        showToast('Account created! Welcome to CrimsonSync.');
        // Redirect directly to donor dashboard — no forced verification
        window.location.href = ROUTES.DASHBOARDS[ROLES.DONOR];
    } catch (err) {
        showToast(err.message || 'Signup failed. Please try again.');
        setLoading(btn, false, 'Create Donor Account');
    }
});

// ── RECIPIENT Signup ───────────────────────────────────────────────────────────
document.getElementById('recipientForm').addEventListener('submit', async e => {
    e.preventDefault();
    const password = document.getElementById('r_password').value;
    const confirm  = document.getElementById('r_confirm').value;
    const terms = document.getElementById('d_terms').checked;

    if (password !== confirm) { showToast('Passwords do not match'); return; }

    if (!terms) {
        showToast('Please agree to the Terms and Conditions.');
        return;
    }

    const btn = document.getElementById('recipientSubmitBtn');
    setLoading(btn, true, 'Create Recipient Account');

    const userData = {
        name:     document.getElementById('r_name').value.trim(),
        age:      parseInt(document.getElementById('r_age').value, 10),
        email:    document.getElementById('r_email').value.trim(),
        password,
        role:     ROLES.RECIPIENT,
        verified: false,
        verificationStatus: 'unverified',
    };

    try {
        // TODO: POST /api/auth/register with userData (FastAPI/Django)
        await signup(userData);
        showToast('Account created! Welcome to CrimsonSync.');
        // Redirect directly to recipient dashboard — no forced verification
        window.location.href = ROUTES.DASHBOARDS[ROLES.RECIPIENT];
    } catch (err) {
        showToast(err.message || 'Signup failed. Please try again.');
        setLoading(btn, false, 'Create Recipient Account');
    }
});

// ── HOSPITAL / BLOOD BANK Signup ──────────────────────────────────────────────
document.getElementById('orgForm').addEventListener('submit', async e => {
    e.preventDefault();
    const password = document.getElementById('o_password').value;
    const confirm  = document.getElementById('o_confirm').value;
    if (password !== confirm) { showToast('Passwords do not match'); return; }

    const terms = document.getElementById('d_terms').checked;

    if (!terms) {
    showToast('Please agree to the Terms and Conditions.');
    return;
}


    const licenseDoc = document.getElementById('o_license_doc').files[0];
    const regDoc     = document.getElementById('o_reg_doc').files[0];
    if (!licenseDoc || !regDoc) {
        showToast('Please upload both required documents.');
        return;
    }

    const btn = document.getElementById('orgSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    const role = normalizeRole(selectedRole); // 'hospital' or 'blood_bank'

    const userData = {
        name:           document.getElementById('o_orgName').value.trim(),
        orgType:        document.getElementById('o_orgType').value,
        licenseNumber:  document.getElementById('o_license').value.trim(),
        repName:        document.getElementById('o_repName').value.trim(),
        email:          document.getElementById('o_email').value.trim(),
        password,
        role,
        verified:       false,
        // Hospitals/blood banks start as pending — must be approved by admin
        verificationStatus: 'pending',
    };

    try {
        // TODO: POST /api/auth/register/organization with userData + file uploads (FastAPI/Django)
        // TODO: Upload licenseDoc and regDoc via upload.api.js after account creation
        await signup(userData);
        showScreen(pendingScreen);
    } catch (err) {
        showToast(err.message || 'Registration failed. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Submit for Verification';
    }
});
