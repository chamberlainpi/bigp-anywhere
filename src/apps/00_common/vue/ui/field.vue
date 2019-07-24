<template>
    <i>
        <i class="label">{{label}}</i>
        <i class="ui">
            <slot>
                <input :id="name" :name="name" type="text" v-model="value" />
            </slot>
        </i>
    </i>
</template>

<script>
    export default { props: ['name', 'label', 'value'] }
</script>