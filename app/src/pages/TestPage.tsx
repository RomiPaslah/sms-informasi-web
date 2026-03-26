export function TestPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#d90429] mb-4">TEST PAGE WORKS!</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-8">If you can see this, the app is running correctly.</p>
        <div className="space-y-4">
          <p className="text-lg">✓ React is working</p>
          <p className="text-lg">✓ Router is working</p>
          <p className="text-lg">✓ Tailwind CSS is working</p>
        </div>
      </div>
    </div>
  );
}
