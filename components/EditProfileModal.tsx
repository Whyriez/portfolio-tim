'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { supabase } from '@/utils/supabase/supabase';

type Member = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  avatar_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
};

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: Member | null;
};

export default function EditProfileModal({ isOpen, onClose, onSuccess, member }: EditProfileModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Isi form saat modal dibuka
  useEffect(() => {
    if (member && isOpen) {
      setName(member.name);
      setRole(member.role);
      setBio(member.bio || '');
      setImagePreview(member.avatar_url);
      setGithubUrl(member.github_url || '');
      setLinkedinUrl(member.linkedin_url || '');
      setImageFile(null);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatarToSupabase = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${member.id}-${Date.now()}.${fileExt}`; // Pake ID member biar unik
    
    // Upload ke bucket 'avatars'
    const { error } = await supabase.storage.from('avatars').upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) return null;
    
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalAvatarUrl = member.avatar_url;

      if (imageFile) {
        const uploadedUrl = await uploadAvatarToSupabase(imageFile);
        if (uploadedUrl) finalAvatarUrl = uploadedUrl;
      }

      const { error } = await supabase.from('members').update({
        name,
        role,
        bio,
        avatar_url: finalAvatarUrl,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
      }).eq('id', member.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error: any) {
      alert('Gagal mengupdate profil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-400";
  const labelStyle = "text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-h-[95vh] overflow-y-auto no-scrollbar">
        
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Profil Anda</h2>
            <p className="text-xs text-slate-500 mt-1">Perbarui foto dan informasi diri Anda.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* AREA UPLOAD FOTO PROFIL (Lingkaran) */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-32 rounded-full border-4 border-slate-100 bg-slate-50 hover:border-indigo-200 transition-colors cursor-pointer group overflow-hidden shadow-sm flex items-center justify-center"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
              
              {/* Overlay Hover */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">GANTI FOTO</span>
              </div>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelStyle}>Nama Lengkap</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Role / Posisi (Cth: Mobile Developer)</label>
              <input type="text" required value={role} onChange={(e) => setRole(e.target.value)} className={inputStyle} />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Bio Singkat</label>
            <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className={`${inputStyle} resize-none`} placeholder="Ceritakan sedikit tentang keahlian atau minat Anda..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelStyle}>Link GitHub</label>
              <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={inputStyle} placeholder="https://github.com/nuralim" />
            </div>
            <div>
              <label className={labelStyle}>Link LinkedIn</label>
              <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={inputStyle} placeholder="https://linkedin.com/in/nuralim" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-5 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
              {loading ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}