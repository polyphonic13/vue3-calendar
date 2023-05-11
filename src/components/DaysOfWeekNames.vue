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
    .day_names {
    background-color: #fff;
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
    border-top: 1px #ccc solid;
    border-right: 1px #ccc solid;
    border-bottom: 1px #ccc solid;

    display:flex;
    align-items: center;
    justify-content: center;

    user-select: none;
    }
</style>
