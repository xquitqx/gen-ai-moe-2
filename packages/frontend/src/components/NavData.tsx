//libraries to import icons
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { ReactNode } from 'react';

// the type for each sidebar item
export interface SidebarItem {
  title: string;
  path: string;
  icon: ReactNode;
  cName: string;
  subItems?: { title: string; path: string }[];
}

export const NavData: SidebarItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <AiIcons.AiOutlineDashboard />,
    cName: 'nav-text',
  },
  {
    title: 'Upload Section Exams',
    path: '/AdminUploadExams',
    icon: <AiIcons.AiOutlineCloudUpload />,
    cName: 'nav-text',
    subItems: [
      { title: 'Listening', path: '/UploadListening' },
      { title: 'Reading', path: '/UploadReading' },
      { title: 'Writing', path: '/UploadWriting' },
      { title: 'Speaking', path: '/UploadSpeaking' },
    ],
  },
  {
    title: 'Upload Full Exams',
    path: '/FullExamUpload',
    icon: <AiIcons.AiOutlineCloudUpload />,
    cName: 'nav-text',
  },
  {
    title: 'Generate Exams',
    path: '/generate-exams',
    icon: <AiIcons.AiOutlineFileText />,
    cName: 'nav-text',
  },

  {
    title: 'Messages',
    path: '/messages',
    icon: <FaIcons.FaEnvelopeOpenText />,
    cName: 'nav-text',
  },
];
