"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  color?: string;
}

export default function StatCard({ title, value, subtitle, icon, trend, color = "brand" }: StatCardProps) {
  const colorMap: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.positive ? "text-green-600" : "text-red-600"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorMap[color] || colorMap.brand}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
