import { verifyEmail, verifyIdentity } from '../../api/auth.api.js';
import { VERIFICATION_REQUIREMENTS } from '../../constants/roles.js';
import { getDashboardPath } from '../../utils/auth.js';
import { guardVerifyPage } from '../../utils/router.js';
import { getSession } from '../../utils/storage.js';
import { initTheme } from '../../hooks/useTheme.js';
import { showToast } from '../../components/common/toast.js';
import { SessionContext } from '../../context/session.js';

initTheme();
guardVerifyPage();

const session = getSession();
const user = session?.pendingUser || session?.user;
const role = user?.role || 'donor';
const requirements = VERIFICATION_REQUIREMENTS[role];

document.getElementById('identityTitle').textContent = requirements.title;
document.getElementById('identityDesc').textContent = requirements.description;
document.getElementById('docList').innerHTML = requirements.documents.map((d) => `<li>${d}</li>`).join('');

// OTP auto-focus
const otpInputs = document.querySelectorAll('.otp-digit');
otpInputs.forEach((input, i) => {
    input.addEventListener('input', () => {
        if (input.value && i < otpInputs.length - 1) otpInputs[i + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && i > 0) otpInputs[i - 1].focus();
    });
});

document.getElementById('verifyEmailBtn').addEventListener('click', async () => {
    const otp = Array.from(otpInputs).map((i) => i.value).join('');
    if (otp.length < 6) {
        showToast('Please enter the full 6-digit code');
        return;
    }
    await verifyEmail(otp);
    showToast('Email verified!');
    document.getElementById('emailStep').style.display = 'none';
    document.getElementById('identityStep').style.display = 'block';
    document.getElementById('stepEmail').classList.replace('active', 'done');
    document.getElementById('stepIdentity').classList.add('active');
});

document.getElementById('resendOtp').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('OTP resent (mock)');
});

// File upload
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
let uploadedFiles = [];

uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.style.borderColor = 'var(--primary)'; });
uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadedFiles = [...uploadedFiles, ...e.dataTransfer.files];
    renderFiles();
});

fileInput.addEventListener('change', () => {
    uploadedFiles = [...uploadedFiles, ...fileInput.files];
    renderFiles();
});

function renderFiles() {
    document.getElementById('fileList').innerHTML = uploadedFiles.map((f) => `📎 ${f.name}`).join('<br>');
}

document.getElementById('verifyIdentityBtn').addEventListener('click', async () => {
    if (uploadedFiles.length === 0) {
        showToast('Please upload at least one document');
        return;
    }
    const docs = uploadedFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }));
    await verifyIdentity(docs);
    SessionContext.notify();
    showToast('Verification submitted! Redirecting...');
    document.getElementById('stepIdentity').classList.replace('active', 'done');
    setTimeout(() => { window.location.href = getDashboardPath(role); }, 1200);
});
