"use client";

import type { inferRouterOutputs } from "@trpc/server";
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
import type { AppRouter } from "~/server/api/root";
import { api } from "~/trpc/react";
import CreateForm from "../ingredients/create-form";

type Ingredient = NonNullable<
  inferRouterOutputs<AppRouter>["ingredient"]["getById"]
>;

interface IngredientSelectProps {
  value: Ingredient | null;
  onChange: (ingredient: Ingredient | null) => void;
  userId?: string;
}

export function IngredientSelect({
  value,
  onChange,
  userId,
}: IngredientSelectProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Optionally filter by userId if provided
  const ingredientSearch = api.ingredient.search.useQuery(debouncedSearch);

  return (
    <div className="flex space-x-2">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
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
        <Button
          variant="secondary"
          onClick={() => {
            setSelectedIngredient(null);
          }}
        >
          Remove Ingredient
        </Button>
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
