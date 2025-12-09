/**
 * NexalOnboardingPage - Full-screen wizard wrapper
 * 
 * Shows NexalWizard for new users, redirects to editor after completion.
 */

import { useNavigate } from 'react-router-dom';
import { NexalWizard } from './NexalWizard';
import { useCVStoreV2 } from '../../../application/store/v2';

export function NexalOnboardingPage() {
    const navigate = useNavigate();
    const updateField = useCVStoreV2(state => state.updateField);

    const handleComplete = (data: any) => {
        // Populate CV with wizard data
        if (data.firstName) {
            updateField('personal.firstName', data.firstName);
        }
        if (data.lastName) {
            updateField('personal.lastName', data.lastName);
        }
        if (data.email) {
            updateField('personal.contact.email', data.email);
        }
        if (data.phone) {
            updateField('personal.contact.phone', data.phone);
        }
        if (data.jobTitle) {
            updateField('personal.title', data.jobTitle);
        }

        // Mark onboarding as complete
        localStorage.setItem('nexal-onboarding-complete', 'true');

        // Navigate to editor
        navigate('/');
    };

    const handleSkip = () => {
        localStorage.setItem('nexal-onboarding-complete', 'true');
        navigate('/');
    };

    return (
        <NexalWizard
            onComplete={handleComplete}
            onSkip={handleSkip}
        />
    );
}

export default NexalOnboardingPage;
