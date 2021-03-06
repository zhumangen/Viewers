import { ToolGroupBaseSchema } from './baseSchema';
import { bidirectional } from '../tools/bidirectional';
import { targetEllipse } from '../tools/targetEllipse';
import { targetRect } from '../tools/targetRect';
import { targetProbe } from '../tools/targetProbe';
import { targetPencil } from '../tools/targetPencil';
import { targetCR } from '../tools/targetCR';
import { targetUN } from '../tools/targetUN';

export const targets = {
    id: 'targets',
    name: '标注',
    childTools: [bidirectional, targetEllipse, targetRect, targetProbe, targetPencil, targetCR, targetUN],
    schema: ToolGroupBaseSchema
};
