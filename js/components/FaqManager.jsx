import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { laundryStore } from '../store.js';
import { FAQ_CATEGORIES } from '../data/faqData.js';

export function FaqManager() {
  const [faqs, setFaqs] = useState(() => laundryStore.getFaqs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'published' | 'draft'

  // Add / Edit Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null); // null when adding new
  const [formCategory, setFormCategory] = useState('Pricing & Weight Verification');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formOrder, setFormOrder] = useState('1');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Sync with store
  const refreshFaqs = () => {
    setFaqs(laundryStore.getFaqs());
  };

  useEffect(() => {
    const unsub = laundryStore.subscribe(refreshFaqs);
    return unsub;
  }, []);

  // Esc key listener for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Escape' || e.key === 'Esc') && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const showToast = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormCategory(FAQ_CATEGORIES[1] || 'General');
    setIsCustomCategory(false);
    setCustomCategory('');
    setFormQuestion('');
    setFormAnswer('');
    setFormOrder(String((faqs?.length || 0) + 1));
    setFormIsPublished(true);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (faq) => {
    setEditingFaq(faq);
    if (FAQ_CATEGORIES.includes(faq.category)) {
      setFormCategory(faq.category);
      setIsCustomCategory(false);
      setCustomCategory('');
    } else {
      setFormCategory('CUSTOM');
      setIsCustomCategory(true);
      setCustomCategory(faq.category || '');
    }
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormOrder(String(faq.order || 1));
    setFormIsPublished(faq.isPublished !== false);
    setShowModal(true);
  };

  // Handle Save (Create or Update)
  const handleSaveFaq = (e) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) {
      alert('Please fill out both the question and answer.');
      return;
    }

    const finalCategory = isCustomCategory 
      ? (customCategory.trim() || 'General')
      : (formCategory === 'CUSTOM' ? (customCategory.trim() || 'General') : formCategory);

    if (editingFaq) {
      laundryStore.updateFaq(editingFaq.id, {
        category: finalCategory,
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        order: parseInt(formOrder) || 1,
        isPublished: formIsPublished
      });
      showToast(`FAQ "${formQuestion.substring(0, 30)}..." updated successfully!`);
    } else {
      laundryStore.addFaq({
        category: finalCategory,
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        order: parseInt(formOrder) || (faqs.length + 1),
        isPublished: formIsPublished
      });
      showToast('New FAQ question created and published!');
    }

    setShowModal(false);
    refreshFaqs();
  };

  // Handle Delete
  const handleDeleteFaq = (faq) => {
    if (confirm(`Delete the question: "${faq.question}"?`)) {
      laundryStore.deleteFaq(faq.id);
      showToast('FAQ question deleted.');
      refreshFaqs();
    }
  };

  // Handle Quick Toggle Publish
  const handleTogglePublish = (faqId) => {
    const newState = laundryStore.toggleFaqPublish(faqId);
    showToast(newState ? 'FAQ published to live website.' : 'FAQ set to draft (hidden from public).');
    refreshFaqs();
  };

  // Categories list
  const allCategories = ['ALL', ...Array.from(new Set(faqs.map(f => f.category).filter(Boolean)))];

  // Filtered FAQs
  const filtered = faqs.filter(faq => {
    const matchCat = selectedCategory === 'ALL' || faq.category === selectedCategory;
    const matchStatus = statusFilter === 'ALL' || 
      (statusFilter === 'published' && faq.isPublished !== false) ||
      (statusFilter === 'draft' && faq.isPublished === false);
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      faq.question.toLowerCase().includes(q) || 
      faq.answer.toLowerCase().includes(q) ||
      (faq.category && faq.category.toLowerCase().includes(q));
    return matchCat && matchStatus && matchSearch;
  });

  const publishedCount = faqs.filter(f => f.isPublished !== false).length;
  const draftCount = faqs.filter(f => f.isPublished === false).length;

  return (
    <div className="space-y-6">
      
      {/* Toast Banner */}
      {feedbackMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Icon name="checkCircle" className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2 border border-purple-200">
            <span>❓ Storefront Knowledge Base & FAQ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            FAQ Management & Content Editor
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Add, update, and manage frequently asked questions displayed on the storefront. Help customers understand our purely digital zero-storefront model, certified scale weigh-in procedures, and condo juristic drop-off policies.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0"
        >
          <Icon name="plus" className="w-4 h-4 text-sky-400" />
          <span>+ Add FAQ Question</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">Total Questions</span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block">{faqs.length}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-emerald-600 font-bold uppercase text-[10px] block">Live / Published</span>
          <span className="text-2xl font-black text-emerald-600 mt-0.5 block">{publishedCount}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-amber-600 font-bold uppercase text-[10px] block">Drafts / Hidden</span>
          <span className="text-2xl font-black text-amber-600 mt-0.5 block">{draftCount}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-purple-600 font-bold uppercase text-[10px] block">Topic Categories</span>
          <span className="text-2xl font-black text-purple-600 mt-0.5 block">{allCategories.length - 1}</span>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or answers..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-xs text-slate-700 focus:outline-none"
          >
            {allCategories.map(cat => (
              <option key={cat} value={cat}>Category: {cat}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">Status: All</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* FAQs List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-44">Category</th>
                <th className="py-3 px-4">Question & Answer Preview</th>
                <th className="py-3 px-4 w-28 text-center">Status</th>
                <th className="py-3 px-4 w-36 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length > 0 ? (
                filtered.map((faq) => (
                  <tr key={faq.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* Order */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                      {faq.order || 1}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 text-[10px] font-bold border border-sky-200/80">
                        {faq.category}
                      </span>
                    </td>

                    {/* Question & Answer */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-extrabold text-slate-900 text-xs leading-snug">
                        {faq.question}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                        {faq.answer}
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(faq.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 mx-auto ${
                          faq.isPublished !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title="Click to toggle live status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${faq.isPublished !== false ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                        <span>{faq.isPublished !== false ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(faq)}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[11px] border border-sky-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete FAQ"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <p className="font-bold text-sm">No FAQ questions match your filter.</p>
                    <p className="text-xs mt-1">Try resetting your search query or add a new FAQ question.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT FAQ MODAL */}
      {/* ========================================================================= */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {editingFaq ? 'Edit FAQ Question' : 'Add New FAQ Question'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This question will be displayed in the public FAQ section on the website.
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 flex items-center gap-1"
                title="Close (Esc)"
              >
                <span className="hidden sm:inline text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">ESC</span>
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
              
              {/* Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Topic Category *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      setFormCategory(e.target.value);
                      setIsCustomCategory(e.target.value === 'CUSTOM');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    {FAQ_CATEGORIES.filter(c => c !== 'ALL').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="CUSTOM">+ Add Custom Category...</option>
                  </select>

                  {isCustomCategory && (
                    <input
                      type="text"
                      required
                      placeholder="Enter new category name..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-sky-400 focus:ring-2 focus:ring-sky-500"
                    />
                  )}
                </div>
              </div>

              {/* Question */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Question (คำถาม) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Can I leave my laundry with condo juristic reception?"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Answer / Clarification (คำตอบ) *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Provide a clear, reassuring, and detailed explanation for the customer..."
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 leading-relaxed"
                />
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Display Priority / Sort Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formOrder}
                    onChange={(e) => setFormOrder(e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-center"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">Lower numbers appear first</span>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPublished}
                      onChange={(e) => setFormIsPublished(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-bold text-slate-800 text-xs">Publish to live website</span>
                  </label>
                  <span className="text-[10px] text-slate-400 mt-1">Unchecked will keep this as a private draft</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md transition"
                >
                  {editingFaq ? 'Update FAQ' : 'Save & Publish FAQ'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
