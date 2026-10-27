import type {Metadata,Viewport} from 'next';
import type {ReactNode} from 'react';
import './globals.css';
import {OfflineRegistration} from './offline-registration';
import {projectInfo} from '@/project-info';
export const metadata:Metadata={title:projectInfo.title,description:projectInfo.summary,applicationName:projectInfo.title,manifest:'/manifest.webmanifest',icons:{icon:'/icon.svg'}};
export const viewport:Viewport={themeColor:'#082f49'};
export default function RootLayout({children}:{children:ReactNode}){return <html lang={projectInfo.locale} dir={projectInfo.direction}><body><OfflineRegistration/>{children}</body></html>;}
