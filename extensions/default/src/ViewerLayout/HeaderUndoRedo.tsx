import React from 'react';
import { Button, Icons } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';

/**
 * Undo/redo cluster for ZelvynViewerChrome right actions.
 */
function HeaderUndoRedo() {
  const { commandsManager } = useSystem();

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="text-[color:var(--text-secondary,#9AA8B6)] hover:text-[color:var(--accent,#2DD4BF)] h-8 w-8"
        data-cy="undo-btn"
        onClick={() => {
          commandsManager.run('undo');
        }}
        aria-label="Undo"
        type="button"
      >
        <Icons.Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-[color:var(--text-secondary,#9AA8B6)] hover:text-[color:var(--accent,#2DD4BF)] h-8 w-8"
        data-cy="redo-btn"
        onClick={() => {
          commandsManager.run('redo');
        }}
        aria-label="Redo"
        type="button"
      >
        <Icons.Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default HeaderUndoRedo;
