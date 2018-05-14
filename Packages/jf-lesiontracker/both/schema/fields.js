export const FieldLesionLocation = {
    type: String,
    label: '标签',
    allowedValues: []
};

export const FieldLesionLocationResponse = {
    type: String,
    label: 'Lesion Location Response',
    allowedValues: [
        '',
        'CR',
        'PD',
        'SD',
        'Present',
        'NE',
        'NN',
        'EX'
    ],
    valuesLabels: [
        '',
        'CR - Complete response',
        'PD - Progressive disease',
        'SD - Stable disease',
        'Present - Present',
        'NE - Not Evaluable',
        'NN - Non-CR/Non-PD',
        'EX - Excluded from Assessment'
    ]
};
