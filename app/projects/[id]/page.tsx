'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/supabase';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, LayoutTemplate, Trophy, Rocket, Code2, Images } from 'lucide-react';
import { GithubIcon } from '@/app/page';

export default function ProjectDetail() {
  const params = useParams();
  const id = params?.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

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

          {/* Featured Image */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full h-64 md:h-[500px] rounded-[2rem] overflow-hidden border border-slate-700/50 shadow-2xl relative"
          >
            <img 
              src={project.image_url || 'https://via.placeholder.com/1920x1080'} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </header>

      {/* --- CONTENT SECTION --- */}
      <main className="container mx-auto px-6 py-20 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Kolom Kiri: Main Content (Problem, Solution, Architecture, Gallery) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }}
            className="md:col-span-2 space-y-12"
          >
            {/* Tinjauan Proyek */}
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

            {/* Architecture Section */}
            {project.architecture_diagram_url && (
              <section className="pt-8 border-t border-slate-800/50">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <LayoutTemplate className="text-violet-400" /> System Architecture
                </h2>
                <p className="text-slate-400 mb-6">
                  Pendekatan teknis dan arsitektur infrastruktur yang kami gunakan untuk memastikan skalabilitas dan keamanan aplikasi ini:
                </p>
                <div className="rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900 p-4 relative group cursor-pointer">
                  <img 
                    src={project.architecture_diagram_url} 
                    alt="Architecture Diagram" 
                    className="w-full h-auto rounded-xl group-hover:opacity-90 transition-opacity"
                  />
                  <a href={project.architecture_diagram_url} target="_blank" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/40 backdrop-blur-sm rounded-xl">
                    <span className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold flex items-center gap-2">
                      <ExternalLink size={16} /> Lihat Full Resolusi
                    </span>
                  </a>
                </div>
              </section>
            )}

            {/* Gallery Section */}
            {project.gallery_urls && project.gallery_urls.length > 0 && (
              <section className="pt-8 border-t border-slate-800/50">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Images className="text-emerald-400" /> Galeri Sistem
                </h2>
                <p className="text-slate-400 mb-6">
                  Beberapa tangkapan layar antarmuka pengguna dan fitur-fitur dari aplikasi.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.gallery_urls.map((url: string, index: number) => (
                    <a href={url} target="_blank" key={index} className="rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900 h-48 group block relative">
                      <img 
                        src={url} 
                        alt={`${project.title} screenshot ${index + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300"></div>
                    </a>
                  ))}
                </div>
              </section>
            )}

          </motion.div>

          {/* Kolom Kanan: Meta Info & Tech Stack */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
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
              {/* Ini dia implementasi teks dinamis dari kolom motivation */}
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