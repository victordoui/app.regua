import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Image, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Clock,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Story {
  id: string;
  image_url: string;
  title?: string;
  expires_at?: string;
  created_at: string;
}

interface StoriesCarouselProps {
  stories: Story[];
  companyName?: string;
  primaryColor?: string;
}

export const StoriesCarousel = ({
  stories,
  companyName = "Destaques",
  primaryColor = "#0ea5e9",
}: StoriesCarouselProps) => {
  const [viewingStory, setViewingStory] = useState<number | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  if (stories.length === 0) return null;

  const handleStoryClick = (index: number) => {
    setViewingStory(index);
    setViewedStories((prev) => new Set(prev).add(stories[index].id));
  };

  const handleClose = () => {
    setViewingStory(null);
  };

  const handlePrev = () => {
    if (viewingStory !== null && viewingStory > 0) {
      setViewingStory(viewingStory - 1);
      setViewedStories((prev) => new Set(prev).add(stories[viewingStory - 1].id));
    }
  };

  const handleNext = () => {
    if (viewingStory !== null && viewingStory < stories.length - 1) {
      setViewingStory(viewingStory + 1);
      setViewedStories((prev) => new Set(prev).add(stories[viewingStory + 1].id));
    } else {
      handleClose();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Agora";
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  return (
    <>
      {/* Stories Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {stories.map((story, index) => {
          const isViewed = viewedStories.has(story.id);
          return (
            <button
              key={story.id}
              onClick={() => handleStoryClick(index)}
              className="flex-shrink-0 flex flex-col items-center gap-1"
            >
              <div
                className={`p-0.5 rounded-full ${
                  isViewed ? "bg-muted" : "bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500"
                }`}
              >
                <div className="p-0.5 bg-background rounded-full">
                  <div
                    className="w-16 h-16 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${story.image_url})` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground truncate w-16 text-center">
                {story.title || companyName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fullscreen Story Viewer */}
      <AnimatePresence>
        {viewingStory !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={handleClose}
          >
            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
              {stories.map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/30"
                >
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: index < viewingStory ? "100%" : "0%" }}
                    animate={{ width: index <= viewingStory ? "100%" : "0%" }}
                    transition={index === viewingStory ? { duration: 5 } : { duration: 0 }}
                  />
                </div>
              ))}
            </div>

            {/* Story info */}
            <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-white">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {companyName.charAt(0)}
                </div>
                <span className="font-medium text-sm">{companyName}</span>
                <span className="text-white/60 text-xs">
                  {formatTimeAgo(stories[viewingStory].created_at)}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="text-white p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Story image */}
            <motion.img
              key={viewingStory}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={stories[viewingStory].image_url}
              alt={stories[viewingStory].title || "Story"}
              className="max-h-[80vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation */}
            <button
              className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            />
            <button
              className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            />

            {/* Story title */}
            {stories[viewingStory].title && (
              <div className="absolute bottom-8 left-4 right-4 text-center z-10">
                <p className="text-white text-lg font-medium">
                  {stories[viewingStory].title}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
