import React from 'react';
import type { HistoryItem } from '../types';
import { CloseIcon, ImageIcon } from './IconComponents';

interface HistoryPanelProps {
    history: HistoryItem[];
    isOpen: boolean;
    onClose: () => void;
    onLoadHistory: (id: string) => void;
    onClearHistory: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, isOpen, onClose, onLoadHistory, onClearHistory }) => {
    
    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(timestamp));
    };
    
    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/30 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside 
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    <header className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-bold text-gray-800">Generation History</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </header>
                    
                    {history.length === 0 ? (
                        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 p-6">
                            <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="font-semibold">No History Yet</p>
                            <p className="text-sm">Your generated product content will appear here.</p>
                        </div>
                    ) : (
                        <div className="flex-grow overflow-y-auto">
                            <ul className="divide-y">
                                {history.map(item => (
                                    <li key={item.id}>
                                        <button 
                                            onClick={() => onLoadHistory(item.id)}
                                            className="w-full flex items-center p-4 space-x-4 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <img 
                                                src={`data:${item.uploadedImage.mimeType};base64,${item.uploadedImage.base64}`}
                                                alt="Product thumbnail" 
                                                className="w-16 h-16 rounded-md object-cover bg-gray-100 flex-shrink-0"
                                            />
                                            <div className="flex-grow">
                                                <p className="font-semibold text-gray-800 truncate">{item.generatedText.name}</p>
                                                <p className="text-sm text-gray-500">{formatDate(item.timestamp)}</p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <footer className="p-4 border-t">
                        <button
                            onClick={onClearHistory}
                            disabled={history.length === 0}
                            className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md border border-red-200 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Clear All History
                        </button>
                    </footer>
                </div>
            </aside>
        </>
    );
};

export default HistoryPanel;
