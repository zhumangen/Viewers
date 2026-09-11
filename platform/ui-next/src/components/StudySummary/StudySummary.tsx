import React from 'react';

interface StudySummaryProps {
  date: string;
  description: string;
}

/**
 * StudySummary component displays a summary of a study with its date and description.
 */
const StudySummary: React.FC<StudySummaryProps> = ({ date, description }) => {
  return (
    <div
      className="border-border/60 mx-2 my-0 border-b px-0.5 py-1.5"
      style={{ textAlign: 'left' }}
      data-cy="study-summary"
    >
      <div className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
        {date}
      </div>
      <div className="text-foreground truncate pb-0.5 text-[13px] font-medium leading-5">
        {description}
      </div>
    </div>
  );
};

export { StudySummary };
