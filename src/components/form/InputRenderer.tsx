"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import type { InputRendererProps } from "@/types/question";

export default function InputRenderer({
  question,
  value,
  onChange,
  handleNext,
  autoAdvance,
  error
}: InputRendererProps) {
  const code = question.code || question.name || "";

  const handleValueChange = (newValue: any) => {
    onChange(code, newValue);
    if (autoAdvance && handleNext) {
      // Auto advance for certain types
      if (["yesNo", "toggle", "radio", "dropdown", "searchableDropdown"].includes(question.type)) {
        handleNext({ [code]: newValue });
      }
    }
  };

  const commonProps = {
    value: value || "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => handleValueChange(e.target.value),
    placeholder: question.placeholder,
    "aria-invalid": !!error,
  };

  switch (question.type) {
    case "text":
      return <Input {...commonProps} type="text" />;
    case "email":
      return <Input {...commonProps} type="email" />;
    case "number":
      return <Input {...commonProps} type="number" min={question.min} max={question.max} />;
    case "phone":
      return <Input {...commonProps} type="tel" />;
    case "textarea":
      return <textarea {...commonProps} className="w-full min-h-20 p-3 border rounded-md" />;
    case "date":
      return <Input {...commonProps} type="date" />;
    case "radio":
      return (
        <div className="space-y-2">
          {question.options?.map((opt, i) => {
            const optValue = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label || opt.value;
            return (
              <label key={i} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={code}
                  value={optValue}
                  checked={value === optValue}
                  onChange={() => handleValueChange(optValue)}
                  className="text-primary"
                />
                <span>{optLabel}</span>
              </label>
            );
          })}
        </div>
      );
    case "checkbox":
      return (
        <div className="space-y-2">
          {question.options?.map((opt, i) => {
            const optValue = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label || opt.value;
            const isChecked = Array.isArray(value) ? value.includes(optValue) : false;
            return (
              <label key={i} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={optValue}
                  checked={isChecked}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...(Array.isArray(value) ? value : []), optValue]
                      : (Array.isArray(value) ? value : []).filter(v => v !== optValue);
                    handleValueChange(newValue);
                  }}
                  className="text-primary"
                />
                <span>{optLabel}</span>
              </label>
            );
          })}
        </div>
      );
    case "dropdown":
      return (
        <select
          value={value || ""}
          onChange={(e) => handleValueChange(e.target.value)}
          className="w-full h-9 px-3 py-1 border rounded-md bg-transparent"
        >
          <option value="">Select...</option>
          {question.options?.map((opt, i) => {
            const optValue = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label || opt.value;
            return <option key={i} value={optValue}>{optLabel}</option>;
          })}
        </select>
      );
    case "searchableDropdown":
      // For now, same as dropdown
      return (
        <select
          value={value || ""}
          onChange={(e) => handleValueChange(e.target.value)}
          className="w-full h-9 px-3 py-1 border rounded-md bg-transparent"
        >
          <option value="">Select...</option>
          {question.options?.map((opt, i) => {
            const optValue = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label || opt.value;
            return <option key={i} value={optValue}>{optLabel}</option>;
          })}
        </select>
      );
    case "yesNo":
      return (
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name={code}
              value="yes"
              checked={value === "yes"}
              onChange={() => handleValueChange("yes")}
              className="text-primary"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name={code}
              value="no"
              checked={value === "no"}
              onChange={() => handleValueChange("no")}
              className="text-primary"
            />
            <span>No</span>
          </label>
        </div>
      );
    case "toggle":
      return (
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleValueChange(e.target.checked)}
            className="text-primary"
          />
          <span>{question.label}</span>
        </label>
      );
    case "document":
      return (
        <input
          type="file"
          onChange={(e) => handleValueChange(e.target.files)}
          multiple={question.maxFilesAllowed ? question.maxFilesAllowed > 1 : false}
          accept={question.filetype?.join(",")}
          className="w-full"
        />
      );
    default:
      return <Input {...commonProps} type="text" />;
  }
}
