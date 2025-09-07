"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Undo, 
  Workflow, 
  PanelRightDashed, 
  Expand, 
  Rotate3d, 
  LayoutPanelTop, 
  Frame, 
  Grid3x2, 
  Shrink, 
  PanelRight, 
  ImagePlay, 
  ZoomIn, 
  TableOfContents 
} from 'lucide-react';
import { toast } from 'sonner';

interface Scene {
  id: string;
  title: string;
  content: string;
  images: { id: string; url: string; alt: string; seed?: string; model?: string; style?: string; }[];
  expanded: boolean;
}

interface StorySettings {
  numberOfScenes: number;
  targetAudience: string;
  safetyFilter: boolean;
}

interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  message?: string;
}

const GENRE_PRESETS = [
  'Fantasy', 'Sci-fi', 'Mystery', 'Educational', 'Romance', 'Thriller', 'Adventure', 'Horror'
];

const TONE_PRESETS = [
  'Lighthearted', 'Serious', 'Humorous', 'Dark', 'Inspirational', 'Dramatic', 'Whimsical', 'Mysterious'
];

const TARGET_AUDIENCES = [
  'Children', 'Young Adults', 'Adults', 'All Ages', 'Early Readers', 'Middle Grade', 'Teens'
];

// const EXAMPLE_PROMPTS = [
//   "A young dragon learns to control their fire magic while protecting a village from an ancient curse.",
//   "In a future city, an AI detective solves crimes by reading emotional data from digital memories.",
//   "Two rival bakers discover they must work together to save their town's annual festival.",
//   "A time-traveling librarian accidentally changes history and must fix the timeline before it's too late."
// ];

interface StoryStudioProps {
  onTitleChange?: (title: string) => void;
  resetSignal?: number;
  externalPrompt?: string;
}

