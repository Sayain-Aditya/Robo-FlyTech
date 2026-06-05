'use client';
import { useEffect, useState } from 'react';
import { getOffers, createOffer, updateOffer, deleteOffer, getProducts, getCategories } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, AlertCircle, Zap, Calendar, Tag } from 'lucide-react';
import { useToast } from '@/components/Toast';

const EMPTY = {
  name: '', description: '', type: 'percentage', value: '',
  scope: 'all', categories: [], products: [],
  startDate: '', endDate: '', badge: '', active: true,
};

const fmt = d => d ? new Date(d).toISOString().slice(0, 10) : '';
const now = new Date();

function statusBadge(offer) {
  const start = new Date(offer.startDate);
  const end   = new Date(offer.endDate);
  if (!offer.active)  return { label: 'Inactive', cls: 'bg-gray-100 text-gray-500' };
  if (now < start)    return { label: 'Scheduled', cls: 'bg-blue-50 text-blue-600' };
  if (now > end)      return { label: 'Expired', cls: 'bg-gray-100 text-gray-400' };
  return { label: 'Live', cls: 'bg-green-50 text-green-600' };
}

export default function AdminOffersPage() {
  const [offers, setOffers]       = useState([]);
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    const [o, p, c] = await Promise.all([getOffers(), getProducts({ limit: 200 }), getCategories()]);
    setOffers(o.data);
    setProducts(p.data.products || []);
    setCategories(c.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, startDate: fmt(new Date()), endDate: fmt(new Date(Date.now() + 7 * 86400000)) });
    setError(''); setModalOpen(true);
  };
  const openEdit = (o) => {
    setEditing(o);
    setForm({ ...o, startDate: fmt(o.startDate), endDate: fmt(o.endDate), products: o.products.map(p => p._id || p) });
    setError(''); setModalOpen(true);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleCategory = (name) =>
    setForm(f => ({ ...f, categories: f.categories.includes(name) ? f.categories.filter(c => c !== name) : [...f.categories, name] }));

  const toggleProduct = (id) =>
    setForm(f => ({ ...f, products: f.products.includes(id) ? f.products.filter(p => p !== id) : [...f.products, id] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { ...form, value: Number(form.value) };
      if (editing) await updateOffer(editing._id, payload);
      else         await createOffer(payload);
      setModalOpen(false); load();
      showToast(editing ? 'Offer updated' : 'Offer created');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    await deleteOffer(deleteId);
    setDeleteId(null); load();
    showToast('Offer deleted');
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-black text-2xl tracking-tight text-[#0a0a0a]">Offers & Discounts</h1>
          <p className="text-xs text-gray-400 mt-1">{offers.filter(o => { const s=new Date(o.startDate),e=new Date(o.endDate); return o.active && now>=s && now<=e; }).length} active offers running</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-5 py-2.5">
          <Plus size={15} /> Create Offer
        </button>
      </div>

      {/* Offers list */}
      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_,i) => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20 border border-gray-200">
          <Zap size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-4">No offers yet</p>
          <button onClick={openAdd} className="btn-primary px-6 py-2 flex items-center gap-2 mx-auto">
            <Plus size={14} /> Create First Offer
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((o, i) => {
            const st = statusBadge(o);
            return (
              <motion.div key={o._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white border border-gray-200 p-4 flex items-center gap-4 hover:border-[#0a0a0a] transition-colors">
                {/* Color bar */}
                <div className={`w-1 self-stretch rounded-full ${o.active ? 'bg-[#dc2626]' : 'bg-gray-200'}`} />
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-sm text-[#0a0a0a]">{o.name}</p>
                    {o.badge && <span className="text-[10px] bg-[#dc2626] text-white px-2 py-0.5 font-bold tracking-wider uppercase">{o.badge}</span>}
                    <span className={`text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wider ${st.cls}`}>{st.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{o.description}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs font-bold text-[#dc2626]">
                      {o.type === 'percentage' ? `${o.value}% OFF` : `₹${o.value} OFF`}
                    </span>
                    <span className="text-[11px] text-gray-400 capitalize">
                      Scope: {o.scope === 'all' ? 'All Products' : o.scope === 'category' ? `Categories (${o.categories.join(', ')})` : `${o.products.length} product(s)`}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Calendar size={10} /> {fmt(o.startDate)} → {fmt(o.endDate)}
                    </span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => updateOffer(o._id, { active: !o.active }).then(load)}
                    className={`text-xs px-3 py-1.5 border font-semibold transition-colors ${o.active ? 'border-gray-200 text-gray-500 hover:border-[#0a0a0a]' : 'border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white'}`}>
                    {o.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => openEdit(o)} className="p-1.5 text-gray-400 hover:text-[#0a0a0a] transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteId(o._id)} className="p-1.5 text-gray-400 hover:text-[#dc2626] transition-colors"><Trash2 size={14} /></button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
            <motion.div key="modal" initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white border border-gray-200 w-full max-w-xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <h2 className="font-black text-lg tracking-tight">{editing ? 'Edit Offer' : 'Create Offer'}</h2>
                  <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5">
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}

                  {/* Name + Badge */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Offer Name *</label>
                      <input className="input-field" required placeholder="e.g. Diwali Sale"
                        value={form.name} onChange={e => set('name', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Badge Label</label>
                      <input className="input-field" placeholder="e.g. DIWALI, HOLI, FLASH"
                        value={form.badge} onChange={e => set('badge', e.target.value)} />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                    <input className="input-field" placeholder="Short description of the offer"
                      value={form.description} onChange={e => set('description', e.target.value)} />
                  </div>

                  {/* Type + Value */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Discount Type *</label>
                      <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                        {form.type === 'percentage' ? 'Discount %' : 'Discount ₹'} *
                      </label>
                      <input className="input-field" type="number" min="1" required
                        placeholder={form.type === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                        value={form.value} onChange={e => set('value', e.target.value)} />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Start Date *</label>
                      <input className="input-field" type="date" required
                        value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">End Date *</label>
                      <input className="input-field" type="date" required
                        value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                    </div>
                  </div>

                  {/* Scope */}
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Applies To *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[['all','All Products'],['category','By Category'],['products','Specific Products']].map(([val,label]) => (
                        <button key={val} type="button" onClick={() => set('scope', val)}
                          className={`py-2 text-xs font-semibold border transition-colors ${form.scope === val ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#0a0a0a]'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category picker */}
                  {form.scope === 'category' && (
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Select Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(c => (
                          <button key={c._id} type="button" onClick={() => toggleCategory(c.name)}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border transition-colors ${form.categories.includes(c.name) ? 'bg-[#dc2626] text-white border-[#dc2626]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#dc2626]'}`}>
                            <Tag size={10} /> {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product picker */}
                  {form.scope === 'products' && (
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                        Select Products ({form.products.length} selected)
                      </label>
                      <input className="input-field mb-2" placeholder="Search products..."
                        value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                      <div className="border border-gray-200 max-h-48 overflow-y-auto">
                        {filteredProducts.map(p => (
                          <label key={p._id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                            <input type="checkbox" checked={form.products.includes(p._id)}
                              onChange={() => toggleProduct(p._id)}
                              className="accent-[#dc2626]" />
                            <img src={p.image || 'https://placehold.co/32x32'} alt={p.name} className="w-8 h-8 object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#0a0a0a] truncate">{p.name}</p>
                              <p className="text-[10px] text-gray-400">{p.brand} · ₹{p.price?.toLocaleString()}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active toggle */}
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => set('active', !form.active)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? 'bg-[#dc2626]' : 'bg-gray-200'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <span className="text-sm text-gray-600">{form.active ? 'Active' : 'Inactive'}</span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1 py-2.5">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                      <Save size={14} /> {saving ? 'Saving...' : editing ? 'Update Offer' : 'Create Offer'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div key="del-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
            <motion.div key="del-modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white border border-gray-200 p-6 w-full max-w-sm pointer-events-auto shadow-2xl">
                <div className="w-12 h-12 bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={20} className="text-[#dc2626]" />
                </div>
                <h3 className="font-black text-lg text-center mb-1">Delete Offer?</h3>
                <p className="text-sm text-gray-400 text-center mb-6">Discount will stop applying immediately.</p>
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
