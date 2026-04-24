"use client";

const SUGGESTIONS = [
  { icon: "🏨", text: "Suggest me some hotels near IGI airport" },
  { icon: "🍽️", text: "What are the best restaurants for dinner" },
  { icon: "💼", text: "I want to book a conference room for 100 people" },
  { icon: "🎉", text: "What are the most exciting upcoming events in Delhi ?" },
  { icon: "🚗", text: "Where can i get the parking facilities near IGI airport" },
  { icon: "📍", text: "Plan a 2 days itinerary for me in Delhi" },
];

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
}

export default function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="px-4 pb-3 pt-1">
      <p className="text-xs text-gray-400 mb-2 font-medium">Quick questions</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => onSelect(s.text)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:border-[#C8973A] hover:text-[#1A3557] hover:bg-amber-50 transition-all duration-200 shadow-sm font-medium"
          >
            <span>{s.icon}</span>
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
