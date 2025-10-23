import React, { useState, useEffect } from 'react';
import { SparklesIcon, HistoryIcon } from './components/IconComponents';
import type { HistoryItem } from './types';
import HistoryPanel from './components/HistoryPanel';
import ProductContentGenerator from './components/ProductContentGenerator';
import TextToImageStudio from './components/TextToImageStudio';

type ActiveView = 'product' | 'creative';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<ActiveView>('product');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyToLoad, setHistoryToLoad] = useState<HistoryItem | null>(null);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('generationHistory');
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load history from localStorage:", error);
            setHistory([]);
        }
    }, []);

    const saveHistory = (newHistory: HistoryItem[]) => {
        try {
            localStorage.setItem('generationHistory', JSON.stringify(newHistory));
            setHistory(newHistory);
        } catch (error) {
            console.error("Failed to save history to localStorage:", error);
        }
    };
    
    const handleSaveToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
        const newHistoryItem: HistoryItem = {
            ...item,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        const updatedHistory = [newHistoryItem, ...history];
        saveHistory(updatedHistory);
    };

    const handleClearHistory = () => {
        saveHistory([]);
        setIsHistoryOpen(false);
    };
    
    const handleLoadHistory = (id: string) => {
        const itemToLoad = history.find(item => item.id === id);
        if (itemToLoad) {
            setHistoryToLoad(itemToLoad);
            setActiveView('product'); // Switch to product view if not already there
            setIsHistoryOpen(false);
            // Reset after a short delay to allow the component to receive the prop
            setTimeout(() => setHistoryToLoad(null), 100);
        }
    };

    const NavButton: React.FC<{ view: ActiveView; label: string; }> = ({ view, label }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeView === view ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-100">
             <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-2">
                             <div className="inline-flex items-center bg-white p-2 rounded-full shadow-sm border">
                                <SparklesIcon className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
                                AI Content Suite
                            </h1>
                        </div>
                        <div className="flex items-center justify-center space-x-2 p-1 bg-gray-100 rounded-lg">
                            <NavButton view="product" label="Product Studio" />
                            <NavButton view="creative" label="Creative Studio" />
                        </div>
                        <div className="flex items-center">
                            <button 
                                onClick={() => setIsHistoryOpen(true)}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                                aria-label="View history"
                            >
                                <HistoryIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <main className="p-4 sm:p-6 lg:p-8">
                 {activeView === 'product' && <ProductContentGenerator onSaveToHistory={handleSaveToHistory} initialState={historyToLoad} />}
                 {activeView === 'creative' && <TextToImageStudio />}
            </main>

            <HistoryPanel
                history={history}
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                onLoadHistory={handleLoadHistory}
                onClearHistory={handleClearHistory}
            />
        </div>
    );
};

export default App;
