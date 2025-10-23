import React, { useState } from 'react';
import { SparklesIcon, ImageIcon } from './IconComponents';
import { GeneratedImageView } from './GeneratedContentView';
import { generateImagesFromText } from '../services/geminiService';

const TextToImageStudio: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [numberOfImages, setNumberOfImages] = useState(4);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt) {
            setError("Please enter a prompt to generate images.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        try {
            const images = await generateImagesFromText(prompt, numberOfImages);
            setGeneratedImages(images);
        } catch (e) {
            console.error(e);
            setError("Failed to generate images. The prompt may have been rejected. Please try again with a different prompt.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const downloadImage = (image: string, index: number) => {
        const a = document.createElement('a');
        a.href = image;
        a.download = `creative-image-${index + 1}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

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
                    Creative Studio
                </h1>
                <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
                    Describe anything you can imagine, and let AI bring it to life as a stunning image.
                </p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Controls */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg space-y-6 self-start">
                     <h2 className="text-xl font-bold text-gray-800">1. Describe Your Image</h2>
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Prompt</label>
                        <textarea 
                            id="prompt" 
                            name="prompt" 
                            rows={8}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A majestic lion wearing a crown, cinematic lighting, hyperrealistic, 4k" 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                     <div>
                        <label htmlFor="numberOfImages" className="block text-sm font-medium text-gray-700">Number of Images: <span className="font-bold text-indigo-600">{numberOfImages}</span></label>
                         <input
                            id="numberOfImages"
                            type="range"
                            min="1"
                            max="4"
                            value={numberOfImages}
                            onChange={(e) => setNumberOfImages(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                         <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all"
                        >
                            <ImageIcon className="w-5 h-5 mr-2" />
                            {isLoading ? 'Generating...' : 'Generate Images'}
                        </button>
                    </div>
                </div>

                {/* Right Column: Output */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    <GeneratedImageView 
                        images={generatedImages} 
                        isLoading={isLoading} 
                        onDownloadImage={handleDownloadImage}
                        onDownloadAllImages={handleDownloadAllImages}
                        title="Creative Results"
                    />
                </div>
            </div>
        </div>
    );
};

export default TextToImageStudio;