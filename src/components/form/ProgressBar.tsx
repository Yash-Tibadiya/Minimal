import React from "react";

export type ProgressBarProps = {
  currentStepIndex: number; // 1-based
  totalSteps: number;
};

export default function ProgressBar({ currentStepIndex, totalSteps }: ProgressBarProps) {
  const safeTotal = Math.max(0, Number(totalSteps) || 0);
  const safeIndex = Math.min(Math.max(1, Number(currentStepIndex) || 1), Math.max(1, safeTotal));
  const percent = safeTotal > 0 ? Math.round((safeIndex / safeTotal) * 100) : 0;

  return (
    <div className="w-full">
      <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-2 bg-green-750 transition-all duration-300"
          style={{ width: `${percent}%` }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          role="progressbar"
        />
      </div>
    </div>
  );
}