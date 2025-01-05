export function ImportInstructions() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">
        Upload a CSV file with contacts. The file should have two columns:
      </p>
      <ul className="list-disc list-inside text-sm text-gray-500 ml-2">
        <li>Name (optional)</li>
        <li>Phone Number (required, format: +1234567890)</li>
      </ul>
    </div>
  );
}