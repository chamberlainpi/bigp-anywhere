<template>
    <div :class="'btn ' + (icon||emoji||'')" v-forward-events>
        <i v-if="emoji" :class="'v-align-mid em em-' + emoji" aria-hidden="true"></i>
        <i v-if="icon" :class="'v-align-mid icon fa fa-' + icon" aria-hidden="true"></i>
        <i><slot></slot></i>
    </div>
</template>
<script>
    export default {
    	props: {
    		obj:Object,
            emoji:String,
            icon:String
		}
    }
</script>