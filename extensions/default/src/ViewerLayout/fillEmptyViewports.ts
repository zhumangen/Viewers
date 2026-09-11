import { thumbnailNoImageModalities } from '@ohif/core/src/utils/thumbnailNoImageModalities';

type FillDeps = {
  viewportGridService: any;
  displaySetService: any;
  commandsManager: any;
};

export type FillResult = {
  filled: number;
  empty: number;
  candidates: number;
};

/**
 * Assign unused image display sets to empty grid cells (e.g. after 1×1 → 2×2).
 * Does not duplicate series already shown. Single-series studies leave empties.
 */
export function fillEmptyViewportsWithUnusedSeries({
  viewportGridService,
  displaySetService,
  commandsManager,
}: FillDeps): FillResult {
  const emptyResult = { filled: 0, empty: 0, candidates: 0 };
  if (!viewportGridService || !displaySetService || !commandsManager) {
    return emptyResult;
  }

  const state = viewportGridService.getState?.();
  const viewports: Map<string, any> | undefined = state?.viewports;
  if (!viewports || typeof viewports.forEach !== 'function') {
    return emptyResult;
  }

  const used = new Set<string>();
  const empty: Array<{ viewportId: string; viewportOptions?: any }> = [];

  viewports.forEach((vp: any) => {
    const uids: string[] = vp?.displaySetInstanceUIDs || [];
    if (uids.length > 0) {
      uids.forEach(uid => used.add(uid));
    } else if (vp?.viewportId) {
      empty.push({ viewportId: vp.viewportId, viewportOptions: vp.viewportOptions });
    }
  });

  if (empty.length === 0) {
    return { filled: 0, empty: 0, candidates: 0 };
  }

  const candidates = (displaySetService.getActiveDisplaySets?.() || []).filter((ds: any) => {
    if (!ds?.displaySetInstanceUID || ds.unsupported || ds.excludeFromThumbnailBrowser) {
      return false;
    }
    if (used.has(ds.displaySetInstanceUID)) {
      return false;
    }
    if (thumbnailNoImageModalities.includes(ds.Modality)) {
      return false;
    }
    const frames = ds.numImageFrames || ds.instances?.length || 0;
    return frames > 0;
  });

  if (candidates.length === 0) {
    return { filled: 0, empty: empty.length, candidates: 0 };
  }

  const viewportsToUpdate = [];
  const n = Math.min(empty.length, candidates.length);
  for (let i = 0; i < n; i++) {
    const ds = candidates[i];
    const { viewportId, viewportOptions } = empty[i];
    viewportsToUpdate.push({
      viewportId,
      displaySetInstanceUIDs: [ds.displaySetInstanceUID],
      displaySetOptions: [{}],
      viewportOptions: {
        ...(viewportOptions || {}),
        viewportId,
        viewportType: viewportOptions?.viewportType || 'stack',
        toolGroupId: viewportOptions?.toolGroupId || 'default',
        allowUnmatchedView: true,
      },
    });
    used.add(ds.displaySetInstanceUID);
  }

  if (viewportsToUpdate.length === 0) {
    return { filled: 0, empty: empty.length, candidates: candidates.length };
  }

  commandsManager.run('setDisplaySetsForViewports', { viewportsToUpdate });
  return {
    filled: viewportsToUpdate.length,
    empty: empty.length,
    candidates: candidates.length,
  };
}

export default fillEmptyViewportsWithUnusedSeries;
