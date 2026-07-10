'use client';

import { useState, useEffect, useCallback } from 'react';

interface DiscountCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  isActive: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  minOrderAmount: number | null;
  createdAt: string;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [formValue, setFormValue] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [formUsageLimit, setFormUsageLimit] = useState('');
  const [formMinOrderAmount, setFormMinOrderAmount] = useState('');

  const fetchCodes = useCallback(async () => {
    const res = await fetch('/api/admin/discount-codes');
    if (res.ok) {
      const data = await res.json();
      setCodes(data.map((c: DiscountCode) => ({ ...c, value: Number(c.value), minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const resetForm = () => {
    setFormCode('');
    setFormType('PERCENTAGE');
    setFormValue('');
    setFormIsActive(true);
    setFormExpiresAt('');
    setFormUsageLimit('');
    setFormMinOrderAmount('');
    setEditingId(null);
    setError('');
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (c: DiscountCode) => {
    setFormCode(c.code);
    setFormType(c.type);
    setFormValue(String(c.value));
    setFormIsActive(c.isActive);
    setFormExpiresAt(c.expiresAt ? c.expiresAt.slice(0, 16) : '');
    setFormUsageLimit(c.usageLimit != null ? String(c.usageLimit) : '');
    setFormMinOrderAmount(c.minOrderAmount != null ? String(c.minOrderAmount) : '');
    setEditingId(c.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async () => {
    if (!formCode.trim() || !formValue.trim()) {
      setError('Kod i wartość są wymagane');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      code: formCode,
      type: formType,
      value: Number(formValue),
      isActive: formIsActive,
      expiresAt: formExpiresAt || null,
      usageLimit: formUsageLimit ? Number(formUsageLimit) : null,
      minOrderAmount: formMinOrderAmount ? Number(formMinOrderAmount) : null,
    };

    const url = editingId ? `/api/admin/discount-codes/${editingId}` : '/api/admin/discount-codes';
    const method = editingId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Wystąpił błąd');
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    resetForm();
    fetchCodes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten kod rabatowy?')) return;
    await fetch(`/api/admin/discount-codes/${id}`, { method: 'DELETE' });
    fetchCodes();
  };

  const toggleActive = async (c: DiscountCode) => {
    await fetch(`/api/admin/discount-codes/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    fetchCodes();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kody rabatowe</h1>
        <button
          onClick={openCreate}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium"
        >
          + Nowy kod
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? 'Edytuj kod rabatowy' : 'Nowy kod rabatowy'}
          </h2>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kod</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="np. LATO20"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 uppercase"
                />
                <button
                  type="button"
                  onClick={() => setFormCode(generateCode())}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                >
                  Losuj
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ rabatu</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              >
                <option value="PERCENTAGE">Procent (%)</option>
                <option value="FIXED_AMOUNT">Kwota stała (PLN)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wartość {formType === 'PERCENTAGE' ? '(%)' : '(PLN)'}
              </label>
              <input
                type="number"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                min="0"
                step={formType === 'PERCENTAGE' ? '1' : '0.01'}
                max={formType === 'PERCENTAGE' ? '100' : undefined}
                placeholder={formType === 'PERCENTAGE' ? 'np. 10' : 'np. 15.00'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min. kwota zamówienia (PLN, opcjonalne)
              </label>
              <input
                type="number"
                value={formMinOrderAmount}
                onChange={(e) => setFormMinOrderAmount(e.target.value)}
                min="0"
                step="0.01"
                placeholder="np. 50.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data wygaśnięcia (opcjonalne)
              </label>
              <input
                type="datetime-local"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit użyć (opcjonalne)
              </label>
              <input
                type="number"
                value={formUsageLimit}
                onChange={(e) => setFormUsageLimit(e.target.value)}
                min="1"
                placeholder="bez limitu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
              <span className="text-sm text-gray-700">Aktywny</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Zapisywanie...' : editingId ? 'Zapisz zmiany' : 'Utwórz kod'}
            </button>
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Kod</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Typ</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Wartość</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Użycia</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Wygasa</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {codes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Brak kodów rabatowych. Utwórz pierwszy kod powyżej.
                </td>
              </tr>
            )}
            {codes.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-bold text-gray-900">{c.code}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {c.type === 'PERCENTAGE' ? 'Procent' : 'Kwota'}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {c.type === 'PERCENTAGE' ? `${c.value}%` : `${Number(c.value).toFixed(2)} PLN`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {c.usageCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ''}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {c.expiresAt ? formatDate(c.expiresAt) : '—'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(c)}
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      c.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {c.isActive ? 'Aktywny' : 'Nieaktywny'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-blue-700 hover:text-blue-900 text-sm font-medium mr-3"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
