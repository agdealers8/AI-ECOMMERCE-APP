import React, { useState, useEffect, useRef } from 'react';
import ImageUploader from './ImageUploader';
import { GeneratedTextView, GeneratedImageView } from './GeneratedContentView';
import { generateTextualContent, generateImageVariations } from '../services/geminiService';
import { TextIcon, ImageIcon } from './IconComponents';
import type { GeneratedTextContent, UploadedImage, UserPreferences, HistoryItem } from '../types';

interface ProductContentGeneratorProps {
    onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
    initialState: HistoryItem | null;
}

const ProductContentGenerator: React.FC<ProductContentGeneratorProps> = ({ onSaveToHistory, initialState }) => {
    const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
    const [generatedText, setGeneratedText] = useState<GeneratedTextContent | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoadingText, setIsLoadingText] = useState(false);
    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const textGeneratedRef = useRef(false);
    const imagesGeneratedRef = useRef(false);

    const [userPreferences, setUserPreferences] = useState<UserPreferences>({
        category: '',
        audience: '',
        features: '',
        tone: 'Professional',
    });
    
    useEffect(() => {
        if (initialState) {
            setUploadedImage(initialState.uploadedImage);
            setUserPreferences(initialState.userPreferences);
            setGeneratedText(initialState.generatedText);
            setGeneratedImages(initialState.generatedImages);
            setError(null);
            textGeneratedRef.current = !!initialState.generatedText;
            imagesGeneratedRef.current = !!initialState.generatedImages?.length;
        }
    }, [initialState]);

    useEffect(() => {
        if (textGeneratedRef.current && imagesGeneratedRef.current && uploadedImage && generatedText && generatedImages.length > 0) {
            onSaveToHistory({
                uploadedImage,
                userPreferences,
                generatedText,
                generatedImages
            });
            // Reset refs to prevent re-saving on subsequent actions
            textGeneratedRef.current = false;
            imagesGeneratedRef.current = false;
        }
    }, [generatedText, generatedImages, uploadedImage, userPreferences, onSaveToHistory]);

    const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserPreferences(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (image: UploadedImage) => {
        setUploadedImage(image);
        setError(null);
        setGeneratedText(null);
        setGeneratedImages([]);
        textGeneratedRef.current = false;
        imagesGeneratedRef.current = false;
    };

    const handleGenerateText = async () => {
        if (!uploadedImage) return;
        setIsLoadingText(true);
        setError(null);
        try {
            const content = await generateTextualContent(uploadedImage.base64, uploadedImage.mimeType, userPreferences);
            setGeneratedText(content);
            textGeneratedRef.current = true;
        } catch (e) {
            console.error(e);
            setError("Failed to generate text content. Please try again.");
        } finally {
            setIsLoadingText(false);
        }
    };

    const handleGenerateImages = async () => {
        if (!uploadedImage) return;
        setIsLoadingImages(true);
        setError(null);
        try {
            const images = await generateImageVariations(uploadedImage.base64, uploadedImage.mimeType, userPreferences);
            setGeneratedImages(images);
            imagesGeneratedRef.current = true;
        } catch (e) {
            console.error(e);
            setError("Failed to generate images. Please try again.");
        } finally {
            setIsLoadingImages(false);
        }
    };
    
    const handleDownloadText = () => {
        if (!generatedText) return;
        
        const { name, title, description, highlights, benefits } = generatedText;

        const contentString = `
Product Name:
${name}

---

Title:
${title}

---

Description:
${description}

---

Highlights:
${highlights.map(h => `- ${h}`).join('\n')}

---

Benefits:
${benefits.map(b => `- ${b}`).join('\n')}
        `;

        const blob = new Blob([contentString.trim()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-content.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const downloadImage = (image: string, index: number) => {
        const a = document.createElement('a');
        a.href = image;
        a.download = `product-image-${index + 1}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    const handleDownloadImage = (image: string, index: number) => {
        downloadImage(image, index);
    };
    
    const handleDownloadAllImages = () => {
        generatedImages.forEach((image, index) => {
           setTimeout(() => downloadImage(image, index), index * 200);
        });
    };

    return (
         <div className="max-w-7xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
                    Product Studio
                </h1>
                <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
                    Upload your product image and let AI create professional photos and compelling descriptions for your listings.
                </p>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Input and Controls */}
                <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6 self-start">
                    <h2 className="text-xl font-bold text-gray-800">1. Upload Your Product Image</h2>
                    <ImageUploader onImageUpload={handleImageUpload} />
                    
                    {uploadedImage && (
                        <>
                        <div className="space-y-4 pt-6 border-t border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">2. (Optional) Refine Details</h2>
                            <p className="text-sm text-gray-500">Provide more details to get better, more tailored results.</p>
                            
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Product Category</label>
                                <input type="text" name="category" id="category" value={userPreferences.category} onChange={handlePreferenceChange} placeholder="e.g., Running Shoes, Kitchen Blender" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>

                            <div>
                                <label htmlFor="audience" className="block text-sm font-medium text-gray-700">Target Audience</label>
                                <input type="text" name="audience" id="audience" value={userPreferences.audience} onChange={handlePreferenceChange} placeholder="e.g., Athletes, Home Cooks" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>

                            <div>
                                <label htmlFor="features" className="block text-sm font-medium text-gray-700">Key Features / Keywords</label>
                                <textarea name="features" id="features" rows={3} value={userPreferences.features} onChange={handlePreferenceChange} placeholder="e.g., Waterproof, Organic Cotton, 24-hour battery" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                            </div>

                            <div>
                                <label htmlFor="tone" className="block text-sm font-medium text-gray-700">Desired Tone</label>
                                <select id="tone" name="tone" value={userPreferences.tone} onChange={handlePreferenceChange} className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                                    <option>Professional</option>
                                    <option>Playful</option>
                                    <option>Luxurious</option>
                                    <option>Minimalist</option>
                                    <option>Bold & Energetic</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">3. Generate Content</h2>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleGenerateText}
                                    disabled={isLoadingText}
                                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all"
                                >
                                    <TextIcon className="w-5 h-5 mr-2" />
                                    {isLoadingText ? 'Generating...' : 'Generate Descriptions'}
                                </button>
                                <button
                                    onClick={handleGenerateImages}
                                    disabled={isLoadingImages}
                                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300 disabled:cursor-not-allowed transition-all"
                                >
                                    <ImageIcon className="w-5 h-5 mr-2" />
                                    {isLoadingImages ? 'Generating...' : 'Generate Images'}
                                </button>
                            </div>
                        </div>
                        </>
                    )}
                </div>

                {/* Right Column: Output */}
                <div className="bg-white p-6 rounded-2xl shadow-lg space-y-8">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    <GeneratedTextView content={generatedText} isLoading={isLoadingText} onDownload={handleDownloadText} />
                    <hr className="border-gray-200" />
                    <GeneratedImageView images={generatedImages} isLoading={isLoadingImages} onDownloadImage={handleDownloadImage} onDownloadAllImages={handleDownloadAllImages} />
                </div>
            </main>
        </div>
    );
}

export default ProductContentGenerator;
