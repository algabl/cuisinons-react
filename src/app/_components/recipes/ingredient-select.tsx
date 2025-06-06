"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/trpc/react";
import CreateForm from "../ingredients/create-form";
import { type Ingredient } from "~/server/api/types";
import type { z } from "zod";
import type { formSchema } from "./edit-form";
import { createPortal } from "react-dom";

interface IngredientSelectProps {
  recipeIngredients?: z.infer<typeof formSchema>["recipeIngredients"];
  onSelect: (ingredient: Ingredient) => void;
}

export function IngredientSelect({
  recipeIngredients,
  onSelect,
}: IngredientSelectProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const ingredientSearch = api.ingredient.search.useQuery(debouncedSearch);

  const filteredIngredients: Ingredient[] = ingredientSearch.data
    ? ingredientSearch.data.filter(
        (ingredient) =>
          !(recipeIngredients ?? []).some(
            (i) => i.ingredientId === ingredient.id,
          ),
      )
    : [];

  // Render the dialog at the root of the body using React's createPortal
  const dialogNode = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Ingredient</DialogTitle>
          <CreateForm
            onSubmit={(ingredient) => {
              onSelect(ingredient);
              setIsDialogOpen(false);
            }}
            prefill={{ name: search }}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <div className="flex flex-col space-x-2">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="mb-4 w-full justify-start">
              <Plus />
              Add Ingredient
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Command>
              <CommandInput
                placeholder="Search or create ingredients..."
                value={search}
                onValueChange={setSearch}
                className="flex-grow"
              />
              <CommandList>
                {filteredIngredients.length === 0 && (
                  <CommandEmpty>
                    No ingredients found.
                    <Button
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => {
                        setIsPopoverOpen(false);
                        setIsDialogOpen(true);
                      }}
                    >
                      Create Ingredient
                    </Button>
                  </CommandEmpty>
                )}
                <CommandGroup>
                  {filteredIngredients.map((ingredient) => (
                    <CommandItem
                      key={ingredient.id}
                      value={ingredient.name}
                      onSelect={() => {
                        setIsPopoverOpen(false);
                        setSearch("");
                        onSelect(ingredient);
                      }}
                    >
                      {ingredient.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      {/* Use ReactDOM.createPortal for Dialog */}
      {typeof window !== "undefined" && createPortal(dialogNode, document.body)}
    </>
  );
}
