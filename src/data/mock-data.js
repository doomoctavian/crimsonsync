/**
 * Mock data for development until backend is connected.
 */
export const mockDashboardData = {
    donor: {
        stats: [
            { label: 'Reward Points', value: '1,250', icon: '🏆' },
            { label: 'Donations', value: '8', icon: '❤️' },
            { label: 'Leaderboard Rank', value: '#42', icon: '📊' },
            { label: 'Eligibility', value: 'Eligible', icon: '✅', status: 'success' },
        ],
        appointments: [
            { id: 1, center: 'City Blood Bank', date: '2026-07-02', time: '10:00 AM', status: 'confirmed' },
            { id: 2, center: 'Metro Hospital Drive', date: '2026-08-15', time: '2:30 PM', status: 'pending' },
        ],
        history: [
            { date: '2026-03-10', center: 'Red Cross Center', units: 1, bloodType: 'O+' },
            { date: '2025-12-05', center: 'City Blood Bank', units: 1, bloodType: 'O+' },
        ],
        nearbyCenters: [
            { name: 'City Blood Bank', distance: '1.2 km', slots: 12 },
            { name: 'Metro Hospital', distance: '3.5 km', slots: 5 },
            { name: 'Red Cross Center', distance: '4.8 km', slots: 8 },
        ],
        requests: [
            { id: 'req_101', bloodType: 'O+', urgency: 'high', hospital: 'Metro Hospital', status: 'open' },
            { id: 'req_102', bloodType: 'A-', urgency: 'medium', hospital: 'City General', status: 'open' },
        ],
        badges: ['First Donation', 'Hero Donor', 'Consistent Giver'],
    },
    hospital: {
        stats: [
            { label: 'Active Requests', value: '6', icon: '📋' },
            { label: 'Matched Donors', value: '14', icon: '👥' },
            { label: 'Inventory Units', value: '128', icon: '🩸' },
            { label: 'Verified', value: 'Yes', icon: '✅', status: 'success' },
        ],
        inventory: [
            { type: 'O+', units: 24, status: 'adequate' },
            { type: 'O-', units: 8, status: 'low' },
            { type: 'A+', units: 18, status: 'adequate' },
            { type: 'B+', units: 6, status: 'critical' },
        ],
        requests: [
            { id: 'hreq_1', bloodType: 'B+', units: 4, urgency: 'critical', status: 'matching' },
            { id: 'hreq_2', bloodType: 'AB-', units: 2, urgency: 'high', status: 'approved' },
        ],
        matchedDonors: [
            { name: 'Punit C.', bloodType: 'O+', distance: '2 km', match: 98 },
            { name: 'Saimon G.', bloodType: 'A+', distance: '4 km', match: 92 },
        ],
    },
    recipient: {
        stats: [
            { label: 'Active Requests', value: '1', icon: '📋' },
            { label: 'Matched', value: '1', icon: '✅' },
            { label: 'Verification', value: 'Verified', icon: '🛡️', status: 'success' },
            { label: 'Saved Centers', value: '3', icon: '🏥' },
        ],
        requests: [
            { id: 'rreq_1', bloodType: 'A+', units: 2, status: 'matched', hospital: 'Metro Hospital' },
            { id: 'rreq_2', bloodType: 'O-', units: 1, status: 'pending', hospital: 'City General' },
        ],
        matches: [
            { type: 'Donor', name: 'Punit C.', bloodType: 'A+', status: 'confirmed' },
            { type: 'Hospital', name: 'Metro Hospital', bloodType: 'A+', status: 'processing' },
        ],
        saved: ['Metro Hospital', 'City Blood Bank', 'Red Cross Center'],
    },
    blood_bank: {
        stats: [
            { label: 'Total Stock', value: '342', icon: '🩸' },
            { label: 'Pending Verifications', value: '7', icon: '📄' },
            { label: 'Emergency Queue', value: '3', icon: '⚡' },
            { label: 'Fulfillment Rate', value: '94%', icon: '📈' },
        ],
        inventory: [
            { type: 'O+', units: 64, status: 'adequate' },
            { type: 'O-', units: 22, status: 'adequate' },
            { type: 'A+', units: 48, status: 'adequate' },
            { type: 'B+', units: 12, status: 'low' },
            { type: 'AB+', units: 8, status: 'low' },
        ],
        verifications: [
            { id: 'v1', name: 'Sunrise Hospital', role: 'hospital', status: 'pending' },
            { id: 'v2', name: 'Alex M.', role: 'donor', status: 'pending' },
            { id: 'v3', name: 'Regional Blood Center', role: 'blood_bank', status: 'review' },
        ],
        emergencyQueue: [
            { id: 'e1', bloodType: 'B+', units: 6, hospital: 'City General', priority: 1 },
            { id: 'e2', bloodType: 'AB-', units: 2, hospital: 'Metro Hospital', priority: 2 },
        ],
    },
    requests: [
        {
            id: 'req_1',
            bloodType: 'O+',
            units: 2,
            urgency: 'critical',
            status: 'open',
            role: 'hospital',
            hospital: 'Metro Hospital',
            location: 'Downtown Medical District',
            patientName: 'Emergency Case #4421',
            notes: 'Surgery scheduled within 6 hours. O+ or O- preferred.',
            createdAt: '2026-06-22T08:30:00',
            updatedAt: '2026-06-22T08:30:00',
            createdBy: 'Metro Hospital',
            timeline: [
                { status: 'open', label: 'Request Created', timestamp: '2026-06-22T08:30:00', note: 'Emergency blood request submitted' },
            ],
        },
        {
            id: 'req_2',
            bloodType: 'A-',
            units: 1,
            urgency: 'high',
            status: 'accepted',
            role: 'recipient',
            hospital: 'City General',
            location: 'Northside',
            patientName: 'Saimon G.',
            notes: 'Post-operative recovery. Donor matched and en route.',
            createdAt: '2026-06-21T14:00:00',
            updatedAt: '2026-06-21T16:20:00',
            createdBy: 'Saimon G.',
            acceptedBy: 'Punit C.',
            timeline: [
                { status: 'open', label: 'Request Created', timestamp: '2026-06-21T14:00:00', note: 'Blood request submitted' },
                { status: 'accepted', label: 'Donor Accepted', timestamp: '2026-06-21T16:20:00', note: 'Punit C. confirmed availability' },
            ],
        },
        {
            id: 'req_3',
            bloodType: 'B+',
            units: 3,
            urgency: 'medium',
            status: 'fulfilled',
            role: 'hospital',
            hospital: 'Red Cross Center',
            location: 'Eastside',
            patientName: 'Pediatric Ward',
            notes: 'Routine transfusion completed successfully.',
            createdAt: '2026-06-18T09:00:00',
            updatedAt: '2026-06-19T11:45:00',
            createdBy: 'Red Cross Center',
            timeline: [
                { status: 'open', label: 'Request Created', timestamp: '2026-06-18T09:00:00', note: 'Request submitted' },
                { status: 'accepted', label: 'Donor Accepted', timestamp: '2026-06-18T11:30:00', note: 'Donor matched' },
                { status: 'fulfilled', label: 'Fulfilled', timestamp: '2026-06-19T11:45:00', note: 'All units delivered' },
            ],
        },
        {
            id: 'req_4',
            bloodType: 'AB-',
            units: 1,
            urgency: 'low',
            status: 'cancelled',
            role: 'recipient',
            hospital: 'Metro Hospital',
            location: 'Downtown',
            patientName: 'Alex M.',
            notes: 'Cancelled — alternative supply found.',
            createdAt: '2026-06-15T10:00:00',
            updatedAt: '2026-06-15T12:00:00',
            createdBy: 'Alex M.',
            timeline: [
                { status: 'open', label: 'Request Created', timestamp: '2026-06-15T10:00:00', note: 'Request submitted' },
                { status: 'cancelled', label: 'Cancelled', timestamp: '2026-06-15T12:00:00', note: 'Request cancelled by recipient' },
            ],
        },
    ],
};

