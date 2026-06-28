/**
 * Profile page — role-aware layout.
 *
 * Donors / Recipients:
 *   - Edit basic info
 *   - OPTIONAL "Verify Your Identity" section (collapsible, non-blocking)
 *   - Notification & privacy settings
 *
 * Hospitals / Blood Banks:
 *   - View/update organization info
 *   - Upload new documents if rejected
 *   - Verification status card (read-only, managed by admin)
 *
 * TODO: Connect to authService.verifyUser() / authService.verifyOrganization()
 *       for document upload → POST /api/auth/verify-identity or /api/auth/verify-org
 */

import { mountDashboardLayout } from '../../components/layout/dashboard-layout.js';
import { getCurrentUser, updateCurrentUser } from '../../utils/auth.js';
import { guardRoute } from '../../utils/router.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import { showToast } from '../../components/common/toast.js';
import { confirmAction } from '../../components/common/confirm.js';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const AVAILABILITY_OPTIONS = ['Available Now', 'Available This Week', 'Unavailable', 'Emergency Only'];

// ── Toggle helper ─────────────────────────────────────────────────────────────
function renderToggle(id, label, desc, checked) {
    return `<div class="toggle-row">
        <div class="toggle-label"><h4>${label}</h4><p>${desc}</p></div>
        <label class="toggle-switch"><input type="checkbox" id="${id}" ${checked ? 'checked' : ''}><span class="toggle-slider"></span></label>
    </div>`;
}

// ── OPTIONAL verification section for Donor / Recipient ───────────────────────
function renderOptionalVerification(user) {
    const verified = user?.verified || user?.verificationStatus === 'verified';
    const role = user?.role;
    const isDonor = role === ROLES.DONOR;

    if (verified) {
        return `<div class="card" style="margin-bottom:1.25rem">
            <div class="card-header">
                <h3 class="card-title">✅ Identity Verified</h3>
                <span class="badge badge-success">Verified</span>
            </div>
            <p style="font-size:0.875rem;color:var(--text-light)">
                Your identity has been verified. You ${isDonor ? 'have priority in donor matching and display a Verified Badge.' : 'receive prioritized blood request matching.'}
            </p>
        </div>`;
    }

    return `<div class="card" style="margin-bottom:1.25rem">
        <div class="card-header">
            <h3 class="card-title">🪪 Verify Your Identity</h3>
            <span class="badge badge-info" style="background:rgba(59,130,246,0.12);color:var(--info)">Optional</span>
        </div>
        <p style="font-size:0.875rem;color:var(--text-light);margin-bottom:1rem">
            Verification is entirely optional — you can use the platform fully without it.
            Verified ${isDonor ? 'donors get a Verified Badge, higher trust score, and priority in matching.' : 'recipients receive prioritized matching with donors.'}
        </p>
        <div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.25rem">
            <div style="background:var(--bg-light);border-radius:0.5rem;padding:0.85rem 1rem;font-size:0.875rem">
                <strong style="display:block;margin-bottom:0.25rem">Accepted documents:</strong>
                <span style="color:var(--text-light)">National ID, Citizenship Card, Passport, ${isDonor ? 'Donor Card, ' : ''}Any government-issued ID</span>
            </div>
        </div>
        <label class="upload-zone" for="verifyDocInput" style="cursor:pointer">
            <input type="file" id="verifyDocInput" accept=".pdf,.jpg,.jpeg,.png" style="display:none">
            <div style="font-size:1.5rem;margin-bottom:0.35rem">📄</div>
            <div style="font-weight:600;font-size:0.9rem">Upload ID Document</div>
            <div style="font-size:0.8rem;color:var(--text-light)">PDF, JPG, or PNG · Max 5 MB</div>
            <div class="file-chosen" id="verifyDocName" style="margin-top:0.35rem;font-size:0.8rem;color:var(--success)"></div>
        </label>
        <button class="btn btn-primary" id="submitVerifyBtn" style="margin-top:1rem;width:100%" disabled>
            Submit for Verification
        </button>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.75rem;text-align:center">
            Your document is reviewed within 1–2 business days.
        </p>
    </div>`;
}

