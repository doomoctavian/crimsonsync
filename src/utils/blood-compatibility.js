/**
 * Blood type compatibility helpers for request UI hints.
 */
export const BLOOD_COMPATIBILITY = {
    'O-': { donateTo: ['All Types'], receiveFrom: ['O-'] },
    'O+': { donateTo: ['O+', 'A+', 'B+', 'AB+'], receiveFrom: ['O-', 'O+'] },
    'A-': { donateTo: ['A-', 'A+', 'AB-', 'AB+'], receiveFrom: ['A-', 'O-'] },
    'A+': { donateTo: ['A+', 'AB+'], receiveFrom: ['A-', 'A+', 'O-', 'O+'] },
    'B-': { donateTo: ['B-', 'B+', 'AB-', 'AB+'], receiveFrom: ['B-', 'O-'] },
    'B+': { donateTo: ['B+', 'AB+'], receiveFrom: ['B-', 'B+', 'O-', 'O+'] },
    'AB-': { donateTo: ['AB-', 'AB+'], receiveFrom: ['AB-', 'A-', 'B-', 'O-'] },
    'AB+': { donateTo: ['AB+'], receiveFrom: ['All Types'] },
};

export function getCompatibleDonors(bloodType) {
    return Object.entries(BLOOD_COMPATIBILITY)
        .filter(([, c]) => c.donateTo.includes('All Types') || c.donateTo.includes(bloodType))
        .map(([type]) => type);
}

export function getCompatibilityHint(bloodType) {
    const donors = getCompatibleDonors(bloodType);
    return `Compatible donors: ${donors.join(', ')}`;
}

export function canDonorMatch(donorType, neededType) {
    const compat = BLOOD_COMPATIBILITY[donorType];
    if (!compat) return false;
    return compat.donateTo.includes('All Types') || compat.donateTo.includes(neededType);
}
