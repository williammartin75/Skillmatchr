import React from "react";

export default function InsightsCard({ title, value, description, icon, color = "indigo", trend = null }) {
  const colorClasses = {
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600"
  };

  const bgColorClasses = {
    indigo: "bg-indigo-50",
    green: "bg-green-50",
    red: "bg-red-50",
    yellow: "bg-yellow-50",
    blue: "bg-blue-50",
    purple: "bg-purple-50"
  };

  return (
    <div className={`${bgColorClasses[color]} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-medium ${
            trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
} 