// ── Org verification status card (Hospital / Blood Bank) ─────────────────────
function renderOrgVerificationCard(user) {
    const status = user?.verificationStatus || 'pending';
    const STATUS_CONFIG = {
        pending:  { icon: '⏳', label: 'Pending Review',   color: 'warning', msg: 'Your documents are under review. Our team will notify you within 1–3 business days.' },
        approved: { icon: '✅', label: 'Approved',         color: 'success', msg: 'Your organization is fully verified with complete platform access.' },
        rejected: { icon: '❌', label: 'Rejected',         color: 'danger',  msg: 'Verification was rejected. Please upload new or corrected documents below.' },
    };
    const sc = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    return `<div class="card" style="margin-bottom:1.25rem">
        <div class="card-header">
            <h3 class="card-title">${sc.icon} Verification Status</h3>
            <span class="badge badge-${sc.color}">${sc.label}</span>
        </div>
        <p style="font-size:0.875rem;color:var(--text-light);margin-bottom:${status === 'rejected' ? '1.25rem' : '0'}">${sc.msg}</p>
        ${status === 'rejected' ? `
        <div>
            <label class="upload-zone" for="orgLicenseReDoc">
                <input type="file" id="orgLicenseReDoc" accept=".pdf,.jpg,.jpeg,.png" style="display:none">
                <div style="font-size:1.25rem;margin-bottom:0.25rem">📄</div>
                <div style="font-weight:600;font-size:0.875rem">Re-upload Operating License</div>
                <div class="file-chosen" id="orgLicenseReName" style="margin-top:0.25rem;font-size:0.8rem;color:var(--success)"></div>
            </label>
            <label class="upload-zone" for="orgRegReDoc" style="margin-top:0.75rem">
                <input type="file" id="orgRegReDoc" accept=".pdf,.jpg,.jpeg,.png" style="display:none">
                <div style="font-size:1.25rem;margin-bottom:0.25rem">📋</div>
                <div style="font-weight:600;font-size:0.875rem">Re-upload Registration Certificate</div>
                <div class="file-chosen" id="orgRegReName" style="margin-top:0.25rem;font-size:0.8rem;color:var(--success)"></div>
            </label>
            <button class="btn btn-primary" id="resubmitDocsBtn" style="margin-top:1rem;width:100%">
                Re-submit Documents
            </button>
        </div>` : ''}
    </div>`;
}

