import { ToolGroupBaseSchema } from './baseSchema';
import { bidirectional } from '../tools/bidirectional';
import { targetEllipse } from '../tools/targetEllipse';
import { targetProbe } from '../tools/targetProbe';
import { targetCR } from '../tools/targetCR';
import { targetUN } from '../tools/targetUN';

export const targets = {
    id: 'targets',
    name: '标注',
    childTools: [bidirectional, targetEllipse, targetProbe, targetCR, targetUN],
    schema: ToolGroupBaseSchema
};
