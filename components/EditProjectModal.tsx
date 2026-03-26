'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { supabase } from '@/utils/supabase/supabase';

type Project = {
  id: string;
  title: string;
  description: string | null;
  tech_stack: string[];
  image_url: string | null;
  demo_url: string | null;
  repo_url: string | null;
};

type EditProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project | null;
};

export default function EditProjectModal({ isOpen, onClose, onSuccess, project }: EditProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Isi form dengan data proyek saat modal dibuka
  useEffect(() => {
    if (project && isOpen) {
      setTitle(project.title);
      setDescription(project.description || '');
      setTechStack(project.tech_stack.join(', '));
      setImagePreview(project.image_url); // Tampilkan gambar lama
      setDemoUrl(project.demo_url || '');
      setRepoUrl(project.repo_url || '');
      setImageFile(null); // Reset file baru
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('proyek_images').upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('proyek_images').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = project.image_url; // Default pakai URL lama

      // Jika ada file baru yang dipilih, upload dulu
      if (imageFile) {
        const uploadedUrl = await uploadImageToSupabase(imageFile);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const techArray = techStack.split(',').map(tech => tech.trim()).filter(Boolean);

      // UPDATE data ke Supabase berdasarkan ID
      const { error } = await supabase.from('projects').update({
        title,
        description,
        tech_stack: techArray,
        image_url: finalImageUrl,
        demo_url: demoUrl,
        repo_url: repoUrl,
      }).eq('id', project.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error: any) {
      alert('Gagal mengupdate proyek: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Class styling untuk Clean Modern UI
  const inputStyle = "w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-400";
  const labelStyle = "text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-h-[95vh] overflow-y-auto no-scrollbar">
        
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Proyek</h2>
            <p className="text-xs text-slate-500 mt-1">Perbarui detail portofolio karya ini.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelStyle}>Nama Proyek <span className="text-red-500">*</span></label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Tech Stack</label>
              <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} className={inputStyle} />
              <span className="text-[10px] text-slate-400 ml-1 mt-1 block">Pisahkan dengan koma</span>
            </div>
          </div>

          <div>
            <label className={labelStyle}>Gambar Proyek</label>
            <div className="w-full p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-4 min-h-[160px]">
              {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg shadow-sm border border-slate-200" />}
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
              >
                Ganti Gambar Baru
              </button>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>

          <div>
            <label className={labelStyle}>Deskripsi Singkat</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputStyle} resize-none`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelStyle}>Link Demo (Opsional)</label>
              <input type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Link Repo / GitHub</label>
              <input type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className={inputStyle} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Menyimpan...
                </>
              ) : 'Simpan Perubahan'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}