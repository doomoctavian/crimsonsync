import { resetPassword } from '../../api/auth.api.js';
import { ROUTES } from '../../constants/routes.js';
import { initTheme } from '../../hooks/useTheme.js';
import { showToast } from '../../components/common/toast.js';

initTheme();

const params = new URLSearchParams(window.location.search);
const token = params.get('token') || 'mock-token';

document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (password !== confirm) {
        showToast('Passwords do not match');
        return;
    }

    await resetPassword(token, password);
    showToast('Password reset successfully!');
    setTimeout(() => { window.location.href = ROUTES.LOGIN; }, 1500);
});
