import React from "react";

export default function Chart({ 
  type = "bar", 
  data = [], 
  title = "", 
  height = 300,
  color = "indigo" 
}) {
  const colorClasses = {
    indigo: "bg-indigo-600",
    blue: "bg-blue-600",
    green: "bg-green-600",
    red: "bg-red-600",
    yellow: "bg-yellow-600",
    purple: "bg-purple-600"
  };

  const maxValue = Math.max(...data.map(item => item.value), 1);

  const renderBarChart = () => (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="w-24 text-sm text-gray-600 truncate">
            {item.label}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div
              className={`${colorClasses[color]} h-4 rounded-full transition-all duration-500`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            ></div>
          </div>
          <div className="w-12 text-sm font-medium text-gray-900 text-right">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => (
    <div className="relative" style={{ height: `${height}px` }}>
      <svg className="w-full h-full" viewBox={`0 0 400 ${height}`}>
        <polyline
          fill="none"
          stroke={colorClasses[color].replace('bg-', 'rgb(').replace('-600', '59, 130, 246)')}
          strokeWidth="2"
          points={data.map((item, index) => 
            `${(index / (data.length - 1)) * 400},${height - (item.value / maxValue) * height}`
          ).join(' ')}
        />
        {data.map((item, index) => (
          <circle
            key={index}
            cx={(index / (data.length - 1)) * 400}
            cy={height - (item.value / maxValue) * height}
            r="4"
            fill={colorClasses[color].replace('bg-', 'rgb(').replace('-600', '59, 130, 246)')}
          />
        ))}
      </svg>
    </div>
  );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M 100 100`,
              `L ${x1} ${y1}`,
              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={`hsl(${(index * 60) % 360}, 70%, 60%)`}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case "bar":
        return renderBarChart();
      case "line":
        return renderLineChart();
      case "pie":
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="space-y-4">
        {renderChart()}
        {type === "pie" && (
          <div className="flex flex-wrap gap-4 mt-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: `hsl(${(index * 60) % 360}, 70%, 60%)` }}
                ></div>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 