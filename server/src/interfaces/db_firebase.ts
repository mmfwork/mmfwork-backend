export interface Answer {
  variant: string;
}

export interface Question {
  question: string;
  answers: Answer[];
}

export interface Survey {
  title: string;
  description: string;
  topic: string;
}

export interface SurveyData {
  survey: Survey;
  questions: Question[];
}

export interface ApiResponse {
  success: boolean;
  data: SurveyData;
}

interface Variant_get {
  id_question: string;
  id_survey: string;
}

interface Question_get {
  id: string;
  title: string;
  topic: string;
  description: string;
  searchKeywords: string[];
  variants: Variant_get[];
}

interface SurveyData_get {
  questions: Question_get[];
}