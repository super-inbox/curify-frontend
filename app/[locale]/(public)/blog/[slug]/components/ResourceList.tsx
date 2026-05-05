interface Resource {
  title: string;
  description: string;
  url: string;
  type: 'tool' | 'article' | 'video' | 'course';
}

interface ResourceListProps {
  title: string;
  resources: Resource[];
}

export default function ResourceList({ title, resources }: ResourceListProps) {
  const typeIcons = {
    tool: '🛠️',
    article: '📄',
    video: '🎥',
    course: '🎓'
  };

  const typeColors = {
    tool: 'bg-purple-100 text-purple-800',
    article: 'bg-blue-100 text-blue-800',
    video: 'bg-red-100 text-red-800',
    course: 'bg-green-100 text-green-800'
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 my-8">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {resources.map((resource, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
            <span className="text-xl">{typeIcons[resource.type]}</span>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium">{resource.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${typeColors[resource.type]}`}>
                  {resource.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
              <a 
                href={resource.url} 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Resource →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
