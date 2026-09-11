import React from 'react';
import { AccordionTrigger, ColorCircle } from '@ohif/ui-next';
import { ChevronDownIcon } from '@radix-ui/react-icons';

function onClickDefault(e) {
  const { group, onClick = group?.onClick } = this;
  if (!onClick) {
    console.log('No onClick function', group);
    return;
  }
  console.log('onClickDefault');
  e.preventDefault();
  e.stopPropagation();

  onClick(e, group);

  return false;
}

export default function PanelAccordionTrigger(props) {
  const { marginLeft = 8, isActive = false, colorHex, count, text, menu: Menu = null } = props;

  return (
    <AccordionTrigger
      style={{ marginLeft: `${marginLeft}px`, padding: 0 }}
      asChild={true}
    >
      <div
        className={`inline-flex text-[13px] ${isActive ? 'bg-row-selected' : 'bg-muted'} border-border/50 group flex-grow border-b`}
      >
        <button
          className="flex min-w-0 flex-1 items-center gap-1 py-1 text-left"
          onClick={onClickDefault.bind(props)}
        >
          <span
            className={`inline-flex items-center rounded-l border-r border-border ${isActive ? 'bg-primary/90 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {count !== undefined ? <span className="px-2 text-[12px] font-medium">{count}</span> : null}
            {colorHex && <ColorCircle colorHex={colorHex} />}
          </span>
          <span className={`truncate ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
            {text}
          </span>
        </button>
        {Menu && (
          <Menu
            {...props}
            classNames="justify-end flex-grow"
          />
        )}
        <ChevronDownIcon className="text-muted-foreground group-data-[state=open]:text-primary mr-1 h-4 w-4 shrink-0 transition-transform duration-200" />
      </div>
    </AccordionTrigger>
  );
}
