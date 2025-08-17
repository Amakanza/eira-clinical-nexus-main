import { MainLayout } from '@/components/layout/MainLayout';
import { ClinicalNotesViewer } from '@/components/notes/ClinicalNotesViewer';

const ClinicalNotesViewerPage = () => {
  return (
    <MainLayout currentPath="/notes-viewer">
      <ClinicalNotesViewer />
    </MainLayout>
  );
};

export default ClinicalNotesViewerPage;
