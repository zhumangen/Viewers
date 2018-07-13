import { ToolGroupBaseSchema } from './baseSchema';
import { label } from '../tools/label';

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
    return '诊断' + data.measurementNumber;
};

export const labels = {
    id: 'labels',
    name: '诊断',
    childTools: [label],
    schema: ToolGroupBaseSchema,
    options: {
        measurementTable: {
            detailDisplay,
            headerDisplay
        }
    }
};
