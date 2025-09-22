export type QuestionOption =
  | string
  | {
      value: string;
      label: string;
      sublabel?: string;
      image?: string;
    };

export type Question = {
  // Prefer "code" as the stable key; also support legacy "name"
  code?: string;
  name?: string;

  // Supported types
  // text, email, number, textarea, date, radio, checkbox, dropdown, searchableDropdown,
  // document (file upload), phone (tel), yesNo/toggle (boolean)
  type:
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "date"
    | "radio"
    | "checkbox"
    | "dropdown"
    | "searchableDropdown"
    | "document"
    | "phone"
    | "yesNo"
    | "toggle";

  label?: string;
  required?: boolean;
  placeholder?: string;

  // validations / constraints
  min?: number;
  max?: number;

  // option-based
  options?: QuestionOption[];

  // file upload constraints
  filetype?: string[]; // e.g. [".pdf", "image/*"]
  maxFilesAllowed?: number;
  maxFileSize?: number; // MB

  // behavior
  showFollowupWhen?: string;
};

export type InputRendererProps = {
  question: Question;
  value: any;
  onChange: (code: string, value: any) => void;
  handleNext?: () => void;
  autoAdvance?: boolean; // Only auto-advance when a page has a single question
};