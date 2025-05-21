export default function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Recipe not found</h1>
      <p className="mt-4 text-gray-500">
        The recipe you are looking for does not exist.
      </p>
    </div>
  );
}
