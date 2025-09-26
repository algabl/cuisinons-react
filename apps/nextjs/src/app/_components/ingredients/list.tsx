"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Package,
  Plus,
  Search,
} from "lucide-react";

import type { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { IngredientListItem } from "./list-item";

type SortField = "name" | "type" | "createdAt";
type SortDirection = "asc" | "desc";

interface IngredientsListProps {
  ingredients: Awaited<ReturnType<typeof api.ingredient.getWithRecipeUsage>>;
  userId: string;
}

export function IngredientsList({ ingredients, userId }: IngredientsListProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filteredIngredients = ingredients
    .filter((ingredient) =>
      ingredient.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      let aValue = a[sortField] ?? "";
      let bValue = b[sortField] ?? "";
      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  return (
    <div className="container mx-auto">
      {/* Controls */}
      <div className="bg-background/80 sticky top-0 z-10 mb-6 flex flex-col gap-4 backdrop-blur sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2">
          <Search className="text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Search ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/app/ingredients/create">
              <Plus className="h-4 w-4" />
              New Ingredient
            </Link>
          </Button>
        </div>
      </div>

      {/* Sorting */}
      <div className="mb-4 flex gap-2">
        <Button variant="outline" onClick={() => handleSort("name")}>
          Name
          {sortField === "name" ? (
            sortDirection === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronUp className="ml-2 h-4 w-4" />
            )
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
        <Button variant="outline" onClick={() => handleSort("type")}>
          Type
          {sortField === "type" ? (
            sortDirection === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronUp className="ml-2 h-4 w-4" />
            )
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
        <Button variant="outline" onClick={() => handleSort("createdAt")}>
          Created At
          {sortField === "createdAt" ? (
            sortDirection === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronUp className="ml-2 h-4 w-4" />
            )
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Content */}
      {filteredIngredients.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center py-24 text-center">
          <Package className="mb-4 h-12 w-12 opacity-30" />
          <h3 className="mb-2 text-xl font-semibold">No ingredients found</h3>
          <p className="mb-4 text-sm">
            Try adjusting your search or create a new ingredient.
          </p>
          <Button asChild>
            <Link href="/app/ingredients/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Ingredient
            </Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Recipe Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIngredients.map((ingredient) => (
              <IngredientListItem
                key={ingredient.id}
                ingredient={ingredient}
                userId={userId}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
