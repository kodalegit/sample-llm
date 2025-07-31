export function PulsingLoader() {
    return (
      <div className="mb-4 sm:mb-6 max-w-4xl mx-auto w-full">
        <div className="bg-slate-800/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-700/30">
          <div className="prose dark:prose-invert max-w-none text-slate-200">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-slate-400 text-sm">AI is thinking...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }