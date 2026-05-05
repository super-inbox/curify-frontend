interface KeyTakeawayProps {
  takeaways: string[];
}

export default function KeyTakeaways({ takeaways }: KeyTakeawayProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
      <h3 className="text-xl font-semibold mb-4 text-blue-900">Key Takeaways</h3>
      <ul className="space-y-2">
        {takeaways.map((takeaway, index) => (
          <li key={index} className="flex items-start">
            <span className="text-blue-600 mr-2 mt-1">•</span>
            <span className="text-gray-700">{takeaway}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
