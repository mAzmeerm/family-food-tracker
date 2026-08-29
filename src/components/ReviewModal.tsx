import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, User, AlertCircle, Plus } from 'lucide-react';
import { Review, FamilyMember } from '../types';
import { Rating } from './Rating';
import { getFamilyMembers, addFamilyMember } from '../services/familyMemberService';

interface ReviewModalProps {
  isOpen: boolean;
  restaurantId: string;
  restaurantName: string;
  reviewToEdit?: Review | null;
  onClose: () => void;
  onSubmit: (reviewData: {
    restaurantId: string;
    memberId: string;
    memberName: string;
    rating: number;
    feedback: string;
  }) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  restaurantId,
  restaurantName,
  reviewToEdit,
  onClose,
  onSubmit,
}) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Quick inline add new family member
  const [showAddMemberInput, setShowAddMemberInput] = useState<boolean>(false);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
      if (reviewToEdit) {
        setSelectedMemberId(reviewToEdit.memberId);
        setRating(reviewToEdit.rating);
        setFeedback(reviewToEdit.feedback);
      } else {
        setRating(5);
        setFeedback('');
      }
      setError(null);
      setShowAddMemberInput(false);
      setNewMemberName('');
    }
  }, [isOpen, reviewToEdit]);

  const loadMembers = async () => {
    try {
      const members = await getFamilyMembers();
      setFamilyMembers(members);
      if (!reviewToEdit && members.length > 0 && !selectedMemberId) {
        setSelectedMemberId(members[0].id);
      }
    } catch (err) {
      console.error('Error loading family members:', err);
    }
  };

  const handleQuickAddMember = async () => {
    if (!newMemberName.trim()) return;
    setIsAddingMember(true);
    setError(null);
    try {
      const created = await addFamilyMember(newMemberName.trim());
      const updated = [...familyMembers, created];
      setFamilyMembers(updated);
      setSelectedMemberId(created.id);
      setNewMemberName('');
      setShowAddMemberInput(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add family member.');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setError('Please select who is reviewing this restaurant.');
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    const member = familyMembers.find((m) => m.id === selectedMemberId);
    const memberName = member ? member.name : (reviewToEdit?.memberName || 'Family Member');

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        restaurantId,
        memberId: selectedMemberId,
        memberName,
        rating,
        feedback: feedback.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="review-form-modal"
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {reviewToEdit ? 'Edit Family Review' : 'Add Family Review'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
              For <span className="font-semibold text-gray-700">{restaurantName}</span>
            </p>
          </div>
          <button
            id="close-review-modal-btn"
            onClick={onClose}
            disabled={loading}
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Family Member Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="reviewer-select" className="text-xs font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                Reviewer
              </label>
              {!showAddMemberInput && (
                <button
                  type="button"
                  onClick={() => setShowAddMemberInput(true)}
                  className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  + New Member
                </button>
              )}
            </div>

            {showAddMemberInput ? (
              <div className="flex gap-2 mb-2 p-2.5 bg-orange-50/70 rounded-xl border border-orange-200">
                <input
                  type="text"
                  placeholder="New family member name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-orange-300 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={handleQuickAddMember}
                  disabled={isAddingMember || !newMemberName.trim()}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                >
                  {isAddingMember ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMemberInput(false)}
                  className="px-2 py-1.5 text-gray-500 hover:text-gray-700 text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : null}

            <select
              id="reviewer-select"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="" disabled>Select family member</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-orange-500" />
              Rating (1 - 5 Stars)
            </label>
            <div className="p-3 bg-orange-50/40 rounded-xl border border-orange-100 flex items-center justify-between">
              <Rating
                value={rating}
                onChange={setRating}
                size="lg"
                readOnly={false}
              />
              <span className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                {rating} / 5
              </span>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label htmlFor="review-feedback" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
              Written Feedback
            </label>
            <textarea
              id="review-feedback"
              rows={3}
              placeholder="e.g. Food was very good, chicken was tender but service was a bit slow..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              id="cancel-review-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-review-btn"
              type="submit"
              disabled={loading || !selectedMemberId}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-xs cursor-pointer"
            >
              {loading ? 'Saving Review...' : reviewToEdit ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
