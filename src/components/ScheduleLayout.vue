<template>
    <div class="schedule_layout">
        <div class="schedule_layout__events">

        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
    .schedule_layout {
        width: 100%;

        flex: 1;
    }

    .schedule_layout__events {
        width: 100%;
        height: 100%;

        overflow-x: hidden;
        overflow-y: scroll;

        display: flex;
        flex-direction: column;
    }

    .schedule_layout__event {
        width: 100%;

        display: flex;
        align-items: center;
        justify-content: flex-start;
    }
</style>
