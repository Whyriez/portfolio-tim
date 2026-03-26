'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/supabase';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, LayoutTemplate, Trophy, Rocket, Code2, Images, X, User } from 'lucide-react';
import { GithubIcon } from '@/app/page';

export default function ProjectDetail() {
  const params = useParams();
  const id = params?.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [authors, setAuthors] = useState<any[]>([]); // STATE BARU: Untuk menyimpan data pembuat karya
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjectData() {
      if (!id) return;
      try {
        // 1. Ambil Data Proyek
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        // 2. Ambil Data Anggota (Authors) melalui tabel relasi member_projects
        const { data: relationData, error: relationError } = await supabase
          .from('member_projects')
          .select('members(*)')
          .eq('project_id', id);

        if (!relationError && relationData) {
          // Supabase akan mengembalikan array object { members: { ...data } }
          const fetchedAuthors = relationData.map((rel: any) => rel.members).filter(Boolean);
          setAuthors(fetchedAuthors);
        }

      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectData();
  }, [id]);

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-indigo-400 font-medium tracking-widest uppercase text-sm">Memuat Detail Arsitektur...</p>
      </div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <h1 className="text-4xl font-bold mb-4">Proyek Tidak Ditemukan</h1>
      <Link href="/" className="px-6 py-3 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
        <ArrowLeft size={18} /> Kembali ke Beranda
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-20">
      
      {/* --- POPUP LIGHTBOX --- */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)} 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 cursor-zoom-out"
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 bg-slate-900/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full flex items-center justify-center transition-colors border border-slate-700/50 backdrop-blur-md"
            >
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              src={selectedImage} 
              alt="Gambar diperbesar" 
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar Minimalis */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="container mx-auto px-6 h-20 flex items-center">
          <Link href="/#projects" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group font-semibold">
            <div className="p-2 bg-slate-800 rounded-full group-hover:bg-indigo-600 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Kembali ke Portofolio
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0 z-0">
          <img 
            src={project.image_url || 'https://via.placeholder.com/1920x1080'} 
            alt="Background" 
            className="w-full h-full object-cover opacity-10 blur-xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex flex-wrap gap-3 mb-6">
              {project.award && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-bold backdrop-blur-md">
                  <Trophy size={16} /> {project.award}
                </div>
              )}
              {project.competition_name && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-bold backdrop-blur-md">
                  <Rocket size={16} /> {project.competition_name}
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              {project.title}
            </h1>

            <div className="flex flex-wrap gap-4 mb-10">
              {project.demo_url && (
                <a href={project.demo_url} target="_blank" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] transition-all flex items-center gap-2">
                  Live Application <ExternalLink size={18} />
                </a>
              )}
              {project.repo_url && (
                <a href={project.repo_url} target="_blank" className="px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-white backdrop-blur-md border border-slate-700 rounded-xl font-bold transition-all flex items-center gap-2">
                  <GithubIcon size={18} /> Source Code
                </a>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            onClick={() => setSelectedImage(project.image_url)}
            className="w-full h-64 md:h-[500px] rounded-[2rem] overflow-hidden border border-slate-700/50 shadow-2xl relative group cursor-zoom-in"
          >
            <img 
              src={project.image_url || 'https://via.placeholder.com/1920x1080'} 
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/20 backdrop-blur-[2px]">
               <span className="px-4 py-2 bg-slate-900/80 text-white rounded-lg font-bold text-sm">Lihat Gambar</span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* --- CONTENT SECTION --- */}
      <main className="container mx-auto px-6 py-20 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Kolom Kiri: Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }}
            className="md:col-span-2 space-y-12"
          >
            <section>
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Code2 className="text-indigo-400" /> Tinjauan Proyek
              </h2>
              <div className="prose prose-invert prose-lg max-w-none text-slate-400">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {project.description || 'Deskripsi proyek belum ditambahkan.'}
                </p>
              </div>
            </section>

            {project.architecture_diagram_url && (
              <section className="pt-8 border-t border-slate-800/50">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <LayoutTemplate className="text-violet-400" /> System Architecture
                </h2>
                <p className="text-slate-400 mb-6">
                  Pendekatan teknis dan arsitektur infrastruktur yang kami gunakan untuk memastikan skalabilitas dan keamanan aplikasi ini:
                </p>
                <div 
                  className="rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900 p-4 relative group cursor-zoom-in"
                  onClick={() => setSelectedImage(project.architecture_diagram_url)}
                >
                  <img 
                    src={project.architecture_diagram_url} 
                    alt="Architecture Diagram" 
                    className="w-full h-auto rounded-xl group-hover:opacity-60 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/40 backdrop-blur-sm rounded-xl">
                    <span className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold flex items-center gap-2">
                      <ExternalLink size={16} /> Lihat Skema Penuh
                    </span>
                  </div>
                </div>
              </section>
            )}

            {project.gallery_urls && project.gallery_urls.length > 0 && (
              <section className="pt-8 border-t border-slate-800/50">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Images className="text-emerald-400" /> Dokumentasi Karya
                </h2>
                <p className="text-slate-400 mb-6">
                  Beberapa tangkapan layar lainnya.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.gallery_urls.map((url: string, index: number) => (
                    <div 
                      key={index} 
                      onClick={() => setSelectedImage(url)}
                      className="rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900 h-48 group block relative cursor-zoom-in"
                    >
                      <img 
                        src={url} 
                        alt={`${project.title} screenshot ${index + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/40 backdrop-blur-sm">
                        <span className="bg-slate-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-md backdrop-blur-md">Perbesar</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>

          {/* Kolom Kanan: Meta Info, Authors, Tech Stack */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            
            {/* KARTU BARU: DIKERJAKAN OLEH (AUTHORS) */}
            {authors.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-8 backdrop-blur-md shadow-xl">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <User className="text-blue-400" size={20} /> Kontributor
                </h3>
                <div className="flex flex-col gap-4">
                  {authors.map((author, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50">
                      <img 
                        src={author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback'} 
                        alt={author.name} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/30"
                      />
                      <div>
                        <p className="text-slate-200 font-bold text-sm">{author.name}</p>
                        <p className="text-indigo-400 text-xs font-medium">{author.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6">Teknologi Inti</h3>
              <div className="flex flex-col gap-3">
                {project.tech_stack?.map((tech: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="font-semibold text-slate-200">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/20 to-violet-900/20 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-indigo-300 mb-4">Mengapa Kami Membangun Ini?</h3>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {project.motivation || 'Sebagai bagian dari dedikasi tim, proyek ini dirancang khusus untuk memenuhi standar kompetisi tingkat tinggi, menitikberatkan pada performa, UX yang mulus, dan kebersihan kode.'}
              </p>
            </div>
            
          </motion.div>

        </div>
      </main>

    </div>
  );
}