
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import type { CVProfile } from '../../../domain/entities/cv';
import { mapProfileToScv } from '../../../domain/scv/mapper';
import { InfinityDocument } from './InfinityRenderer';


export const InfinityService = {
    async generateBlob(profile: CVProfile, language: string = 'en'): Promise<Blob> {
        try {
            const scv = mapProfileToScv(profile, language);
            return await pdf(<InfinityDocument scv={scv} />).toBlob();
        } catch (error) {
            console.error("Infinity Engine Generation Error:", error);
            throw error;
        }
    }
};
