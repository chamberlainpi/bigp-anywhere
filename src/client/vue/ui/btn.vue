<template>
    <div :class="(icon||emoji)"
         :style="{'--color-normal': color, '--color-over': colorOver}"
         v-forward-events>
        <i v-if="emoji" :class="'v-align-mid em em-' + emoji" aria-hidden="true"></i>
        <i v-if="icon" :class="'v-align-mid icon fa fa-' + icon" aria-hidden="true"></i>
        <i><slot></slot></i>
    </div>
</template>

<style lang="scss">
.btn {
    cursor: pointer;
    display: inline-block;
    border-radius: 4px;
    padding: 6px 8px;
    color: #fff;
    box-shadow: 2px 2px 0px #00000044;
    
    background: var(--btnNormal);
    &:hover { background: var(--btnHover); }
}
</style>

<script>
    export default {
    	props: {
            obj:Object,
            emoji:String,
            icon:String,
            color: { type:String, default:'#336' }
        },

        computed: {
    		colorOver() {
    			return tinycolor(this.color).lighten(20);
            }
        }
    }
</script>