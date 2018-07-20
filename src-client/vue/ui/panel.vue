<template>
    <div class="panel-container fullsize">
        <div class="modal-fader fullsize"></div>

        <div :class="'panel box-shadow is-centered ' + subclasses">
            <h1 v-if="header" class="center">{{header}}</h1>
            <slot></slot>
            <btn icon="close" @mousedown="fadeOut()"></btn>
        </div>
    </div>
</template>

<script>
	export default {
		props: ['header','subclasses'],
		data() {
			return {
				isVisible: false
			}
		},

		methods: {
			fadeOut(isForced) {
				$$$.fx.fadeOut(this.$el, () => {
					$$$.panelManager.pop();
                });
				isForced && this.$forceUpdate();
			},
		},

		mounted() {
			$$$.fx.fadeIn(this.$el, true);
            $$$.emit('dom-changed');

			$(this.$el).find('.modal-fader').click(() => {
				this.fadeOut();
			});

			$(window).keydown(e => {
				if (!this.isVisible) return;
				this.fadeOut();
			})
		}
	}


</script>