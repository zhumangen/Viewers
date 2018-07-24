import { ToolGroupBaseSchema } from './baseSchema';
import { tissue } from '../tools/tissue';

const detailDisplay = data => {
    const items = data.location;
    if (!items || !(items instanceof Array)) return;

    items = items.slice(1);

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
    const items = data.location;
    let textData = '';
    if (items && items.length > 0) {
        items = items[0].items;
        items.forEach(item => {
            if (item.checked) {
                textData += item.name.zh + '，'
            }
        });
        while (textData.slice(textData.length-1) === '，')
            textData = textData.slice(0, textData.length-1);
    }
    return textData;
};

export const tissues = {
    id: 'tissues',
    name: '组织结构的改变',
    childTools: [tissue],
    schema: ToolGroupBaseSchema,
    options: {
        measurementTable: {
            detailDisplay,
            headerDisplay
        }
    }
};
