'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabase';
import AddProjectModal from '@/components/AddProjectModal';
import EditProjectModal from '@/components/EditProjectModal';
import EditProfileModal from '@/components/EditProfileModal';

// Tipe Data sesuai skema database
type Member = {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    avatar_url: string | null;
    github_url: string | null;
    linkedin_url: string | null;
};

type Project = {
    id: string;
    title: string;
    description: string | null;
    tech_stack: string[];
    image_url: string | null;
    demo_url: string | null;
    repo_url: string | null;
    created_at?: string;
};

export default function DashboardPage() {
    const [member, setMember] = useState<Member | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const router = useRouter();

    const handleDeleteProject = async (id: string, title: string) => {
        if (!window.confirm(`Yakin ingin menghapus proyek "${title}"?`)) return;

        const { error } = await supabase.from('projects').delete().eq('id', id);

        if (error) {
            alert('Gagal menghapus: ' + error.message);
        } else {
            setProjects(projects.filter(p => p.id !== id));
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            // 1. Cek User login
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                router.push('/login');
                return;
            }

            // 2. Ambil profil Member
            const { data: memberData, error: memberError } = await supabase
                .from('members')
                .select('*')
                .eq('email', user.email)
                .single();

            if (memberError) {
                console.error("Error fetching member:", memberError);
            } else if (memberData) {
                setMember(memberData);

                // 3. PERBAIKAN LOGIKA: Ambil proyek HANYA milik user ini via member_projects
                const { data: userProjects, error: projectsError } = await supabase
                    .from('member_projects')
                    .select('projects(*)')
                    .eq('member_id', memberData.id);

                if (projectsError) {
                    console.error("Error fetching projects:", projectsError);
                } else if (userProjects) {
                    // Supabase mereturn array of object { projects: {...} }
                    // Kita map & bersihkan datanya
                    const myProjects = userProjects
                        .map((mp: any) => mp.projects)
                        .filter((p) => p !== null); // Filter null jika ada relasi putus

                    // Urutkan dari yang terbaru
                    myProjects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setProjects(myProjects);
                }
            }
            setLoading(false);
        };

        fetchDashboardData();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500">Memuat ruang kerja...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 font-sans">

            {/* --- HEADER CLEAN & MODERN --- */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-inner">
                        S
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">SkillSync Workspace</h1>
                        <p className="text-xs text-slate-500 font-medium">Portofolio Control Panel</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <p className="text-sm font-medium text-slate-600 hidden md:block">
                        Halo, <span className="text-slate-900 font-bold">{member?.name || 'Anggota'}</span>
                    </p>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        Keluar
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* --- KOLOM KIRI: PROFIL SAYA (Lebar 4 Kolom) --- */}
                <section className="xl:col-span-4 h-fit">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
                        {/* Aksen background atas */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

                        <img
                            src={member?.avatar_url || 'https://placehold.co/600x400'}
                            alt={member?.name}
                            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md relative z-10 mt-6 mb-4 bg-white"
                        />
                        <h2 className="text-xl font-extrabold text-slate-900">{member?.name}</h2>
                        <span className="px-3 py-1 mt-2 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 rounded-full">
                            {member?.role}
                        </span>

                        <p className="w-full mt-6 text-sm text-slate-600 leading-relaxed text-left border-t border-slate-100 pt-6">
                            {member?.bio || 'Belum ada bio singkat. Tambahkan bio agar juri mengenal Anda.'}
                        </p>

                        <div className="w-full grid grid-cols-2 gap-3 mt-6">
                            <a href={member?.github_url || '#'} target="_blank" className="py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex justify-center items-center gap-2">
                                GitHub
                            </a>
                            <a href={member?.linkedin_url || '#'} target="_blank" className="py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex justify-center items-center gap-2">
                                LinkedIn
                            </a>
                        </div>

                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="w-full mt-4 py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                            Edit Profil
                        </button>
                    </div>
                </section>

                {/* --- KOLOM KANAN: PROYEK TIM (Lebar 8 Kolom) --- */}
                <section className="xl:col-span-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Karya & Proyek</h2>
                                <p className="text-sm text-slate-500 mt-1">Kelola portofolio yang akan ditampilkan di halaman tim.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Tambah Proyek
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {projects.length === 0 && (
                                <div className="md:col-span-2 p-12 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center flex flex-col items-center justify-center">
                                    <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    <p className="text-slate-600 font-medium text-lg">Belum ada karya</p>
                                    <p className="text-slate-500 text-sm mt-1">Klik tombol tambah proyek untuk mulai memamerkan karya terbaik Anda.</p>
                                </div>
                            )}

                            {projects.map((project) => (
                                <div key={project.id} className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
                                    <div className="relative h-48 overflow-hidden bg-slate-100">
                                        <img
                                            src={project.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
                                            alt={project.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                                        <p className="text-sm text-slate-500 mt-2 line-clamp-2 flex-grow">{project.description}</p>

                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {project.tech_stack.map(tech => (
                                                <span key={tech} className="px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100">
                                            <button
                                                onClick={() => setEditingProject(project)}
                                                className="py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                            >
                                                Edit Data
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(project.id, project.title)}
                                                className="py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* PENTING: Passing memberId ke AddProjectModal agar relasi tabelnya jalan */}
            <AddProjectModal
                isOpen={isModalOpen}
                memberId={member?.id}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    window.location.reload();
                }}
            />
            <EditProjectModal
                isOpen={!!editingProject}
                project={editingProject}
                onClose={() => setEditingProject(null)}
                onSuccess={() => {
                    window.location.reload();
                }}
            />

            <EditProfileModal
                isOpen={isProfileModalOpen}
                member={member}
                onClose={() => setIsProfileModalOpen(false)}
                onSuccess={() => {
                    window.location.reload();
                }}
            />
        </div>
    );
}