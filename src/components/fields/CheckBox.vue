<template>
  <label class="form-control">
    <input
        type="checkbox"
        :name="name"
        :value="props.model"
        :model="props.model"
        :disabled="props.disabled"
        :checked="props.model"
        @change="onChanged"
    />
    {{ props.label }}
  </label>
</template>

<script setup lang="ts">
    import { computed } from 'vue';

    interface ICheckBoxProps {
        model: boolean;
        disabled: boolean;
        label: string;
    }

    const props = defineProps<ICheckBoxProps>();

    const emit = defineEmits(['checkboxChanged']);

    const name = computed(() => {
        if (props.disabled) {
            return (props.model) ? 'checkbox-disabled-checked' : 'checkbox-disabled';
        }
        return (props.model) ? 'checkbox-checked' : 'checkbox';
    });

    const onChanged = ((event: InputEvent) => {
        emit('checkboxChanged');
    });
</script>

<style scoped lang="scss">
// Learn about this technique:
// @link https://moderncss.dev/pure-css-custom-checkbox-style/

:root {
  --form-control-color: rebeccapurple;
  --form-control-disabled: #959495;
}

*,
*:before,
*:after {
  box-sizing: border-box;
}

body {
  margin: 0;
}

form {
    place-content: center;
    min-height: 100vh;
}

.form-control {
    font-family: system-ui, sans-serif;
    line-height: 1.1;
    display: flex;
    align-items: center;

    user-select: none;
}

.form-control + .form-control {
    margin-top: 1em;
}

.form-control--disabled {
    color: var(--form-control-disabled);
    cursor: not-allowed;
}

input[type="checkbox"] {
    /* Add if not using autoprefixer */
    -webkit-appearance: none;
    /* Remove most all native input styles */
    appearance: none;
    /* For iOS < 15 */
    background-color: var(--form-background);
    /* Not removed via appearance */
    margin: 0;

    font: inherit;
    color: currentColor;
    width: 24px;
    height: 24px;
    margin-right: 8px;
    border: 2px solid currentColor;
    border-radius: 2px;
    transform: translateY(-0.075em);

    display: grid;
    place-content: center;
}

input[type="checkbox"]::before {
    content: "";
    width: 12px;
    height: 12px;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
    transform: scale(0);
    transform-origin: bottom left;
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em var(--form-control-color);
    /* Windows High Contrast Mode */
    background-color: CanvasText;
}

input[type="checkbox"]:checked::before {
    transform: scale(1);
}

input[type="checkbox"]:disabled {
    --form-control-color: var(--form-control-disabled);

    color: var(--form-control-disabled);
    cursor: not-allowed;
}
</style>
