"use client";
import { useState } from "react";
import { type RouterOutputs } from "~/trpc/react";
import { RecipeCard } from "./card";
import { RecipeListItem } from "./list-item";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { List as ListIcon, LayoutGrid, Plus, Search } from "lucide-react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

type Recipe = RouterOutputs["recipe"]["getAll"][number];
type ViewMode = "grid" | "list";
type SortField = "name" | "cookingTime" | "createdAt";
type SortDirection = "asc" | "desc";

export function List({ recipes }: { recipes: Recipe[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filteredRecipes = recipes
    .filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description?.toLowerCase().includes(search.toLowerCase()) ?? false),
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
    <div className="container mx-auto py-8">
      {/* Controls */}
      <div className="bg-background/80 sticky top-0 z-10 mb-6 flex flex-col gap-4 backdrop-blur sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2">
          <Search className="text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            aria-label="Grid view"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            aria-label="List view"
            onClick={() => setViewMode("list")}
          >
            <ListIcon className="h-5 w-5" />
          </Button>
          <Button asChild className="ml-2">
            <Link href="/app/recipes/create">
              <Plus className="h-4 w-4" />
              New Recipe
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
        <Button variant="outline" onClick={() => handleSort("cookingTime")}>
          Cooking Time
          {sortField === "cookingTime" ? (
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
      {filteredRecipes.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center py-24 text-center">
          <LayoutGrid className="mb-4 h-12 w-12 opacity-30" />
          <h3 className="mb-2 text-xl font-semibold">No recipes found</h3>
          <p className="mb-4 text-sm">
            Try adjusting your search or create a new recipe.
          </p>
          <Button asChild>
            <Link href="/app/recipes/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Recipe
            </Link>
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipe</TableHead>
              <TableHead className="hidden md:table-cell">
                Description
              </TableHead>
              <TableHead>Total Time</TableHead>
              <TableHead className="text-right">Servings</TableHead>
              <TableHead className="text-right">Calories</TableHead>
              <TableHead className="text-center">Privacy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecipes.map((recipe) => (
              <RecipeListItem key={recipe.id} recipe={recipe} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
