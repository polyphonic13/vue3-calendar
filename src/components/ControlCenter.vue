<template>
    <div class="control_center" :class="classes">
        <div class="control_center__content">
            <h1 v-if="!state.isControlCenterCollapsed" class="control_center__content__title">Control Center</h1>
        </div>
        <div class="control_center__footer">
            <button class="control_center__footer__collapse_btn" @click="onCollapseClicked">
                <svg v-if="!state.isControlCenterCollapsed" class="left_arrow" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><g><polygon points="17.59,18 19,16.59 14.42,12 19,7.41 17.59,6 11.59,12"/><polygon points="11,18 12.41,16.59 7.83,12 12.41,7.41 11,6 5,12"/></g></g></svg>
                <svg v-if="!state.isControlCenterCollapsed" class="up_arrow" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg>
                <svg v-if="state.isControlCenterCollapsed" class="right_arrow" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><g><polygon points="6.41,6 5,7.41 9.58,12 5,16.59 6.41,18 12.41,12"/><polygon points="13,6 11.59,7.41 16.17,12 11.59,16.59 13,18 19,12"/></g></g></svg>
                <svg v-if="state.isControlCenterCollapsed" class="down_arrow" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { storeToRefs } from 'pinia';

    import { useUIStore } from '@/stores/ui';

    const store = useUIStore();
    const { state } = storeToRefs(store);
    const { toggleisControlCenterCollapsed } = store;


    const classes = computed(() => ({
        'control_center-collapsed': state.value.isControlCenterCollapsed,
    }));

    const onCollapseClicked = () => {
        toggleisControlCenterCollapsed();
    };
</script>

<style scoped lang="scss">
    @import '../styles/global.scss';

    .control_center {
        color: $secondaryColor01;
        background-color: $highlightedColorPrimary;
        box-shadow: $boxShadow02;

        padding: 8px;
        box-sizing: border-box;

        width: 256px;
        height: 100%;

        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        flex-direction: column;

        text-align: center;

    }

    .control_center-collapsed {
        width: 52px;
        align-items: center;
    }

    .control_center__content {
        flex: 1;
    }

    .control_center__content, .control_center__footer {
        width: 100%;

        display: flex;
    }

    .control_center__content__title {
        width: 100%;
        text-align: center;
    }

    .control_center__footer__collapse_btn {
        background: transparent;
        border: none;

        cursor: pointer;

        > .left_arrow, > .right_arrow {
            display: block;
        }

        > .up_arrow, > .down_arrow {
            display: none;
        }
    }

    @media screen and (max-width: 400px) {
        .control_center {
            width: 100%;
            height: 256px;

        }

        .control_center-collapsed {
            height: 64px;

            align-items: flex-start;

            > .control_center__footer {
                height: 100%;
            }
        }

        .control_center__footer__collapse_btn {
            > .left_arrow, > .right_arrow {
                display: none;
            }

            > .up_arrow, > .down_arrow {
                display: block;
            }

        }
    }
</style>
