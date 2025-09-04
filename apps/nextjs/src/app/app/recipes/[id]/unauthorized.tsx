export default function Unauthorized() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Unauthorized</h1>
      <p className="mt-4 text-gray-500">
        You do not have permission to view this recipe. Please log in with an
        account that has access.
      </p>
    </div>
  );
}
