import type {MetadataRoute} from 'next';
import {projectInfo} from '@/project-info';
export default function manifest():MetadataRoute.Manifest{return{id:'/',name:projectInfo.title,short_name:projectInfo.title.slice(0,16),description:projectInfo.summary,start_url:'/',display:'standalone',background_color:'#f8fafc',theme_color:'#082f49',lang:projectInfo.locale,dir:projectInfo.direction,icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]};}
