export interface GeneratedTextContent {
  name: string;
  title: string;
  highlights: string[];
  description: string;
  benefits: string[];
}

export interface UploadedImage {
  base64: string;
  mimeType: string;
}

export interface UserPreferences {
  category: string;
  audience: string;
  features: string;
  tone: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  uploadedImage: UploadedImage;
  userPreferences: UserPreferences;
  generatedText: GeneratedTextContent;
  generatedImages: string[];
}
