<template>
    <a class="smart-link" href="javascript:;" @mousedown="$app.gotoRoute(to)" v-forward-events>
        <slot></slot>
    </a>
</template>

<script>
    export default { props: ['to'] }
</script>