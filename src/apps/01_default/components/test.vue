<template>
    <div>{{label}} {{randomNum}}</div>
</template>
<script>
    export default {
    	props: {
            label: {type:String, default:'Test Vue Component'},
        },

        computed: {
    		randomNum() {
    			return (Math.random() * 9999) | 0;
            }
        }
    }
</script>