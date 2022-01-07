import CMS from '../../../constant/sw-cms.constant';
import template from './sw-cms-el-image.html.twig';
import './sw-cms-el-image.scss';

const { Component, Mixin, Filter } = Shopware;

Component.register('sw-cms-el-image', {
    template,

    mixins: [
        Mixin.getByName('cms-element'),
    ],

    computed: {
        displayModeClass() {
            if (this.element.config.displayMode.value === 'standard') {
                return null;
            }

            return `is--${this.element.config.displayMode.value}`;
        },

        styles() {
            return {
                'min-height': this.element.config.displayMode.value === 'cover' &&
                              this.element.config.minHeight.value &&
                              this.element.config.minHeight.value !== 0 ? this.element.config.minHeight.value : '340px',
            };
        },

        imgStyles() {
            return {
                'align-self': this.element.config.verticalAlign.value || null,
            };
        },

        mediaUrl() {
            const staticFallBackImage = this.assetFilter(`administration/static/img/cms/${CMS.MEDIA.previewMountain}`);
            const elemData = this.element.data.media;
            const elemConfig = this.element.config.media;

            if (elemConfig.source === 'mapped') {
                const demoMedia = this.getDemoValue(elemConfig.value);

                if (demoMedia?.url) {
                    return demoMedia.url;
                }

                return staticFallBackImage;
            }

            if (elemConfig.source === 'default') {
                return this.assetFilter(`/administration/static/img/cms/${elemConfig.value}`);
            }

            if (elemData?.id) {
                return this.element.data.media.url;
            }

            if (elemData?.url) {
                return this.assetFilter(elemConfig.url);
            }

            return staticFallBackImage;
        },

        assetFilter() {
            return Filter.getByName('asset');
        },

        mediaConfigValue() {
            return this.element?.config?.sliderItems?.value;
        },
    },

    watch: {
        cmsPageState: {
            deep: true,
            handler() {
                this.$forceUpdate();
            },
        },

        mediaConfigValue(value) {
            const mediaId = this.element?.data?.media?.id;
            const isSourceStatic = this.element?.config?.media?.source === 'static';

            if (isSourceStatic && mediaId && value !== mediaId) {
                this.element.config.media.value = mediaId;
            }
        },
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            this.initElementConfig('image');
            this.initElementData('image');
        },
    },
});
