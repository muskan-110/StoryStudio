"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import StoryStudio from '@/components/StoryStudio';

export default function HomePage() {
  const [storyTitle, setStoryTitle] = useState<string>('Untitled Story');
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [externalPrompt, setExternalPrompt] = useState<string>('');

  const handleNewStory = () => {
    setStoryTitle('Untitled Story');
    setResetCounter((c) => c + 1);
    setExternalPrompt('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title={storyTitle} onNewStory={handleNewStory} onExamplePrompt={setExternalPrompt} />
      <main className="flex-1">
        <StoryStudio onTitleChange={setStoryTitle} resetSignal={resetCounter} externalPrompt={externalPrompt} />
      </main>
    </div>
  );
}