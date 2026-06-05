'use client';
import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, AlertCircle, Tag } from 'lucide-react';
import { useToast } from '@/components/Toast';

const EMPTY = { name: '', image: '' };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [error, setError]           = useState('');
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState(null);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    getCategories().then(r => { setCategories(r.data); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setError(''); setModalOpen(true); };
  const openEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, image: cat.image || '' }); setError(''); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editing) await updateCategory(editing._id, form);
      else         await createCategory(form);
      setModalOpen(false);
      load();
      showToast(editing ? 'Category updated' : 'Category created');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    await deleteCategory(deleteId);
    setDeleteId(null);
    load();
    showToast('Category deleted');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-black text-2xl tracking-tight text-[#0a0a0a]">Categories</h1>
          <p className="text-xs text-gray-400 mt-1">{categories.length} categories total</p>
        </div>
        <button onClick={openAdd}
          className="btn-primary flex items-center gap-2 px-5 py-2.5">
          <Plus size={15} /> Add Category
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="border border-gray-200 p-4">
              <div className="skeleton h-24 w-full mb-3" />
              <div className="skeleton h-4 w-24" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 border border-gray-200">
          <Tag size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-4">No categories yet</p>
          <button onClick={openAdd} className="btn-primary px-6 py-2 flex items-center gap-2 mx-auto">
            <Plus size={14} /> Add First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat._id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border border-gray-200 group hover:border-[#0a0a0a] transition-colors">
              {/* Image */}
              <div className="h-28 bg-gray-50 overflow-hidden relative">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tag size={28} className="text-gray-300" />
                  </div>
                )}
              </div>
              {/* Info + actions */}
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-[#0a0a0a]">{cat.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{cat.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(cat)}
                    className="p-1.5 text-gray-400 hover:text-[#0a0a0a] transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDeleteId(cat._id)}
                    className="p-1.5 text-gray-400 hover:text-[#dc2626] transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
            <motion.div key="modal" initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white border border-gray-200 w-full max-w-md pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="font-black text-lg tracking-tight">{editing ? 'Edit Category' : 'Add Category'}</h2>
                  <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5">
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Category Name *</label>
                    <input className="input-field" type="text" required placeholder="e.g. Laptops"
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Image URL</label>
                    <input className="input-field" type="text" placeholder="https://..."
                      value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
                  </div>
                  {form.image && (
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Preview</label>
                      <img src={form.image} alt="preview" className="h-28 w-full object-cover border border-gray-200" />
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1 py-2.5">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                      <Save size={14} /> {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div key="del-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
            <motion.div key="del-modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white border border-gray-200 p-6 w-full max-w-sm pointer-events-auto shadow-2xl">
                <div className="w-12 h-12 bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={20} className="text-[#dc2626]" />
                </div>
                <h3 className="font-black text-lg text-center mb-1">Delete Category?</h3>
                <p className="text-sm text-gray-400 text-center mb-6">Products in this category won't be deleted but will have no category assigned.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="btn-outline flex-1 py-2.5">Cancel</button>
                  <button onClick={confirmDelete}
                    className="flex-1 py-2.5 bg-[#dc2626] text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
