<template>
    <a href="javascript:;" @mousedown="$gotoRoute(to)" v-forward-events>
        <slot></slot>
    </a>
</template>

<script>
    export default { props: ['to'] }
</script>