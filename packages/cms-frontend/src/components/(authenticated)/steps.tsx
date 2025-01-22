interface StepItem {
  title: string;
  status: "current" | "complete" | "upcoming";
}

interface StepsProps {
  items: StepItem[];
}

export function Steps({ items }: StepsProps) {
  return (
    <nav aria-label="Progress">
      <ol
        role="list"
        className="space-y-4 md:flex md:space-x-8 md:space-y-0"
      >
        {items.map((item, index) => (
          <li
            key={index}
            className="md:flex-1"
          >
            <div
              className={`
                  flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4
                  ${item.status === "complete" ? "border-primary/50" : ""}
                  ${item.status === "current" ? "border-primary" : ""}
                  ${item.status === "upcoming" ? "border-muted" : ""}
                `}
            >
              <span
                className={`
                    text-sm font-medium
                    ${item.status === "complete" ? "text-primary/70" : ""}
                    ${item.status === "current" ? "text-primary" : ""}
                    ${item.status === "upcoming" ? "text-muted-foreground" : ""}
                  `}
              >
                {`Step ${index + 1}`}
              </span>
              <span
                className={`
                    text-sm
                    ${item.status === "complete" ? "text-primary/70" : ""}
                    ${item.status === "current" ? "text-primary" : ""}
                    ${item.status === "upcoming" ? "text-muted-foreground" : ""}
                  `}
              >
                {item.title}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
