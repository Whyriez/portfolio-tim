'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabase';
import AddProjectModal from '@/components/AddProjectModal';
import EditProjectModal from '@/components/EditProjectModal';
import EditProfileModal from '@/components/EditProfileModal';
import { motion } from 'framer-motion';
import { LogOut, Plus, Trophy, Star, Code2 } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../page';
import Image from 'next/image';

// Tipe Data sesuai skema database
type Member = {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    avatar_url: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    email?: string;
    skills: string[];
    created_at?: string;
};

export interface Project {
    id: string;
    title: string;
    description: string | null;
    tech_stack: string[];

    image_url: string | null;
    demo_url: string | null;
    repo_url: string | null;

    competition_name: string | null;
    award: string | null;

    is_featured: boolean;
    gallery_urls: string[];

    architecture_diagram_url: string | null;
    motivation: string | null;

    created_at?: string;
}

export default function DashboardPage() {
    const [member, setMember] = useState<Member | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const router = useRouter();

    const handleDeleteProject = async (id: string, title: string) => {
        if (!window.confirm(`Yakin ingin menghapus proyek "${title}" secara permanen?`)) return;

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

                // 3. Ambil proyek HANYA milik user ini via member_projects
                const { data: userProjects, error: projectsError } = await supabase
                    .from('member_projects')
                    .select('projects(*)')
                    .eq('member_id', memberData.id);

                if (projectsError) {
                    console.error("Error fetching projects:", projectsError);
                } else if (userProjects) {
                    const myProjects = userProjects
                        .map((mp: any) => mp.projects)
                        .filter((p) => p !== null);

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
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-indigo-400 tracking-widest uppercase">Memuat Workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-12 font-sans relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">

            {/* --- BACKGROUND GLOW EFFECTS --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/10 blur-[120px]"></div>
            </div>

            <div className="relative z-10">
                {/* --- HEADER CLEAN & MODERN --- */}
                <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-tight">SkillSync Workspace</h1>
                            <p className="text-xs text-slate-400 font-medium">Portofolio Control Panel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <p className="text-sm font-medium text-slate-400 hidden md:block">
                            Sistem Utama, <span className="text-white font-bold">{member?.name || 'Anggota'}</span>
                        </p>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"
                        >
                            <LogOut size={16} /> <span className="hidden sm:inline">Keluar</span>
                        </button>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8 mt-4">

                    {/* --- KOLOM KIRI: PROFIL SAYA (Lebar 4 Kolom) --- */}
                    <section className="xl:col-span-4 h-fit">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-slate-800/60 flex flex-col items-center text-center relative overflow-hidden"
                        >
                            {/* Aksen background atas */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600/40 to-violet-600/40 opacity-50"></div>
                            <div className="absolute top-0 left-0 w-full h-32 bg-slate-950/20 backdrop-blur-sm"></div>

                            <div className="relative w-32 h-32 mt-6 mb-4">
                                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-50"></div>
                                <img
                                    src={member?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                                    alt={member?.name}
                                    className="w-full h-full rounded-full object-cover border-4 border-slate-900 shadow-xl relative z-10 bg-slate-800"
                                />
                            </div>

                            <h2 className="text-2xl font-extrabold text-white relative z-10">{member?.name}</h2>
                            <span className="px-4 py-1.5 mt-2 text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full relative z-10">
                                {member?.role}
                            </span>

                            <p className="w-full mt-6 text-sm text-slate-400 leading-relaxed text-left border-t border-slate-800/50 pt-6">
                                {member?.bio || 'Belum ada bio singkat. Tambahkan bio agar juri mengenal Anda lebih baik.'}
                            </p>

                            {/* Tags Skill */}
                            {member?.skills && member.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4 justify-start w-full">
                                    {member.skills.map((skill, i) => (
                                        <span key={i} className="px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="w-full grid grid-cols-2 gap-3 mt-8">
                                <a href={member?.github_url || '#'} target="_blank" className="py-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 text-sm font-semibold text-slate-300 hover:bg-white hover:text-slate-900 transition-all flex justify-center items-center gap-2">
                                    <GithubIcon size={16} /> GitHub
                                </a>
                                <a href={member?.linkedin_url || '#'} target="_blank" className="py-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 text-sm font-semibold text-slate-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all flex justify-center items-center gap-2">
                                    <LinkedinIcon size={16} /> LinkedIn
                                </a>
                            </div>

                            <button
                                onClick={() => setIsProfileModalOpen(true)}
                                className="w-full mt-4 py-3 text-sm font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white rounded-xl transition-colors"
                            >
                                Edit Profil Publik
                            </button>
                        </motion.div>
                    </section>

                    {/* --- KOLOM KANAN: PROYEK TIM (Lebar 8 Kolom) --- */}
                    <section className="xl:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-slate-800/60"
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Karya & Proyek</h2>
                                    <p className="text-sm text-slate-400 mt-1">Kelola portofolio sistem yang Anda kembangkan.</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <Plus size={18} /> Tambah Proyek
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {projects.length === 0 && (
                                    <div className="md:col-span-2 p-12 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/30 text-center flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                                            <Code2 className="text-slate-500" size={32} />
                                        </div>
                                        <p className="text-slate-300 font-bold text-lg">Belum ada karya</p>
                                        <p className="text-slate-500 text-sm mt-1 max-w-sm">Klik tombol tambah proyek untuk mulai mengunggah karya terbaik Anda ke portofolio tim.</p>
                                    </div>
                                )}

                                {projects.map((project) => (
                                    <div key={project.id} className="group flex flex-col bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 relative">

                                        {/* Badge Unggulan / Award */}
                                        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                                            {project.is_featured && (
                                                <span className="bg-indigo-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1 backdrop-blur-md">
                                                    <Star size={12} fill="currentColor" /> Spotlight
                                                </span>
                                            )}
                                            {project.award && (
                                                <span className="bg-yellow-500/90 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1 backdrop-blur-md">
                                                    <Trophy size={12} /> {project.award}
                                                </span>
                                            )}
                                        </div>

                                        <div className="relative h-48 overflow-hidden bg-slate-900">
                                            <img
                                                src={project.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
                                                alt={project.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80"></div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-grow relative z-10 -mt-8">
                                            <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors drop-shadow-md">{project.title}</h3>
                                            <p className="text-sm text-slate-400 mt-2 line-clamp-2 flex-grow">{project.description}</p>

                                            <div className="flex flex-wrap gap-1.5 mt-4">
                                                {project.tech_stack.slice(0, 4).map(tech => (
                                                    <span key={tech} className="px-2 py-1 text-[10px] font-semibold tracking-wide rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.tech_stack.length > 4 && (
                                                    <span className="px-2 py-1 text-[10px] font-semibold tracking-wide rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                                                        +{project.tech_stack.length - 4}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-800/50">
                                                <button
                                                    onClick={() => setEditingProject(project)}
                                                    className="py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30 border border-transparent transition-colors"
                                                >
                                                    Edit Karya
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProject(project.id, project.title)}
                                                    className="py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white transition-colors border border-transparent"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </section>
                </main>
            </div>

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