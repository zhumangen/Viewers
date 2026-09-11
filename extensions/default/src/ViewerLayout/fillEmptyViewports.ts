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
  mprFilled: number;
};

/** Prefer unused unique series; then orthogonal volume views for reconstructable DS. */
const MPR_ORIENTATIONS = ['sagittal', 'coronal', 'axial'] as const;

const VOI_SYNC_GROUP = {
  type: 'voi',
  id: 'mpr',
  source: true,
  target: true,
  options: { syncColormap: true },
};

const HYDRATE_SEG_SYNC_GROUP = {
  type: 'hydrateseg',
  id: 'sameFORId',
  source: true,
  target: true,
  options: { matchingRules: ['sameFOR'] },
};

function isImageDisplaySet(ds: any): boolean {
  if (!ds?.displaySetInstanceUID || ds.unsupported || ds.excludeFromThumbnailBrowser) {
    return false;
  }
  if (thumbnailNoImageModalities.includes(ds.Modality)) {
    return false;
  }
  const frames = ds.numImageFrames || ds.instances?.length || 0;
  return frames > 0;
}

function buildStackViewportUpdate(
  viewportId: string,
  viewportOptions: any,
  displaySetInstanceUID: string
) {
  return {
    viewportId,
    displaySetInstanceUIDs: [displaySetInstanceUID],
    displaySetOptions: [{}],
    viewportOptions: {
      ...(viewportOptions || {}),
      viewportId,
      viewportType: viewportOptions?.viewportType || 'stack',
      toolGroupId: viewportOptions?.toolGroupId || 'default',
      allowUnmatchedView: true,
    },
  };
}

function buildMprViewportUpdate(
  viewportId: string,
  viewportOptions: any,
  displaySetInstanceUID: string,
  orientation: string
) {
  return {
    viewportId,
    displaySetInstanceUIDs: [displaySetInstanceUID],
    displaySetOptions: [{}],
    viewportOptions: {
      ...(viewportOptions || {}),
      viewportId,
      viewportType: 'volume',
      orientation,
      toolGroupId: 'mpr',
      allowUnmatchedView: true,
      initialImageOptions: { preset: 'middle' },
      syncGroups: [VOI_SYNC_GROUP, HYDRATE_SEG_SYNC_GROUP],
    },
  };
}

/**
 * Fill empty grid cells after 1×1 → 2×2:
 * 1) Unique unused image display sets (never duplicate as plain stacks).
 * 2) If empties remain and a shown series is reconstructable, assign the same
 *    display set as volume viewports with unused axial/sagittal/coronal
 *    orientations (OHIF MPR pattern — same DS, different orientation).
 * Non-reconstructable single-series studies still leave honest empty cells.
 */
export function fillEmptyViewportsWithUnusedSeries({
  viewportGridService,
  displaySetService,
  commandsManager,
}: FillDeps): FillResult {
  const emptyResult = { filled: 0, empty: 0, candidates: 0, mprFilled: 0 };
  if (!viewportGridService || !displaySetService || !commandsManager) {
    return emptyResult;
  }

  const state = viewportGridService.getState?.();
  const viewports: Map<string, any> | undefined = state?.viewports;
  if (!viewports || typeof viewports.forEach !== 'function') {
    return emptyResult;
  }

  const used = new Set<string>();
  const usedOrientations = new Set<string>();
  const empty: Array<{ viewportId: string; viewportOptions?: any }> = [];
  let primaryUid: string | null = null;
  const activeViewportId = state?.activeViewportId;

  viewports.forEach((vp: any) => {
    const uids: string[] = vp?.displaySetInstanceUIDs || [];
    if (uids.length > 0) {
      uids.forEach(uid => used.add(uid));
      if (!primaryUid) {
        primaryUid = uids[0];
      }
      if (vp.viewportId === activeViewportId) {
        primaryUid = uids[0];
      }
      const orientation = vp?.viewportOptions?.orientation;
      if (orientation) {
        usedOrientations.add(String(orientation).toLowerCase());
      }
    } else if (vp?.viewportId) {
      empty.push({ viewportId: vp.viewportId, viewportOptions: vp.viewportOptions });
    }
  });

  if (empty.length === 0) {
    return { filled: 0, empty: 0, candidates: 0, mprFilled: 0 };
  }

  const activeSets = displaySetService.getActiveDisplaySets?.() || [];
  const uniqueCandidates = activeSets.filter(
    (ds: any) => isImageDisplaySet(ds) && !used.has(ds.displaySetInstanceUID)
  );

  const viewportsToUpdate = [];

  // Pass 1 — unique unused series into empty cells
  const uniqueN = Math.min(empty.length, uniqueCandidates.length);
  for (let i = 0; i < uniqueN; i++) {
    const ds = uniqueCandidates[i];
    const { viewportId, viewportOptions } = empty[i];
    viewportsToUpdate.push(
      buildStackViewportUpdate(viewportId, viewportOptions, ds.displaySetInstanceUID)
    );
    used.add(ds.displaySetInstanceUID);
  }
  const remainingEmpty = empty.slice(uniqueN);

  // Pass 2 — orthogonal volume views for reconstructable primary series
  let mprFilled = 0;
  let mprCandidates = 0;
  if (remainingEmpty.length > 0) {
    let reconstructableUid = primaryUid;
    if (reconstructableUid) {
      const primaryDs = displaySetService.getDisplaySetByUID?.(reconstructableUid);
      if (!primaryDs?.isReconstructable) {
        reconstructableUid = null;
      }
    }
    if (!reconstructableUid) {
      const fallback = activeSets.find(
        (ds: any) =>
          isImageDisplaySet(ds) && ds.isReconstructable && used.has(ds.displaySetInstanceUID)
      );
      reconstructableUid = fallback?.displaySetInstanceUID || null;
    }

    if (reconstructableUid) {
      const orientationsLeft = MPR_ORIENTATIONS.filter(o => !usedOrientations.has(o));
      mprCandidates = orientationsLeft.length;
      const mprN = Math.min(remainingEmpty.length, orientationsLeft.length);
      for (let i = 0; i < mprN; i++) {
        const orientation = orientationsLeft[i];
        const { viewportId, viewportOptions } = remainingEmpty[i];
        viewportsToUpdate.push(
          buildMprViewportUpdate(viewportId, viewportOptions, reconstructableUid, orientation)
        );
        usedOrientations.add(orientation);
        mprFilled += 1;
      }
    }
  }

  const candidates = uniqueCandidates.length + mprCandidates;

  if (viewportsToUpdate.length === 0) {
    return {
      filled: 0,
      empty: empty.length,
      candidates,
      mprFilled: 0,
    };
  }

  commandsManager.run('setDisplaySetsForViewports', { viewportsToUpdate });
  return {
    filled: viewportsToUpdate.length,
    empty: empty.length,
    candidates,
    mprFilled,
  };
}

export default fillEmptyViewportsWithUnusedSeries;
