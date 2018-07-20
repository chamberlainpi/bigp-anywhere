<template>
    <i>
        <i class="field field-label">{{label}}</i>
        <i class="field field-value">
            <input :id="name" :name="name" type="text" v-model:value="value" />
        </i>
    </i>
</template>

<script>
    export default { props: ['name', 'label', 'value'] }
</script>