"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Medicine, MedicineForm } from '@/types';
import { 
  Pill, 
  Plus, 
  Search, 
  Edit3, 
  Archive, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { MedicineFormModal } from './MedicineFormModal';

export const MedicineList: React.FC = () => {
  const { medicines, schedule, addMedicine, updateMedicine, deleteMedicine } = useApp();

  const [search, setSearch] = useState('');
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Calculate which slots this medicine is assigned to
  const getAssignedSlotsCount = (medId: string) => {
    return Object.values(schedule.slots).filter(slot => slot.medicineId === medId && slot.enabled).length;
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      if (!showArchived && m.isArchived) return false;
      if (showArchived && !m.isArchived) return false;

      if (selectedForm !== 'all' && m.form !== selectedForm) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesDosage = m.dosage.toLowerCase().includes(q);
        const matchesInst = m.instructions.toLowerCase().includes(q);
        return matchesName || matchesDosage || matchesInst;
      }
      return true;
    });
  }, [medicines, search, selectedForm, showArchived]);

  const handleEdit = (med: Medicine) => {
    setEditingMed(med);
    setModalOpen(true);
  };

  const handleFormSubmit = (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMed) {
      updateMedicine(editingMed.id, data);
    } else {
      addMedicine(data);
    }
  };

  const handleToggleArchive = (med: Medicine) => {
    updateMedicine(med.id, { isArchived: !med.isArchived });
  };

  const handleDelete = (id: string) => {
    deleteMedicine(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Medication Management
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {medicines.filter(m => !m.isArchived).length} Active Rx
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain your drug catalog, formulations, patient instructions and meal interactions.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMed(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          Add Medication
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by drug name, dosage or instruction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Archived tab */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !showArchived ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              Active Medications
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                showArchived ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              Archived ({medicines.filter(m => m.isArchived).length})
            </button>
          </div>
        </div>

        {/* Form filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium mr-1 text-[11px]">Form:</span>
          {['all', 'tablet', 'capsule', 'syrup', 'injection', 'inhaler', 'drops'].map((form) => (
            <button
              key={form}
              onClick={() => setSelectedForm(form)}
              className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                selectedForm === form
                  ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold border border-teal-300 dark:border-teal-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {form}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <Pill className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No Medications Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search ? 'Try adjusting your search criteria or filter tags.' : 'Add your first medication to begin scheduling doses.'}
          </p>
          <button
            onClick={() => {
              setEditingMed(null);
              setModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
          >
            Add Medication Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.map((med) => {
            const slotsCount = getAssignedSlotsCount(med.id);

            return (
              <div
                key={med.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:border-teal-300 dark:hover:border-teal-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Color Dot & Form */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-2xs"
                        style={{ backgroundColor: med.color || '#0d9488' }}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                        {med.form}
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400 capitalize">
                      {med.foodTiming.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Name and Dosage */}
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                    {med.name}
                  </h3>
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                    {med.dosage}
                  </p>

                  {/* Instructions */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed line-clamp-2">
                    {med.instructions}
                  </p>

                  {med.notes && (
                    <p className="text-[11px] text-slate-400 mt-1.5 italic line-clamp-1">
                      Notes: {med.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Hardware schedule badge & Action buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                    <span>{slotsCount} {slotsCount === 1 ? 'slot' : 'slots'} scheduled</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(med)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Medication"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(med)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                      title={med.isArchived ? 'Restore to Active' : 'Archive Medication'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(med.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation Overlay */}
                {confirmDeleteId === med.id && (
                  <div className="mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs">
                    <p className="font-bold text-rose-900 dark:text-rose-200">Delete this medication?</p>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                      It will be removed from your catalog and cleared from active schedule slots.
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-slate-600 text-[11px] font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(med.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Medicine Form Modal */}
      <MedicineFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingMed(null);
        }}
        onSubmit={handleFormSubmit}
        initialMedicine={editingMed}
      />
    </div>
  );
};

