interface CalloutBoxProps {
  type: 'tip' | 'warning' | 'info' | 'success';
  title: string;
  children: React.ReactNode;
}

export default function CalloutBox({ type, title, children }: CalloutBoxProps) {
  const styles = {
    tip: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    warning: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900'
  };

  const icons = {
    tip: '💡',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  };

  return (
    <div className={`border-l-4 p-4 my-6 rounded-r-lg ${styles[type]}`}>
      <div className="flex items-start">
        <span className="text-xl mr-3">{icons[type]}</span>
        <div>
          <h4 className="font-semibold mb-2">{title}</h4>
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
