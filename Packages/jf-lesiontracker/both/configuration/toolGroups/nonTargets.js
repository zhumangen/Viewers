import { ToolGroupBaseSchema } from './baseSchema';
import { nonTarget } from '../tools/nonTarget';

export const nonTargets = {
    id: 'nonTargets',
    name: '标签',
    childTools: [nonTarget],
    schema: ToolGroupBaseSchema
};
