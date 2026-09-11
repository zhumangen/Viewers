/**
 * Zelvyn viewport overlays — denser mockup layout:
 *   top-left: light series cue
 *   top-right: W / L
 *   bottom-left: Slice n/m
 *   bottom-right: thickness mm
 * L/R markers remain ViewportOrientationMarkers (unchanged).
 */
export default {
  'viewportOverlay.topLeft': [
    {
      id: 'SeriesDescription',
      inheritsFrom: 'ohif.overlayItem',
      label: '',
      title: 'Series',
      condition: ({ referenceInstance, displaySet }) =>
        !!(referenceInstance?.SeriesDescription || displaySet?.SeriesDescription),
      contentF: ({ referenceInstance, displaySet }) => {
        const desc =
          referenceInstance?.SeriesDescription || displaySet?.SeriesDescription || '';
        return desc.length > 28 ? `${desc.slice(0, 28)}…` : desc;
      },
    },
  ],
  'viewportOverlay.topRight': [
    {
      id: 'WindowLevel',
      inheritsFrom: 'ohif.overlayItem.windowLevel',
      title: 'Window Level',
    },
  ],
  'viewportOverlay.bottomLeft': [
    {
      id: 'SliceIndex',
      inheritsFrom: 'ohif.overlayItem',
      title: 'Slice',
      contentF: ({ imageSliceData }) => {
        const numberOfSlices = imageSliceData?.numberOfSlices;
        if (!numberOfSlices) {
          return null;
        }
        const imageIndex = imageSliceData.imageIndex ?? 0;
        return `Slice: ${imageIndex + 1}/${numberOfSlices}`;
      },
    },
  ],
  'viewportOverlay.bottomRight': [
    {
      id: 'SliceThickness',
      inheritsFrom: 'ohif.overlayItem',
      title: 'Slice thickness',
      contentF: ({ instance, referenceInstance, displaySet }) => {
        const raw =
          instance?.SliceThickness ??
          referenceInstance?.SliceThickness ??
          displaySet?.instance?.SliceThickness ??
          displaySet?.SliceThickness;
        if (raw === undefined || raw === null || raw === '') {
          return null;
        }
        const n = Number(raw);
        return Number.isFinite(n) ? `${n.toFixed(1)} mm` : `${raw} mm`;
      },
    },
  ],
};
