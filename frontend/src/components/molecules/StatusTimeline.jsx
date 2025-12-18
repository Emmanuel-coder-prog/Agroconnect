function StatusTimeline({ request }) {
  const timelineItems = [
    {
      status: "created",
      label: "Request Created",
      date: request.createdAt,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "text-green-500",
      bg: "bg-green-100"
    },
    request.acceptedAt && {
      status: "accepted",
      label: "Accepted by Provider",
      date: request.acceptedAt,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "text-blue-500",
      bg: "bg-blue-100"
    },
    request.startedAt && {
      status: "in_progress",
      label: "Work Started",
      date: request.startedAt,
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      color: "text-purple-500",
      bg: "bg-purple-100"
    },
    request.completedAt && {
      status: "completed",
      label: "Work Completed",
      date: request.completedAt,
      icon: "M5 13l4 4L19 7",
      color: "text-green-500",
      bg: "bg-green-100"
    }
  ].filter(Boolean);

  const getCurrentStep = () => {
    if (request.completedAt) return 3;
    if (request.startedAt) return 2;
    if (request.acceptedAt) return 1;
    return 0;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timelineItems.map((item, index) => (
          <li key={item.status}>
            <div className="relative pb-8">
              {index !== timelineItems.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className={`relative ${item.bg} p-2 rounded-full`}>
                  <svg
                    className={`h-5 w-5 ${item.color}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {item.label}
                      </span>
                      {index === currentStep && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {new Date(item.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StatusTimeline;