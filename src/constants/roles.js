/**
 * User roles and role-specific metadata.
 */
export const ROLES = {
    DONOR: 'donor',
    HOSPITAL: 'hospital',
    RECIPIENT: 'recipient',
    BLOOD_BANK: 'blood_bank',
};

export const ROLE_LABELS = {
    [ROLES.DONOR]: 'Donor',
    [ROLES.HOSPITAL]: 'Hospital',
    [ROLES.RECIPIENT]: 'Recipient',
    [ROLES.BLOOD_BANK]: 'Blood Bank',
};

export const ROLE_DASHBOARD_PATHS = {
    [ROLES.DONOR]: '/src/pages/DonorDashboard/index.html',
    [ROLES.HOSPITAL]: '/src/pages/HospitalDashboard/index.html',
    [ROLES.RECIPIENT]: '/src/pages/RecipientDashboard/index.html',
    [ROLES.BLOOD_BANK]: '/src/pages/BloodBankDashboard/index.html',
};

export const VERIFICATION_REQUIREMENTS = {
    [ROLES.DONOR]: {
        title: 'Donor Verification',
        description: 'Upload a government-issued ID or your official donor card.',
        documents: ['Government ID', 'Donor Card (optional)'],
    },
    [ROLES.HOSPITAL]: {
        title: 'Hospital Verification',
        description: 'Upload hospital licensing and official accreditation documents.',
        documents: ['Hospital License', 'Accreditation Certificate', 'Authorized Signatory ID'],
    },
    [ROLES.RECIPIENT]: {
        title: 'Identity Verification',
        description: 'Verify your identity to submit and track blood requests.',
        documents: ['Government ID', 'Medical Referral (if available)'],
    },
    [ROLES.BLOOD_BANK]: {
        title: 'Blood Bank Verification',
        description: 'Upload blood bank licensing and regulatory compliance documents.',
        documents: ['Blood Bank License', 'Regulatory Compliance Certificate', 'Facility Authorization'],
    },
};
