<template>
    <div class="event_modal">

    </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss">
    @import '../styles/global.scss';
    @import '../styles/variables.scss';

    .event_modal {
        width: 500px;
        height: 500px;

        background-color: $greyscale01;
        box-shadow: $box-shadow03;

        position: absolute;
        z-index: 1000;
    }
</style>
