import template from './sw-condition-type-select.html.twig';
import './sw-condition-type-select.scss';

const { Component } = Shopware;

// eslint-disable-next-line sw-deprecation-rules/private-feature-declarations
Component.register('sw-condition-type-select', {
    template: template,

    inject: [
        'removeNodeFromTree',
        'conditionDataProviderService',
        'restrictedConditions',
        'feature',
    ],

    props: {
        availableTypes: {
            type: Array,
            required: true,
        },

        condition: {
            type: Object,
            required: true,
        },

        hasError: {
            type: Boolean,
            required: false,
            default: false,
        },

        disabled: {
            type: Boolean,
            required: false,
            default: false,
        },

        availableGroups: {
            type: Array,
            required: false,
            default() {
                return [];
            },
        },
    },

    data() {
        return {
            typeSearchTerm: '',
        };
    },

    computed: {
        currentValue() {
            return this.condition.scriptId ?? this.condition.type;
        },

        valueProperty() {
            return this.condition.scriptId ? 'scriptId' : 'type';
        },

        ucTerm() {
            return this.typeSearchTerm.toUpperCase();
        },

        /**
         * @deprecated tag:v6.5.0 - Function is no longer needed,
         * use translatedLabel property instead
         */
        translatedTypes() {
            return this.availableTypes.map(({ type, label }) => {
                return {
                    type,
                    label: this.$tc(label),
                };
            });
        },

        typeOptions() {
            if (!(typeof this.typeSearchTerm === 'string') || this.typeSearchTerm === '') {
                return this.availableTypes;
            }

            return this.availableTypes.filter(({ type, label }) => {
                const ucType = type.toUpperCase();
                const ucLabel = label.toUpperCase();

                return ucType.includes(this.ucTerm) || ucLabel.includes(this.ucTerm);
            });
        },

        typeSelectClasses() {
            return {
                'has--error': this.hasError,
            };
        },

        arrowColor() {
            if (this.disabled) {
                return {
                    primary: '#d1d9e0',
                    secondary: '#d1d9e0',
                };
            }

            if (this.hasError) {
                return {
                    primary: '#DE294C',
                    secondary: '#ffffff',
                };
            }

            return {
                primary: '#758CA3',
                secondary: '#ffffff',
            };
        },
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            if (this.condition.type === 'scriptRule' && !this.condition.scriptId) {
                this.condition.type = null;
            }
        },

        changeItem(item) {
            const { type, scriptId, appScriptCondition } = item ?? {};
            this.condition.type = type;
            this.condition.scriptId = scriptId;
            this.condition.appScriptCondition = appScriptCondition;
        },

        changeType(type) {
            this.condition.value = null;

            if (this.condition[this.childAssociationField] && this.condition[this.childAssociationField].length > 0) {
                this.condition[this.childAssociationField].forEach((child) => {
                    this.removeNodeFromTree(this.condition, child);
                });
            }

            this.condition.type = type;
        },

        getTooltipConfig(item) {
            if (!Object.keys(this.restrictedConditions).includes(item.type)) {
                return { message: '', disabled: true };
            }

            return {
                width: 260,
                message: this.$t(
                    'sw-restricted-rules.restrictedConditions.restrictedConditionTooltip',
                    { assignments: this.groupAssignments(item) },
                ),
            };
        },

        groupAssignments(item) {
            const groups = this.restrictedConditions[item.type].reduce((accumulator, current) => {
                if (current.associationName.startsWith('flowTrigger')) {
                    if (!accumulator.flowTrigger) {
                        accumulator.flowTrigger = [];
                    }

                    accumulator.flowTrigger.push(current);
                } else if (/promotion/i.test(current.associationName)) {
                    if (!accumulator.promotion) {
                        accumulator.promotion = [];
                    }

                    accumulator.promotion.push(current);
                } else {
                    if (!accumulator[current.associationName]) {
                        accumulator[current.associationName] = [];
                    }

                    accumulator[current.associationName].push(current);
                }

                return accumulator;
            }, {});

            return Object.entries(groups).reduce((accumulator, [key, value], index) => {
                let snippet = '';

                value.forEach((currentValue, currentIndex) => {
                    if (currentIndex > 0) {
                        snippet += '<br />';
                    }

                    snippet += this.$t(`sw-restricted-rules.restrictedConditions.relation.${key}`, {
                        assignments: `"${this.$tc(currentValue.snippet, 1)}"`,
                    });
                });

                if (index > 0) {
                    return `${accumulator} </br> ${snippet}`;
                }

                return `${accumulator} ${snippet}`;
            }, '');
        },
    },
});