// ── Individual profile form (Donor / Recipient) ───────────────────────────────
function renderIndividualProfile(user) {
    const loc = user?.location || '';
    const avail = user?.availability || 'Available This Week';
    const notifications = user?.notifications || { email: true, push: true, emergency: true, marketing: false };
    const privacy = user?.privacy || { showProfile: true, showLocation: false, showBloodType: true };
    const isDonor = user?.role === ROLES.DONOR;

    return `
    <div class="dashboard-row">
        <div>
            ${renderOptionalVerification(user)}
            <div class="card">
                <div class="card-header"><h3 class="card-title">Personal Information</h3></div>
                <div class="avatar-upload" id="avatarUpload" tabindex="0" role="button" aria-label="Change profile picture" style="width:4rem;height:4rem;border-radius:50%;background:var(--gradient-primary);color:white;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;cursor:pointer;margin:0 auto 1.5rem;position:relative;">
                    ${user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    <span style="position:absolute;bottom:0;right:-0.25rem;background:var(--bg-card);border:1px solid var(--border-light);border-radius:9999px;padding:0.15rem 0.4rem;font-size:0.65rem;font-weight:600">✏️</span>
                </div>
                <form id="profileForm" novalidate>
                    <div class="form-group">
                        <label for="p_name">Full Name</label>
                        <input class="form-input" id="p_name" value="${user?.name || ''}" required minlength="2">
                    </div>
                    <div class="form-group">
                        <label for="p_email">Email</label>
                        <input class="form-input" id="p_email" value="${user?.email || ''}" readonly style="opacity:0.7;cursor:not-allowed">
                    </div>
                    <div class="form-row">
                        ${isDonor ? `<div class="form-group">
                            <label for="p_bloodType">Blood Group</label>
                            <select class="form-select" id="p_bloodType">
                                ${BLOOD_TYPES.map(t => `<option value="${t}" ${user?.bloodType === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </div>` : ''}
                        <div class="form-group">
                            <label for="p_age">Age</label>
                            <input class="form-input" id="p_age" type="number" value="${user?.age || ''}" min="1" max="120">
                        </div>
                    </div>
                    ${isDonor ? `<div class="form-group">
                        <label for="p_avail">Availability</label>
                        <select class="form-select" id="p_avail">
                            ${AVAILABILITY_OPTIONS.map(a => `<option value="${a}" ${avail === a ? 'selected' : ''}>${a}</option>`).join('')}
                        </select>
                    </div>` : ''}
                    <div class="form-group">
                        <label for="p_location">Location</label>
                        <input class="form-input" id="p_location" placeholder="City, State" value="${loc}">
                    </div>
                    <button type="submit" class="btn btn-primary" id="saveProfileBtn">Save Changes</button>
                </form>
            </div>
        </div>
        <div>
            <div class="card" style="margin-bottom:1.25rem">
                <div class="card-header"><h3 class="card-title">Notification Settings</h3></div>
                ${renderToggle('notifEmail',     'Email Alerts',        'Receive updates via email',             notifications.email)}
                ${renderToggle('notifPush',      'Push Notifications',  'Browser and mobile alerts',             notifications.push)}
                ${renderToggle('notifEmergency', 'Emergency SOS',       'Critical blood request alerts',         notifications.emergency)}
                ${renderToggle('notifMarketing', 'Newsletter',          'Platform updates and tips',             notifications.marketing)}
            </div>
            <div class="card" style="margin-bottom:1.25rem">
                <div class="card-header"><h3 class="card-title">Privacy Settings</h3></div>
                ${renderToggle('privacyProfile',   'Show Profile',    'Visible to matched users',              privacy.showProfile)}
                ${renderToggle('privacyLocation',  'Show Location',   'Share city with requesters',            privacy.showLocation)}
                ${isDonor ? renderToggle('privacyBloodType', 'Show Blood Type', 'Display blood group publicly', privacy.showBloodType) : ''}
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">Account</h3></div>
                <div class="list-item" style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid var(--border-light)">
                    <div><strong style="font-size:0.9rem">Change Password</strong><p style="font-size:0.8rem;color:var(--text-light);margin:0">Update your login password</p></div>
                    <button type="button" class="btn btn-secondary btn-sm" id="changePwBtn">Change</button>
                </div>
                <div class="list-item" style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 0">
                    <div><strong style="font-size:0.9rem;color:var(--danger)">Delete Account</strong><p style="font-size:0.8rem;color:var(--text-light);margin:0">Permanently remove your account</p></div>
                    <button type="button" class="btn btn-sm" style="background:rgba(239,68,68,0.1);color:var(--danger);border:1px solid rgba(239,68,68,0.3)" id="deleteAccountBtn">Delete</button>
                </div>
            </div>
        </div>
    </div>`;
}

// ── Organization profile form (Hospital / Blood Bank) ─────────────────────────
function renderOrgProfile(user) {
    return `
    <div class="dashboard-row">
        <div>
            ${renderOrgVerificationCard(user)}
            <div class="card">
                <div class="card-header"><h3 class="card-title">Organization Information</h3></div>
                <form id="profileForm" novalidate>
                    <div class="form-group">
                        <label for="p_name">Organization Name</label>
                        <input class="form-input" id="p_name" value="${user?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="p_email">Email</label>
                        <input class="form-input" id="p_email" value="${user?.email || ''}" readonly style="opacity:0.7;cursor:not-allowed">
                    </div>
                    <div class="form-group">
                        <label for="p_repName">Authorized Representative</label>
                        <input class="form-input" id="p_repName" value="${user?.repName || ''}">
                    </div>
                    <div class="form-group">
                        <label for="p_license">License Number</label>
                        <input class="form-input" id="p_license" value="${user?.licenseNumber || ''}" placeholder="Operating license number">
                    </div>
                    <div class="form-group">
                        <label for="p_location">Address / Location</label>
                        <input class="form-input" id="p_location" value="${user?.location || ''}" placeholder="Full address">
                    </div>
                    <button type="submit" class="btn btn-primary" id="saveProfileBtn">Save Changes</button>
                </form>
            </div>
        </div>
        <div>
            <div class="card" style="margin-bottom:1.25rem">
                <div class="card-header"><h3 class="card-title">Notification Settings</h3></div>
                ${renderToggle('notifEmail',     'Email Alerts',   'Receive updates via email',     user?.notifications?.email ?? true)}
                ${renderToggle('notifEmergency', 'Emergency SOS',  'Critical blood request alerts', user?.notifications?.emergency ?? true)}
                ${renderToggle('notifMarketing', 'Newsletter',     'Platform updates and tips',     user?.notifications?.marketing ?? false)}
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">Account</h3></div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 0">
                    <div><strong style="font-size:0.9rem">Change Password</strong><p style="font-size:0.8rem;color:var(--text-light);margin:0">Update your login password</p></div>
                    <button type="button" class="btn btn-secondary btn-sm" id="changePwBtn">Change</button>
                </div>
            </div>
        </div>
    </div>`;
}

// ── Events ────────────────────────────────────────────────────────────────────
function bindEvents(user) {
    const isOrg = user?.role === ROLES.HOSPITAL || user?.role === ROLES.BLOOD_BANK;

    // Save profile
    document.getElementById('profileForm')?.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('p_name').value.trim();
        if (name.length < 2) { showToast('Name must be at least 2 characters'); return; }
        const updates = {
            name,
            location: document.getElementById('p_location')?.value.trim(),
            ...(document.getElementById('p_age') ? { age: parseInt(document.getElementById('p_age').value, 10) } : {}),
            ...(document.getElementById('p_bloodType') ? { bloodType: document.getElementById('p_bloodType').value } : {}),
            ...(document.getElementById('p_avail') ? { availability: document.getElementById('p_avail').value } : {}),
            ...(document.getElementById('p_repName') ? { repName: document.getElementById('p_repName').value.trim() } : {}),
            ...(document.getElementById('p_license') ? { licenseNumber: document.getElementById('p_license').value.trim() } : {}),
        };
        // TODO: PATCH /api/profile with updates
        updateCurrentUser(updates);
        showToast('Profile updated successfully');
    });

    // Toggle settings
    ['notifEmail', 'notifPush', 'notifEmergency', 'notifMarketing',
     'privacyProfile', 'privacyLocation', 'privacyBloodType'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => {
            // TODO: PATCH /api/profile/settings
            showToast('Settings saved');
        });
    });

    // Optional identity verification (donor/recipient)
    const verifyDocInput = document.getElementById('verifyDocInput');
    if (verifyDocInput) {
        verifyDocInput.addEventListener('change', e => {
            const file = e.target.files[0];
            document.getElementById('verifyDocName').textContent = file?.name || '';
            document.getElementById('submitVerifyBtn').disabled = !file;
        });
        document.getElementById('submitVerifyBtn')?.addEventListener('click', () => {
            const file = verifyDocInput.files[0];
            if (!file) return;
            // TODO: POST /api/auth/verify-identity (multipart/form-data) via authService.verifyUser()
            showToast('Document submitted for review. You\'ll be notified within 1–2 business days.');
            updateCurrentUser({ verificationStatus: 'pending' });
            document.getElementById('submitVerifyBtn').disabled = true;
            document.getElementById('submitVerifyBtn').textContent = '⏳ Under Review';
        });
    }

    // Org re-upload on rejection
    document.getElementById('orgLicenseReDoc')?.addEventListener('change', e => {
        document.getElementById('orgLicenseReName').textContent = e.target.files[0]?.name || '';
    });
    document.getElementById('orgRegReDoc')?.addEventListener('change', e => {
        document.getElementById('orgRegReName').textContent = e.target.files[0]?.name || '';
    });
    document.getElementById('resubmitDocsBtn')?.addEventListener('click', () => {
        const l = document.getElementById('orgLicenseReDoc')?.files[0];
        const r = document.getElementById('orgRegReDoc')?.files[0];
        if (!l || !r) { showToast('Please upload both documents'); return; }
        // TODO: POST /api/auth/verify-org (multipart/form-data) via authService.verifyOrganization()
        showToast('Documents re-submitted. Verification pending review.');
        updateCurrentUser({ verificationStatus: 'pending' });
    });

    // Avatar
    document.getElementById('avatarUpload')?.addEventListener('click', () => {
        // TODO: POST /api/profile/avatar
        showToast('Profile picture upload — connect to API');
    });

    // Change password
    document.getElementById('changePwBtn')?.addEventListener('click', async () => {
        const ok = await confirmAction({
            title: 'Change Password',
            message: 'You will be redirected to reset your password via email.',
            confirmLabel: 'Continue',
        });
        if (ok) window.location.href = ROUTES.FORGOT_PASSWORD;
    });

    // Delete account (individual only)
    document.getElementById('deleteAccountBtn')?.addEventListener('click', async () => {
        const ok = await confirmAction({
            title: 'Delete Account',
            message: 'This will permanently delete your account and all data. This action cannot be undone.',
            confirmLabel: 'Delete Account',
        });
        if (ok) {
            // TODO: DELETE /api/auth/account
            showToast('Account deletion — connect to API');
        }
    });
}

// ── Mount ─────────────────────────────────────────────────────────────────────
if (guardRoute({ requireAuth: true })) {
    const user = getCurrentUser();
    const isOrg = user?.role === ROLES.HOSPITAL || user?.role === ROLES.BLOOD_BANK;

    const content = isOrg
        ? renderOrgProfile(user)
        : renderIndividualProfile(user);

    mountDashboardLayout(document.getElementById('app'), {
        title: 'Profile Settings',
        activeNav: 'Profile',
        content,
    });

    bindEvents(user);
}
