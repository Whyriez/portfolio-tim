'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { supabase } from '@/utils/supabase/supabase';
import { motion, AnimatePresence } from 'framer-motion';

type AddProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  memberId?: string;
};

export default function AddProjectModal({ isOpen, onClose, onSuccess, memberId }: AddProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [motivation, setMotivation] = useState(''); 
  const [techStack, setTechStack] = useState('');

  const [competitionName, setCompetitionName] = useState('');
  const [award, setAward] = useState('');
  const [architectureUrl, setArchitectureUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Gambar Utama
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Baru: Gallery (Multiple Images)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handler Gambar Utama
  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handler Gallery (Multiple)
  const handleGalleryChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Fungsi Upload ke Supabase Storage
  const uploadSingleImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('proyek_images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('proyek_images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (!imageFile) {
        alert('Mohon upload gambar proyek utama.');
        setLoading(false);
        return;
      }

      // 1. Upload Gambar Utama
      const finalImageUrl = await uploadSingleImage(imageFile);
      if (!finalImageUrl) throw new Error("Upload gambar utama gagal.");

      // 2. Upload Gallery Images (Paralel)
      let finalGalleryUrls: string[] = [];
      if (galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(file => uploadSingleImage(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        finalGalleryUrls = uploadedUrls.filter(url => url !== null) as string[];
      }

      const techArray = techStack.split(',').map(tech => tech.trim()).filter(Boolean);

      // Auto-Unfeature Logika
      if (isFeatured) {
        await supabase
          .from('projects')
          .update({ is_featured: false })
          .eq('is_featured', true);
      }
      
      // 3. Insert ke database
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            title,
            description,
            motivation: motivation || null,
            tech_stack: techArray,
            image_url: finalImageUrl,
            gallery_urls: finalGalleryUrls,
            demo_url: demoUrl,
            repo_url: repoUrl,
            competition_name: competitionName || null,
            award: award || null,
            architecture_diagram_url: architectureUrl || null,
            is_featured: isFeatured,
          }
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      // 4. Insert Relasi Member
      if (memberId && newProject) {
        const { error: relationError } = await supabase
          .from('member_projects')
          .insert([{ member_id: memberId, project_id: newProject.id }]);

        if (relationError) {
          await supabase.from('projects').delete().eq('id', newProject.id);
          throw relationError;
        }
      }

      // Reset & Sukses
      setTitle(''); setDescription(''); setMotivation(''); setTechStack('');
      setCompetitionName(''); setAward(''); setArchitectureUrl(''); setIsFeatured(false);
      setImageFile(null); setImagePreview(null);
      setGalleryFiles([]); setGalleryPreviews([]);
      setDemoUrl(''); setRepoUrl('');

      onClose();
      onSuccess();

    } catch (error: any) {
      alert('Gagal menyimpan proyek: ' + error.message);
      setLoading(false); 
    }
  };

  // Class styling untuk Dark Mode UI
  const inputStyle = "w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-600";
  const labelStyle = "text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1 block";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl bg-slate-900/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-800 p-8 max-h-[95vh] overflow-y-auto no-scrollbar relative"
        >

          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/50">
            <div>
              <h2 className="text-xl font-bold text-white">Tambah Karya Baru</h2>
              <p className="text-xs text-slate-400 mt-1">Masukkan detail proyek untuk ditampilkan di portofolio.</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Nama Proyek <span className="text-red-500">*</span></label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyle} placeholder="Cth: SARAH Panel Control" />
              </div>
              <div>
                <label className={labelStyle}>Tech Stack</label>
                <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} className={inputStyle} placeholder="Cth: Go, React, Android" />
                <span className="text-[10px] text-slate-500 ml-1 mt-1 block">Pisahkan dengan koma</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full"></div>
              <div className="relative z-10">
                <label className={labelStyle}>Nama Lomba / Event</label>
                <input type="text" value={competitionName} onChange={(e) => setCompetitionName(e.target.value)} className={inputStyle} placeholder="Cth: Hackathon BI 2026" />
              </div>
              <div className="relative z-10">
                <label className={labelStyle}>Penghargaan (Jika Ada)</label>
                <input type="text" value={award} onChange={(e) => setAward(e.target.value)} className={inputStyle} placeholder="Cth: 1st Winner" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer mt-1 mb-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={isFeatured} 
                  onChange={(e) => setIsFeatured(e.target.checked)} 
                  className="w-5 h-5 text-indigo-500 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500/50 focus:ring-offset-slate-900" 
                />
                <span className="text-sm font-semibold text-slate-300">Jadikan Proyek Unggulan (Tampil Paling Atas)</span>
              </label>
            </div>

            {/* UPLOAD GAMBAR UTAMA */}
            <div>
              <label className={labelStyle}>Gambar Proyek Utama <span className="text-red-500">*</span></label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 hover:bg-slate-900/80 hover:border-indigo-500/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center gap-2 min-h-[140px] group"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg shadow-sm" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-400 group-hover:text-indigo-300 transition-colors">Upload Gambar Utama</p>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleMainImageChange} className="hidden" />
            </div>

            {/* UPLOAD GAMBAR GALLERY (MULTIPLE) */}
            <div className="bg-slate-950/30 p-5 rounded-2xl border border-slate-800">
              <label className={labelStyle}>Gallery Proyek (Bisa lebih dari 1 gambar)</label>
              <div className="flex flex-wrap gap-3 mt-3">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-700 group">
                    <img src={preview} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
                
                <div 
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 cursor-pointer transition-colors"
                >
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-[10px] font-bold">Tambah</span>
                </div>
              </div>
              <input type="file" accept="image/*" multiple ref={galleryInputRef} onChange={handleGalleryChange} className="hidden" />
            </div>

            <div>
              <label className={labelStyle}>Deskripsi Tinjauan Proyek</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputStyle} resize-none`} placeholder="Jelaskan masalah dan solusi dari proyek ini..." />
            </div>

            <div>
              <label className={labelStyle}>Mengapa Kami Membangun Ini? (Latar Belakang)</label>
              <textarea rows={3} value={motivation} onChange={(e) => setMotivation(e.target.value)} className={`${inputStyle} resize-none`} placeholder="Cth: Sistem ini dibangun untuk memecahkan masalah X pada instansi Y..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Link Demo (Opsional)</label>
                <input type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} className={inputStyle} placeholder="https://..." />
              </div>
              <div>
                <label className={labelStyle}>Link Repo / GitHub</label>
                <input type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className={inputStyle} placeholder="https://github.com/..." />
              </div>
            </div>
            
            <div>
               <label className={labelStyle}>Link Diagram Arsitektur (Opsional)</label>
               <input type="url" value={architectureUrl} onChange={(e) => setArchitectureUrl(e.target.value)} className={inputStyle} placeholder="URL gambar diagram (opsional)" />
            </div>

            <div className="flex justify-end gap-3 mt-2 pt-6 border-t border-slate-800/50">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                Batal
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_-3px_rgba(79,70,229,0.4)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Menyimpan...
                  </>
                ) : 'Simpan Proyek'}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}