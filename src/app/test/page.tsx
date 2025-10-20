export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">TailwindCSS Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Card 1</h2>
            <p className="text-gray-600">This is a test card to verify TailwindCSS styling is working.</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Test Button
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Card 2</h2>
            <p className="text-gray-600">Another test card with different styling.</p>
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Success Button
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Card 3</h2>
            <p className="text-gray-600">Third test card for comprehensive testing.</p>
            <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Danger Button
            </button>
          </div>
        </div>
        
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Gradient Test</h2>
          <p className="text-lg">This should show a beautiful gradient background if TailwindCSS is working properly.</p>
        </div>
      </div>
    </div>
  );
}
