'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { getProfile, updateProfile, changePassword, getMyOrders } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Lock, ShoppingBag, Save, Eye, EyeOff,
  ChevronRight, Package, LogOut, Settings, Heart
} from 'lucide-react';

const TABS = [
  { id: 'orders',   label: 'Orders',    icon: ShoppingBag },
  { id: 'address',  label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist',  icon: Heart },
  { id: 'settings', label: 'Settings',  icon: Settings },
];

const statusStyle = (s) => {
  if (s === 'Delivered') return 'bg-gray-100 text-gray-600';
  if (s === 'Shipped')   return 'bg-[#dc2626] text-white';
  if (s === 'Cancelled') return 'bg-gray-100 text-gray-500';
  return 'bg-gray-100 text-gray-600';
};

export default function ProfilePage() {
  const { user, login, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [tab, setTab] = useState('orders');
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // addresses state
  const EMPTY_ADDR = { label: 'HOME', name: '', street: '', city: '', state: '', pin: '', country: 'India', isDefault: false };
  const [addresses, setAddresses] = useState([]);
  const [addrModal, setAddrModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDR);
  const [addrLoading, setAddrLoading] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    getProfile().then(r => {
      setProfile(r.data);
      setProfileForm({ name: r.data.name, email: r.data.email, phone: r.data.phone || '' });
      setAddresses(r.data.addresses || [
        r.data.address?.street ? { ...r.data.address, label: 'HOME', name: r.data.name, isDefault: true, id: 'default' } : null
      ].filter(Boolean));
    });
    getMyOrders().then(r => setOrders(r.data));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await updateProfile(profileForm);
      login({ ...user, ...data });
      showToast('Profile updated');
    } catch (err) { showToast(err.response?.data?.message || 'Update failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleAddressSave = async (e) => {
    e.preventDefault(); setAddrLoading(true);
    try {
      const updated = editingAddr
        ? addresses.map(a => a.id === editingAddr.id ? { ...addrForm, id: editingAddr.id } : a)
        : [...addresses, { ...addrForm, id: Date.now().toString(), isDefault: addresses.length === 0 }];
      setAddresses(updated);
      await updateProfile({ addresses: updated });
      showToast(editingAddr ? 'Address updated' : 'Address added');
      setAddrModal(false);
    } catch (err) { showToast('Failed to save address', 'error'); }
    finally { setAddrLoading(false); }
  };

  const removeAddress = async (id) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    await updateProfile({ addresses: updated });
    showToast('Address removed');
  };

  const setDefault = async (id) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    await updateProfile({ addresses: updated });
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return showToast('Passwords do not match', 'error');
    if (passwordForm.newPassword.length < 6)
      return showToast('Password must be at least 6 characters', 'error');
    setLoading(true);
    try {
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      showToast('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  if (!profile) return (
    <>
      <Navbar />
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-gray-400 text-sm">Loading...</motion.p>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 py-10">

          {/* Breadcrumb */}
          <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-6">
            [ ACCOUNT / <span className="text-[#dc2626]">MY PROFILE</span> ]
          </p>

          {/* Welcome header */}
          <div className="mb-8 border-b border-gray-200 pb-8">
            <h1 className="font-black text-[3.5rem] tracking-[-0.04em] leading-none text-[#0a0a0a] mb-2">
              Welcome back.
            </h1>
            <p className="text-sm text-gray-400">
              {profile.email} · Member since {new Date(profile.createdAt).getFullYear()}
            </p>
          </div>

          <div className="flex gap-8">

            {/* Sidebar */}
            <aside className="w-72 shrink-0">
              <div className="border border-gray-200">
                {TABS.map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      className={`w-full flex items-center justify-between px-5 py-4 text-sm border-b border-gray-100 last:border-0 transition-colors ${
                        tab === t.id
                          ? 'bg-[#0a0a0a] text-white font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}>
                      <span className="flex items-center gap-3">
                        <Icon size={15} className={tab === t.id ? 'text-white' : 'text-gray-400'} />
                        {t.label}
                      </span>
                      <ChevronRight size={14} className={tab === t.id ? 'text-white' : 'text-gray-300'} />
                    </button>
                  );
                })}
                <button onClick={() => { logout(); router.push('/'); }}
                  className="w-full flex items-center gap-3 px-5 py-4 text-sm text-[#dc2626] hover:bg-red-50 transition-colors border-t border-gray-100">
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">

                {/* Orders */}
                {tab === 'orders' && (
                  <motion.div key="orders"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <h2 className="font-black text-xl tracking-tight text-[#0a0a0a] mb-6">Recent orders</h2>

                    {orders.length === 0 ? (
                      <div className="border border-gray-200 p-16 text-center">
                        <Package size={32} className="text-gray-300 mx-auto mb-3" />
                        <p className="font-bold text-gray-500 mb-1">No orders yet</p>
                        <p className="text-sm text-gray-400 mb-4">Start shopping to see your orders here</p>
                        <a href="/products" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5">
                          <ShoppingBag size={14} /> Shop Now
                        </a>
                      </div>
                    ) : (
                      <div className="border border-gray-200">
                        {/* Table header */}
                        <div className="grid grid-cols-5 px-5 py-3 bg-gray-50 border-b border-gray-200">
                          {['ORDER', 'DATE', 'ITEMS', 'STATUS', 'TOTAL'].map(h => (
                            <p key={h} className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400">{h}</p>
                          ))}
                        </div>
                        {orders.map((order, i) => (
                          <motion.div key={order._id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="grid grid-cols-5 items-center px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                            <p className="font-mono text-sm font-semibold text-[#0a0a0a]">
                              VLT-{order._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-sm text-gray-600">{order.items?.length || 0}</p>
                            <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 w-fit ${statusStyle(order.status)}`}>
                              {order.status}
                            </span>
                            <p className="text-sm font-black text-[#0a0a0a]">
                              ₹{order.totalPrice?.toLocaleString()}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Addresses */}
                {tab === 'address' && (
                  <motion.div key="address"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-black text-xl tracking-tight text-[#0a0a0a]">Saved addresses</h2>
                      <button onClick={() => { setEditingAddr(null); setAddrForm(EMPTY_ADDR); setAddrModal(true); }}
                        className="btn-primary flex items-center gap-2 px-4 py-2 text-xs">
                        + Add Address
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="border border-gray-200 p-16 text-center">
                        <MapPin size={32} className="text-gray-300 mx-auto mb-3" />
                        <p className="font-bold text-gray-500 mb-1">No saved addresses</p>
                        <p className="text-sm text-gray-400 mb-4">Add an address to speed up checkout</p>
                        <button onClick={() => { setEditingAddr(null); setAddrForm(EMPTY_ADDR); setAddrModal(true); }}
                          className="btn-primary px-6 py-2.5 text-xs">Add Address</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map(addr => (
                          <div key={addr.id} className="border border-gray-200 p-5 hover:border-[#0a0a0a] transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="bg-[#dc2626] text-white text-[10px] font-bold tracking-widest uppercase px-2 py-0.5">DEFAULT</span>
                              )}
                            </div>
                            <p className="font-semibold text-sm text-[#0a0a0a] mb-1">{addr.name || profile.name}</p>
                            <p className="text-sm text-gray-500">
                              {addr.street}{addr.city ? `, ${addr.city}` : ''}{addr.state ? ` ${addr.state}` : ''}{addr.pin ? ` ${addr.pin}` : ''}
                            </p>
                            <div className="flex items-center gap-3 mt-4">
                              <button onClick={() => { setEditingAddr(addr); setAddrForm(addr); setAddrModal(true); }}
                                className="text-sm text-gray-600 hover:text-[#0a0a0a] font-medium transition-colors">Edit</button>
                              {!addr.isDefault && (
                                <button onClick={() => setDefault(addr.id)}
                                  className="text-sm text-gray-400 hover:text-[#0a0a0a] transition-colors">Set default</button>
                              )}
                              <button onClick={() => removeAddress(addr.id)}
                                className="text-sm text-[#dc2626] hover:text-red-700 transition-colors">Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Wishlist */}
                {tab === 'wishlist' && (
                  <motion.div key="wishlist"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <h2 className="font-black text-xl tracking-tight text-[#0a0a0a] mb-6">Wishlist</h2>
                    <div className="border border-gray-200 p-16 text-center">
                      <Heart size={32} className="text-gray-300 mx-auto mb-3" />
                      <p className="font-bold text-gray-500 mb-1">No saved items</p>
                      <p className="text-sm text-gray-400 mb-4">Save products you love for later</p>
                      <a href="/products" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5">
                        Browse Products
                      </a>
                    </div>
                  </motion.div>
                )}

                {/* Settings */}
                {tab === 'settings' && (
                  <motion.div key="settings"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                    className="space-y-6">
                    <h2 className="font-black text-xl tracking-tight text-[#0a0a0a]">Settings</h2>

                    {/* Profile info */}
                    <div className="border border-gray-200 p-6">
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Personal Information</p>
                      <form onSubmit={handleProfileSave} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">Full Name</label>
                          <input className="input-field" type="text"
                            value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">Email</label>
                          <input className="input-field" type="email"
                            value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">Phone</label>
                          <input className="input-field" type="tel" placeholder="+91 98765 43210"
                            value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2.5">
                          <Save size={14} /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </form>
                    </div>

                    {/* Change password */}
                    <div className="border border-gray-200 p-6">
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Change Password</p>
                      <form onSubmit={handlePasswordSave} className="space-y-4">
                        {[
                          { key: 'currentPassword', label: 'Current Password', pw: 'current' },
                          { key: 'newPassword',     label: 'New Password',     pw: 'new' },
                          { key: 'confirmPassword', label: 'Confirm Password', pw: 'confirm' },
                        ].map(f => (
                          <div key={f.key}>
                            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">{f.label}</label>
                            <div className="relative">
                              <input className="input-field pr-10" type={showPw[f.pw] ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={passwordForm[f.key]}
                                onChange={e => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })} required />
                              <button type="button" onClick={() => setShowPw(p => ({ ...p, [f.pw]: !p[f.pw] }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPw[f.pw] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </div>
                        ))}
                        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2.5">
                          <Lock size={14} /> {loading ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Address Modal */}
      <AnimatePresence>
        {addrModal && (
          <>
            <motion.div key="addr-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAddrModal(false)} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
            <motion.div key="addr-modal" initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white border border-gray-200 w-full max-w-md pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="font-black text-lg tracking-tight">{editingAddr ? 'Edit Address' : 'Add Address'}</h2>
                  <button onClick={() => setAddrModal(false)} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                    <span className="text-xl leading-none">&times;</span>
                  </button>
                </div>
                <form onSubmit={handleAddressSave} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">Label</label>
                      <select className="input-field" value={addrForm.label} onChange={e => setAddrForm(f => ({ ...f, label: e.target.value }))}>
                        {['HOME', 'WORK', 'STUDIO', 'OTHER'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">Full Name</label>
                      <input className="input-field" placeholder="John Doe"
                        value={addrForm.name} onChange={e => setAddrForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">Street Address</label>
                    <input className="input-field" placeholder="123 Main Street" required
                      value={addrForm.street} onChange={e => setAddrForm(f => ({ ...f, street: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">City</label>
                      <input className="input-field" placeholder="Mumbai"
                        value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">State</label>
                      <input className="input-field" placeholder="Maharashtra"
                        value={addrForm.state} onChange={e => setAddrForm(f => ({ ...f, state: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">PIN Code</label>
                      <input className="input-field" placeholder="400001"
                        value={addrForm.pin} onChange={e => setAddrForm(f => ({ ...f, pin: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">Country</label>
                      <input className="input-field"
                        value={addrForm.country} onChange={e => setAddrForm(f => ({ ...f, country: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setAddrModal(false)} className="btn-outline flex-1 py-2.5">Cancel</button>
                    <button type="submit" disabled={addrLoading} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                      <Save size={14} /> {addrLoading ? 'Saving...' : editingAddr ? 'Update' : 'Add Address'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
