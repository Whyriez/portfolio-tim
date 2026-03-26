'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/supabase';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Code2, Trophy, Rocket } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/app/page';

export default function TeamMemberProfile() {
  const params = useParams();
  const id = params?.id as string;
  
  const [member, setMember] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemberData() {
      if (!id) return;
      try {
        // 1. Ambil data profil member
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('id', id)
          .single();

        if (memberError) throw memberError;
        setMember(memberData);

        // 2. Ambil data proyek yang dikerjakan oleh member ini
        const { data: relationData, error: relationError } = await supabase
          .from('member_projects')
          .select('projects(*)')
          .eq('member_id', id);

        if (!relationError && relationData) {
          const memberProjects = relationData
            .map((rel: any) => rel.projects)
            .filter(Boolean);
          
          // Urutkan dari yang terbaru
          memberProjects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setProjects(memberProjects);
        }
      } catch (error) {
        console.error("Error fetching member data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMemberData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-indigo-400 font-medium tracking-widest uppercase text-sm">Memuat Profil Kontributor...</p>
      </div>
    </div>
  );

  if (!member) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <h1 className="text-4xl font-bold mb-4">Anggota Tidak Ditemukan</h1>
      <Link href="/" className="px-6 py-3 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
        <ArrowLeft size={18} /> Kembali ke Beranda
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-20">
      
      {/* Navbar Minimalis */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="container mx-auto px-6 h-20 flex items-center">
          <Link href="/#team" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group font-semibold">
            <div className="p-2 bg-slate-800 rounded-full group-hover:bg-indigo-600 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Kembali ke Tim
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION: MEMBER PROFILE --- */}
      <header className="relative pt-32 pb-16 border-b border-slate-800/50">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center max-w-3xl">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ type: "spring", duration: 0.6 }}
            className="relative w-40 h-40 mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full blur-xl opacity-40"></div>
            <img 
              src={member.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback'} 
              alt={member.name}
              className="w-full h-full object-cover rounded-full border-4 border-slate-950 shadow-2xl relative z-10 bg-slate-800"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{member.name}</h1>
            <p className="text-xl text-indigo-400 font-semibold mb-6">{member.role}</p>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              {member.bio || 'Developer yang berfokus pada kualitas dan performa.'}
            </p>

            {member.skills && member.skills.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {member.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-4 py-1.5 bg-slate-800/80 text-slate-300 text-sm font-medium rounded-full border border-slate-700/50 backdrop-blur-md">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-4">
              {member.github_url && (
                <a href={member.github_url} target="_blank" className="px-6 py-3 bg-slate-800/80 hover:bg-white hover:text-slate-900 text-white rounded-xl font-bold transition-colors flex items-center gap-2 border border-slate-700">
                  <GithubIcon size={18} /> GitHub
                </a>
              )}
              {member.linkedin_url && (
                <a href={member.linkedin_url} target="_blank" className="px-6 py-3 bg-slate-800/80 hover:bg-blue-500 hover:text-white hover:border-blue-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2 border border-slate-700">
                  <LinkedinIcon size={18} /> LinkedIn
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* --- MEMBER'S PROJECTS SECTION --- */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Code2 className="text-indigo-400" /> Kontribusi Proyek
          </h2>
          <p className="text-slate-400">Karya-karya yang melibatkan kontribusi dari {member.name}.</p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800/50 max-w-2xl mx-auto">
            <p className="text-slate-500">Belum ada proyek yang ditambahkan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {projects.map((project, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={project.id} 
                className="bg-slate-900/40 border border-slate-800/50 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-colors group flex flex-col"
              >
                <div className="h-48 overflow-hidden relative bg-slate-900">
                  {project.award && (
                    <div className="absolute top-3 right-3 z-10 bg-yellow-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Trophy size={12} /> {project.award}
                    </div>
                  )}
                  <img 
                    src={project.image_url || 'https://via.placeholder.com/400x300'} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    {project.competition_name && (
                      <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">{project.competition_name}</p>
                    )}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{project.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {project.tech_stack?.slice(0, 3).map((tech: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] font-semibold rounded">{tech}</span>
                      ))}
                      {project.tech_stack?.length > 3 && <span className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] font-semibold rounded">+{project.tech_stack.length - 3}</span>}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-800/50">
                    <Link href={`/projects/${project.id}`} className="flex-1 text-center py-2.5 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-400 rounded-lg text-sm font-bold transition-colors">
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}