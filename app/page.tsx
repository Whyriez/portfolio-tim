'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/supabase';
import { motion } from 'framer-motion';

import { ExternalLink, Code2, Users, Rocket, Trophy, Star, ArrowRight, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';

export const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
);

export const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
);

export default function LandingPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: membersData } = await supabase
          .from('members')
          .select('*')
          .order('name', { ascending: true });

        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        const uniqueProjects = Array.from(new Map(projectsData?.map(item => [item.id, item])).values());

        setMembers(membersData || []);
        setProjects(uniqueProjects || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-indigo-400 font-medium tracking-widest uppercase text-sm">Inisiasi Mahakarya...</p>
      </div>
    </div>
  );

  // Ambil 1 proyek unggulan (is_featured = true) atau ambil proyek pertama sebagai fallback
  const featuredProject = projects.find(p => p.is_featured) || projects[0];
  // Sisa proyek untuk ditampilkan di grid bawah
  const regularProjects = projects.filter(p => p.id !== featuredProject?.id);

  return (
    <div className="bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">

      {/* --- BACKGROUND GLOW EFFECTS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px]"></div>
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[80%] h-[20%] rounded-full bg-blue-900/10 blur-[150px]"></div>
      </div>

      <div className="relative z-10">
        {/* --- HERO SECTION --- */}
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-16">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md"
            >
              <Trophy size={14} className="text-yellow-400" />
              Lomba Hackathon X DIGDAYA 2026 - Bank Indonesia
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-5xl md:text-8xl font-extrabold tracking-tight text-white mb-6 leading-tight"
            >
              Building the Future <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400">
                One Line at a Time.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed mb-12"
            >
              Kami adalah <strong className="text-white">Tim SkillSync</strong>. Sekumpulan pengembang spesialis yang berdedikasi menciptakan solusi digital inovatif, tangguh, dan memenangkan kompetisi.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-5"
            >
              <a href="#featured" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] transition-all active:scale-95 flex items-center gap-2 group">
                Lihat Karya Terbaik <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#team" className="px-8 py-4 bg-slate-900/50 hover:bg-slate-800 text-slate-300 border border-slate-700/50 rounded-2xl font-bold backdrop-blur-md transition-all active:scale-95">
                Mengenal Tim
              </a>
            </motion.div>
          </div>
        </section>

        {/* --- STATS SECTION --- */}
        <section className="container mx-auto px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: <Users size={24} className="text-blue-400" />, title: `${members.length} Core Members`, desc: "Ahli di bidang spesifik masing-masing" },
              { icon: <Trophy size={24} className="text-yellow-400" />, title: `${projects.filter(p => p.award).length} Awards Won`, desc: "Prestasi yang telah diraih tim" },
              { icon: <Code2 size={24} className="text-emerald-400" />, title: `${projects.length} Total Projects`, desc: "Sistem kompleks yang diselesaikan" },
            ].map((item, i) => (
              <div key={i} className="p-8 bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-3xl hover:bg-slate-800/50 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="font-bold text-2xl text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* --- FEATURED BENTO GRID --- */}
        {featuredProject && (
          <section id="featured" className="py-24 relative">
            <div className="container mx-auto px-6">
              <div className="mb-12">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3">
                  <Star className="text-yellow-400" size={36} fill="currentColor" /> Spotlight
                </h2>
                <p className="text-slate-400 text-lg">Proyek unggulan dan kebanggaan tim kami.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">

                {/* Main Feature Card - DITAMBAHKAN min-h-[500px] md:min-h-0 UNTUK MOBILE FIX */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="md:col-span-2 md:row-span-2 relative rounded-[2rem] overflow-hidden group border border-slate-700/50 min-h-[500px] md:min-h-0"
                >
                  <img
                    src={featuredProject.image_url || 'https://via.placeholder.com/800x600'}
                    alt={featuredProject.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>

                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                    {featuredProject.award && (
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-sm font-bold mb-4 backdrop-blur-md">
                        <Trophy size={16} /> {featuredProject.award}
                      </div>
                    )}
                    {featuredProject.competition_name && (
                      <div className="text-indigo-300 font-semibold mb-2">{featuredProject.competition_name}</div>
                    )}
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">{featuredProject.title}</h3>
                    <p className="text-slate-300 text-lg max-w-xl mb-6 line-clamp-2">
                      {featuredProject.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {featuredProject.demo_url && (
                        <a href={featuredProject.demo_url} target="_blank" className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2">
                          Live Demo <ExternalLink size={16} />
                        </a>
                      )}
                      {featuredProject.architecture_diagram_url && (
                        <a href={featuredProject.architecture_diagram_url} target="_blank" className="px-6 py-3 bg-slate-800/80 text-white backdrop-blur-md border border-slate-700 rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center gap-2">
                          <LayoutTemplate size={16} /> System Architecture
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Tech Stack Card */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="bg-slate-900/60 backdrop-blur-md rounded-[2rem] p-8 border border-slate-800/50 flex flex-col justify-center"
                >
                  <Rocket className="text-indigo-400 mb-4" size={32} />
                  <h3 className="text-2xl font-bold text-white mb-2">Tech Stack</h3>
                  <p className="text-slate-400 mb-6 text-sm">Teknologi yang mendayai sistem ini.</p>
                  <div className="flex flex-wrap gap-2">
                    {featuredProject.tech_stack?.map((tech: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-sm font-semibold">
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Team Info Card */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 backdrop-blur-md rounded-[2rem] p-8 border border-indigo-500/20 flex flex-col justify-center relative overflow-hidden"
                >
                  <div className="absolute -right-6 -top-6 text-white/5">
                    <Code2 size={120} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Repo & Code</h3>
                  <p className="text-indigo-200/70 mb-6 text-sm relative z-10">Buka akses kode sumber untuk melihat kualitas struktur kode kami.</p>
                  {featuredProject.repo_url ? (
                    <a href={featuredProject.repo_url} target="_blank" className="w-full py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 relative z-10">
                      <GithubIcon size={18} /> View Source Code
                    </a>
                  ) : (
                    <div className="w-full py-3 bg-slate-800/50 text-slate-500 rounded-xl font-bold text-center border border-slate-700/50 cursor-not-allowed">Private Repository</div>
                  )}
                </motion.div>

              </div>
            </div>
          </section>
        )}

        {/* --- OTHER PROJECTS SECTION --- */}
        {regularProjects.length > 0 && (
          <section className="py-20">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold text-white mb-10">Karya Lainnya</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularProjects.map((project, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    key={project.id}
                    className="bg-slate-900/40 border border-slate-800/50 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-colors group flex flex-col"
                  >
                    <div className="h-48 overflow-hidden relative">
                      {project.award && (
                        <div className="absolute top-3 right-3 z-10 bg-yellow-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <Trophy size={12} /> {project.award}
                        </div>
                      )}
                      <img
                        src={project.image_url || 'https://via.placeholder.com/400x300'}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                        <Link href={`/projects/${project.id}`} className="flex-1 text-center py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-indigo-500/25">
                          Baca Case Study Lengkap
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- TEAM SECTION --- */}
        <section id="team" className="py-24 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">The Brains Behind</h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {members.map((member, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  key={member.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all duration-500 group"
                >
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full blur-xl opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>
                    <img
                      src={member.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                      alt={member.name}
                      className="relative w-full h-full object-cover rounded-full border-4 border-slate-900 shadow-xl"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-indigo-400 font-semibold text-sm mb-4">{member.role}</p>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 italic">"{member.bio || 'Developer yang berfokus pada kualitas dan performa.'}"</p>

                    {/* Menampilkan Array Skills (Data Baru) */}
                    {member.skills && member.skills.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {member.skills.map((skill: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-center gap-3">
                      {member.github_url && (
                        <a href={member.github_url} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all">
                          <GithubIcon size={18} />
                        </a>
                      )}
                      {member.linkedin_url && (
                        <a href={member.linkedin_url} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-500 hover:text-white transition-all">
                          <LinkedinIcon size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="py-12 border-t border-slate-800/50 bg-slate-950 relative z-10">
          <div className="container mx-auto px-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-xl flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-lg shadow-indigo-500/20">
              S
            </div>
            <p className="text-slate-500 text-sm">
              © 2026 Tim SkillSync. Dibuat dengan presisi dan ambisi.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}