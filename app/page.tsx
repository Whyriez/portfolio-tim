'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/supabase';
import { ExternalLink, Code2, Users, Rocket } from 'lucide-react';

const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
);

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
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
        // Ambil data anggota & urutkan berdasarkan nama
        const { data: membersData } = await supabase
          .from('members')
          .select('*')
          .order('name', { ascending: true });

        // Ambil data proyek & urutkan berdasarkan yang terbaru
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        // Gunakan Set untuk memastikan tidak ada ID duplikat (hanya untuk jaga-jaga)
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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl mb-4"></div>
        <p className="text-slate-400 font-medium">Memuat Mahakarya...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50 blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-purple-50 blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8 animate-bounce">
            <Rocket size={14} /> Lomba Hackathon X DIGDAYA 2026 - Bank Indonesia
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            Building the Future <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              One Line at a Time.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed mb-10">
            Kami adalah <strong>Tim SkillSync</strong>. Sekumpulan pengembang yang berdedikasi menciptakan solusi digital inovatif melalui kode yang bersih dan desain yang intuitif.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#projects" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95">
              Lihat Project
            </a>
            <a href="#team" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95">
              Mengenal Tim
            </a>
          </div>
        </div>
      </section>

      {/* --- STATS / TECH --- */}
      <section className="container mx-auto px-6 -mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Users className="text-indigo-600" />, title: `${members.length} Member`, desc: "Ahli di bidang masing-masing" },
            { icon: <Code2 className="text-violet-600" />, title: `${projects.length} Proyek`, desc: "Selesai dikerjakan & Live" },
            { icon: <Rocket className="text-fuchsia-600" />, title: "Agile", desc: "Pengembangan cepat & terukur" },
          ].map((item, i) => (
            <div key={i} className="p-8 bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">{item.icon}</div>
              <h3 className="font-bold text-xl mb-1">{item.title}</h3>
              <p className="text-slate-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- TEAM SECTION --- */}
      <section id="team" className="py-32 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">The Minds Behind</h2>
            <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {members.map((member) => (
              <div key={member.id} className="group relative bg-white rounded-[32px] p-8 border border-slate-100 hover:border-indigo-200 transition-all duration-500 shadow-sm hover:shadow-xl">
                <div className="relative w-24 h-24 mb-6 mx-auto">
                  <img
                    src={member.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-3xl rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-md"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{member.name}</h3>
                  <p className="text-indigo-600 font-semibold text-sm mb-4">{member.role}</p>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 italic">"{member.bio || 'Developer yang berfokus pada kualitas dan performa.'}"</p>

                  <div className="flex justify-center gap-3">
                    {member.github_url && (
                      <a href={member.github_url} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                        <GithubIcon size={18} />
                      </a>
                    )}
                    {member.linkedin_url && (
                      <a href={member.linkedin_url} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                        <LinkedinIcon size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PROJECTS SECTION --- */}
      <section id="projects" className="py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Featured Projects</h2>
              <p className="text-slate-500 max-w-md">Karya-karya terbaik yang telah kami selesaikan dengan teknologi terkini.</p>
            </div>
            <div className="h-px flex-1 bg-slate-100 mx-8 hidden md:block"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="group flex flex-col md:flex-row bg-white rounded-[32px] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500">
                <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
                  <img
                    src={project.image_url || 'https://via.placeholder.com/600x400'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={project.title}
                  />
                </div>
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech_stack?.map((tech: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-lg">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{project.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      {project.description || 'Deskripsi proyek belum ditambahkan.'}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    {project.demo_url && (
                      <a href={project.demo_url} target="_blank" className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
                        Live Demo <ExternalLink size={14} />
                      </a>
                    )}
                    {project.repo_url && (
                      <a href={project.repo_url} target="_blank" className="flex items-center gap-2 text-slate-600 font-bold text-sm hover:underline">
                        Repository <Github size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 border-t border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-6">
            S
          </div>
          <p className="text-slate-400 text-sm">
            © 2026 Tim SkillSync. Dibuat dengan semangat untuk kemajuan teknologi.
          </p>
        </div>
      </footer>

    </div>
  );
}