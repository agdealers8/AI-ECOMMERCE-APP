import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { GeneratedTextContent, UserPreferences } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textResponseSchema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: 'A catchy and short product name, 2-5 words long.',
    },
    title: {
      type: Type.STRING,
      description: 'A descriptive e-commerce title, optimized for search engines, around 10-15 words.',
    },
    description: {
      type: Type.STRING,
      description: 'A compelling and descriptive product paragraph, around 50-80 words long.',
    },
    highlights: {
      type: Type.ARRAY,
      description: 'A list of 3 to 5 key features or technical specifications, each as a short string.',
      items: {
        type: Type.STRING,
      },
    },
    benefits: {
        type: Type.ARRAY,
        description: 'A list of 2 to 4 key benefits for the customer, explaining why they should buy it.',
        items: {
          type: Type.STRING,
        },
    }
  },
  required: ['name', 'title', 'description', 'highlights', 'benefits'],
};


export const generateTextualContent = async (imageBase64: string, mimeType: string, preferences: UserPreferences): Promise<GeneratedTextContent> => {
    let prompt = `Based on the provided product image, generate content for an e-commerce listing.`;

    if (preferences.category) prompt += ` The product category is "${preferences.category}".`;
    if (preferences.audience) prompt += ` The target audience is "${preferences.audience}".`;
    if (preferences.features) prompt += ` Key features to highlight are: "${preferences.features}".`;
    if (preferences.tone) prompt += ` The desired tone is "${preferences.tone}".`;

    prompt += ` Provide a catchy product name, a descriptive title, a compelling product description, a list of 3-5 key highlights/specifications, and a list of 2-4 customer benefits.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType,
                    },
                },
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: textResponseSchema,
        },
    });

    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);

    // Basic validation to ensure the structure matches
    if (parsedJson && typeof parsedJson.name === 'string' && typeof parsedJson.title === 'string' && typeof parsedJson.description === 'string' && Array.isArray(parsedJson.highlights) && Array.isArray(parsedJson.benefits)) {
         return parsedJson as GeneratedTextContent;
    } else {
        throw new Error("Invalid JSON structure received from API.");
    }
};

export const generateImageVariations = async (imageBase64: string, mimeType: string, preferences: UserPreferences): Promise<string[]> => {
    const { category, audience, tone } = preferences;

    const contextualize = (prompt: string): string => {
        let p = prompt;
        if (category && p.includes("in a realistic setting")) {
            p += ` The product category is "${category}", so place it in a suitable environment (e.g., kitchen for a gadget, park for a shoe).`;
        }
        if (audience) {
            p += ` The scene should be appealing to ${audience}.`;
        }
        if (tone) {
            p += ` The overall mood should be ${tone}.`;
        }
        return p;
    };

    const prompts = [
        contextualize("A professional product photograph of this item from a 45-degree angle on a clean, neutral light grey background."),
        contextualize("A lifestyle shot of this product in a realistic setting."),
        contextualize("A close-up, detailed shot of this product, focusing on its texture and material craftsmanship against a complementary colored background."),
        contextualize("This product presented in premium, minimalist packaging, suggesting it's a high-quality gift.")
    ];

    const imageGenerationPromises = prompts.map(prompt => 
        ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: mimeType,
                        },
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        })
    );
    
    const responses = await Promise.all(imageGenerationPromises);

    const generatedImages: string[] = [];
    responses.forEach(response => {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
        }
    });

    return generatedImages;
};

export const generateImagesFromText = async (prompt: string, numberOfImages: number): Promise<string[]> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: numberOfImages,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });

    return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
};
