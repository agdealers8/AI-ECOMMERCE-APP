import React, { useState } from 'react';
import type { GeneratedTextContent } from '../types';
import { SparklesIcon, DownloadIcon, CopyIcon, CheckIcon } from './IconComponents';

interface GeneratedTextViewProps {
    content: GeneratedTextContent | null;
    isLoading: boolean;
    onDownload: () => void;
}

const TextSkeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button onClick={handleCopy} className="text-gray-400 hover:text-indigo-600 transition-colors" aria-label="Copy to clipboard">
            {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
        </button>
    );
};

const SectionHeader: React.FC<{ title: string; textToCopy?: string | string[] }> = ({ title, textToCopy }) => {
    const formatText = () => {
        if (!textToCopy) return '';
        if (Array.isArray(textToCopy)) {
            return textToCopy.map(item => `- ${item}`).join('\n');
        }
        return textToCopy;
    };
    
    return (
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
            {textToCopy && <CopyButton textToCopy={formatText()} />}
        </div>
    );
};


export const GeneratedTextView: React.FC<GeneratedTextViewProps> = ({ content, isLoading, onDownload }) => {
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-start">
                <div>
                    <SectionHeader title="Product Name" textToCopy={content?.name} />
                    {isLoading ? <TextSkeleton className="h-8 w-48" /> :
                        <h2 className="text-2xl font-bold text-gray-800">{content?.name || 'Your catchy product name...'}</h2>
                    }
                </div>
                <button
                    onClick={onDownload}
                    disabled={!content || isLoading}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download Text
                </button>
            </div>
            <div>
                <SectionHeader title="Title" textToCopy={content?.title}/>
                 {isLoading ? <TextSkeleton className="h-6 w-full" /> :
                    <p className="text-lg text-gray-700">{content?.title || 'A descriptive title will be generated...'}</p>
                 }
            </div>
            <div>
                <SectionHeader title="Product Description" textToCopy={content?.description} />
                 {isLoading ? <>
                    <TextSkeleton className="h-5 w-full mb-2" />
                    <TextSkeleton className="h-5 w-5/6" />
                 </> :
                    <p className="text-base text-gray-600">{content?.description || 'An engaging product description will appear here.'}</p>
                 }
            </div>
            <div>
                <SectionHeader title="Highlights" textToCopy={content?.highlights}/>
                <ul className="space-y-2">
                    {isLoading ? (
                        <>
                            <li className="flex items-start"><SparklesIcon className="w-5 h-5 mr-2 text-gray-300 flex-shrink-0" /><TextSkeleton className="h-5 w-5/6" /></li>
                            <li className="flex items-start"><SparklesIcon className="w-5 h-5 mr-2 text-gray-300 flex-shrink-0" /><TextSkeleton className="h-5 w-4/6" /></li>
                            <li className="flex items-start"><SparklesIcon className="w-5 h-5 mr-2 text-gray-300 flex-shrink-0" /><TextSkeleton className="h-5 w-5/6" /></li>
                        </>
                    ) : content?.highlights ? (
                        content.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start text-gray-600">
                                <SparklesIcon className="w-5 h-5 mr-2 text-indigo-500 flex-shrink-0 mt-0.5" />
                                <span>{highlight}</span>
                            </li>
                        ))
                    ) : (
                         <li className="flex items-start text-gray-400 italic">
                            Key features will be listed here.
                        </li>
                    )}
                </ul>
            </div>
             <div>
                <SectionHeader title="Why You'll Love It" textToCopy={content?.benefits}/>
                <ul className="space-y-2">
                    {isLoading ? (
                        <>
                            <li className="flex items-start"><SparklesIcon className="w-5 h-5 mr-2 text-gray-300 flex-shrink-0" /><TextSkeleton className="h-5 w-full" /></li>
                            <li className="flex items-start"><SparklesIcon className="w-5 h-5 mr-2 text-gray-300 flex-shrink-0" /><TextSkeleton className="h-5 w-5/6" /></li>
                        </>
                    ) : content?.benefits ? (
                        content.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start text-gray-600">
                                <SparklesIcon className="w-5 h-5 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                                <span>{benefit}</span>
                            </li>
                        ))
                    ) : (
                         <li className="flex items-start text-gray-400 italic">
                            Customer benefits will appear here.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};


interface GeneratedImageViewProps {
    images: string[];
    isLoading: boolean;
    onDownloadImage: (image: string, index: number) => void;
    onDownloadAllImages: () => void;
    title?: string;
}

const ImageSkeleton: React.FC = () => (
    <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse"></div>
);

export const GeneratedImageView: React.FC<GeneratedImageViewProps> = ({ images, isLoading, onDownloadImage, onDownloadAllImages, title = "Generated Images" }) => {
    const skeletonCount = title === "Generated Images" ? 4 : 8;
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                {images.length > 0 && !isLoading && (
                    <button
                        onClick={onDownloadAllImages}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download All
                    </button>
                )}
            </div>

            {isLoading && images.length === 0 && (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {Array.from({ length: skeletonCount }).map((_, i) => (
                        <div key={i} className="aspect-square"><ImageSkeleton/></div>
                     ))}
                 </div>
            )}
            {!isLoading && images.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 bg-gray-50 rounded-lg p-8 h-64">
                    <SparklesIcon className="w-12 h-12 text-gray-300 mb-4"/>
                    <p>Your generated product images will appear here.</p>
                </div>
            )}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <div key={index} className="group relative aspect-square rounded-lg overflow-hidden shadow-md">
                            <img src={image} alt={`Generated product variation ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                <button
                                    onClick={() => onDownloadImage(image, index)}
                                    className="absolute top-2 right-2 p-2 bg-white/70 rounded-full text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white hover:scale-110"
                                    aria-label="Download image"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
