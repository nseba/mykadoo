'use client';

/**
 * Search Form Component
 *
 * Interactive form for gift search criteria
 */

import { useState } from 'react';

export interface SearchFormData {
  occasion: string;
  relationship: string;
  ageRange: string;
  gender?: string;
  budgetMin: number;
  budgetMax: number;
  interests: string[];
  recipientName?: string;
}

interface SearchFormProps {
  onSubmit: (data: SearchFormData) => void;
  loading?: boolean;
}

const AGE_RANGES = [
  'Child (0-12)',
  'Teen (13-17)',
  'Young Adult (18-30)',
  'Adult (31-50)',
  'Senior (50+)',
];

const GENDERS = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];

const COMMON_OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Christmas',
  'Wedding',
  'Graduation',
  'New Baby',
  'Retirement',
  'Housewarming',
  'Thank You',
  'Just Because',
];

const COMMON_RELATIONSHIPS = [
  'Spouse/Partner',
  'Parent',
  'Sibling',
  'Child',
  'Friend',
  'Coworker',
  'Boss',
  'Teacher',
  'Neighbor',
  'Other',
];

export function SearchForm({ onSubmit, loading = false }: SearchFormProps) {
  const [formData, setFormData] = useState<SearchFormData>({
    occasion: '',
    relationship: '',
    ageRange: '',
    gender: undefined,
    budgetMin: 20,
    budgetMax: 100,
    interests: [],
    recipientName: '',
  });

  const [interestInput, setInterestInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestInput.trim()],
      });
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  const isValid =
    formData.occasion &&
    formData.relationship &&
    formData.ageRange &&
    formData.budgetMin > 0 &&
    formData.budgetMax >= formData.budgetMin &&
    formData.interests.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Occasion */}
        <div>
          <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-2">
            Occasion *
          </label>
          <select
            id="occasion"
            value={formData.occasion}
            onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            required
          >
            <option value="">Select an occasion</option>
            {COMMON_OCCASIONS.map((occ) => (
              <option key={occ} value={occ}>
                {occ}
              </option>
            ))}
          </select>
        </div>

        {/* Relationship */}
        <div>
          <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">
            Relationship *
          </label>
          <select
            id="relationship"
            value={formData.relationship}
            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            required
          >
            <option value="">Select relationship</option>
            {COMMON_RELATIONSHIPS.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
        </div>

        {/* Age Range */}
        <div>
          <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-2">
            Age Range *
          </label>
          <select
            id="ageRange"
            value={formData.ageRange}
            onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            required
          >
            <option value="">Select age range</option>
            {AGE_RANGES.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
            Gender (Optional)
          </label>
          <select
            id="gender"
            value={formData.gender || ''}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value || undefined })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral-500 focus:border-transparent"
          >
            <option value="">Select gender</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Budget Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Budget Range (${formData.budgetMin} - ${formData.budgetMax}) *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="budgetMin" className="block text-xs text-gray-500 mb-1">
              Minimum
            </label>
            <input
              id="budgetMin"
              type="number"
              min="1"
              max="10000"
              value={formData.budgetMin}
              onChange={(e) =>
                setFormData({ ...formData, budgetMin: parseInt(e.target.value) || 1 })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="budgetMax" className="block text-xs text-gray-500 mb-1">
              Maximum
            </label>
            <input
              id="budgetMax"
              type="number"
              min="1"
              max="10000"
              value={formData.budgetMax}
              onChange={(e) =>
                setFormData({ ...formData, budgetMax: parseInt(e.target.value) || 100 })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Interests */}
      <div>
        <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
          Interests & Hobbies *
        </label>
        <div className="flex gap-2 mb-2">
          <input
            id="interests"
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addInterest();
              }
            }}
            placeholder="e.g., Reading, Yoga, Coffee"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addInterest}
            className="px-4 py-2 bg-coral-100 text-coral-700 rounded-md hover:bg-coral-200 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.interests.map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center px-3 py-1 bg-coral-500 text-white rounded-full text-sm"
            >
              {interest}
              <button
                type="button"
                onClick={() => removeInterest(interest)}
                className="ml-2 hover:text-coral-200"
                aria-label={`Remove ${interest}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {formData.interests.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Add at least one interest to get personalized recommendations
          </p>
        )}
      </div>

      {/* Recipient Name */}
      <div>
        <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-2">
          Recipient Name (Optional)
        </label>
        <input
          id="recipientName"
          type="text"
          value={formData.recipientName}
          onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
          placeholder="e.g., Sarah"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral-500 focus:border-transparent"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full px-6 py-3 bg-coral-500 text-white font-medium rounded-md hover:bg-coral-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Finding Gifts...' : 'Find Perfect Gifts'}
      </button>
    </form>
  );
}
