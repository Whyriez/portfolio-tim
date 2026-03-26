'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { supabase } from '@/utils/supabase/supabase';

type AddProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  memberId?: string; // PENTING: Menerima ID member dari dashboard
};

export default function AddProjectModal({ isOpen, onClose, onSuccess, memberId }: AddProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('proyek_images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('proyek_images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // PERTAHANAN 1: Langsung kunci di awal
    if (loading) return;

    setLoading(true);

    try {
      if (!imageFile) {
        alert('Mohon upload gambar proyek untuk portofolio tim.');
        setLoading(false);
        return;
      }

      // TAHAP 1: Upload Gambar
      const finalImageUrl = await uploadImageToSupabase(imageFile);

      if (!finalImageUrl) throw new Error("Upload gambar gagal, silakan coba lagi.");

      const techArray = techStack.split(',').map(tech => tech.trim()).filter(Boolean);

      // TAHAP 2: Insert ke tabel projects
      // Kita gunakan .select() untuk mendapatkan ID-nya
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            title,
            description,
            tech_stack: techArray,
            image_url: finalImageUrl,
            demo_url: demoUrl,
            repo_url: repoUrl,
          }
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      // TAHAP 3: Insert relasi ke tabel member_projects
      if (memberId && newProject) {
        const { error: relationError } = await supabase
          .from('member_projects')
          .insert([
            {
              member_id: memberId,
              project_id: newProject.id
            }
          ]);

        if (relationError) {
          // Logika cleanup: jika gagal simpan relasi, hapus project yang tadi terlanjur dibuat
          await supabase.from('projects').delete().eq('id', newProject.id);
          throw relationError;
        }
      }

      // Reset form & Sukses
      setTitle(''); setDescription(''); setTechStack('');
      setImageFile(null); setImagePreview(null);
      setDemoUrl(''); setRepoUrl('');

      // PERTAHANAN 2: Pastikan onClose dipanggil duluan sebelum refresh
      onClose();
      onSuccess();

    } catch (error: any) {
      alert('Gagal menyimpan proyek: ' + error.message);
      setLoading(false); // Pastikan loading dimatikan kalau error agar user bisa coba lagi
    }
    // Jangan letakkan setLoading(false) di finally jika Anda melakukan redirect/reload 
    // di onSuccess, karena bisa memicu state update pada komponen yang sudah unmount.
  };

  // Class styling untuk Clean Modern UI
  const inputStyle = "w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-400";
  const labelStyle = "text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-h-[95vh] overflow-y-auto no-scrollbar">

        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Tambah Karya Baru</h2>
            <p className="text-xs text-slate-500 mt-1">Masukkan detail proyek untuk ditampilkan di portofolio.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelStyle}>Nama Proyek <span className="text-red-500">*</span></label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyle} placeholder="Cth: SARAH Panel Control" />
            </div>

            <div>
              <label className={labelStyle}>Tech Stack</label>
              <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} className={inputStyle} placeholder="Cth: Go, React, Android" />
              <span className="text-[10px] text-slate-400 ml-1 mt-1 block">Pisahkan dengan koma</span>
            </div>
          </div>

          <div>
            <label className={labelStyle}>Gambar Proyek <span className="text-red-500">*</span></label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-colors cursor-pointer flex flex-col items-center justify-center text-center gap-3 min-h-[160px] group"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg shadow-sm" />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Klik untuk upload gambar</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>

          <div>
            <label className={labelStyle}>Deskripsi Singkat</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputStyle} resize-none`} placeholder="Jelaskan kontribusi Anda pada proyek ini..." />
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
              ) : 'Simpan Proyek'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}