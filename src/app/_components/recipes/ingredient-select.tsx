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
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/trpc/react";
import CreateForm from "../ingredients/create-form";
import { type Ingredient, type Recipe } from "~/server/api/types";
import { IngredientForm } from "./ingredient-form";

interface IngredientSelectProps {
  value?: Ingredient;
  recipe: Recipe;
}

export function IngredientSelect({ value, recipe }: IngredientSelectProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(value ?? null);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Optionally filter by userId if provided
  const ingredientSearch = api.ingredient.search.useQuery(debouncedSearch);

  return (
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
              {ingredientSearch.data?.length === 0 && (
                <CommandEmpty>
                  No ingredients found.
                  <Button
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => {
                      setIsPopoverOpen(false);
                      setIsDialogOpen(true);
                      // Logic to open ingredient creation dialog
                    }}
                  >
                    Create Ingredient
                  </Button>
                </CommandEmpty>
              )}
              <CommandGroup>
                {ingredientSearch.data?.map((ingredient) => (
                  <CommandItem
                    key={ingredient.id}
                    value={ingredient.name}
                    onSelect={() => {
                      setIsPopoverOpen(false);
                      setSearch("");
                      setSelectedIngredient(ingredient);
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
      {selectedIngredient && (
        <Dialog
          open={selectedIngredient != null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedIngredient(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedIngredient.name}</DialogTitle>
            </DialogHeader>
            <IngredientForm recipe={recipe} ingredient={selectedIngredient} />
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Ingredient</DialogTitle>
            <CreateForm
              onSubmit={(ingredient) => {
                setSelectedIngredient(ingredient);
                setIsDialogOpen(false);
              }}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
