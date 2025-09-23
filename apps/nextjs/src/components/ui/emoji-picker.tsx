"use client";

import { useState } from "react";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";

const COMMON_FOOD_EMOJIS = [
  "🍎",
  "🍌",
  "🍊",
  "🍇",
  "🍓",
  "🥝",
  "🍅",
  "🥕",
  "🌽",
  "🥒",
  "🥬",
  "🥦",
  "🧄",
  "🧅",
  "🥔",
  "🍆",
  "🌶️",
  "🥄",
  "🍴",
  "🥢",
  "🍳",
  "🥓",
  "🍖",
  "🍗",
  "🥩",
  "🍞",
  "🥖",
  "🧀",
  "🥛",
  "🍯",
  "🧂",
  "🌿",
  "🍋",
  "🥥",
  "🍑",
  "🍒",
  "🥭",
  "🍍",
  "🫐",
  "🥑",
  "🍄",
  "🥜",
  "🌰",
  "🍠",
  "🫘",
  "🫚",
  "🧈",
  "🥚",
  "🐟",
  "🦐",
  "🦀",
  "🦞",
  "🐙",
  "🦑",
  "🥫",
  "🫙",
  "🧊",
];

interface EmojiPickerProps {
  value?: string;
  onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPicker({
  value,
  onEmojiSelect,
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  const handleClear = () => {
    onEmojiSelect("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-10 p-0 text-lg"
          type="button"
        >
          {value ?? "🔍"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Choose an emoji</h4>
            {value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="h-48 overflow-x-hidden overflow-y-auto">
            <div className="grid grid-cols-10 gap-1">
              {COMMON_FOOD_EMOJIS.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  className="h-8 w-8 p-0 text-lg hover:bg-gray-100"
                  onClick={() => handleEmojiClick(emoji)}
                  type="button"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
