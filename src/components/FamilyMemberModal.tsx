import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { FamilyMember } from '../types';
import { getFamilyMembers, addFamilyMember, deleteFamilyMember } from '../services/familyMemberService';

interface FamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMembersUpdated?: (members: FamilyMember[]) => void;
}

export const FamilyMemberModal: React.FC<FamilyMemberModalProps> = ({
  isOpen,
  onClose,
  onMembersUpdated,
}) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen]);

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFamilyMembers();
      setMembers(data);
      if (onMembersUpdated) onMembersUpdated(data);
    } catch (err: any) {
      setError('Failed to load family members.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const added = await addFamilyMember(newMemberName.trim());
      const updated = [...members, added];
      setMembers(updated);
      setNewMemberName('');
      setSuccess(`Added "${added.name}" to family members.`);
      if (onMembersUpdated) onMembersUpdated(updated);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (members.length <= 1) {
      setError('You should keep at least one family member.');
      return;
    }

    if (!window.confirm(`Remove ${name} from family members?`)) return;

    setActionLoading(true);
    setError(null);
    try {
      await deleteFamilyMember(id);
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
      setSuccess(`Removed ${name}.`);
      if (onMembersUpdated) onMembersUpdated(updated);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to delete member.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="family-members-modal"
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Family Members</h3>
              <p className="text-xs text-gray-500">Names used to record reviews for family food stops</p>
            </div>
          </div>
          <button
            id="close-family-modal-btn"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Add new member form */}
        <form onSubmit={handleAddMember} className="mt-4 flex gap-2">
          <input
            id="new-family-member-input"
            type="text"
            placeholder="e.g. Adik, Kakak, Pakcik..."
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            disabled={actionLoading}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
          />
          <button
            id="add-family-member-btn"
            type="submit"
            disabled={actionLoading || !newMemberName.trim()}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Current list */}
        <div className="mt-5 flex-1 overflow-y-auto pr-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Current Family Members ({members.length})
          </p>

          {loading ? (
            <div className="py-8 text-center text-gray-400 text-sm">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No members added yet.</div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  id={`member-item-${member.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-orange-50/40 hover:border-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800 text-sm">{member.name}</span>
                  </div>
                  <button
                    id={`delete-member-${member.id}-btn`}
                    type="button"
                    onClick={() => handleDeleteMember(member.id, member.name)}
                    disabled={actionLoading}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
          <button
            id="done-family-modal-btn"
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
