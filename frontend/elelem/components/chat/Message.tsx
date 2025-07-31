import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
    message: {
      id: string;
      role: "user" | "assistant" | "system";
      content: string;
      createdAt: string;
    };
  }
  
  export function ChatMessage({ message }: ChatMessageProps) {
    const components: Components = {
      a: ({...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300" />,
      code: ({className, children, ...props}) => {
        // Check if it's an inline code element
        const isInline = !className;
        if (isInline) {
          return (
            <code
              className="bg-[#23272e] text-blue-200 px-1.5 py-0.5 rounded font-mono text-sm"
              {...props}
            >
              {children}
            </code>
          );
        }
        return (
          <pre className="bg-[#23272e] text-blue-100 p-4 rounded-lg overflow-x-auto text-sm my-2 font-mono">
            <code className={className} {...props}>{children}</code>
          </pre>
        );
      },
      ul: ({...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
      ol: ({...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
      li: ({...props}) => <li className="mb-1" {...props} />,
      blockquote: ({...props}) => <blockquote className="border-l-4 border-slate-400 pl-4 italic my-4" {...props} />,
      hr: ({...props}) => <hr className="my-6 border-slate-400" {...props} />,
      p: ({...props}) => <p className={message.role === "user" ? "mb-0" : "mb-4"} {...props} />,
      h1: ({...props}) => <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />,
      h2: ({...props}) => <h2 className="text-xl font-bold mb-3 mt-5" {...props} />,
      h3: ({...props}) => <h3 className="text-lg font-bold mb-3 mt-4" {...props} />,
    };
  
    // Assistant messages
    if (message.role === "assistant") {
      return (
        <div className="mb-4 sm:mb-6 max-w-4xl mx-auto w-full">
          <div className="bg-slate-800/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-700/30">
            <div className="prose dark:prose-invert max-w-none text-slate-200 prose-sm sm:prose-base">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      );
    }
  
    // User messages
    if (message.role === "user") {
      return (
        <div className="flex justify-end mb-4 sm:mb-6 max-w-4xl mx-auto w-full">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base whitespace-pre-wrap max-w-xs sm:max-w-md lg:max-w-2xl shadow-lg">
            <span className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {message.content}
              </ReactMarkdown>
            </span>
          </div>
        </div>
      );
    }
  
    // System messages
    return (
      <div className="flex justify-start mb-4 sm:mb-6 max-w-4xl mx-auto w-full">
        <div className="bg-red-600/20 text-red-300 border border-red-500/30 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base whitespace-pre-wrap max-w-xs sm:max-w-md lg:max-w-2xl">
          <span className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {message.content}
            </ReactMarkdown>
          </span>
        </div>
      </div>
    );
  }