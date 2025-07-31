import React, { useState } from "react";

export default function FeedbackSmileys({ onFeedbackChange }) {
  const [selectedRating, setSelectedRating] = useState(null);

  const ratings = [
    {
      value: 1,
      emoji: "😞",
      label: "Très mauvais",
      color: "text-red-600"
    },
    {
      value: 2,
      emoji: "😐",
      label: "Mauvais",
      color: "text-orange-600"
    },
    {
      value: 3,
      emoji: "😊",
      label: "Correct",
      color: "text-yellow-600"
    },
    {
      value: 4,
      emoji: "😄",
      label: "Bon",
      color: "text-blue-600"
    },
    {
      value: 5,
      emoji: "🤩",
      label: "Excellent",
      color: "text-green-600"
    }
  ];

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
    if (onFeedbackChange) {
      onFeedbackChange(rating);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Comment évaluez-vous cette analyse ?</h3>
      
      <div className="flex justify-center space-x-4 mb-4">
        {ratings.map((rating) => (
          <button
            key={rating.value}
            onClick={() => handleRatingClick(rating.value)}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
              selectedRating === rating.value
                ? `border-${rating.color.split('-')[1]}-500 bg-${rating.color.split('-')[1]}-50`
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-3xl mb-2">{rating.emoji}</span>
            <span className={`text-sm font-medium ${rating.color}`}>{rating.label}</span>
          </button>
        ))}
      </div>

      {selectedRating && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Merci pour votre feedback ! Nous utilisons ces informations pour améliorer nos analyses.
          </p>
        </div>
      )}
    </div>
  );
} 