export const mockLeaderboard = [
    { rank: 1, name: 'Punit C.', points: 4200, donations: 24, badge: '🥇' },
    { rank: 2, name: 'Saimon G.', points: 3850, donations: 21, badge: '🥈' },
    { rank: 3, name: 'Maya R.', points: 3600, donations: 19, badge: '🥉' },
    { rank: 42, name: 'You', points: 1250, donations: 8, badge: '⭐', isCurrentUser: true },
];

export const mockBadges = [
    { id: 'b1', name: 'First Donation', icon: '🩸', earned: true, description: 'Completed your first donation' },
    { id: 'b2', name: 'Hero Donor', icon: '🦸', earned: true, description: 'Responded to an emergency request' },
    { id: 'b3', name: 'Consistent Giver', icon: '📅', earned: true, description: 'Donated 5+ times' },
    { id: 'b4', name: 'Life Saver', icon: '❤️', earned: false, description: 'Save 10 lives through donations' },
    { id: 'b5', name: 'Community Champion', icon: '🏆', earned: false, description: 'Top 10 on leaderboard' },
];

export const mockChats = {
    conversations: [
        { id: 'c1', name: 'Metro Hospital', role: 'hospital', lastMessage: 'Thank you for confirming!', unread: 1 },
        { id: 'c2', name: 'Saimon G.', role: 'recipient', lastMessage: 'Are you available tomorrow?', unread: 0 },
    ],
    messages: {
        c1: [
            { id: 'm1', sender: 'Metro Hospital', content: 'Your donation request has been approved.', timestamp: '2026-06-20T10:00:00' },
            { id: 'm2', sender: 'me', content: 'I can come in at 10 AM tomorrow.', timestamp: '2026-06-20T10:05:00' },
            { id: 'm3', sender: 'Metro Hospital', content: 'Thank you for confirming!', timestamp: '2026-06-20T10:08:00' },
        ],
        c2: [
            { id: 'm4', sender: 'Saimon G.', content: 'Are you available tomorrow?', timestamp: '2026-06-21T14:00:00' },
        ],
    },
};
