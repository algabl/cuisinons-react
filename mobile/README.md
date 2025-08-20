# Cuisinons Mobile App

React Native Expo app that connects to the Cuisinons tRPC API using a custom HTTP client.

## Setup

1. Make sure your Next.js API is running on `http://localhost:3000`
2. Install dependencies:

   ```bash
   cd mobile
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   ```

## Architecture

Instead of using `@trpc/react-query` (which has React Native bundling issues), this app uses:

- **Custom HTTP Client** (`src/utils/api.ts`) - Direct HTTP calls to tRPC endpoints
- **React Query** - For data fetching, caching, and state management
- **Type-safe API methods** - Structured like tRPC but without server dependencies

## API Integration

The app connects to your tRPC API with:

- **API URL**: `http://localhost:3000/api/trpc` (configured in `src/utils/api.ts`)
- **HTTP Client**: Custom implementation that formats requests for tRPC
- **React Query Provider**: Set up in `src/utils/api-provider.tsx`

## Usage

In your components, use React Query hooks with the custom API client:

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../utils/api";

// Fetch data
const { data: recipes, isLoading } = useQuery({
  queryKey: ["recipes"],
  queryFn: () => api.recipe.getAll(),
});

// Mutations
const createRecipe = useMutation({
  mutationFn: (data) => api.recipe.create(data),
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ["recipes"] });
  },
});
```

## Available API Methods

- `api.recipe.getAll()` - Get all recipes
- `api.recipe.getById(id)` - Get recipe by ID
- `api.recipe.create(data)` - Create new recipe
- `api.recipe.update(data)` - Update recipe
- `api.recipe.delete(id)` - Delete recipe
- `api.group.*` - Group operations
- `api.ingredient.*` - Ingredient operations

## Next Steps

1. **Update API URL**: Change the `API_URL` in `src/utils/api.ts` for production
2. **Add Authentication**: Add auth headers to the HTTP client if needed
3. **Extend API Methods**: Add more endpoints to the `api` object as needed
4. **Error Handling**: Customize error handling in the HTTP client

## File Structure

```
mobile/
├── src/
│   ├── components/
│   │   └── RecipeList.tsx      # Example component with data fetching
│   ├── utils/
│   │   ├── api.ts              # Custom tRPC HTTP client
│   │   └── api-provider.tsx    # React Query provider
│   └── types/
│       └── api.ts              # Type definitions
├── App.tsx                     # Main app component
└── package.json
```

## Troubleshooting

### React Version Conflicts

If you see React version mismatch errors, ensure both `react` and `react-dom` are the same version:

```bash
npm install react@19.1.1 react-dom@19.1.1 --legacy-peer-deps
```

### Network Issues

- Make sure your Next.js server is running on `http://localhost:3000`
- For physical devices, update the API_URL to use your computer's IP address
- For production, update the API_URL to your deployed backend URL
