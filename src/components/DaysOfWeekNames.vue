<template>
    <div class="day_names">
        <div
            v-for="(name, n) in SHORT_DAY_NAMES"
            :key="n"
            class="day_name"
        >{{ name }}</div>
    </div>

</template>

<script setup lang="ts">
    import { SHORT_DAY_NAMES } from '../composables/use-date-utils';

</script>

<style scoped lang="scss">
    @import '../styles/global.scss';

    .day_names {
        background-color: $primaryBg01;
        width: 100%;
        min-height: 28px;
        box-sizing: border-box;

        display: flex;
    }

    .day_name {
        text-align: center;
        width: calc(100%/7);
        height: 100%;

        box-sizing: border-box;
        border-top: 1px solid $borderColor01;
        border-right: 1px solid $borderColor01;
        border-bottom: 1px solid $borderColor01;

        display:flex;
        align-items: center;
        justify-content: center;

        user-select: none;
    }
</style>
