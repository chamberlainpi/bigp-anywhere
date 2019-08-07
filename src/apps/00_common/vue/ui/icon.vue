<template>
    <i :class="'fa fa-'+name" v-forward-events></i>
</template>

<script>
    export default { props: ['name'] }
</script>