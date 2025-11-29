import { pdf } from '@react-pdf/renderer';
import type { CVProfile } from '../../../domain/entities/cv';
import { mapProfileToScv } from '../../../domain/scv/mapper';
import { InfinityDocument } from './InfinityRenderer';


export const InfinityService = {
    async generatePdfBlob(profile: CVProfile): Promise<Blob> {
        // 1. Map Profile -> SCV
        const scvDocument = mapProfileToScv(profile);

        // 2. Render SCV -> PDF Blob
        // We need to pass the component as a React Element
        const blob = await pdf(<InfinityDocument document={scvDocument} />).toBlob();

        return blob;
    },
};