export default function StoryStudio({ onTitleChange, resetSignal, externalPrompt }: StoryStudioProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [settings, setSettings] = useState<StorySettings>({
    numberOfScenes: 3,
    targetAudience: 'All Ages',
    safetyFilter: true
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showLog, setShowLog] = useState(false);
  
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; alt: string; sceneId: string; imageId: string; } | null>(null);
  const [storyTitle, setStoryTitle] = useState<string>("Untitled Story");
  const [showExportModal, setShowExportModal] = useState(false);
  
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // If an external prompt is provided (from header example), set it
  useEffect(() => {
    if (typeof externalPrompt === 'string' && externalPrompt.length > 0) {
      setPrompt(externalPrompt);
    }
  }, [externalPrompt]);

  const initializeGenerationSteps = useCallback(() => {
    return [
      { id: 'planning', label: 'Planning story structure', status: 'pending' as const },
      { id: 'writing', label: 'Writing narrative', status: 'pending' as const },
      { id: 'illustrating', label: 'Generating illustrations', status: 'pending' as const }
    ];
  }, []);

  // When resetSignal changes, clear state to initial values
  useEffect(() => {
    if (resetSignal === undefined) return;
    setPrompt('');
    setSelectedGenre('');
    setSelectedTone('');
    setSettings({ numberOfScenes: 3, targetAudience: 'All Ages', safetyFilter: true });
    setIsGenerating(false);
    setGenerationProgress(0);
    setGenerationSteps([]);
    setShowAdvanced(false);
    setShowLog(false);
    setScenes([]);
    setSelectedSceneId(null);
    setLightboxImage(null);
    setStoryTitle('Untitled Story');
    setShowExportModal(false);
    onTitleChange && onTitleChange('Untitled Story');
  }, [resetSignal, onTitleChange]);

  const generateStory = useCallback(async (isDraft: boolean = false) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    const steps = initializeGenerationSteps();
    setGenerationSteps(steps);
    
    try {
      // Planning phase
      setGenerationSteps(prev => prev.map(step => 
        step.id === 'planning' 
          ? { ...step, status: 'active' }
          : step
      ));
      
      // Prepare request data
      const requestData = {
        prompt: prompt,
        genre: selectedGenre || 'general',
        tone: selectedTone || 'neutral',
        audience: settings.targetAudience,
        num_scenes: isDraft ? Math.min(3, settings.numberOfScenes) : settings.numberOfScenes
      };
      
      setGenerationProgress(20);
      
      setGenerationSteps(prev => prev.map(step => 
        step.id === 'planning' 
          ? { ...step, status: 'complete', message: 'Story outline created' }
          : step
      ));

      // Writing phase
      setGenerationSteps(prev => prev.map(step => 
        step.id === 'writing' 
          ? { ...step, status: 'active' }
          : step
      ));
      
      setGenerationProgress(40);

      // Make API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://storystudio-backend.onrender.com'}/scene/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const data = await response.json();
      
      setGenerationProgress(60);
      
      setGenerationSteps(prev => prev.map(step => 
        step.id === 'writing' 
          ? { ...step, status: 'complete', message: `${data.scenes.length} scenes written` }
          : step
      ));

      // Illustrating phase
      setGenerationSteps(prev => prev.map(step => 
        step.id === 'illustrating' 
          ? { ...step, status: 'active' }
          : step
      ));

      // Transform API response to our scene format
      const generatedScenes: Scene[] = data.scenes.map((scene: any, index: number) => ({
        id: `scene-${index + 1}`,
        title: `Scene ${index + 1}`,
        content: scene.text,
        images: [{
          id: `img-${index}-1`,
          url: scene.image || `data:image/png;base64,${scene.image_data}`,
          alt: `Illustration for Scene ${index + 1}`,
          seed: String(Math.random() * 1000000 | 0),
          model: 'Stable Diffusion'
        }],
        expanded: true // Show the full content by default
      }));

      setGenerationProgress(100);
      
      setGenerationSteps(prev => prev.map(step => 
        step.id === 'illustrating' 
          ? { ...step, status: 'complete', message: 'All images generated' }
          : step
      ));

      setScenes(generatedScenes);
      // Generate a title based on the prompt
      const generatedTitle = prompt.trim().length > 0
        ? prompt.split(' ').slice(0, 4).join(' ') + '...'
        : 'Untitled Story';
      setStoryTitle(generatedTitle);
      if (onTitleChange) {
        onTitleChange(generatedTitle);
      }
      toast.success(`Story generated successfully! ${generatedScenes.length} scenes created.`);
      
    } catch (error) {
      console.error('Story generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setGenerationSteps(prev => prev.map(step => 
        step.status === 'active' 
          ? { ...step, status: 'error', message: errorMessage }
          : step
      ));
      toast.error(`Failed to generate story: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, settings, initializeGenerationSteps]);

  const handleGenerate = () => generateStory(false);
  const handleQuickDraft = () => generateStory(true);

  const handleCancel = () => {
    setIsGenerating(false);
    setGenerationProgress(0);
    setGenerationSteps([]);
    toast.info('Generation cancelled');
  };

  const toggleSceneExpansion = (sceneId: string) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId 
        ? { ...scene, expanded: !scene.expanded }
        : scene
    ));
  };

  // const fillSurprisePrompt = () => {
  //   const randomPrompt = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
  //   setPrompt(randomPrompt);
  //   toast.info('Surprise prompt added!');
  // };

  const selectedScene = scenes.find(scene => scene.id === selectedSceneId);



  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-gradient-start to-bg-gradient-end">
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Left Column - Input & Controls */}
        <div className={`lg:w-96 space-y-6 ${isMobile && !showMobileControls ? 'hidden' : ''}`}>
          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="font-heading text-lg">{storyTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 ">
              <div>
                <Label htmlFor="prompt" className='space-x-1.5'>Your Story Idea</Label>
                <Textarea
                  id="prompt"
                  placeholder="A brave knight discovers that the dragon they've been hunting is actually protecting the kingdom from a greater evil..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-24 resize-none"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Genre</Label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_PRESETS.map((genre) => (
                    <Badge
                      key={genre}
                      variant={selectedGenre === genre ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedGenre(selectedGenre === genre ? '' : genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Tone</Label>
                <div className="flex flex-wrap gap-2">
                  {TONE_PRESETS.map((tone) => (
                    <Badge
                      key={tone}
                      variant={selectedTone === tone ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedTone(selectedTone === tone ? '' : tone)}
                    >
                      {tone}
                    </Badge>
                  ))}
                </div>
              </div>

              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    Advanced Controls
                    <PanelRightDashed className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="number-of-scenes" className="text-sm font-medium">Number of Scenes</Label>
                    <Input
                      id="number-of-scenes"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.numberOfScenes}
                      onChange={(e) => setSettings(prev => ({ ...prev, numberOfScenes: parseInt(e.target.value) || 1 }))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="target-audience">Target Audience</Label>
                    <Select 
                      value={settings.targetAudience} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, targetAudience: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TARGET_AUDIENCES.map((audience) => (
                          <SelectItem key={audience} value={audience}>
                            {audience}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Safety Filter control removed as requested */}
                </CollapsibleContent>
              </Collapsible>

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Workflow className="h-4 w-4 mr-2" />
                  Generate Story
                </Button>
                {/* <Button
                  variant="outline"
                  onClick={handleQuickDraft}
                  disabled={!prompt.trim() || isGenerating}
                >
                  Quick Draft
                </Button> */}
              </div>

              {isGenerating && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  className="w-full"
                >
                  Cancel Generation
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Generation Progress */}
          {(isGenerating || generationSteps.length > 0) && (
            <Card className="bg-card/95 backdrop-blur-sm border-border/50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generation Progress</span>
                    <span className="text-sm text-muted-foreground">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  
                  <Collapsible open={showLog} onOpenChange={setShowLog}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between">
                        Activity Log
                        <LayoutPanelTop className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2">
                      {generationSteps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${
                            step.status === 'complete' ? 'bg-green-500' :
                            step.status === 'active' ? 'bg-blue-500 animate-pulse' :
                            step.status === 'error' ? 'bg-red-500' :
                            'bg-gray-300'
                          }`} />
                          <span className="flex-1">{step.label}</span>
                          {step.message && (
                            <span className="text-xs text-muted-foreground">{step.message}</span>
                          )}
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Button */}
          {scenes.length > 0 && (
            <Card className="bg-card/95 backdrop-blur-sm border-border/50">
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowExportModal(true)}
                  className="w-full"
                >
                  <Frame className="h-4 w-4 mr-2" />
                  Export Story
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mobile Controls Toggle */}
        {isMobile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileControls(!showMobileControls)}
            className="fixed top-20 left-4 z-50 bg-card/95 backdrop-blur-sm"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        )}

        {/* Right Column - Story Canvas */}
        <div className="flex-1 space-y-6">
          {scenes.length === 0 ? (
            <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <ImagePlay className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading text-xl">Ready to Create</h3>
                  {isGenerating ? (
                    <div className="space-y-4">
                      <Progress value={generationProgress} className="w-full" />
                      <p className="text-muted-foreground">
                        {generationSteps.find(step => step.status === 'active')?.label || 'Generating your story...'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Enter your story idea in the input panel and click "Generate Story" to begin creating your narrative with AI-generated illustrations.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Scene Detail */}
              {selectedScene && (
                <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Frame className="h-5 w-5" />
                      {selectedScene.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList>
                        <TabsTrigger value="edit">Edit Scene</TabsTrigger>
                        <TabsTrigger value="images">Images</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="edit" className="space-y-4">
                        <Input
                          value={selectedScene.title}
                          onChange={(e) => {
                            setScenes(prev => prev.map(scene =>
                              scene.id === selectedScene.id
                                ? { ...scene, title: e.target.value }
                                : scene
                            ));
                          }}
                          className="font-medium"
                        />
                        <Textarea
                          value={selectedScene.content}
                          onChange={(e) => {
                            setScenes(prev => prev.map(scene =>
                              scene.id === selectedScene.id
                                ? { ...scene, content: e.target.value }
                                : scene
                            ));
                          }}
                          className="min-h-32"
                        />
                      </TabsContent>
                      
                      <TabsContent value="images" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedScene.images.map((image) => (
                            <div
                              key={image.id}
                              className="relative group cursor-pointer rounded-lg overflow-hidden"
                              onClick={() => setLightboxImage({
                                url: image.url,
                                alt: image.alt,
                                sceneId: selectedScene.id,
                                imageId: image.id
                              })}
                            >
                              <img
                                src={image.url}
                                alt={image.alt}
                                className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                <ZoomIn className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Scene List */}
              <div className="space-y-4" ref={scrollAreaRef}>
                {scenes.map((scene, index) => (
                  <Card
                    key={scene.id}
                    className={`bg-card/95 backdrop-blur-sm border-border/50 shadow-lg transition-all duration-200 hover:shadow-xl cursor-pointer ${
                      selectedSceneId === scene.id ? 'ring-2 ring-accent' : ''
                    }`}
                    style={{
                      transform: `perspective(1000px) rotateX(${scene.expanded ? '2deg' : '0deg'}) rotateY(${scene.expanded ? '1deg' : '0deg'})`
                    }}
                    onClick={() => setSelectedSceneId(scene.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {index + 1}
                          </Badge>
                          <CardTitle className="text-base font-heading">
                            {scene.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSceneExpansion(scene.id);
                            }}
                          >
                            {scene.expanded ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Grid3x2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <p className={`text-sm leading-relaxed ${
                            scene.expanded ? '' : 'line-clamp-2'
                          }`}>
                            {scene.content}
                          </p>
                        </div>
                        
                        <div className="w-48 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {scene.images.slice(0, scene.expanded ? undefined : 4).map((image) => (
                              <div
                                key={image.id}
                                className="relative group cursor-pointer rounded-md overflow-hidden"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxImage({
                                    url: image.url,
                                    alt: image.alt,
                                    sceneId: scene.id,
                                    imageId: image.id
                                  });
                                }}
                              >
                                <img
                                  src={image.url}
                                  alt={image.alt}
                                  className="w-full h-16 object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                  <ZoomIn className="h-4 w-4 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                          {!scene.expanded && scene.images.length > 4 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{scene.images.length - 4} more
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Story Navigation TOC */}
              <div className="fixed right-6 top-1/2 -translate-y-1/2 hidden xl:block">
                <Card className="bg-card/95 backdrop-blur-sm border-border/50 w-48">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TableOfContents className="h-4 w-4" />
                      Contents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {scenes.map((scene, index) => (
                        <button
                          key={scene.id}
                          className={`w-full text-left text-xs p-2 rounded transition-colors ${
                            selectedSceneId === scene.id
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedSceneId(scene.id)}
                        >
                          {index + 1}. {scene.title}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
          </DialogHeader>
          {lightboxImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.alt}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{lightboxImage.alt}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button 
              className="w-full"
              onClick={async () => {
                try {
                  // Prepare scenes data with base64 image data
                  const scenesData = scenes.map((scene, index) => {
                    const image = scene.images[0];
                    let imageData = null;
                    
                    // Extract base64 data from data URL or direct base64
                    if (image?.url) {
                      if (image.url.startsWith('data:image/png;base64,')) {
                        imageData = image.url.split(',')[1];
                      } else if (image.url.startsWith(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://storystudio-backend.onrender.com'}/static/`)) {
                        // This shouldn't happen with the new implementation, but handle gracefully
                        imageData = null;
                      }
                    }

                    return {
                      index,
                      text: scene.content,
                      image_data: imageData
                    };
                  });

                  // Make API call to export PDF
                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://storystudio-backend.onrender.com'}/story/export-pdf`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ scenes: scenesData }),
                  });

                  if (!response.ok) {
                    throw new Error('Failed to export PDF');
                  }

                  // Get the blob from response
                  const blob = await response.blob();
                  
                  // Create download link
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'story.pdf';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);

                  setShowExportModal(false);
                  toast.success('Story exported successfully!');
                } catch (error) {
                  toast.error('Failed to export story. Please try again.');
                }
              }}
            >
              <Frame className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}