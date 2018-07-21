<template>
    <div class="icon">
        <i :class="'fa fa-'+name" v-forward-events></i>
    </div>
</template>

<script>
    export default { props: ['name'] }
</script>