import { ToolGroupBaseSchema } from './baseSchema';
import { bidirectional } from '../tools/bidirectional';
import { targetRect } from '../tools/targetRect';
import { targetEllipse } from '../tools/targetEllipse';
import { targetProbe } from '../tools/targetProbe';
import { targetPencil } from '../tools/targetPencil';
import { targetCR } from '../tools/targetCR';
import { targetUN } from '../tools/targetUN';

const detailDisplay = data => {
    const items = data.location;
    if (!items || !(items instanceof Array)) return;

    const textData = '';
    items.forEach(item => {
        textData += '<div class="prop-node"><span class="prop-name">';
        textData += item.name.zh + '：';
        textData += '</span><span class="prop-detail">';
        item.items.forEach(item => {
            if (item.items) {
                let hasData = false;
                item.items.forEach(item => {
                    if (item.checked) {
                        hasData = true;
                        textData += item.name.zh + '，';
                    }
                });
                while (textData.slice(textData.length-1) === '，')
                    textData = textData.slice(0, textData.length-1);
                if (hasData) textData += '；';
            } else {
                if (item.checked) {
                    textData += item.name.zh + '；';
                }
            }
        });
        while (textData.slice(textData.length-1) === '；')
            textData = textData.slice(0, textData.length-1);

        textData += '</span></div>';
    });

    return textData;
};

const headerDisplay = data => {
    if (data.shortestDiameter) {
        // TODO: Make this check criteria again to see if we should display shortest x longest
        return data.longestDiameter + ' x ' + data.shortestDiameter;
    }

    return data.longestDiameter;
};

export const targets = {
    id: 'targets',
    name: '病灶',
    childTools: [targetRect, targetEllipse, bidirectional, targetProbe, targetPencil, targetCR, targetUN],
    schema: ToolGroupBaseSchema,
    options: {
        measurementTable: {
            detailDisplay,
            headerDisplay
        }
    }
};
