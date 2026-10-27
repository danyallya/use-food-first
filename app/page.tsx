'use client';
import { LuLayers, LuDatabase, LuWifiOff, LuArrowUpRight } from 'react-icons/lu';
import { projectInfo } from '@/project-info';
const copy = {"badge":"Foundation ready","warning":"The technical shell is in place; product workflows are not implemented yet.","task":"Active task","storage":"Storage","local":"The local data layer is prepared for the next slice","offline":"Offline shell","shell":"The page and static files are available after the first visit","queued":"Domain records and synchronization are queued for later tasks"};
export default function HomePage() {
 return <main className="min-h-screen px-5 py-8 sm:px-10 sm:py-14"><div className="mx-auto max-w-5xl">
 <header className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5"><a href="https://github.com/danyallya/offline-dev-vault" target="_blank" rel="noreferrer">Offline Dev Vault <LuArrowUpRight className="inline" aria-hidden="true" /></a><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs">{copy.badge}</span></header>
 <section className="grid gap-10 py-14 md:grid-cols-[1.2fr_0.8fr]"><div><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100"><LuLayers size={24} aria-hidden="true" /></div>
 <p className="text-sm text-sky-700">{projectInfo.scope} · {projectInfo.locale}</p><h1 className="mt-3 text-4xl font-semibold sm:text-6xl">{projectInfo.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{projectInfo.summary}</p>
 <p className="mt-5 text-sm leading-7 text-slate-500">{copy.warning}</p><div className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-5"><p className="text-xs font-semibold">{copy.task}</p><p className="mt-2 leading-7">{projectInfo.firstTask}</p></div></div>
 <aside className="grid content-start gap-4"><article className="rounded-2xl border p-5"><LuDatabase className="mb-4" aria-hidden="true" /><h2 className="font-semibold">{copy.storage}</h2><p className="mt-2 text-sm leading-6">{copy.local}</p></article>
 <article className="rounded-2xl border p-5"><LuWifiOff className="mb-4" aria-hidden="true" /><h2 className="font-semibold">{copy.offline}</h2><p className="mt-2 text-sm leading-6">{copy.shell}</p></article><p className="text-xs leading-5 text-slate-500">{copy.queued}</p></aside></section>
 <footer className="border-t pt-5 text-xs text-slate-500">Built with <a className="underline" href="https://github.com/danyallya/offline-dev-vault" target="_blank" rel="noreferrer">danyallya/offline-dev-vault</a></footer></div></main>;
}
